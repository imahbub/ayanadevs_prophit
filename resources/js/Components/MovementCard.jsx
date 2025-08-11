import React, { useState, useEffect } from 'react'
import { Link } from '@inertiajs/react'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
)

export default function MovementCard({ movement }) {
    const [priceHistory, setPriceHistory] = useState([])
    const [showChart, setShowChart] = useState(false)
    const [isLoadingChart, setIsLoadingChart] = useState(false)

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

    const fetchPriceHistory = async () => {
        if (priceHistory.length > 0) return
        
        setIsLoadingChart(true)
        try {
            const response = await fetch(`/api/markets/${movement.market.id}/price-history`)
            const data = await response.json()
            
            if (data.success && data.price_history) {
                setPriceHistory(data.price_history.map(point => ({
                    x: new Date(point.recorded_at),
                    y: parseFloat(point.probability)
                })))
            }
        } catch (error) {
            console.error('Error fetching price history:', error)
        } finally {
            setIsLoadingChart(false)
        }
    }

    const toggleChart = () => {
        if (!showChart) {
            fetchPriceHistory()
        }
        setShowChart(!showChart)
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `Probability: ${(context.parsed.y * 100).toFixed(2)}%`
                    }
                }
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    displayFormats: {
                        hour: 'HH:mm',
                        day: 'MMM dd',
                    }
                },
                display: false,
            },
            y: {
                min: 0,
                max: 1,
                display: false,
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 4,
            }
        }
    }

    const chartData = {
        datasets: [
            {
                label: 'Probability',
                data: priceHistory,
                borderColor: movement.change_percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                backgroundColor: movement.change_percentage >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1,
            },
        ],
    }

    return (
        <div className="bg-white rounded-lg shadow border p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start">
                <div className="flex-1 pr-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                            {movement.market.question}
                        </h3>
                        <button
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleChart()
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            {showChart ? 'Hide Chart' : 'Show Chart'}
                        </button>
                    </div>
                    
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

                    {/* Mini Chart */}
                    {showChart && (
                        <div className="mt-4">
                            {isLoadingChart ? (
                                <div className="h-32 flex items-center justify-center">
                                    <div className="text-gray-500">Loading chart...</div>
                                </div>
                            ) : priceHistory.length > 0 ? (
                                <div className="h-32">
                                    <Line options={chartOptions} data={chartData} />
                                </div>
                            ) : (
                                <div className="h-32 flex items-center justify-center text-gray-500">
                                    No price history available
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 rounded-full text-sm font-bold ${getMovementClass(movement.change_percentage)}`}>
                        {formatPercentage(movement.change_percentage)}
                    </div>
                    
                    <div className="text-xs text-gray-500 text-right">
                        <div>{formatProbability(movement.probability_before)} → {formatProbability(movement.probability_after)}</div>
                    </div>

                    <Link
                        href={`/market/${movement.market.id}`}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                        View Details →
                    </Link>
                </div>
            </div>
        </div>
    )
}
