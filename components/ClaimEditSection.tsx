'use client'

import { Building2, Edit3 } from 'lucide-react'

interface ClaimEditSectionProps {
  companyName: string
  companySlug: string
  className?: string
}

/**
* Renders a section with "Claim Company" and "Suggest Edit" links that open a prefilled JotForm for the given company.
* @example
* ClaimEditSection({ companyName: 'Acme Corp', companySlug: 'acme-corp' })
* Returns a JSX element rendering the claim/edit links.
* @param {string} companyName - Company display name used to prefill the claim/edit form.
* @param {string} companySlug - Company slug used to prefill the claim/edit form.
* @param {string} [className] - Optional additional CSS class names for the outer container.
* @returns {JSX.Element} Rendered JSX element containing claim and suggest edit actions.
**/
export default function ClaimEditSection({
  companyName,
  companySlug,
  className = '',
}: ClaimEditSectionProps) {
  const claimFormUrl = process.env.NEXT_PUBLIC_JOTFORM_CLAIM_URL || 'https://form.jotform.com/252655541644056'
  
  // Pre-fill form with company info
  const claimUrl = `${claimFormUrl}?company=${encodeURIComponent(companyName)}&slug=${encodeURIComponent(companySlug)}`

  const handleClaimClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.open(
      claimUrl,
      'blank',
      'scrollbars=yes, toolbar=no, width=700, height=500'
    )
  }

  const handleEditClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.open(
      claimUrl,
      'blank',
      'scrollbars=yes, toolbar=no, width=700, height=500'
    )
  }

  return (
    <div className={`border-t border-gray-200 pt-6 mt-8 ${className}`}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-sm text-gray-600">
          Is this your company? <span className="font-medium">Claim it</span> or{' '}
          <span className="font-medium">suggest an edit</span>.
        </p>
        
        <div className="flex gap-2">
          <a
            href={claimUrl}
            onClick={handleClaimClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
          >
            <Building2 className="w-3.5 h-3.5" />
            Claim Company
          </a>
          
          <a
            href={claimUrl}
            onClick={handleEditClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Suggest Edit
          </a>
        </div>
      </div>
    </div>
  )
}