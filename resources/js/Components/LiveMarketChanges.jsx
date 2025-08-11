import React, { useState, useEffect, useMemo } from 'react'
import { Link } from '@inertiajs/react'

export default function LiveMarketChanges({ markets }) {
    const [activeMarkets, setActiveMarkets] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        // Filter for markets with recent activity
        const recentMarkets = markets
            .filter(market => market.current_probability > 0.01 && market.current_probability < 0.99)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10)
        
        setActiveMarkets(recentMarkets)
        setIsLoading(false)
    }, [markets])

    // Filter markets based on search term
    const filteredMarkets = useMemo(() => {
        if (!searchTerm.trim()) {
            return activeMarkets
        }
        
        const searchLower = searchTerm.toLowerCase()
        return activeMarkets.filter(market => 
            market.question.toLowerCase().includes(searchLower) ||
            (market.category && market.category.toLowerCase().includes(searchLower))
        )
    }, [activeMarkets, searchTerm])

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))
        
        if (diffInMinutes < 1) return 'Just now'
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`
        
        const diffInHours = Math.floor(diffInMinutes / 60)
        return `${diffInHours}h ago`
    }

    const formatProbability = (probability) => {
        return `${(parseFloat(probability) * 100).toFixed(1)}%`
    }

    const getProbabilityColor = (probability) => {
        if (probability < 0.2) return 'text-red-600'
        if (probability < 0.4) return 'text-orange-600'
        if (probability < 0.6) return 'text-yellow-600'
        if (probability < 0.8) return 'text-blue-600'
        return 'text-green-600'
    }

    const clearSearch = () => {
        setSearchTerm('')
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow border p-6">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow border p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                    Live Market Activity
                </h3>
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-gray-600">Live</span>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search markets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    {searchTerm && (
                        <button
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                {searchTerm && (
                    <div className="mt-2 text-sm text-gray-600">
                        Showing {filteredMarkets.length} of {activeMarkets.length} markets
                    </div>
                )}
            </div>

            {activeMarkets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No active markets found</p>
                </div>
            ) : filteredMarkets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p>No markets match your search</p>
                    <p className="text-sm mt-1">Try different keywords</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMarkets.map((market) => (
                        <div
                            key={market.id}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                                    {market.question}
                                </h4>
                                <Link
                                    href={`/market/${market.id}`}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-2 flex-shrink-0"
                                >
                                    View →
                                </Link>
                            </div>
                            
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className={`text-sm font-semibold ${getProbabilityColor(market.current_probability)}`}>
                                        {formatProbability(market.current_probability)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {formatTime(market.updated_at)}
                                    </span>
                                </div>
                                {market.volume && (
                                    <div className="text-xs text-gray-500">
                                        Volume: ${parseFloat(market.volume).toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
