export default function CompanyLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Company Header Skeleton */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-xl animate-pulse" />
            <div className="flex-1">
              <div className="w-64 h-8 bg-white/20 rounded mb-2 animate-pulse" />
              <div className="w-48 h-4 bg-white/20 rounded mb-4 animate-pulse" />
              <div className="flex items-center gap-4">
                <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
                <div className="w-32 h-4 bg-white/20 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <div className="py-4 px-2">
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="py-4 px-2">
              <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="py-4 px-2">
              <div className="w-28 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-24 h-6 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-32 h-6 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="w-full h-8 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="w-32 h-5 bg-gray-200 rounded mb-4 animate-pulse" />
              <div className="space-y-3">
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-full h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}