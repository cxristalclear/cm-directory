'use client'

/**
* Render a top fixed thin progress bar when loading is pending.
* @example
* FilterProgress({ isPending: true })
* <div className="fixed top-0 left-0 right-0 h-1 bg-blue-100 z-50" role="progressbar" aria-label="Loading" aria-live="polite"><div className="h-full bg-blue-600 transition-all duration-300 animate-progress" /></div>
* @param {{boolean}} {{isPending}} - Whether the loading state is pending.
* @returns {{JSX.Element|null}} Rendered progress bar element when pending, otherwise null.
**/
export const FilterProgress = ({ isPending }: { isPending: boolean }) => {
  if (!isPending) return null
  
  return (
    <div 
      className="fixed top-0 left-0 right-0 h-1 bg-blue-100 z-50"
      role="progressbar"
      aria-label="Loading"
      aria-live="polite"
    >
      <div className="h-full bg-blue-600 transition-all duration-300 animate-progress" />
    </div>
  )
}