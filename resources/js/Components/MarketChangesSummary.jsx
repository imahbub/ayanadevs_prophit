import React from 'react'
import { Link } from '@inertiajs/react'

export default function MarketChangesSummary({ movements }) {
    const formatPercentage = (percentage) => {
        const sign = percentage >= 0 ? '+' : ''
        return `${sign}${parseFloat(percentage).toFixed(2)}%`
    }

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

    const getMovementIcon = (percentage) => {
        if (percentage >= 0) {
            return (
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        } else {
            return (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
            )
        }
    }

    const topMovements = movements
        .sort((a, b) => Math.abs(b.change_percentage) - Math.abs(a.change_percentage))
        .slice(0, 5)

    return (
        <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Movements Today
            </h3>

            {topMovements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p>No movements detected yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topMovements.map((movement, index) => (
                        <div
                            key={movement.id}
                            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold text-gray-600">
                                        #{index + 1}
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        {getMovementIcon(movement.change_percentage)}
                                        <span className={`text-sm font-bold ${
                                            movement.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {formatPercentage(movement.change_percentage)}
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    href={`/market/${movement.market.id}`}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    View →
                                </Link>
                            </div>
                            
                            <h4 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                                {movement.market.question}
                            </h4>
                            
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Before:</span>
                                    <span className="font-medium">{formatProbability(movement.probability_before)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">After:</span>
                                    <span className="font-medium">{formatProbability(movement.probability_after)}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-gray-500">Time:</span>
                                    <span className="text-gray-400">{formatTime(movement.movement_detected_at)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {movements.length > 5 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                        href="/historic"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View all {movements.length} movements →
                    </Link>
                </div>
            )}
        </div>
    )
}
