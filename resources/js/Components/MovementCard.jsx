import React from 'react'
import { Link } from '@inertiajs/react'

export default function MovementCard({ movement }) {
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
        return percentage >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
    }

    const formatProbability = (probability) => {
        return `${(parseFloat(probability) * 100).toFixed(1)}%`
    }

    return (
        <Link
            href={`/market/${movement.market.id}`}
            className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow duration-200 block"
        >
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {movement.market.question}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <span>{formatTime(movement.movement_detected_at)}</span>
                        {movement.market.category && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {movement.market.category}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <span className="text-gray-500">Current odds: </span>
                            <span className="font-medium">
                                {formatProbability(movement.market.current_probability)}
                            </span>
                        </div>
                        {movement.market.volume && (
                            <div className="text-sm text-gray-500">
                                Volume: ${parseFloat(movement.market.volume).toLocaleString()}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMovementClass(movement.change_percentage)}`}>
                        {formatPercentage(movement.change_percentage)}
                    </div>
                    
                    <div className="text-xs text-gray-500 text-right">
                        <div>{formatProbability(movement.probability_before)} → {formatProbability(movement.probability_after)}</div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
