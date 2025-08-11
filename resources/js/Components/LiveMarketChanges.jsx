import React, { useState, useEffect } from 'react'
import { Link } from '@inertiajs/react'

export default function LiveMarketChanges({ markets }) {
    const [activeMarkets, setActiveMarkets] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Filter for markets with recent activity
        const recentMarkets = markets
            .filter(market => market.current_probability > 0.01 && market.current_probability < 0.99)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 10)
        
        setActiveMarkets(recentMarkets)
        setIsLoading(false)
    }, [markets])

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

            {activeMarkets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No active markets found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeMarkets.map((market) => (
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
