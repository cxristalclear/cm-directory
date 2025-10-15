export type CertificationDirectoryEntry = {
  slug: string
  name: string
  dbName: string
  title: string
  description: string
  industry: string
}

export const CERTIFICATION_DIRECTORY: Record<string, CertificationDirectoryEntry> = {
  'iso-9001': {
    slug: 'iso-9001',
    name: 'ISO 9001',
    dbName: 'ISO 9001',
    title: 'ISO 9001 Certified Manufacturers',
    description: 'Quality management system certification for consistent product quality',
    industry: 'General Manufacturing',
  },
  'iso-13485': {
    slug: 'iso-13485',
    name: 'ISO 13485',
    dbName: 'ISO 13485',
    title: 'ISO 13485 Medical Device Manufacturers',
    description: 'Medical device quality management certification for regulatory compliance',
    industry: 'Medical Devices',
  },
  'as9100': {
    slug: 'as9100',
    name: 'AS9100',
    dbName: 'AS9100',
    title: 'AS9100 Aerospace Manufacturers',
    description: 'Aerospace quality management certification for aviation and defense',
    industry: 'Aerospace & Defense',
  },
  'iatf-16949': {
    slug: 'iatf-16949',
    name: 'IATF 16949',
    dbName: 'IATF 16949',
    title: 'IATF 16949 Automotive Manufacturers',
    description: 'Automotive quality management system for OEM suppliers',
    industry: 'Automotive',
  },
  itar: {
    slug: 'itar',
    name: 'ITAR Registered',
    dbName: 'ITAR',
    title: 'ITAR Registered Defense Manufacturers',
    description: 'International Traffic in Arms Regulations compliance for defense articles',
    industry: 'Defense',
  },
}

export const CERTIFICATION_DIRECTORY_SLUGS = Object.keys(CERTIFICATION_DIRECTORY)
