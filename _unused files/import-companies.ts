// scripts/import-companies.ts
// Run with: npx tsx scripts/import-companies.ts

import { createClient } from '@supabase/supabase-js'
import { parse } from 'csv-parse/sync'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set in .env.local')
  console.error('   Please make sure your .env.local file contains:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  process.exit(1)
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY is not set in .env.local')
  console.error('   Please make sure your .env.local file contains one of:')
  console.error('   SUPABASE_SERVICE_KEY=your_service_key (recommended for admin access)')
  console.error('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key (fallback option)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CompanyCSVRow {
  id: string
  company_name: string
  dba_name?: string
  website_url: string
  year_founded?: number
  employee_count_range?: string
  annual_revenue_range?: string
  slug: string
  logo_url?: string
  description?: string
  key_differentiators?: string
  is_active: boolean
  is_verified: boolean
  last_verified_date?: string
  created_at: string
  updated_at: string
}

interface ExistingCompany {
  id: string
  website_url: string | null
  slug: string
}

// Type for csv-parse cast function context
interface CastContext {
  column: string | number | undefined
  empty_lines: number
  error: Error | undefined
  header: boolean
  index: number
  invalid_field_length: number
  lines: number
  quoting: boolean
  records: number
}

async function importCompanies() {
  try {
    // Read and parse CSV file
    const csvPath = path.join(process.cwd(), 'data', 'companies_rows_filled.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      cast: (value: string, context: CastContext) => {
        // Handle boolean fields
        if (context.column === 'is_active' || context.column === 'is_verified') {
          return value.toLowerCase() === 'true'
        }
        // Handle numeric fields
        if (context.column === 'year_founded' && value) {
          return parseInt(value, 10)
        }
        // Handle empty strings as null
        if (value === '') {
          return null
        }
        return value
      }
    }) as CompanyCSVRow[]

    console.log(`📊 Found ${records.length} companies in CSV`)

    // Get existing companies from database
    const { data: existingCompanies, error: fetchError } = await supabase
      .from('companies')
      .select('id, website_url, slug')
      .returns<ExistingCompany[]>()
    
    if (fetchError) throw fetchError

    // Create lookup maps for deduplication
    const existingById = new Map(existingCompanies?.map(c => [c.id, c]) || [])
    const existingByWebsite = new Map(
      existingCompanies?.filter(c => c.website_url)
        .map(c => [c.website_url!.toLowerCase(), c]) || []
    )
    const existingBySlug = new Map(existingCompanies?.map(c => [c.slug, c]) || [])

    // Separate companies into new and updates
    const newCompanies: Record<string, unknown>[] = []
    const updateCompanies: Record<string, unknown>[] = []

    for (const row of records) {
      // Check if company exists (by ID, website, or slug)
      const existsById = existingById.has(row.id)
      const existsByWebsite = row.website_url && existingByWebsite.has(row.website_url.toLowerCase())
      const existsBySlug = existingBySlug.has(row.slug)

      const companyData = {
        id: row.id,
        company_name: row.company_name,
        dba_name: row.dba_name,
        website_url: row.website_url,
        year_founded: row.year_founded,
        employee_count_range: row.employee_count_range,
        annual_revenue_range: row.annual_revenue_range,
        slug: row.slug,
        logo_url: row.logo_url,
        description: row.description,
        key_differentiators: row.key_differentiators,
        is_active: row.is_active,
        is_verified: row.is_verified,
        last_verified_date: row.last_verified_date,
        updated_at: new Date().toISOString()
      }

      if (existsById || existsByWebsite || existsBySlug) {
        // Company exists - prepare for update
        let existingId = ''
        if (existsById) {
          existingId = row.id
        } else if (existsByWebsite && row.website_url) {
          const existing = existingByWebsite.get(row.website_url.toLowerCase())
          existingId = existing ? existing.id : ''
        } else if (existsBySlug) {
          const existing = existingBySlug.get(row.slug)
          existingId = existing ? existing.id : ''
        }
        
        if (existingId) {
          updateCompanies.push({
            ...companyData,
            id: existingId // Use the existing ID
          })
        }
      } else {
        // New company
        newCompanies.push({
          ...companyData,
          created_at: row.created_at || new Date().toISOString()
        })
      }
    }

    console.log(`\n📈 Import Summary:`)
    console.log(`   - New companies to insert: ${newCompanies.length}`)
    console.log(`   - Existing companies to update: ${updateCompanies.length}`)

    // Insert new companies
    if (newCompanies.length > 0) {
      console.log(`\n➕ Inserting ${newCompanies.length} new companies...`)
      
      // Insert in batches of 50 to avoid timeout
      const batchSize = 50
      for (let i = 0; i < newCompanies.length; i += batchSize) {
        const batch = newCompanies.slice(i, i + batchSize)
        const { error: insertError } = await supabase
          .from('companies')
          .insert(batch)
        
        if (insertError) {
          console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, insertError)
        } else {
          console.log(`   ✅ Inserted batch ${i / batchSize + 1} (${batch.length} companies)`)
        }
      }
    }

    // Update existing companies (if needed)
    if (updateCompanies.length > 0) {
      console.log(`\n🔄 Updating ${updateCompanies.length} existing companies...`)
      
      // Update in batches
      const batchSize = 50
      for (let i = 0; i < updateCompanies.length; i += batchSize) {
        const batch = updateCompanies.slice(i, i + batchSize)
        
        // Update each company individually (Supabase doesn't support batch updates with different IDs)
        for (const company of batch) {
          const { error: updateError } = await supabase
            .from('companies')
            .update(company)
            .eq('id', company.id)
          
          if (updateError) {
            console.error(`❌ Error updating ${company.company_name}:`, updateError)
          }
        }
        
        console.log(`   ✅ Updated batch ${i / batchSize + 1} (${batch.length} companies)`)
      }
    }

    console.log('\n✨ Import complete!')

  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importCompanies()