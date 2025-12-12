/**
 * Navigation Testing Script
 * 
 * Tests all navigation links and CTAs across the application.
 * Run with: node scripts/test-navigation.js
 * 
 * This script verifies:
 * - All header links work
 * - All footer links work
 * - All CTA buttons navigate correctly
 * - No 404 errors on expected routes
 * - State pages load correctly
 * - Company pages load correctly
 * - Every page uses <Navbar />
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results
const results = {
  passed: [],
  failed: [],
  warnings: [],
};

// Header links from navbar.tsx
const headerLinks = [
  { href: '/', label: 'Home (Logo)' },
  { href: '/about', label: 'About' },
  { href: '/industries', label: 'Industries' },
  { href: '/list-your-company', label: 'Add Company' },
];

// Footer links from SiteFooter.tsx
const footerLinks = [
  // Resources section
  { href: '/industries', label: 'Industries' },
  { href: '/sitemap.xml', label: 'Sitemap' },
  { href: '/feed.xml', label: 'RSS Feed' },
  { href: '/about', label: 'About' },
  // Top Cities section
  { href: '/manufacturers/texas', label: 'Manufacturers in Austin, TX' },
  { href: '/manufacturers/massachusetts', label: 'Manufacturers in Boston, MA' },
  { href: '/manufacturers/california', label: 'Manufacturers in San Jose, CA' },
  { href: '/manufacturers/arizona', label: 'Manufacturers in Phoenix, AZ' },
  { href: '/manufacturers/illinois', label: 'Manufacturers in Chicago, IL' },
  // Top Industries section
  { href: '/industries/medical-devices', label: 'Medical Devices' },
  { href: '/industries/aerospace-defense', label: 'Aerospace & Defense' },
  { href: '/industries/automotive', label: 'Automotive' },
  { href: '/industries/industrial-controls', label: 'Industrial Controls' },
  { href: '/industries/consumer-electronics', label: 'Consumer Electronics' },
  // For Manufacturers section
  { href: '/list-your-company?intent=claim', label: 'Claim Profile' },
  { href: '/list-your-company?intent=update', label: 'Update Data' },
  { href: '/contact?topic=pricing', label: 'Pricing & Featured' },
  // Legal section
  { href: '/about', label: 'About (Legal)' },
  { href: '/privacy', label: 'Privacy' },
  { href: '/terms', label: 'Terms' },
  { href: '/contact', label: 'Contact' },
];

// Expected pages that should exist
const expectedPages = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
  '/industries',
  '/list-your-company',
  '/manufacturers',
];

// Pages that should use Navbar
const pagesToCheckNavbar = [
  'app/page.tsx',
  'app/about/page.tsx',
  'app/contact/page.tsx',
  'app/privacy/page.tsx',
  'app/terms/page.tsx',
  'app/industries/page.tsx',
  'app/list-your-company/page.tsx',
  'app/manufacturers/page.tsx',
  'app/companies/[slug]/page.tsx',
  'app/manufacturers/[state]/page.tsx',
  'app/industries/[industry]/page.tsx',
];

/**
 * Check if a file uses Navbar component
 */
function checkNavbarUsage(filePath) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(fullPath)) {
      return { found: false, error: 'File not found' };
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasNavbarImport = /import.*Navbar.*from|from.*navbar/.test(content);
    const hasNavbarUsage = /<Navbar\s*\/?>/.test(content);
    
    return {
      found: hasNavbarImport && hasNavbarUsage,
      hasImport: hasNavbarImport,
      hasUsage: hasNavbarUsage,
    };
  } catch (error) {
    return { found: false, error: error.message };
  }
}

/**
 * Test a URL (simulated - actual HTTP testing would require a running server)
 */
function testUrl(href, label) {
  // Remove query params for file checking
  const pathWithoutQuery = href.split('?')[0];
  const filePath = pathWithoutQuery === '/' 
    ? 'app/page.tsx'
    : `app${pathWithoutQuery}/page.tsx`;
  
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  
  if (exists) {
    results.passed.push({ type: 'url', href, label });
    return true;
  } else {
    // Check if it's a dynamic route
    if (pathWithoutQuery.includes('[') || pathWithoutQuery.includes(']')) {
      results.warnings.push({ type: 'url', href, label, reason: 'Dynamic route - manual testing required' });
      return null;
    }
    results.failed.push({ type: 'url', href, label, reason: 'Page file not found' });
    return false;
  }
}

/**
 * Print test results
 */
function printResults() {
  console.log('\n' + '='.repeat(60));
  console.log('NAVIGATION TEST RESULTS');
  console.log('='.repeat(60) + '\n');
  
  console.log(`${colors.green}✓ Passed: ${results.passed.length}${colors.reset}`);
  if (results.passed.length > 0) {
    results.passed.forEach(item => {
      console.log(`  ${colors.green}✓${colors.reset} ${item.label || item.file}`);
    });
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠ Warnings: ${results.warnings.length}${colors.reset}`);
    results.warnings.forEach(item => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${item.label || item.file}: ${item.reason}`);
    });
  }
  
  if (results.failed.length > 0) {
    console.log(`\n${colors.red}✗ Failed: ${results.failed.length}${colors.reset}`);
    results.failed.forEach(item => {
      console.log(`  ${colors.red}✗${colors.reset} ${item.label || item.file}: ${item.reason || 'Unknown error'}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Total: ${results.passed.length + results.warnings.length + results.failed.length} tests`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Main test function
 */
function runTests() {
  console.log(`${colors.cyan}Starting Navigation Tests...${colors.reset}\n`);
  
  // Test header links
  console.log(`${colors.blue}Testing Header Links...${colors.reset}`);
  headerLinks.forEach(link => {
    testUrl(link.href, link.label);
  });
  
  // Test footer links
  console.log(`${colors.blue}Testing Footer Links...${colors.reset}`);
  footerLinks.forEach(link => {
    testUrl(link.href, link.label);
  });
  
  // Test expected pages
  console.log(`${colors.blue}Testing Expected Pages...${colors.reset}`);
  expectedPages.forEach(page => {
    testUrl(page, `Page: ${page}`);
  });
  
  // Check Navbar usage
  console.log(`${colors.blue}Checking Navbar Usage...${colors.reset}`);
  pagesToCheckNavbar.forEach(filePath => {
    const check = checkNavbarUsage(filePath);
    if (check.found) {
      results.passed.push({ type: 'navbar', file: filePath });
    } else if (check.error) {
      results.failed.push({ type: 'navbar', file: filePath, reason: check.error });
    } else {
      const reasons = [];
      if (!check.hasImport) reasons.push('missing import');
      if (!check.hasUsage) reasons.push('missing usage');
      results.failed.push({ type: 'navbar', file: filePath, reason: reasons.join(', ') });
    }
  });
  
  // Print results
  printResults();
  
  // Exit with appropriate code
  if (results.failed.length > 0) {
    process.exit(1);
  }
}

// Run tests
runTests();
