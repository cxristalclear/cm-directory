import type { LngLatBoundsLike } from "mapbox-gl"
import type { FilterState } from "@/types/company"

export const COUNTRY_BOUNDS: Record<string, LngLatBoundsLike> = {
  USA: [-124.848974, 24.396308, -66.885444, 49.384358],
  US: [-124.848974, 24.396308, -66.885444, 49.384358],
  "UNITED STATES": [-124.848974, 24.396308, -66.885444, 49.384358],
  CANADA: [-141.0, 41.675105, -52.648099, 83.23324],
  CA: [-141.0, 41.675105, -52.648099, 83.23324],
  MEXICO: [-118.455, 14.5388286402, -86.710571, 32.718653],
  MX: [-118.455, 14.5388286402, -86.710571, 32.718653],
  CHINA: [73.4997347, 18.1616921, 134.772579, 53.561588],
  CN: [73.4997347, 18.1616921, 134.772579, 53.561588],
  TAIWAN: [119.534, 21.896, 122.006, 25.3],
  TW: [119.534, 21.896, 122.006, 25.3],
  JAPAN: [122.93853, 24.04552, 153.98694, 45.55304],
  JP: [122.93853, 24.04552, 153.98694, 45.55304],
  "SOUTH KOREA": [124.608, 33.115, 131.873, 38.619],
  KR: [124.608, 33.115, 131.873, 38.619],
  INDIA: [68.17665, 6.5546, 97.40256, 35.6745],
  IN: [68.17665, 6.5546, 97.40256, 35.6745],
  VIETNAM: [102.148, 8.179, 109.469, 23.353],
  VN: [102.148, 8.179, 109.469, 23.353],
  THAILAND: [97.344, 5.612, 105.639, 20.463],
  TH: [97.344, 5.612, 105.639, 20.463],
  MALAYSIA: [99.641, 0.855, 119.278, 7.363],
  MY: [99.641, 0.855, 119.278, 7.363],
  SINGAPORE: [103.605, 1.13, 104.085, 1.47],
  SG: [103.605, 1.13, 104.085, 1.47],
  PHILIPPINES: [116.954, 4.586, 126.61, 21.122],
  PH: [116.954, 4.586, 126.61, 21.122],
  GERMANY: [5.8663153, 47.2701236, 15.0419319, 55.0583836],
  DE: [5.8663153, 47.2701236, 15.0419319, 55.0583836],
  "UNITED KINGDOM": [-8.649357, 49.959999, 1.763337, 60.860761],
  UK: [-8.649357, 49.959999, 1.763337, 60.860761],
  GB: [-8.649357, 49.959999, 1.763337, 60.860761],
  FRANCE: [-5.142222, 41.342327, 9.561556, 51.089062],
  FR: [-5.142222, 41.342327, 9.561556, 51.089062],
  ITALY: [6.6272658, 36.6199873, 18.7844746, 47.1153932],
  IT: [6.6272658, 36.6199873, 18.7844746, 47.1153932],
  POLAND: [14.1231056, 49.0020468, 24.1458936, 54.8357889],
  PL: [14.1231056, 49.0020468, 24.1458936, 54.8357889],
  "CZECH REPUBLIC": [12.090717, 48.551808, 18.859216, 51.055703],
  CZ: [12.090717, 48.551808, 18.859216, 51.055703],
  HUNGARY: [16.094047, 45.743099, 22.896266, 48.585257],
  HU: [16.094047, 45.743099, 22.896266, 48.585257],
  ROMANIA: [20.26176, 43.618682, 29.626543, 48.26695],
  RO: [20.26176, 43.618682, 29.626543, 48.26695],
  IRELAND: [-10.662, 51.390, -5.658, 55.435],
  IE: [-10.662, 51.390, -5.658, 55.435],
  MOROCCO: [-13.172, 27.662, -0.996, 35.922],
  MA: [-13.172, 27.662, -0.996, 35.922],
  SPAIN: [-9.301515, 35.94685, 4.323222, 43.748337],
  ES: [-9.301515, 35.94685, 4.323222, 43.748337],
  SWITZERLAND: [5.956, 45.817, 10.492, 47.808],
  CH: [5.956, 45.817, 10.492, 47.808],
}

export const STATE_BOUNDS: Record<string, LngLatBoundsLike> = {
  AZ: [-114.81651, 31.332177, -109.045223, 37.003719],
  CA: [-124.482003, 32.528832, -114.131211, 42.009517],
  FL: [-87.634938, 24.396308, -80.031362, 31.000888],
  IN: [-88.09776, 37.771742, -84.784579, 41.761368],
  MA: [-73.508142, 41.237964, -69.928393, 42.887974],
  MD: [-79.487651, 37.885639, -75.039431, 39.723043],
  MI: [-90.418135, 41.696118, -82.413474, 48.306062],
  MN: [-97.239209, 43.499356, -89.491739, 49.384358],
  NC: [-84.321869, 33.842316, -75.400119, 36.588117],
  NH: [-72.557125, 42.696994, -70.610621, 45.305476],
  NY: [-79.762152, 40.477399, -71.852707, 45.01585],
  OH: [-84.820159, 38.403141, -80.518693, 41.977523],
  OR: [-124.566244, 41.991794, -116.463504, 46.292035],
  PA: [-80.519891, 39.7198, -74.689516, 42.26986],
  TX: [-106.645646, 25.837377, -93.508039, 36.500704],
  VA: [-83.675395, 36.540738, -75.242266, 39.466012],
  WA: [-124.848974, 45.543541, -116.917427, 49.002494],
  WI: [-92.889433, 42.49183, -86.249548, 47.309822],
  ON: [-95.15609, 41.676555, -74.343029, 56.859608],
  GD: [109.664493, 20.221365, 117.378853, 25.616001],
  JS: [116.365568, 30.757889, 121.997391, 35.202398],
  "BAJA CALIFORNIA": [-118.454914, 27.999198, -112.775669, 32.718653],
  CHIHUAHUA: [-109.057769, 25.543232, -103.001438, 31.783256],
  NL: [-101.953125, 23.185049, -98.422646, 27.800275],
  BIHOR: [21.374011, 46.385386, 22.780496, 47.352776],
  VALENCIA: [-1.762255, 37.849772, 0.602005, 40.986068],
  TELANGANA: [77.091224, 15.867025, 81.287247, 19.915609],
  VAUD: [6.022609, 45.70544, 7.463481, 46.774785],
}

type CombinedBounds = {
  bounds: LngLatBoundsLike
  center: [number, number]
  selectionCount: number
  zoom: number
}

const normalizeBounds = (bounds: LngLatBoundsLike): [number, number, number, number] => {
  if (Array.isArray(bounds)) {
    if (bounds.length === 4 && bounds.every((value) => typeof value === "number")) {
      return bounds as [number, number, number, number]
    }
    if (
      bounds.length === 2 &&
      Array.isArray(bounds[0]) &&
      Array.isArray(bounds[1]) &&
      bounds[0].length === 2 &&
      bounds[1].length === 2
    ) {
      const west = Number(bounds[0][0])
      const south = Number(bounds[0][1])
      const east = Number(bounds[1][0])
      const north = Number(bounds[1][1])
      return [west, south, east, north]
    }
  }
  throw new Error("Invalid bounds format")
}

const estimateZoom = ([west, south, east, north]: [number, number, number, number]): number => {
  const width = Math.abs(east - west)
  const height = Math.abs(north - south)
  const maxDiff = Math.max(width, height)

  if (maxDiff >= 60) return 3
  if (maxDiff >= 35) return 4
  if (maxDiff >= 20) return 5
  if (maxDiff >= 10) return 6
  if (maxDiff >= 6) return 7
  if (maxDiff >= 3) return 8
  if (maxDiff >= 1.5) return 9
  if (maxDiff >= 0.75) return 10
  if (maxDiff >= 0.4) return 11
  return 12
}

export function getFallbackBounds(filters: FilterState): CombinedBounds | null {
  const selectedBounds: [number, number, number, number][] = []

  for (const stateCode of filters.states) {
    const bounds = STATE_BOUNDS[stateCode.toUpperCase()]
    if (bounds) {
      selectedBounds.push(normalizeBounds(bounds))
    }
  }

  for (const countryCode of filters.countries) {
    const bounds = COUNTRY_BOUNDS[countryCode.toUpperCase()]
    if (bounds) {
      selectedBounds.push(normalizeBounds(bounds))
    }
  }

  if (selectedBounds.length === 0) {
    return null
  }

  const combined = selectedBounds.reduce<[number, number, number, number]>((acc, current) => {
    const [west, south, east, north] = current
    return [
      Math.min(acc[0], west),
      Math.min(acc[1], south),
      Math.max(acc[2], east),
      Math.max(acc[3], north),
    ]
  }, [...selectedBounds[0]])

  const center: [number, number] = [
    (combined[0] + combined[2]) / 2,
    (combined[1] + combined[3]) / 2,
  ]

  const bounds: LngLatBoundsLike = [
    [combined[0], combined[1]],
    [combined[2], combined[3]],
  ]

  return {
    bounds,
    center,
    selectionCount: selectedBounds.length,
    zoom: estimateZoom(combined),
  }
}
