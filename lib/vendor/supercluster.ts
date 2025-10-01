type PointFeature<P extends Record<string, unknown>> = {
  type: "Feature"
  geometry: { type: "Point"; coordinates: [number, number] }
  properties: P
}

type ClusterProperties = {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
}

type SuperclusterOptions = {
  minPoints?: number
}

function abbreviate(count: number): string {
  if (count >= 1_000_000) {
    return `${Math.round(count / 100_000) / 10}M`
  }
  if (count >= 1_000) {
    return `${Math.round(count / 100) / 10}K`
  }
  return `${count}`
}

function computeResolution(zoom: number): number {
  const clamped = Number.isFinite(zoom) ? Math.max(0, Math.round(zoom)) : 0
  return Math.max(1, 20 - clamped)
}

function createBucketKey(lng: number, lat: number, resolution: number): string {
  const scaledLng = Math.round(lng * resolution)
  const scaledLat = Math.round(lat * resolution)
  return `${scaledLng}:${scaledLat}`
}

export default class Supercluster<P extends Record<string, unknown> = Record<string, unknown>> {
  private readonly minPoints: number
  private points: Array<PointFeature<P>> = []

  constructor(options: SuperclusterOptions = {}) {
    this.minPoints = Math.max(2, options.minPoints ?? 2)
  }

  load(points: Array<PointFeature<P>>): this {
    this.points = Array.isArray(points) ? [...points] : []
    return this
  }

  getClusters(
    bbox: [number, number, number, number],
    zoom: number,
  ): Array<PointFeature<P | ClusterProperties>> {
    const [minLng, minLat, maxLng, maxLat] = bbox
    const withinBounds = (feature: PointFeature<P>) => {
      const [lng, lat] = feature.geometry.coordinates
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat
    }

    const candidates = this.points.filter(withinBounds)
    if (candidates.length === 0) {
      return []
    }

    const resolution = computeResolution(zoom)
    const buckets = new Map<string, Array<PointFeature<P>>>()

    for (const feature of candidates) {
      const [lng, lat] = feature.geometry.coordinates
      const key = createBucketKey(lng, lat, resolution)
      const group = buckets.get(key)
      if (group) {
        group.push(feature)
      } else {
        buckets.set(key, [feature])
      }
    }

    const results: Array<PointFeature<P | ClusterProperties>> = []
    let nextClusterId = 1

    for (const group of buckets.values()) {
      if (group.length >= this.minPoints) {
        const total = group.length
        const [sumLng, sumLat] = group.reduce<[number, number]>(
          (acc, feature) => {
            const [lng, lat] = feature.geometry.coordinates
            return [acc[0] + lng, acc[1] + lat]
          },
          [0, 0],
        )

        results.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [sumLng / total, sumLat / total],
          },
          properties: {
            cluster: true,
            cluster_id: nextClusterId++,
            point_count: total,
            point_count_abbreviated: abbreviate(total),
          },
        })
      } else {
        results.push(...group)
      }
    }

    return results
  }
}

export type { ClusterProperties }
