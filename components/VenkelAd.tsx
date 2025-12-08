'use client'

import Link from 'next/link'
import { ExternalLink, Package, TrendingUp, Clock } from 'lucide-react'

type VenkelAdSize = 'banner' | 'sidebar' | 'featured'

interface VenkelAdProps {
  size?: VenkelAdSize
  className?: string
}

export default function VenkelAd({ size = 'banner', className = '' }: VenkelAdProps) {
  
  // Banner Ad (horizontal, top/bottom of content)
  if (size === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-xl border-2 border-dashed border-orange-200 px-4 py-2`}>
        <div className="flex items-center gap-1 mb-1">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider px-2 py-0.5 bg-orange-100 rounded">Sponsored</span>
        </div>
        <div className="p-1">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
            <div className="flex-1 ">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="text-xl font-bold text-gray-900">
                  Venkel
                </div>
              </div>
              <p className="text-gray-700 mb-2 text-sm font-normal">
                Free custom stocking programs  •  Direct pricing  •  Fast shipping from Austin, TX
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-orange-600" />
                  <span>VMI Programs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                  <span>Factory Direct</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Quick Turnaround</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Link
                href="https://venkel.com/free-stocking-programs"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="inline-flex items-center gap-1.5 bg-orange-500 text-white px-4 py-2 rounded-md font-semibold hover:bg-orange-700 transition-colors text-xs"
              >
                Learn More
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Sidebar Ad (vertical, narrow)
  if (size === 'sidebar') {
    return (
      <div className={`bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4`}>
        <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">
          Sponsored
        </div>
        <div className="p-3">
          <div className="text-center mb-2">
            <h3 className="font-bold text-gray-900 text-sm mb-1">
              Venkel
            </h3>
            <p className="text-xs text-gray-600 mb-3">
              Factory-Direct Components with Free Stocking Programs from Austin, TX
            </p>
          </div>
        

          <Link
            href="https://venkel.com/free-stocking-programs"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-1.5 bg-orange-500 text-white px-3 py-1.5 rounded-md font-semibold hover:bg-orange-700 transition-colors w-full text-xs"
          >
            Learn More
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    )
  }

  // Featured Ad (large, prominent)
  if (size === 'featured') {
    return (
      <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg ${className}`}>
        <div className="px-4 py-1 bg-gray-50 border-b border-gray-200">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Featured Partner</span>
        </div>
        <div className="p-8 md:p-10">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Venkel
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Experience the Difference™
            </p>
            <p className="text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto">
              Factory-direct electronic components with free custom stocking programs. 
              Save time and money with Venkel&apos;s Supply Chain Services.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <Package className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Free Stocking Programs</h4>
                <p className="text-sm text-gray-600">VMI and BIP programs tailored to your needs</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Factory Direct Pricing</h4>
                <p className="text-sm text-gray-600">No middleman markups on components</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                <Clock className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Austin, TX Based</h4>
                <p className="text-sm text-gray-600">Fast shipping and dedicated support</p>
              </div>
            </div>

            <Link
              href="https://venkel.com/free-stocking-programs"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-700 transition-colors shadow-md"
            >
              Explore Stocking Programs
              <ExternalLink className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return null
}
