'use client'

import { Plus } from 'lucide-react'

interface AddCompanyButtonProps {
  className?: string
  variant?: 'primary' | 'secondary'
}

export default function AddCompanyButton({ 
  className = '',
  variant = 'primary' 
}: AddCompanyButtonProps) {
  const addCompanyUrl = process.env.NEXT_PUBLIC_JOTFORM_ADD_URL || 'https://form.jotform.com/252715469871165'
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.open(
      addCompanyUrl,
      'blank',
      'scrollbars=yes, toolbar=no, width=700, height=500'
    )
  }
  
  const baseStyles = "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm cursor-pointer"
  
  const variantStyles = {
    primary: "rounded-lg bg-blue-700/50 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-blue-700/30",
    secondary: "rounded-lg bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
  }
  
  return (
    <a
      href={addCompanyUrl}
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
    >
      <Plus className="w-4 h-4" />
      Add Your Company
    </a>
  )
}