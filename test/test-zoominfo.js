/**
 * Test script for ZoomInfo webhook
 * Run this to test if the Make.com webhook is working
 * 
 * Usage: node test-zoominfo.js
 */

const WEBHOOK_URL = 'https://hook.us1.make.celonis.com/obav4qf8bnmsmf19xfpsr62bjsx2qy6t'

async function testZoomInfo() {
  console.log('🧪 Testing ZoomInfo Webhook')
  console.log('=' .repeat(50))
  console.log('Webhook URL:', WEBHOOK_URL)
  console.log('')

  const testCompany = {
    action: 'enrich_company',
    company_name: 'Flex Ltd',
    website: 'https://flex.com'
  }

  console.log('📤 Sending request:')
  console.log(JSON.stringify(testCompany, null, 2))
  console.log('')

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testCompany),
    })

    console.log('📥 Response Status:', response.status, response.statusText)
    console.log('Response Headers:', Object.fromEntries(response.headers.entries()))
    console.log('')

    if (!response.ok) {
      console.error('❌ Webhook returned error status')
      const text = await response.text()
      console.log('Response body:', text)
      return
    }

    const data = await response.json()
    console.log('✅ Response Data:')
    console.log(JSON.stringify(data, null, 2))
    console.log('')

    // Analyze response
    if (data.success && data.data) {
      console.log('✅ ZoomInfo webhook is working!')
      console.log('📊 Data received:')
      console.log('  - Company:', data.data.company_name || 'N/A')
      console.log('  - Website:', data.data.website || 'N/A')
      console.log('  - Employees:', data.data.employee_range || data.data.employee_count || 'N/A')
      console.log('  - Revenue:', data.data.revenue_range || 'N/A')
      console.log('  - Founded:', data.data.year_founded || 'N/A')
      console.log('  - Industry:', data.data.industry || 'N/A')
    } else {
      console.log('⚠️  Webhook responded but no data returned')
      console.log('   This might mean:')
      console.log('   - ZoomInfo doesn\'t have data for this company')
      console.log('   - The webhook is configured incorrectly')
      console.log('   - The Make.com scenario needs to be activated')
    }

  } catch (error) {
    console.error('❌ Error calling webhook:', error.message)
    console.log('')
    console.log('Possible issues:')
    console.log('  1. Webhook URL is incorrect')
    console.log('  2. Make.com scenario is not active')
    console.log('  3. Network/CORS issues')
    console.log('  4. ZoomInfo API is not configured in Make.com')
  }
}

testZoomInfo()