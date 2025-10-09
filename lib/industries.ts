export type IndustrySlug =
  | 'medical-devices'
  | 'aerospace-defense'
  | 'automotive'
  | 'industrial-controls'
  | 'consumer-electronics'

export type IndustryDefinition = {
  slug: IndustrySlug
  name: string
  dbName: string
  title: string
  description: string
  summary: string
  requirements: string[]
}

export const INDUSTRY_DATA: Record<IndustrySlug, IndustryDefinition> = {
  'medical-devices': {
    slug: 'medical-devices',
    name: 'Medical Devices',
    dbName: 'Medical Devices',
    title: 'Medical Device Contract Manufacturers',
    description: 'FDA-compliant manufacturing for medical devices and diagnostic equipment',
    summary:
      'Discover FDA-compliant partners experienced with diagnostic equipment and medical device production.',
    requirements: ['ISO 13485', 'FDA Registration', 'Clean Room', 'Traceability'],
  },
  'aerospace-defense': {
    slug: 'aerospace-defense',
    name: 'Aerospace & Defense',
    dbName: 'Aerospace/Defense',
    title: 'Aerospace and Defense Manufacturers',
    description: 'AS9100 certified manufacturing for aviation and defense applications',
    summary:
      'Find partners with AS9100 programs and defense production experience for mission-critical builds.',
    requirements: ['AS9100', 'ITAR', 'NADCAP', 'First Article Inspection'],
  },
  automotive: {
    slug: 'automotive',
    name: 'Automotive',
    dbName: 'Automotive',
    title: 'Automotive Electronics Manufacturers',
    description: 'IATF 16949 certified manufacturing for automotive electronics and components',
    summary:
      'Explore IATF 16949 qualified suppliers supporting automotive-grade electronics and assemblies.',
    requirements: ['IATF 16949', 'PPAP', 'APQP', 'Automotive Grade Components'],
  },
  'industrial-controls': {
    slug: 'industrial-controls',
    name: 'Industrial Controls',
    dbName: 'Industrial Controls',
    title: 'Industrial Control System Manufacturers',
    description: 'Rugged electronics manufacturing for industrial automation and control systems',
    summary:
      'Connect with manufacturers building ruggedized controls for automation and harsh environments.',
    requirements: ['UL Certification', 'Conformal Coating', 'Extended Temperature', 'Vibration Testing'],
  },
  'consumer-electronics': {
    slug: 'consumer-electronics',
    name: 'Consumer Electronics',
    dbName: 'Consumer Electronics',
    title: 'Consumer Electronics Contract Manufacturers',
    description: 'High-volume manufacturing for consumer electronic products',
    summary:
      'Source high-volume EMS partners optimized for consumer product launches and scaling.',
    requirements: ['RoHS Compliant', 'FCC Certification', 'High Volume', 'Cost Optimization'],
  },
}

export const allIndustries: IndustryDefinition[] = Object.values(INDUSTRY_DATA)

export function getIndustryBySlug(slug: string) {
  return INDUSTRY_DATA[slug as IndustrySlug] ?? null
}

export function getIndustrySlugs(): IndustrySlug[] {
  return allIndustries.map(industry => industry.slug)
}

export function getRelatedIndustries(
  slug: IndustrySlug,
  limit = 3,
): IndustryDefinition[] {
  return allIndustries.filter(industry => industry.slug !== slug).slice(0, limit)
}
