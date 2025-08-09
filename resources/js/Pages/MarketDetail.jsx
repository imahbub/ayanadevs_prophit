import React, { useState, useEffect } from 'react'
import { Link, router } from '@inertiajs/react'
import Layout from '../Components/Layout'
import PriceChart from '../Components/PriceChart'

export default function MarketDetail({ market, priceHistory, hours }) {
    const [currentHours, setCurrentHours] = useState(hours)
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(() => {
            router.reload({ only: ['market', 'priceHistory'] })
        }, 30000)

        return () => clearInterval(interval)
    }, [autoRefresh])

    const handleTimeRangeChange = (newHours) => {
        setCurrentHours(newHours)
        router.get(`/market/${market.id}`, { hours: newHours }, {
            preserveState: true,
            preserveScroll: true,
            only: ['priceHistory']
        })
    }

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString()
    }

    const formatPercentage = (percentage) => {
        const sign = percentage >= 0 ? '+' : ''
        return `${sign}${parseFloat(percentage).toFixed(2)}%`
    }

    const getMovementClass = (percentage) => {
        return percentage >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
    }

    const timeRangeOptions = [
        { value: 1, label: '1 Hour' },
        { value: 6, label: '6 Hours' },
        { value: 24, label: '24 Hours' },
        { value: 72, label: '3 Days' },
        { value: 168, label: '1 Week' },
    ]

    return (
        <Layout title={market.question}>
            <div className="space-y-8">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-2 text-sm">
                    <Link href="/" className="text-blue-600 hover:text-blue-700">
                        Dashboard
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">Market Details</span>
                </div>

                {/* Market Header */}
                <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-4">
                                {market.question}
                            </h1>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-1">Current Probability</p>
                                    <p className="text-3xl font-bold text-blue-600">
                                        {(parseFloat(market.current_probability) * 100).toFixed(1)}%
                                    </p>
                                </div>
                                
                                {market.volume && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Volume</p>
                                        <p className="text-3xl font-bold text-gray-900">
                                            ${parseFloat(market.volume).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                
                                {market.category && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">Category</p>
                                        <p className="text-lg font-medium text-gray-900">
                                            {market.category}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {market.end_date && (
                                <div className="mt-4">
                                    <p className="text-sm text-gray-600">
                                        Ends: {formatTime(market.end_date)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="mt-4 lg:mt-0 lg:ml-6 flex items-center space-x-4">
                            {/* Time Range Selector */}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="timerange" className="text-sm font-medium text-gray-700">
                                    Time Range:
                                </label>
                                <select
                                    id="timerange"
                                    value={currentHours}
                                    onChange={(e) => handleTimeRangeChange(Number(e.target.value))}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {timeRangeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Auto-refresh toggle */}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="autorefresh" className="text-sm font-medium text-gray-700">
                                    Auto-refresh:
                                </label>
                                <button
                                    id="autorefresh"
                                    onClick={() => setAutoRefresh(!autoRefresh)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            autoRefresh ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Price Chart */}
                <div className="bg-white rounded-lg shadow border p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Price History
                        </h2>
                        <button
                            onClick={() => router.reload({ only: ['market', 'priceHistory'] })}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Refresh
                        </button>
                    </div>
                    
                    {priceHistory.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No price data available
                            </h3>
                            <p className="text-gray-600">
                                Price history will appear here once data collection begins.
                            </p>
                        </div>
                    ) : (
                        <PriceChart 
                            priceHistory={priceHistory}
                            market={market}
                            movements={market.movements || []}
                        />
                    )}
                </div>

                {/* Movement History */}
                {market.movements && market.movements.length > 0 && (
                    <div className="bg-white rounded-lg shadow border p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            Recent Movements
                        </h2>
                        
                        <div className="space-y-4">
                            {market.movements.map((movement) => (
                                <div key={movement.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-4 mb-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMovementClass(movement.change_percentage)}`}>
                                                    {formatPercentage(movement.change_percentage)}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {formatTime(movement.movement_detected_at)}
                                                </span>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600">
                                                <span>
                                                    {(parseFloat(movement.probability_before) * 100).toFixed(2)}% → {(parseFloat(movement.probability_after) * 100).toFixed(2)}%
                                                </span>
                                                {movement.volume_during_movement && (
                                                    <span className="ml-4">
                                                        Volume: ${parseFloat(movement.volume_during_movement).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Market Info */}
                <div className="bg-white rounded-lg shadow border p-6 bg-gray-50">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Market Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Polymarket ID</p>
                            <p className="text-sm text-gray-900 font-mono">{market.polymarket_id}</p>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                            <p className="text-sm text-gray-900">
                                {market.active ? 'Active' : 'Inactive'}
                            </p>
                        </div>
                        
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Last Updated</p>
                            <p className="text-sm text-gray-900">{formatTime(market.updated_at)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
