// scripts/geocode-facilities.ts
// Run with: npx tsx scripts/geocode-facilities.ts

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import * as path from 'path'

import {
  buildFacilityAddress,
  geocodeFacility,
  GeocodeFacilityError,
  type FetchImplementation,
} from '@/lib/admin/geocoding'

import { hasMinimumAddressData } from '@/lib/admin/addressCompat'

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

if (CONFIG.MAPBOX_TOKEN === 'YOUR_MAPBOX_TOKEN_HERE' || !CONFIG.MAPBOX_TOKEN) {
  console.error('❌ Error: NEXT_PUBLIC_MAPBOX_TOKEN is not set in .env.local')
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
  state_province?: string
  state_code?: string
  zip_code?: string
  postal_code?: string
  country?: string
  country_code?: string
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
  status?: 'missing' | 'validated' | 'suspicious' | 'updated' | 'incomplete_address'
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

// Main function to process facilities
/**
* Fetches companies and their facilities, geocodes or validates facility coordinates in batches, logs progress, and optionally updates the database (supports dry-run).
* @example
* processFacilities()
* Promise<void>
* @returns {Promise<void>} Resolves when processing, summarizing results and optionally updating the database.
*/
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
        state_province,
        state_code,
        zip_code,
        postal_code,
        country,
        country_code,
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
  
  // Step 2: Filter facilities based on mode and address completeness
  const facilitiesToProcess: Array<{
    facility: Facility
    companyName: string
  }> = []
  
  const skippedIncompleteAddress: Array<{
    facility: Facility
    companyName: string
    reason: string
  }> = []
  
  typedCompanies.forEach(company => {
    company.facilities?.forEach(facility => {
      const shouldProcess = shouldProcessFacility(facility)
      
      if (shouldProcess) {
        // Check if facility has complete address data
        if (!hasMinimumAddressData(facility)) {
          const missingFields: string[] = []
          if (!facility.street_address) missingFields.push('street_address')
          if (!facility.city) missingFields.push('city')
          if (!facility.state && !facility.state_province) missingFields.push('state/state_province')
          if (!facility.zip_code && !facility.postal_code) missingFields.push('zip_code/postal_code')
          if (!facility.country && !facility.country_code) missingFields.push('country/country_code')
          
          skippedIncompleteAddress.push({
            facility,
            companyName: company.company_name,
            reason: `Missing: ${missingFields.join(', ')}`
          })
        } else {
          facilitiesToProcess.push({
            facility,
            companyName: company.company_name
          })
        }
      }
    })
  })
  
  // Report on incomplete addresses
  if (skippedIncompleteAddress.length > 0) {
    console.log('')
    console.log(`⚠️  Skipped ${skippedIncompleteAddress.length} facilities with incomplete addresses:`)
    skippedIncompleteAddress.slice(0, 5).forEach(({ companyName, reason }) => {
      console.log(`   - ${companyName}: ${reason}`)
    })
    if (skippedIncompleteAddress.length > 5) {
      console.log(`   ... and ${skippedIncompleteAddress.length - 5} more`)
    }
    console.log('')
  }
  
  if (facilitiesToProcess.length === 0) {
    console.log('✅ No facilities to process based on current mode!')
    if (CONFIG.MODE === 'MISSING_ONLY') {
      console.log('   All facilities with complete addresses already have coordinates.')
    } else if (CONFIG.MODE === 'VALIDATE_ALL') {
      console.log('   No facilities with coordinates to validate.')
    }
    return
  }
  
  console.log(`📊 Found ${facilitiesToProcess.length} facilities with complete addresses to process`)
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
      const address = buildFacilityAddress(facility)
      
      if (!address) {
        results.push({
          facilityId: facility.id,
          companyName,
          address: 'No address available',
          currentCoords: { lat: facility.latitude || null, lng: facility.longitude || null },
          newCoords: null,
          status: 'incomplete_address',
          error: 'Insufficient address data'
        })
        console.log(`⚠️  ${companyName}: No address data available`)
        continue
      }
      
      console.log(`🔍 ${CONFIG.MODE === 'VALIDATE_ALL' ? 'Validating' : 'Geocoding'}: ${companyName}`)
      console.log(`   Address: ${address}`)
      if (facility.latitude && facility.longitude) {
        console.log(`   Current: ${facility.latitude}, ${facility.longitude}`)
      } else {
        console.log(`   Current: No coordinates`)
      }
      
      let geocodedResult: Awaited<ReturnType<typeof geocodeFacility>> | null = null
      let geocodingError: unknown

      try {
        geocodedResult = await geocodeFacility(facility, {
          mapboxToken: CONFIG.MAPBOX_TOKEN,
          fetchImpl: fetch as unknown as FetchImplementation,
          addressOverride: address,
        })
      } catch (error) {
        geocodingError = error
      }

      if (geocodedResult) {
        const coords = { lat: geocodedResult.latitude, lng: geocodedResult.longitude }
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
        const errorMessage =
          geocodingError instanceof GeocodeFacilityError
            ? `${geocodingError.code}: ${geocodingError.message}`
            : geocodingError instanceof Error
              ? geocodingError.message
              : 'Geocoding failed'

        results.push({
          facilityId: facility.id,
          companyName,
          address,
          currentCoords: { lat: facility.latitude || null, lng: facility.longitude || null },
          newCoords: null,
          status: 'missing',
          error: errorMessage
        })

        const errorCode =
          geocodingError instanceof GeocodeFacilityError ? ` (${geocodingError.code})` : ''
        console.log(`   ❌ Could not geocode address${errorCode}`)
      }
      
      // Delay between API calls to respect rate limits
      if (i + 1 < facilitiesToProcess.length) {
        await delay(CONFIG.DELAY_MS)
      }
    }
  }
  
  // Step 4: Display results summary
  displayResultsSummary(results, skippedIncompleteAddress.length)
  
  // Step 5: Update database (if not in dry run mode)
  if (!CONFIG.DRY_RUN) {
    await updateDatabase(results)
  } else {
    console.log('')
    console.log('🔄 DRY RUN COMPLETE')
    console.log('To apply these changes, run: DRY_RUN=false npx tsx scripts/geocode-facilities.ts')
  }
}

// Helper function to determine if a facility should be processed
/**
* Determine whether a given facility should be processed based on the current CONFIG.MODE and its coordinates.
* @example
* shouldProcessFacility({ latitude: null, longitude: null })
* true
* @param {{Facility}} {{facility}} - Facility object to evaluate for processing.
* @returns {{boolean}} True if the facility should be processed under the current CONFIG.MODE.
**/
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
/**
* Get a human-readable description for the current geocoding mode defined in CONFIG.MODE.
* @example
* getModeDescription()
* 'Validating all existing coordinates and filling missing ones'
* @returns {string} Human-readable description of the current geocoding mode.
*/
function getModeDescription(): string {
  switch (CONFIG.MODE) {
    case 'MISSING_ONLY':
      return 'Only geocoding facilities with complete addresses and missing coordinates'
    case 'VALIDATE_ALL':
      return 'Validating all existing coordinates and filling missing ones'
    case 'UPDATE_ALL':
      return 'Re-geocoding all facilities (will overwrite existing coordinates)'
    default:
      return 'Unknown mode'
  }
}

// Display comprehensive results summary
/**
* Prints a formatted summary of geocoding results to the console.
* @example
* displayResultsSummary(resultsArray, 2)
* undefined
* @param {GeocodingResult[]} results - Array of geocoding result objects to summarize.
* @param {number} skippedCount - Number of entries skipped due to incomplete addresses.
* @returns {void} Logs a human-readable summary to the console; does not return a value.
**/
function displayResultsSummary(results: GeocodingResult[], skippedCount: number) {
  console.log('')
  console.log('📊 GEOCODING RESULTS SUMMARY')
  console.log('='.repeat(60))
  
  if (skippedCount > 0) {
    console.log(`⚠️  Skipped (incomplete address): ${skippedCount}`)
  }
  
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
    console.log('🎯 FACILITIES TO BE UPDATED (latitude & longitude):')
    console.log('-'.repeat(60))
    toUpdate.slice(0, 10).forEach(result => {
      console.log(`📍 ${result.companyName}`)
      console.log(`   Address: ${result.address}`)
      if (result.currentCoords.lat && result.currentCoords.lng) {
        console.log(`   Current: lat=${result.currentCoords.lat}, lng=${result.currentCoords.lng}`)
      } else {
        console.log(`   Current: No coordinates`)
      }
      console.log(`   New:     lat=${result.newCoords!.lat}, lng=${result.newCoords!.lng}`)
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
/**
* Update facility latitude and longitude in the database for geocoding results that require changes.
* @example
* updateDatabase([
*   { facilityId: 1, companyName: 'Example Co', currentCoords: {lat: null, lng: null}, newCoords: {lat: 12.34, lng: 56.78}, status: 'updated' }
* ])
* undefined
* @param {{GeocodingResult[]}} {{results}} - Array of geocoding results to evaluate and apply updates for facilities.
* @returns {{Promise<void>}} Promise that resolves when all necessary updates are completed (no value returned).
**/
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
  console.log('💾 UPDATING DATABASE (latitude & longitude)...')
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
      console.log(`✅ Updated ${result.companyName} (lat: ${result.newCoords!.lat}, lng: ${result.newCoords!.lng})`)
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