import React, { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import Layout from '../Components/Layout'
import MovementCard from '../Components/MovementCard'
import StatsGrid from '../Components/StatsGrid'

export default function Dashboard({ movements, stats, threshold }) {
    const [currentThreshold, setCurrentThreshold] = useState(threshold)
    const [autoRefresh, setAutoRefresh] = useState(true)

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!autoRefresh) return

        const interval = setInterval(() => {
            router.reload({ only: ['movements', 'stats'] })
        }, 30000)

        return () => clearInterval(interval)
    }, [autoRefresh])

    const handleThresholdChange = (newThreshold) => {
        setCurrentThreshold(newThreshold)
        router.get('/', { threshold: newThreshold }, {
            preserveState: true,
            preserveScroll: true,
            only: ['movements', 'stats']
        })
    }

    const thresholdOptions = [5, 10, 15, 20, 25]

    return (
        <Layout title="Market Movements" lastSync={stats.last_sync}>
            <div className="space-y-8">
                {/* Header with controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Market Movements
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Tracking significant changes in prediction markets
                        </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                        {/* Threshold Selector */}
                        <div className="flex items-center space-x-2">
                            <label htmlFor="threshold" className="text-sm font-medium text-gray-700">
                                Threshold:
                            </label>
                            <select
                                id="threshold"
                                value={currentThreshold}
                                onChange={(e) => handleThresholdChange(Number(e.target.value))}
                                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {thresholdOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option}%+
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

                {/* Stats Grid */}
                <StatsGrid stats={stats} />

                {/* Movements Feed */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Recent Movements ({currentThreshold}%+ in 24h)
                        </h2>
                        <button
                            onClick={() => router.reload({ only: ['movements', 'stats'] })}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                            Refresh
                        </button>
                    </div>

                    {movements.length === 0 ? (
                        <div className="bg-white rounded-lg shadow border p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No significant movements
                            </h3>
                            <p className="text-gray-600">
                                No markets have moved {currentThreshold}% or more in the last 24 hours.
                                Try lowering the threshold or check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {movements.map((movement) => (
                                <MovementCard key={movement.id} movement={movement} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="bg-white rounded-lg shadow border p-6 bg-blue-50 border-blue-200">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-blue-900 mb-1">
                                How it works
                            </h3>
                            <p className="text-sm text-blue-800">
                                Prophit monitors prediction markets on Polymarket and alerts you when odds change significantly. 
                                Markets are updated every 5 minutes, and movements above your threshold are highlighted here.
                                Click on any movement to see detailed price history and analysis.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
