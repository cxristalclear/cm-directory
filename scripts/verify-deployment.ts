#!/usr/bin/env tsx
/**
 * Deployment Verification Script
 * 
 * Verifies critical deployment tasks:
 * - Production build with production env vars
 * - Sitemap.xml accessibility
 * - Feed.xml accessibility
 * - Robots.txt accessibility
 * - Canonical URL configuration
 * 
 * Usage:
 *   tsx scripts/verify-deployment.ts [--url <base-url>]
 * 
 * Example:
 *   tsx scripts/verify-deployment.ts --url https://www.pcbafinder.com
 */

import { execSync, spawn } from 'child_process'
import { readFileSync, existsSync, rmSync } from 'fs'
import { join } from 'path'

interface VerificationResult {
  name: string
  passed: boolean
  message: string
  details?: string
}

const results: VerificationResult[] = []

function addResult(name: string, passed: boolean, message: string, details?: string) {
  results.push({ name, passed, message, details })
  const icon = passed ? '✓' : '✗'
  console.log(`${icon} ${name}: ${message}`)
  if (details) {
    console.log(`  ${details}`)
  }
}

function checkEnvironmentVariables(): void {
  console.log('\n📋 Checking Environment Variables...\n')
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SITE_NAME',
  ]

  const optionalVars = [
    'NEXT_PUBLIC_LINKEDIN_URL',
    'NEXT_PUBLIC_GA_MEASUREMENT_ID',
    'NEXT_PUBLIC_MAPBOX_TOKEN',
  ]

  let allRequiredPresent = true
  const missing: string[] = []

  for (const varName of requiredVars) {
    const value = process.env[varName]
    if (!value) {
      allRequiredPresent = false
      missing.push(varName)
      addResult(
        `Env: ${varName}`,
        false,
        'Missing',
        'Required for production deployment'
      )
    } else {
      // Check for placeholder values
      const placeholderPatterns = [/your_/i, /example\.com/i, /yourdomain\.com/i, /placeholder/i, /localhost/i]
      const isPlaceholder = placeholderPatterns.some(pattern => pattern.test(value))
      
      if (isPlaceholder && varName.includes('SITE_URL')) {
        addResult(
          `Env: ${varName}`,
          false,
          'Placeholder value detected',
          `Value: ${value.substring(0, 50)}...`
        )
        allRequiredPresent = false
      } else {
        addResult(
          `Env: ${varName}`,
          true,
          'Set',
          varName.includes('KEY') ? '***' : value.substring(0, 50)
        )
      }
    }
  }

  for (const varName of optionalVars) {
    const value = process.env[varName]
    if (value) {
      addResult(
        `Env: ${varName} (optional)`,
        true,
        'Set',
        varName.includes('KEY') || varName.includes('TOKEN') ? '***' : value.substring(0, 50)
      )
    } else {
      addResult(
        `Env: ${varName} (optional)`,
        true,
        'Not set (optional)',
        'Will use defaults'
      )
    }
  }

  if (!allRequiredPresent) {
    addResult(
      'Environment Variables',
      false,
      `Missing required variables: ${missing.join(', ')}`,
      'Set these in your .env.local or deployment environment'
    )
  } else {
    addResult(
      'Environment Variables',
      true,
      'All required variables present'
    )
  }
}

async function checkProductionBuild(): Promise<void> {
  console.log('\n🔨 Testing Production Build...\n')

  try {
    // Check if .next directory exists from previous build
    const nextDir = join(process.cwd(), '.next')
    if (existsSync(nextDir)) {
      console.log('  Cleaning previous build...')
      rmSync(nextDir, { recursive: true, force: true })
    }

    console.log('  Building production bundle...')
    execSync('npm run build', {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: 'production',
      },
    })

    addResult(
      'Production Build',
      true,
      'Build completed successfully'
    )
  } catch (error) {
    addResult(
      'Production Build',
      false,
      'Build failed',
      error instanceof Error ? error.message : String(error)
    )
  }
}

async function checkServerRunning(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Deployment-Verification-Script/1.0',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    return response.ok || response.status < 500
  } catch (error) {
    return false
  }
}

async function verifyUrlAccessibility(
  baseUrl: string,
  path: string,
  expectedContentType?: string
): Promise<VerificationResult> {
  const url = `${baseUrl}${path}`
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Deployment-Verification-Script/1.0',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
      if (response.status === 500 && isLocalhost) {
        return {
          name: `Accessibility: ${path}`,
          passed: false,
          message: 'Server not running or error',
          details: `HTTP ${response.status}. Start server with: npm run start`,
        }
      }
      return {
        name: `Accessibility: ${path}`,
        passed: false,
        message: `HTTP ${response.status}`,
        details: `Expected 200, got ${response.status}`,
      }
    }

    const contentType = response.headers.get('content-type') || ''
    
    if (expectedContentType && !contentType.includes(expectedContentType)) {
      return {
        name: `Accessibility: ${path}`,
        passed: false,
        message: `Wrong content type`,
        details: `Expected ${expectedContentType}, got ${contentType}`,
      }
    }

    const content = await response.text()
    if (!content || content.length === 0) {
      return {
        name: `Accessibility: ${path}`,
        passed: false,
        message: 'Empty response',
        details: 'No content returned',
      }
    }

    return {
      name: `Accessibility: ${path}`,
      passed: true,
      message: `Accessible (${response.status})`,
      details: `Content-Type: ${contentType}, Size: ${content.length} bytes`,
    }
  } catch (error) {
    const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
    if (isLocalhost && (error instanceof TypeError || error instanceof Error)) {
      const errorMsg = error.message.toLowerCase()
      if (errorMsg.includes('fetch failed') || errorMsg.includes('econnrefused') || errorMsg.includes('network')) {
        return {
          name: `Accessibility: ${path}`,
          passed: false,
          message: 'Server not running',
          details: 'Start production server with: npm run start (in another terminal)',
        }
      }
    }
    return {
      name: `Accessibility: ${path}`,
      passed: false,
      message: 'Request failed',
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

async function verifySitemap(baseUrl: string): Promise<void> {
  console.log('\n🗺️  Verifying Sitemap...\n')
  
  const result = await verifyUrlAccessibility(baseUrl, '/sitemap.xml', 'xml')
  addResult(result.name, result.passed, result.message, result.details)

  if (result.passed) {
    try {
      const response = await fetch(`${baseUrl}/sitemap.xml`)
      const content = await response.text()
      
      // Basic XML validation
      const hasXmlDeclaration = content.trim().startsWith('<?xml')
      const hasUrlset = content.includes('<urlset') || content.includes('<url')
      
      if (!hasXmlDeclaration) {
        addResult(
          'Sitemap XML Format',
          false,
          'Missing XML declaration',
          'Should start with <?xml version="1.0"?>'
        )
      } else if (!hasUrlset) {
        addResult(
          'Sitemap XML Format',
          false,
          'Invalid sitemap structure',
          'Should contain <urlset> or <url> elements'
        )
      } else {
        addResult(
          'Sitemap XML Format',
          true,
          'Valid XML structure'
        )
      }
    } catch (error) {
      addResult(
        'Sitemap XML Format',
        false,
        'Could not validate XML',
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}

async function verifyFeed(baseUrl: string): Promise<void> {
  console.log('\n📰 Verifying RSS Feed...\n')
  
  const result = await verifyUrlAccessibility(baseUrl, '/feed.xml', 'xml')
  addResult(result.name, result.passed, result.message, result.details)

  if (result.passed) {
    try {
      const response = await fetch(`${baseUrl}/feed.xml`)
      const content = await response.text()
      
      // Basic RSS validation
      const hasXmlDeclaration = content.trim().startsWith('<?xml')
      const hasRss = content.includes('<rss')
      const hasChannel = content.includes('<channel>')
      
      if (!hasXmlDeclaration) {
        addResult(
          'Feed XML Format',
          false,
          'Missing XML declaration',
          'Should start with <?xml version="1.0"?>'
        )
      } else if (!hasRss || !hasChannel) {
        addResult(
          'Feed XML Format',
          false,
          'Invalid RSS structure',
          'Should contain <rss> and <channel> elements'
        )
      } else {
        addResult(
          'Feed XML Format',
          true,
          'Valid RSS structure'
        )
      }
    } catch (error) {
      addResult(
        'Feed XML Format',
        false,
        'Could not validate RSS',
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}

async function verifyRobots(baseUrl: string): Promise<void> {
  console.log('\n🤖 Verifying Robots.txt...\n')
  
  const result = await verifyUrlAccessibility(baseUrl, '/robots.txt', 'text')
  addResult(result.name, result.passed, result.message, result.details)

  if (result.passed) {
    try {
      const response = await fetch(`${baseUrl}/robots.txt`)
      const content = await response.text()
      
      // Check for sitemap reference
      const hasSitemap = content.toLowerCase().includes('sitemap')
      
      if (!hasSitemap) {
        addResult(
          'Robots.txt Sitemap Reference',
          false,
          'Missing sitemap reference',
          'Should include Sitemap: directive'
        )
      } else {
        addResult(
          'Robots.txt Sitemap Reference',
          true,
          'Contains sitemap reference'
        )
      }
    } catch (error) {
      addResult(
        'Robots.txt Validation',
        false,
        'Could not validate content',
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}

async function verifyCanonicalUrls(baseUrl: string): Promise<void> {
  console.log('\n🔗 Verifying Canonical URLs...\n')
  
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  
  // Check that base URL uses HTTPS (skip for localhost)
  if (!baseUrl.startsWith('https://')) {
    if (isLocalhost) {
      addResult(
        'Canonical URL: HTTPS',
        true,
        'HTTP is expected for localhost',
        'Production should use HTTPS'
      )
    } else {
      addResult(
        'Canonical URL: HTTPS',
        false,
        'URL should use HTTPS',
        `Current: ${baseUrl}`
      )
    }
  } else {
    addResult(
      'Canonical URL: HTTPS',
      true,
      'Using HTTPS'
    )
  }

  // Check for www subdomain (common canonical preference)
  const hasWww = baseUrl.includes('www.')
  addResult(
    'Canonical URL: Subdomain',
    true,
    hasWww ? 'Using www subdomain' : 'Using root domain',
    isLocalhost ? 'N/A for localhost' : 'Ensure redirects are configured at hosting layer'
  )

  // Verify homepage is accessible
  try {
    const response = await fetch(baseUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    })
    
    if (response.ok) {
      addResult(
        'Canonical URL: Homepage',
        true,
        'Homepage accessible',
        `Status: ${response.status}`
      )
    } else {
      if (response.status === 500 && isLocalhost) {
        addResult(
          'Canonical URL: Homepage',
          false,
          'Server not running or error',
          'Start production server with: npm run start'
        )
      } else {
        addResult(
          'Canonical URL: Homepage',
          false,
          'Homepage not accessible',
          `Status: ${response.status}`
        )
      }
    }
  } catch (error) {
    if (isLocalhost && (error instanceof TypeError || error instanceof Error)) {
      const errorMsg = error.message.toLowerCase()
      if (errorMsg.includes('fetch failed') || errorMsg.includes('econnrefused') || errorMsg.includes('network')) {
        addResult(
          'Canonical URL: Homepage',
          false,
          'Server not running',
          'Start production server with: npm run start (in another terminal)'
        )
      } else {
        addResult(
          'Canonical URL: Homepage',
          false,
          'Could not verify homepage',
          error instanceof Error ? error.message : String(error)
        )
      }
    } else {
      addResult(
        'Canonical URL: Homepage',
        false,
        'Could not verify homepage',
        error instanceof Error ? error.message : String(error)
      )
    }
  }
}

function printSummary(): void {
  console.log('\n' + '='.repeat(60))
  console.log('📊 Verification Summary')
  console.log('='.repeat(60) + '\n')

  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  const total = results.length

  console.log(`Total Checks: ${total}`)
  console.log(`✓ Passed: ${passed}`)
  console.log(`✗ Failed: ${failed}\n`)

  if (failed > 0) {
    console.log('Failed Checks:')
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  ✗ ${r.name}: ${r.message}`)
        if (r.details) {
          console.log(`    ${r.details}`)
        }
      })
    console.log('')
  }

  if (failed === 0) {
    console.log('✅ All checks passed! Ready for deployment.\n')
    process.exit(0)
  } else {
    console.log('❌ Some checks failed. Please address issues before deploying.\n')
    process.exit(1)
  }
}

async function main() {
  console.log('🚀 Deployment Verification Script\n')
  console.log('='.repeat(60) + '\n')

  // Parse command line arguments
  const args = process.argv.slice(2)
  const urlIndex = args.indexOf('--url')
  const baseUrl = urlIndex >= 0 && args[urlIndex + 1]
    ? args[urlIndex + 1]
    : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  console.log(`Base URL: ${baseUrl}\n`)

  // Load environment variables from .env.local if it exists
  const envPath = join(process.cwd(), '.env.local')
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=')
        const value = valueParts.join('=').replace(/^["']|["']$/g, '')
        if (key && value) {
          process.env[key] = value
        }
      }
    })
  }

  // Run verifications
  checkEnvironmentVariables()
  
  const isLocalhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')
  
  // Only test build if not verifying remote URL
  if (isLocalhost) {
    await checkProductionBuild()
    
    // Check if server is running before verifying URLs
    console.log('\n🔍 Checking if production server is running...\n')
    const serverRunning = await checkServerRunning(baseUrl)
    if (!serverRunning) {
      console.log('⚠️  Production server is not running.\n')
      console.log('To verify URLs locally, start the server in another terminal:')
      console.log('  npm run start\n')
      console.log('Then run this script again, or verify against production URL:')
      console.log('  npm run verify-deployment -- --url https://www.pcbafinder.com\n')
      addResult(
        'Server Status',
        false,
        'Server not running',
        'Start with: npm run start'
      )
    } else {
      addResult(
        'Server Status',
        true,
        'Server is running'
      )
    }
  } else {
    console.log('\n⏭️  Skipping local build test (verifying remote URL)\n')
    addResult(
      'Production Build',
      true,
      'Skipped (remote verification)',
      'Run locally to test build'
    )
  }

  await verifySitemap(baseUrl)
  await verifyFeed(baseUrl)
  await verifyRobots(baseUrl)
  await verifyCanonicalUrls(baseUrl)

  printSummary()
}

main().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})

