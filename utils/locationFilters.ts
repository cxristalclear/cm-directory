import type { HomepageFacility, HomepageFacilityLocation } from "@/types/homepage"
import { COUNTRIES, getCountryName } from "@/utils/countryMapping"
import { STATE_NAMES, getStateName } from "@/utils/stateMapping"

type FacilityLocationLike = HomepageFacility | HomepageFacilityLocation

const US_STATE_CODES = new Set(Object.keys(STATE_NAMES))

const STATE_COUNTRY_MAP: Record<string, string> = Object.fromEntries(
  Object.keys(STATE_NAMES).map((code) => [code, "US"]),
)

// Non-standard aliases and special cases; official country names should rely on COUNTRY_NAME_TO_CODE.
const COUNTRY_CODE_ALIASES: Record<string, string> = {
  USA: "US",
  "UNITED STATES OF AMERICA": "US",
  "U.S.": "US",
  "U.S.A.": "US",
  UK: "GB",
  "GREAT BRITAIN": "GB",
  ENGLAND: "GB",
  SCOTLAND: "GB",
  WALES: "GB",
  "NORTHERN IRELAND": "GB",
  "REPUBLIC OF IRELAND": "IE",
  IRELAND: "IE",
  "REPUBLIC OF CHINA": "TW",
  KOREA: "KR",
  "NORTH KOREA": "KP",
  HONGKONG: "HK",
  "HONG KONG": "HK",
  "HONG KONG SAR": "HK",
  MACAO: "MO",
  "MACAU": "MO",
  "PEOPLE'S REPUBLIC OF CHINA": "CN",
  NAMIBIA: "NA",
}

const COUNTRY_NAME_TO_CODE: Record<string, string> = Object.entries(COUNTRIES).reduce(
  (map, [code, name]) => {
    const upperName = name.toUpperCase()
    const collapsedName = upperName.replace(/[.\s]/g, "")
    map[upperName] = code
    map[collapsedName] = code
    return map
  },
  {} as Record<string, string>,
)

const ISO3_TO_ISO2: Record<string, string> = {
  USA: "US",
  CAN: "CA",
  MEX: "MX",
  GBR: "GB",
  CHN: "CN",
  TWN: "TW",
  DEU: "DE",
  FRA: "FR",
  ITA: "IT",
  JPN: "JP",
  KOR: "KR",
}

const normalizeSpaces = (value: string) => value.replace(/\s+/g, " ")

const COUNTRY_NAME_TOKENS = [
  "united kingdom",
  "united states",
  "united states of america",
  "great britain",
  "england",
  "scotland",
  "wales",
  "northern ireland",
  "ireland",
  "republic of ireland",
  "republic of china",
  "people's republic of china",
  "hong kong",
  "hong kong sar",
  "macau",
  "macao",
  "taiwan",
  "south korea",
  "north korea",
  "namibia",
  "usa",
  "uk",
  "gb",
]

const stripTrailingCountryOrPostal = (value: string): string => {
  let result = value.trim()

  // Remove trailing comma-separated tokens that are country names or codes
  for (const token of COUNTRY_NAME_TOKENS) {
    // Require comma OR word boundary before token
    const pattern = new RegExp(`(?:,\\s*|\\b)${token}$`, 'i')
    result = result.replace(pattern, '').trim()
  }

  // Remove trailing postal codes (e.g., YO51 9UY, 92101, etc.)
  result = result.replace(/(?:,\s*)?[A-Z]{1,2}\d[A-Z\d ]{2,}$/i, '').trim()

  // Remove stray commas or spaces left behind
  result = result.replace(/,\s*,/g, ', ').replace(/,\s*$/, '').trim()

  return result
}

const regionDisplayNames =
  typeof Intl !== "undefined" && typeof (Intl as typeof Intl & { DisplayNames?: typeof Intl.DisplayNames }).DisplayNames !== "undefined"
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null

const EXTRA_REGION_NAMES: Record<string, string> = {
  ON: "Ontario",
  QC: "Quebec",
  BC: "British Columbia",
  AB: "Alberta",
  MB: "Manitoba",
  SK: "Saskatchewan",
  NB: "New Brunswick",
  NL: "Newfoundland and Labrador",
  NS: "Nova Scotia",
  PE: "Prince Edward Island",
  YT: "Yukon",
  NT: "Northwest Territories",
  NU: "Nunavut",
  MP: "Northern Mariana Islands",
  GU: "Guam",
  VI: "U.S. Virgin Islands",
  AS: "American Samoa",
  PR: "Puerto Rico",
  "NORTH YORKSHIRE": "North Yorkshire",
  "YORKSHIRE": "Yorkshire",
  "GREATER LONDON": "Greater London",
  LONDON: "London",
  ENGLAND: "England",
  SCOTLAND: "Scotland",
  WALES: "Wales",
  "NORTHERN IRELAND": "Northern Ireland",
}

const EXTRA_REGION_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(EXTRA_REGION_NAMES).map(([code, name]) => [name.toLowerCase(), code]),
)

const EXTRA_REGION_COUNTRY_MAP: Record<string, string> = {
  ON: "CA",
  QC: "CA",
  BC: "CA",
  AB: "CA",
  MB: "CA",
  SK: "CA",
  NB: "CA",
  NL: "CA",
  NS: "CA",
  PE: "CA",
  YT: "CA",
  NT: "CA",
  NU: "CA",
  MP: "US",
  GU: "US",
  VI: "US",
  AS: "US",
  PR: "US",
  "NORTH YORKSHIRE": "GB",
  "YORKSHIRE": "GB",
  "GREATER LONDON": "GB",
  LONDON: "GB",
  ENGLAND: "GB",
  SCOTLAND: "GB",
  WALES: "GB",
  "NORTHERN IRELAND": "GB",
}

export const normalizeCountryCode = (value?: string | null): string | null => {
  const trimmed = value?.trim()
  if (!trimmed) return null
  const upper = trimmed.toUpperCase()
  const collapsed = upper.replace(/[.\s]/g, "")

  if (ISO3_TO_ISO2[upper]) return ISO3_TO_ISO2[upper]
  if (ISO3_TO_ISO2[collapsed]) return ISO3_TO_ISO2[collapsed]

  if (COUNTRY_CODE_ALIASES[upper]) return COUNTRY_CODE_ALIASES[upper]
  if (COUNTRY_CODE_ALIASES[collapsed]) return COUNTRY_CODE_ALIASES[collapsed]

  if (COUNTRY_NAME_TO_CODE[upper]) return COUNTRY_NAME_TO_CODE[upper]
  if (COUNTRY_NAME_TO_CODE[collapsed]) return COUNTRY_NAME_TO_CODE[collapsed]

  if (upper.length === 2) return upper
  return upper
}

export const formatCountryLabel = (code: string): string => {
  if (!code) return "Unknown Country"
  const normalized = normalizeCountryCode(code) || code
  const mapped = getCountryName(normalized)
  if (mapped && mapped !== normalized) return mapped
  if (regionDisplayNames) {
    try {
      const display = regionDisplayNames.of(normalized)
      if (display && display !== normalized) {
        return display
      }
    } catch {
      // ignore invalid codes
    }
  }
  if (normalized.length > 2) {
    return titleCase(normalized.toLowerCase())
  }
  return normalized
}

export const normalizeStateFilterValue = (value?: string | null): string | null => {
  const trimmed = value?.trim()
  if (!trimmed) return null

  let normalized = normalizeSpaces(trimmed.replace(/\s*,\s*/g, ', '))
  normalized = stripTrailingCountryOrPostal(normalized)
  if (!normalized) normalized = trimmed

  const upper = normalized.toUpperCase()
  if (US_STATE_CODES.has(upper)) {
    return upper
  }
  if (EXTRA_REGION_NAMES[upper]) {
    return upper
  }
  const lower = normalized.toLowerCase()
  const aliasCode = EXTRA_REGION_NAME_TO_CODE[lower]
  if (aliasCode) {
    return aliasCode
  }
  return lower
}

export const getFacilityStateKey = (facility: FacilityLocationLike): string | null => {
  const stateCode = normalizeStateFilterValue(facility.state_code)
  if (stateCode) return stateCode
  const stateProvince = normalizeStateFilterValue(facility.state_province)
  if (stateProvince) return stateProvince
  return normalizeStateFilterValue(facility.state)
}

const inferCountryFromStateKeyInternal = (key: string | null): string | null => {
  if (!key) return null
  const upper = key.toUpperCase()
  if (STATE_COUNTRY_MAP[upper]) return STATE_COUNTRY_MAP[upper]
  if (EXTRA_REGION_COUNTRY_MAP[upper]) return EXTRA_REGION_COUNTRY_MAP[upper]
  const alias = EXTRA_REGION_NAME_TO_CODE[key.toLowerCase()]
  if (alias) {
    const aliasUpper = alias.toUpperCase()
    return STATE_COUNTRY_MAP[aliasUpper] || EXTRA_REGION_COUNTRY_MAP[aliasUpper] || null
  }
  return null
}

export const getFacilityCountryCode = (
  facility: FacilityLocationLike,
  options?: { allowStateInference?: boolean }
): string | null => {
  const direct = normalizeCountryCode(facility.country_code || facility.country)
  if (direct) return direct
  if (options?.allowStateInference === false) {
    return null
  }
  const inferred = inferCountryFromStateKeyInternal(getFacilityStateKey(facility))
  return inferred || null
}
export const getFacilityStateLabel = (facility: FacilityLocationLike): string | null => {
  const stateCode = normalizeStateFilterValue(facility.state_code)
  if (stateCode) {
    return formatStateLabelFromKey(stateCode)
  }
  const stateProvince = normalizeStateFilterValue(facility.state_province)
  if (stateProvince) {
    return formatStateLabelFromKey(stateProvince)
  }
  const state = normalizeStateFilterValue(facility.state)
  if (state) {
    return formatStateLabelFromKey(state)
  }
  return null
}


export const inferCountryCodeFromState = (state?: string | null): string | null => {
  return inferCountryFromStateKeyInternal(normalizeStateFilterValue(state))
}

export const inferCountryCodeFromStateKey = (key?: string | null): string | null => {
  return inferCountryFromStateKeyInternal(key ?? null)
}

export const getFacilityLocationLabel = (facility?: FacilityLocationLike | null): string => {
  if (!facility) return "Multiple"

  const city = facility.city?.trim()
  const region = getFacilityStateLabel(facility)
  const countryCode = getFacilityCountryCode(facility)
  const country = countryCode ? formatCountryLabel(countryCode) : facility.country?.trim()

  const parts = [city, region, country].filter(Boolean)
  return parts.length > 0 ? parts.join(", ") : "Multiple"
}

const titleCase = (value: string) =>
  value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase())

export const formatStateLabelFromKey = (key: string): string => {
  if (!key) return "Unknown Region"
  const normalized = normalizeSpaces(key)
  const upper = normalized.toUpperCase()
  if (US_STATE_CODES.has(upper)) {
    return getStateName(upper) || upper
  }
  const override = EXTRA_REGION_NAMES[upper]
  if (override) {
    return override
  }
  return titleCase(normalized)
}
