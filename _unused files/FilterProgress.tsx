'use client'

export const FilterProgress = ({ isPending }: { isPending: boolean }) => {
  if (!isPending) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-blue-100">
      <div className="h-full bg-blue-600 transition-all duration-300 animate-progress"></div>
    </div>
  )
}