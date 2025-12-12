import EmptyState from '@/components/EmptyState'
import Navbar from '@/components/navbar'

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <EmptyState 
            variant="not-found"
            actionHref="/"
          />
        </div>
      </div>
    </>
  )
}