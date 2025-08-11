import React from 'react'
import { Link } from '@inertiajs/react'

export default function MarketChangesGrid({ movements }) {
    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = (now - date) / (1000 * 60 * 60)
        
        if (diffInHours < 1) {
            const diffInMinutes = Math.floor((now - date) / (1000 * 60))
            return `${diffInMinutes}m ago`
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`
        } else {
            return date.toLocaleDateString()
        }
    }

    const formatPercentage = (percentage) => {
        const sign = percentage >= 0 ? '+' : ''
        return `${sign}${parseFloat(percentage).toFixed(2)}%`
    }

    const getMovementClass = (percentage) => {
        return percentage >= 0 ? 'text-green-600 bg-green-50 border-green-200' : 'text-red-600 bg-red-50 border-red-200'
    }

    const formatProbability = (probability) => {
        return `${(parseFloat(probability) * 100).toFixed(1)}%`
    }

    const getMovementIcon = (percentage) => {
        if (percentage >= 0) {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
            )
        } else {
            return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
            )
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movements.map((movement) => (
                <div
                    key={movement.id}
                    className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getMovementClass(movement.change_percentage)}`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                                {movement.market.question}
                            </h3>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                                <span>{formatTime(movement.movement_detected_at)}</span>
                                {movement.market.category && (
                                    <span className="bg-gray-100 px-2 py-1 rounded">
                                        {movement.market.category}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                            {getMovementIcon(movement.change_percentage)}
                            <span className="font-bold text-sm">
                                {formatPercentage(movement.change_percentage)}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Before:</span>
                            <span className="font-medium">{formatProbability(movement.probability_before)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">After:</span>
                            <span className="font-medium">{formatProbability(movement.probability_after)}</span>
                        </div>
                        {movement.market.volume && (
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Volume:</span>
                                <span className="font-medium">${parseFloat(movement.market.volume).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-200">
                        <Link
                            href={`/market/${movement.market.id}`}
                            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                            View Details →
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    )
}
