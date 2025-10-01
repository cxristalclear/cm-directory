import Supercluster from "@mapbox/supercluster"

import type { MapFacility } from "@/lib/queries/mapSearch"

export type MapCluster = {
  id: string
  coordinates: [number, number]
  point_count: number
}

export type MapClusterLeaf = MapFacility

export type CreateClustersInput = {
  facilities: MapFacility[]
  zoom: number
  bbox: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }
}

export type CreateClustersResult = {
  clusters: MapCluster[]
  leaves: MapClusterLeaf[]
}

type ClusterProperties = {
  cluster: true
  cluster_id: number
  point_count: number
  point_count_abbreviated: string
}

const SUPERCLUSTER_MIN_POINTS = 2

function isClusterProperties(properties: unknown): properties is ClusterProperties {
  if (!properties || typeof properties !== "object") {
    return false
  }

  const candidate = properties as Record<string, unknown>
  return (
    candidate.cluster === true &&
    typeof candidate.cluster_id === "number" &&
    typeof candidate.point_count === "number"
  )
}

function toFeature(facility: MapFacility) {
  return {
    type: "Feature" as const,
    geometry: { type: "Point" as const, coordinates: [facility.lng, facility.lat] as [number, number] },
    properties: facility,
  }
}

export function createClusters({ facilities, zoom, bbox }: CreateClustersInput): CreateClustersResult {
  if (!Array.isArray(facilities) || facilities.length === 0) {
    return { clusters: [], leaves: [] }
  }

  const cluster = new Supercluster({ minPoints: SUPERCLUSTER_MIN_POINTS })
    .load(facilities.map(toFeature))

  const viewportClusters = cluster.getClusters(
    [bbox.minLng, bbox.minLat, bbox.maxLng, bbox.maxLat],
    Math.max(0, Math.round(zoom)),
  )

  const clusters: MapCluster[] = []
  const leaves: MapClusterLeaf[] = facilities.map((facility) => ({ ...facility }))

  for (const feature of viewportClusters) {
    const [lng, lat] = feature.geometry.coordinates as [number, number]
    if (isClusterProperties(feature.properties)) {
      clusters.push({
        id: String(feature.properties.cluster_id),
        coordinates: [lng, lat],
        point_count: feature.properties.point_count,
      })
      continue
    }
  }

  leaves.sort((a, b) => {
    if (a.company_name !== b.company_name) {
      return a.company_name.localeCompare(b.company_name)
    }
    return a.facility_id.localeCompare(b.facility_id)
  })

  clusters.sort((a, b) => a.id.localeCompare(b.id))

  return { clusters, leaves }
}

export default createClusters
