// scripts/geocode-facilities.ts
// Run with: npx tsx scripts/geocode-facilities.ts

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Configuration
const CONFIG = {
  // Mode of operation
  MODE: process.env.MODE || 'MISSING_ONLY', // Options: 'MISSING_ONLY', 'VALIDATE_ALL', 'UPDATE_ALL'
  
  // Set to true to only show what would be updated without making changes
  DRY_RUN: process.env.DRY_RUN === 'false' ? false : true, // Default to true unless explicitly set to false
  
  // Your Mapbox Access Token
  MAPBOX_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '',
  
  // Supabase credentials
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '', // Use service key for admin access
  
  // Geocoding settings
  BATCH_SIZE: 5, // Process in batches to avoid rate limits
  DELAY_MS: 1000, // Delay between API calls (Mapbox has rate limits)
  
  // Validation settings (for VALIDATE_ALL mode)
  DISTANCE_THRESHOLD_KM: 10, // Flag if coordinates are more than 10km from geocoded address
}

// Validate required environment variables
if (!CONFIG.SUPABASE_URL) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  process.exit(1)
}

if (!CONFIG.SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_ROLE_KEY is not set in .env.local')
  console.error('   You can find this in your Supabase dashboard under Settings → API')
  process.exit(1)
}

if (CONFIG.MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE') {
  console.error('❌ Error: MAPBOX_ACCESS_TOKEN is not set in .env.local')
  console.error('   Get your token from https://account.mapbox.com/')
  process.exit(1)
}

// Initialize Supabase client
const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_SERVICE_KEY)

// Type definitions matching your schema
interface Facility {
  id: string
  company_id: string
  facility_type: string
  street_address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  latitude?: number | null
  longitude?: number | null
}

interface Company {
  id: string
  company_name: string
  facilities?: Facility[]
}

interface GeocodingResult {
  facilityId: string
  companyName: string
  address: string
  currentCoords: { lat: number | null; lng: number | null }
  newCoords: { lat: number; lng: number } | null
  distance?: number // Distance in km between old and new coordinates
  status?: 'missing' | 'validated' | 'suspicious' | 'updated'
  error?: string
}

// Calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

// Utility function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Build address string from facility data
function buildAddress(facility: Facility): string {
  const parts = []
  
  if (facility.street_address) parts.push(facility.street_address)
  if (facility.city) parts.push(facility.city)
  if (facility.state) parts.push(facility.state)
  if (facility.zip_code) parts.push(facility.zip_code)
  if (facility.country) parts.push(facility.country)
  
  // If we have no address components, return empty
  if (parts.length === 0) return ''
  
  // If we only have state and/or country, add the company name for better geocoding
  if (parts.length <= 2 && !facility.street_address && !facility.city) {
    return parts.join(', ')
  }
  
  return parts.join(', ')
}

// Geocode a single address using Mapbox API
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null
  
  try {
    const encodedAddress = encodeURIComponent(address)
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${CONFIG.MAPBOX_TOKEN}&limit=1`
    
    const response = await fetch(url)
    const data = await response.json() as any
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return { lat, lng }
    }
    
    return null
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error)
    return null
  }
}

// Main function to process facilities
async function processFacilities() {
  console.log('🚀 Starting Geocoding Script')
  console.log(`📋 Mode: ${CONFIG.MODE}`)
  console.log(`   ${getModeDescription()}`)
  console.log(`📝 Dry Run: ${CONFIG.DRY_RUN ? 'YES (no changes will be made)' : 'NO (will update database)'}`)
  console.log('')
  
  // Step 1: Fetch companies with facilities based on mode
  console.log('📍 Fetching facilities...')
  
  const { data: companies, error: fetchError } = await supabase
    .from('companies')
    .select(`
      id,
      company_name,
      facilities (
        id,
        company_id,
        facility_type,
        street_address,
        city,
        state,
        zip_code,
        country,
        latitude,
        longitude
      )
    `)
    .order('company_name')
  
  if (fetchError) {
    console.error('❌ Error fetching companies:', fetchError)
    return
  }
  
  if (!companies || companies.length === 0) {
    console.log('✅ No companies found in database')
    return
  }
  
  // Type assertion to ensure proper typing
  const typedCompanies = companies as Company[]
  
  // Step 2: Filter facilities based on mode
  const facilitiesToProcess: Array<{
    facility: Facility
    companyName: string
  }> = []
  
  typedCompanies.forEach(company => {
    company.facilities?.forEach(facility => {
      const shouldProcess = shouldProcessFacility(facility)
      if (shouldProcess) {
        facilitiesToProcess.push({
          facility,
          companyName: company.company_name
        })
      }
    })
  })
  
  if (facilitiesToProcess.length === 0) {
    console.log('✅ No facilities to process based on current mode!')
    if (CONFIG.MODE === 'MISSING_ONLY') {
      console.log('   All facilities already have coordinates.')
    } else if (CONFIG.MODE === 'VALIDATE_ALL') {
      console.log('   No facilities with coordinates to validate.')
    }
    return
  }
  
  console.log(`📊 Found ${facilitiesToProcess.length} facilities to process`)
  if (CONFIG.MODE === 'VALIDATE_ALL') {
    const withCoords = facilitiesToProcess.filter(f => f.facility.latitude && f.facility.longitude)
    const withoutCoords = facilitiesToProcess.filter(f => !f.facility.latitude || !f.facility.longitude)
    console.log(`   - ${withCoords.length} with existing coordinates to validate`)
    console.log(`   - ${withoutCoords.length} missing coordinates`)
  }
  console.log('')
  
  // Step 3: Process facilities in batches
  const results: GeocodingResult[] = []
  
  for (let i = 0; i < facilitiesToProcess.length; i += CONFIG.BATCH_SIZE) {
    const batch = facilitiesToProcess.slice(i, i + CONFIG.BATCH_SIZE)
    console.log(`📦 Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(facilitiesToProcess.length / CONFIG.BATCH_SIZE)}`)
    
    for (const { facility, companyName } of batch) {
      const address = buildAddress(facility)
      
      if (!address) {
        results.push({
          facilityId: facility.id,
          companyName,
          address: 'No address available',
          currentCoords: { lat: facility.latitude || null, lng: facility.longitude || null },
          newCoords: null,
          status: 'missing',
          error: 'Insufficient address data'
        })
        console.log(`⚠️  ${companyName}: No address data available`)
        continue
      }
      
      console.log(`🔍 ${CONFIG.MODE === 'VALIDATE_ALL' ? 'Validating' : 'Geocoding'}: ${companyName}`)
      console.log(`   Address: ${address}`)
      if (facility.latitude && facility.longitude) {
        console.log(`   Current: ${facility.latitude}, ${facility.longitude}`)
      }
      
      const coords = await geocodeAddress(address)
      
      if (coords) {
        let status: GeocodingResult['status'] = 'updated'
        let distance: number | undefined
        
        // Calculate distance if validating existing coordinates
        if (facility.latitude && facility.longitude && CONFIG.MODE === 'VALIDATE_ALL') {
          distance = calculateDistance(
            facility.latitude,
            facility.longitude,
            coords.lat,
            coords.lng
          )
          
          if (distance < CONFIG.DISTANCE_THRESHOLD_KM) {
            status = 'validated'
            console.log(`   ✅ Validated: Within ${distance.toFixed(2)}km of geocoded location`)
          } else {
            status = 'suspicious'
            console.log(`   ⚠️  Suspicious: ${distance.toFixed(2)}km from geocoded location`)
          }
        } else {
          console.log(`   ✅ Found: ${coords.lat}, ${coords.lng}`)
        }
        
        results.push({
          facilityId: facility.id,
          companyName,
          address,
          currentCoords: { lat: facility.latitude || null, lng: facility.longitude || null },
          newCoords: coords,
          distance,
          status
        })
      } else {
        results.push({
          facilityId: facility.id,
          companyName,
          address,
          currentCoords: { lat: facility.latitude || null, lng: facility.longitude || null },
          newCoords: null,
          status: 'missing',
          error: 'Geocoding failed'
        })
        console.log(`   ❌ Could not geocode address`)
      }
      
      // Delay between API calls to respect rate limits
      if (i + 1 < facilitiesToProcess.length) {
        await delay(CONFIG.DELAY_MS)
      }
    }
  }
  
  // Step 4: Display results summary
  displayResultsSummary(results)
  
  // Step 5: Update database (if not in dry run mode)
  if (!CONFIG.DRY_RUN) {
    await updateDatabase(results)
  } else {
    console.log('')
    console.log('🔄 DRY RUN COMPLETE')
    console.log('To apply these changes, set DRY_RUN to false')
  }
}

// Helper function to determine if a facility should be processed
function shouldProcessFacility(facility: Facility): boolean {
  switch (CONFIG.MODE) {
    case 'MISSING_ONLY':
      return !facility.latitude || !facility.longitude
    case 'VALIDATE_ALL':
      return true // Process all facilities to validate or add missing
    case 'UPDATE_ALL':
      return true // Re-geocode everything
    default:
      return false
  }
}

// Helper function to get mode description
function getModeDescription(): string {
  switch (CONFIG.MODE) {
    case 'MISSING_ONLY':
      return 'Only geocoding facilities with missing coordinates'
    case 'VALIDATE_ALL':
      return 'Validating all existing coordinates and filling missing ones'
    case 'UPDATE_ALL':
      return 'Re-geocoding all facilities (will overwrite existing coordinates)'
    default:
      return 'Unknown mode'
  }
}

// Display comprehensive results summary
function displayResultsSummary(results: GeocodingResult[]) {
  console.log('')
  console.log('📊 GEOCODING RESULTS SUMMARY')
  console.log('=' .repeat(60))
  
  if (CONFIG.MODE === 'VALIDATE_ALL') {
    const validated = results.filter(r => r.status === 'validated')
    const suspicious = results.filter(r => r.status === 'suspicious')
    const missing = results.filter(r => r.status === 'missing' || !r.newCoords)
    const updated = results.filter(r => r.status === 'updated')
    
    console.log(`✅ Validated (accurate): ${validated.length}`)
    console.log(`⚠️  Suspicious (far from geocoded): ${suspicious.length}`)
    console.log(`🆕 New coordinates found: ${updated.length}`)
    console.log(`❌ Failed to geocode: ${missing.length}`)
    
    if (suspicious.length > 0) {
      console.log('')
      console.log('⚠️  SUSPICIOUS COORDINATES (may need review):')
      console.log('-'.repeat(60))
      suspicious.forEach(result => {
        console.log(`📍 ${result.companyName}`)
        console.log(`   Distance: ${result.distance?.toFixed(2)}km from geocoded location`)
        console.log(`   Current: ${result.currentCoords.lat}, ${result.currentCoords.lng}`)
        console.log(`   Geocoded: ${result.newCoords?.lat}, ${result.newCoords?.lng}`)
        console.log('')
      })
    }
  } else {
    const successful = results.filter(r => r.newCoords !== null)
    const failed = results.filter(r => r.newCoords === null)
    
    console.log(`✅ Successfully geocoded: ${successful.length}`)
    console.log(`❌ Failed to geocode: ${failed.length}`)
  }
  
  const toUpdate = results.filter(r => 
    r.newCoords && 
    (r.status === 'updated' || r.status === 'suspicious' || CONFIG.MODE === 'UPDATE_ALL')
  )
  
  if (toUpdate.length > 0) {
    console.log('')
    console.log('🎯 FACILITIES TO BE UPDATED:')
    console.log('-'.repeat(60))
    toUpdate.slice(0, 10).forEach(result => {
      console.log(`📍 ${result.companyName}`)
      console.log(`   Address: ${result.address}`)
      if (result.currentCoords.lat && result.currentCoords.lng) {
        console.log(`   Current: ${result.currentCoords.lat}, ${result.currentCoords.lng}`)
      }
      console.log(`   New: ${result.newCoords!.lat}, ${result.newCoords!.lng}`)
      if (result.distance) {
        console.log(`   Distance: ${result.distance.toFixed(2)}km`)
      }
      console.log('')
    })
    
    if (toUpdate.length > 10) {
      console.log(`   ... and ${toUpdate.length - 10} more facilities`)
    }
  }
}

// Update database with new coordinates
async function updateDatabase(results: GeocodingResult[]) {
  const toUpdate = results.filter(r => {
    if (!r.newCoords) return false
    
    switch (CONFIG.MODE) {
      case 'MISSING_ONLY':
        return !r.currentCoords.lat || !r.currentCoords.lng
      case 'VALIDATE_ALL':
        return r.status === 'updated' || r.status === 'suspicious'
      case 'UPDATE_ALL':
        return true
      default:
        return false
    }
  })
  
  if (toUpdate.length === 0) {
    console.log('')
    console.log('✅ No updates needed')
    return
  }
  
  console.log('')
  console.log('💾 UPDATING DATABASE...')
  console.log('-'.repeat(60))
  
  let updateCount = 0
  let errorCount = 0
  
  for (const result of toUpdate) {
    const { error: updateError } = await supabase
      .from('facilities')
      .update({
        latitude: result.newCoords!.lat,
        longitude: result.newCoords!.lng,
        updated_at: new Date().toISOString()
      })
      .eq('id', result.facilityId)
    
    if (updateError) {
      console.error(`❌ Failed to update ${result.companyName}:`, updateError)
      errorCount++
    } else {
      console.log(`✅ Updated ${result.companyName}`)
      updateCount++
    }
  }
  
  console.log('')
  console.log('🏁 DATABASE UPDATE COMPLETE')
  console.log(`   Updated: ${updateCount} facilities`)
  console.log(`   Errors: ${errorCount}`)
}

// Run the script
processFacilities()
  .then(() => {
    console.log('')
    console.log('✨ Script completed successfully')
    process.exit(0)
  })
  .catch(error => {
    console.error('💥 Script failed:', error)
    process.exit(1)
  })