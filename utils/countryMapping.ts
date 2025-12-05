// utils/countryMapping.ts
export const COUNTRIES = {
  'USA': 'United States',
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'CN': 'China',
  'TW': 'Taiwan',
  'JP': 'Japan',
  'KR': 'South Korea',
  'IN': 'India',
  'VN': 'Vietnam',
  'TH': 'Thailand',
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'PH': 'Philippines',
  'DE': 'Germany',
  'GB': 'United Kingdom',
  'FR': 'France',
  'IT': 'Italy',
  'PL': 'Poland',
  'CZ': 'Czech Republic',
  'HU': 'Hungary',
  'RO': 'Romania',
} as const

export function getCountryName(code: string): string {
  return COUNTRIES[code as keyof typeof COUNTRIES] || code
}

/* For non-US countries, you might want province/region mapping */
export const REGIONS = {
  'CA': { // Canada
    'ON': 'Ontario',
    'QC': 'Quebec',
    'BC': 'British Columbia',
    'AB': 'Alberta',
    // ... other provinces
  },
  'CN': { // China
    'GD': 'Guangdong',
    'JS': 'Jiangsu',
    'ZJ': 'Zhejiang',
    'SH': 'Shanghai',
    // ... other provinces
  },
  // ... other countries
}