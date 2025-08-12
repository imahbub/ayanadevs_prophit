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
            const response = await fetch(`/api/markets/${movement.market.id}/price-history`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            })
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success && data.price_history && data.price_history.length > 0) {
                const chartData = data.price_history.map(point => ({
                    x: new Date(point.recorded_at),
                    y: parseFloat(point.probability)
                }))
                console.log('Price history data loaded:', chartData.length, 'points for market', movement.market.id)
                setPriceHistory(chartData)
            } else {
                console.log('No price history data available for market', movement.market.id, ':', data)
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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: 'white',
                bodyColor: 'white',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
                callbacks: {
                    title: function(context) {
                        const date = new Date(context[0].parsed.x)
                        return date.toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    },
                    label: function(context) {
                        return `Probability: ${(context.parsed.y * 100).toFixed(1)}%`
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
                    },
                    tooltipFormat: 'MMM dd, HH:mm'
                },
                display: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 10
                    },
                    maxTicksLimit: 4
                },
                border: {
                    display: false
                }
            },
            y: {
                min: 0,
                max: 1,
                display: true,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.05)',
                    drawBorder: false
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 10
                    },
                    callback: function(value) {
                        return (value * 100).toFixed(0) + '%'
                    },
                    maxTicksLimit: 5
                },
                border: {
                    display: false
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        elements: {
            point: {
                radius: priceHistory.length <= 2 ? 4 : 0,
                hoverRadius: 6,
                backgroundColor: movement.change_percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                borderColor: 'white',
                borderWidth: 2
            },
            line: {
                borderWidth: 3,
                tension: 0.2
            }
        }
    }

    const chartData = {
        datasets: [
            {
                label: 'Probability',
                data: priceHistory,
                borderColor: movement.change_percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    if (!chartArea) {
                        return null;
                    }
                    
                    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    if (movement.change_percentage >= 0) {
                        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.1)');
                        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.3)');
                    } else {
                        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
                        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
                    }
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.2,
                pointBackgroundColor: movement.change_percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
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
                                <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                        <div className="text-gray-500 text-sm">Loading chart...</div>
                                    </div>
                                </div>
                            ) : priceHistory.length > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs text-gray-600">
                                        <span>Price History ({priceHistory.length} points)</span>
                                        <span className="text-xs">
                                            {priceHistory.length > 1 && (
                                                <>
                                                    {formatProbability(Math.min(...priceHistory.map(p => p.y)))} - {formatProbability(Math.max(...priceHistory.map(p => p.y)))}
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <div className="h-40 bg-gray-50 rounded-lg p-2">
                                        {priceHistory.length < 2 ? (
                                            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                                                <div className="text-center">
                                                    <div className="mb-2">Limited price data</div>
                                                    <div className="text-xs">Current: {formatProbability(priceHistory[0]?.y || 0)}</div>
                                                </div>
                                            </div>
                                        ) : (
                                            <Line options={chartOptions} data={chartData} />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-40 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <div className="text-center">
                                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                        <div className="text-gray-500 text-sm">No price history available</div>
                                    </div>
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
