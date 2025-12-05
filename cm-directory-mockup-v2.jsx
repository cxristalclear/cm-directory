import React, { useState } from 'react';
import { Search, MapPin, Users, Building2, Star, Clock, CheckCircle, X, Filter, ChevronDown, List, Grid, Map, Layers, RotateCcw, Plus, Minus } from 'lucide-react';

export default function CMDirectoryMockupV2() {
  const [activeFilters, setActiveFilters] = useState(['United States', 'SMT Assembly']);
  const [viewMode, setViewMode] = useState('split');

  const companies = [
    {
      id: 1,
      name: 'Precision Electronics Manufacturing',
      location: 'San Jose, California',
      codes: 'CA, US',
      employees: '500-1,000',
      description: 'Full-service EMS provider specializing in high-reliability PCB assembly for aerospace and medical devices. AS9100D and ISO 13485 certified.',
      capabilities: ['SMT Assembly', 'Box Build', 'Prototyping'],
      certifications: ['ISO 9001', 'AS9100D', 'ITAR'],
      rating: 4.8,
      reviews: 24,
      responseTime: '< 24 hrs',
      verified: true,
    },
    {
      id: 2,
      name: 'MidWest Circuit Solutions',
      location: 'Chicago, Illinois',
      codes: 'IL, US',
      employees: '100-250',
      description: 'Specialized in quick-turn prototyping and low-volume production with strong expertise in RF assemblies.',
      capabilities: ['SMT Assembly', 'Through-Hole', 'Prototyping'],
      certifications: ['ISO 9001', 'IPC-A-610'],
      rating: 4.6,
      reviews: 18,
      responseTime: '< 48 hrs',
      verified: true,
    },
    {
      id: 3,
      name: 'Pacific Assembly Group',
      location: 'Portland, Oregon',
      codes: 'OR, US',
      employees: '250-500',
      description: 'Environmental sustainability focused manufacturer offering carbon-neutral production for consumer electronics.',
      capabilities: ['SMT Assembly', 'Box Build', 'Cable Harness'],
      certifications: ['ISO 14001', 'ISO 9001'],
      rating: 4.5,
      reviews: 12,
      responseTime: '< 24 hrs',
      verified: false,
    },
  ];

  const removeFilter = (filter) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
  };

  return (
    <div className="min-h-screen bg-gray-50 text-sm">
      {/* Header - Clean, no quick filters */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 text-lg">PCBA Finder</span>
            </div>

            <nav className="flex items-center gap-1">
              <a href="#" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">Industries</a>
              <a href="#" className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">Resources</a>
              <button className="ml-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Add Company
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero with Prominent Search */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Find Your Next Manufacturing Partner
          </h1>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            Connect with 420+ verified contract manufacturers. Filter by capabilities, certifications, and location.
          </p>
          
          {/* Prominent Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder='Try "Low-volume SMT in California" or "ISO 13485 medical device assembly"'
                className="w-full pl-12 pr-32 py-4 text-base text-gray-900 bg-white rounded-xl shadow-lg border-2 border-transparent focus:border-blue-300 focus:ring-4 focus:ring-blue-200/50 outline-none placeholder:text-gray-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar - Reinforces map as USP */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-full">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-bold text-gray-900">446</span>
              <span className="text-gray-500 text-sm">Locations Mapped</span>
            </div>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-gray-100 rounded-full">
                <Building2 className="w-4 h-4 text-gray-600" />
              </div>
              <span className="font-bold text-gray-900">420</span>
              <span className="text-gray-500 text-sm">Verified Companies</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Bar */}
      {activeFilters.length > 0 && (
        <div className="sticky top-14 z-40 bg-white border-b border-gray-200 py-2.5">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 overflow-x-auto">
              <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Active filters:</span>
              {activeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => removeFilter(filter)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200 hover:bg-blue-100 whitespace-nowrap group"
                >
                  {filter}
                  <X className="w-3 h-3 group-hover:text-blue-900" />
                </button>
              ))}
              <button className="text-xs text-gray-500 hover:text-red-600 whitespace-nowrap font-medium">
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Hidden on mobile, shown on lg+ */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-32 space-y-3">
              {[
                { name: 'Location', icon: MapPin, count: 2, expanded: true },
                { name: 'Capabilities', icon: Layers, count: 1, expanded: true },
                { name: 'Certifications', icon: CheckCircle, count: 0, expanded: false },
                { name: 'Volume', icon: Grid, count: 0, expanded: false },
              ].map((section) => (
                <div key={section.name} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${section.count > 0 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <section.icon className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-gray-800">{section.name}</span>
                      {section.count > 0 && (
                        <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[18px] text-center">
                          {section.count}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${section.expanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              ))}

              {/* Sidebar Sponsored */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 p-4 mt-4">
                <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wider mb-2">Sponsored</div>
                <div className="font-bold text-gray-900 mb-1">Venkel</div>
                <p className="text-xs text-gray-600 mb-3">Factory-direct components with free stocking programs</p>
                <button className="w-full py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                  Learn More →
                </button>
              </div>
            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-1 min-w-0">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900">Results</h2>
                <span className="text-sm text-gray-500">385 companies</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {[
                    { mode: 'list', icon: List, label: 'List' },
                    { mode: 'split', icon: Grid, label: 'Split' },
                    { mode: 'map', icon: Map, label: 'Map' },
                  ].map(({ mode, icon: Icon, label }) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        viewMode === mode 
                          ? 'bg-white text-gray-900 shadow-sm' 
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                <select className="text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option>Sort: Relevance</option>
                  <option>Sort: Rating</option>
                  <option>Sort: Response Time</option>
                </select>
              </div>
            </div>

            {/* PROMINENT MAP - Full width when in map mode, or large in split */}
            {(viewMode === 'map' || viewMode === 'split') && (
              <div className={`relative mb-4 ${viewMode === 'map' ? 'h-[500px]' : 'h-[400px]'} bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl border border-gray-200 overflow-hidden shadow-sm`}>
                {/* Map Placeholder with realistic styling */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgb3BhY2l0eT0iMC40IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                
                {/* Simulated Map Clusters */}
                <div className="absolute inset-0">
                  {/* West Coast Cluster */}
                  <div className="absolute left-[15%] top-[35%] w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-3 border-white cursor-pointer hover:scale-110 transition-transform">
                    144
                  </div>
                  {/* Pacific NW */}
                  <div className="absolute left-[12%] top-[18%] w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-3 border-white cursor-pointer hover:scale-110 transition-transform">
                    22
                  </div>
                  {/* Mountain */}
                  <div className="absolute left-[28%] top-[40%] w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                    8
                  </div>
                  {/* Texas */}
                  <div className="absolute left-[38%] top-[55%] w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-3 border-white cursor-pointer hover:scale-110 transition-transform">
                    46
                  </div>
                  {/* Midwest */}
                  <div className="absolute left-[48%] top-[32%] w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-3 border-white cursor-pointer hover:scale-110 transition-transform">
                    71
                  </div>
                  {/* Southeast */}
                  <div className="absolute left-[58%] top-[50%] w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg border-3 border-white cursor-pointer hover:scale-110 transition-transform">
                    34
                  </div>
                  {/* Northeast */}
                  <div className="absolute left-[70%] top-[28%] w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg border-3 border-white cursor-pointer hover:scale-110 transition-transform">
                    98
                  </div>
                  {/* New England */}
                  <div className="absolute left-[78%] top-[22%] w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-lg border-2 border-white cursor-pointer hover:scale-110 transition-transform">
                    6
                  </div>
                </div>

                {/* Map Status Pill - Centered at top */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
                  <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg px-5 py-2.5 rounded-full flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <div className="p-1 bg-blue-100 text-blue-600 rounded-full">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-gray-900 font-bold">446</span> locations
                    </div>
                    <div className="w-px h-4 bg-gray-300" />
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <div className="p-1 bg-gray-100 text-gray-600 rounded-full">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-gray-900 font-bold">385</span> companies
                    </div>
                  </div>
                </div>

                {/* Map Controls - Right side */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    <button className="p-2.5 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 border-b border-gray-100">
                      <Plus className="w-4 h-4" />
                    </button>
                    <button className="p-2.5 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900">
                      <Minus className="w-4 h-4" />
                    </button>
                  </div>
                  <button className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {/* Layers Control - Bottom left */}
                <div className="absolute bottom-4 left-4 z-10">
                  <button className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                    <Layers className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Company Cards */}
            {viewMode !== 'map' && (
              <div className="space-y-3">
                {companies.map((company) => (
                  <div key={company.id} className="group bg-white rounded-xl border border-gray-200 p-4 hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 flex-shrink-0 transition-colors">
                        <Building2 className="w-6 h-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {company.name}
                            </h3>
                            {company.verified && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-100">
                                <CheckCircle className="w-3 h-3" />
                                VERIFIED
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm flex-shrink-0">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="font-semibold">{company.rating}</span>
                            <span className="text-gray-400 text-xs">({company.reviews})</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {company.location}
                            <span className="text-gray-300">({company.codes})</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {company.employees}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <Clock className="w-3.5 h-3.5" />
                            Responds {company.responseTime}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{company.description}</p>

                        <div className="flex flex-wrap gap-1.5">
                          {company.capabilities.map((cap) => (
                            <span key={cap} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded border border-blue-100">
                              {cap}
                            </span>
                          ))}
                          {company.certifications.slice(0, 2).map((cert) => (
                            <span key={cert} className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-semibold rounded border border-amber-100">
                              {cert}
                            </span>
                          ))}
                          {company.certifications.length > 2 && (
                            <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[10px] font-medium rounded">
                              +{company.certifications.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                        <button className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 whitespace-nowrap">
                          Request Quote
                        </button>
                        <button className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900">
                          View Profile →
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Inline Sponsored */}
                <div className="bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-xl border-2 border-dashed border-orange-200 p-4">
                  <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider px-2 py-0.5 bg-orange-100 rounded">Sponsored</span>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <h3 className="font-bold text-gray-900">Venkel</h3>
                      <p className="text-sm text-gray-600">Factory-direct components • Direct pricing • Austin, TX</p>
                    </div>
                    <button className="px-4 py-2 text-xs font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600">
                      Learn More →
                    </button>
                  </div>
                </div>

                <div className="flex justify-center py-6">
                  <button className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-full hover:bg-gray-50 hover:border-gray-400 flex items-center gap-2">
                    Show More Results
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Map-only mode message */}
            {viewMode === 'map' && (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">Click on a cluster to explore manufacturers in that area</p>
                <button 
                  onClick={() => setViewMode('split')}
                  className="text-blue-600 font-medium hover:text-blue-700"
                >
                  Switch to Split View to see the list →
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ENHANCED Mobile Filter FAB - Much more prominent */}
      <button className="lg:hidden fixed bottom-6 left-6 z-50 flex items-center gap-2 px-5 py-3.5 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-105 active:scale-95 border-2 border-blue-500">
        <Filter className="w-5 h-5" />
        <span className="font-semibold">Filters</span>
        {activeFilters.length > 0 && (
          <span className="ml-1 w-6 h-6 bg-white text-blue-600 text-xs font-bold rounded-full flex items-center justify-center">
            {activeFilters.length}
          </span>
        )}
      </button>
    </div>
  );
}
