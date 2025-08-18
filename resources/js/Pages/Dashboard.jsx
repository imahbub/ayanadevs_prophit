import React, { useState, useEffect } from 'react'
import { router } from '@inertiajs/react'
import Layout from '../Components/Layout'
import MovementCard from '../Components/MovementCard'
import StatsGrid from '../Components/StatsGrid'
import MovementsChart from '../Components/MovementsChart'
import MarketChangesGrid from '../Components/MarketChangesGrid'
import LiveMarketChanges from '../Components/LiveMarketChanges'
import MarketChangesSummary from '../Components/MarketChangesSummary'

export default function Dashboard({ movements, stats, threshold }) {
    const [currentThreshold, setCurrentThreshold] = useState(threshold)
    const [autoRefresh, setAutoRefresh] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [viewMode, setViewMode] = useState('list') // 'list', 'grid'
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('time') // 'time', 'percentage'
    const [sortOrder, setSortOrder] = useState('desc') // 'asc', 'desc'

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

    const handleRefresh = async () => {
        if (isRefreshing) return
        
        setIsRefreshing(true)
        try {
            // Trigger sync via API
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                }
            })
            
            const result = await response.json()
            
            if (result.success) {
                // After successful sync, reload the page data
                router.reload({ only: ['movements', 'stats'] })
            } else {
                console.error('Sync failed:', result.message)
                // Still reload to show current data
                router.reload({ only: ['movements', 'stats'] })
            }
        } catch (error) {
            console.error('Error triggering sync:', error)
            // Fallback to just reloading current data
            router.reload({ only: ['movements', 'stats'] })
        } finally {
            setIsRefreshing(false)
        }
    }

    const thresholdOptions = [0.5, 1, 5, 10, 15, 20, 25]

    // Filter movements based on search term
    const filteredMovements = searchTerm.trim() 
        ? movements.filter(movement => 
            movement.market.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (movement.market.category && movement.market.category.toLowerCase().includes(searchTerm.toLowerCase()))
          )
        : movements

    // Sort movements based on current sort settings
    const sortedMovements = [...filteredMovements].sort((a, b) => {
        let comparison = 0
        
        if (sortBy === 'percentage') {
            comparison = Math.abs(a.change_percentage) - Math.abs(b.change_percentage)
        } else if (sortBy === 'time') {
            comparison = new Date(a.movement_detected_at) - new Date(b.movement_detected_at)
        }
        
        return sortOrder === 'desc' ? -comparison : comparison
    })

    const handleSortChange = (newSortBy) => {
        if (sortBy === newSortBy) {
            // Toggle sort order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            // Set new sort field with default desc order
            setSortBy(newSortBy)
            setSortOrder('desc')
        }
    }

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
                <StatsGrid stats={stats} threshold={currentThreshold} />

                {/* Recent Movements - Now at the top */}
                <div className="space-y-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Recent Movements ({currentThreshold}%+ in 24h)
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                            {/* Search Bar */}
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search movements..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Sort Options */}
                            <div className="flex items-center space-x-2">
                                <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                                    Sort by:
                                </label>
                                <div className="flex items-center space-x-1">
                                    <button
                                        onClick={() => handleSortChange('time')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                            sortBy === 'time'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Time
                                        {sortBy === 'time' && (
                                            <span className="ml-1">
                                                {sortOrder === 'desc' ? '↓' : '↑'}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleSortChange('percentage')}
                                        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                            sortBy === 'percentage'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    >
                                        Movement %
                                        {sortBy === 'percentage' && (
                                            <span className="ml-1">
                                                {sortOrder === 'desc' ? '↓' : '↑'}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* View Mode Toggle */}
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    List
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                >
                                    Grid
                                </button>
                            </div>
                            
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className={`text-sm font-medium ${
                                    isRefreshing 
                                        ? 'text-gray-400 cursor-not-allowed' 
                                        : 'text-blue-600 hover:text-blue-700'
                                }`}
                            >
                                {isRefreshing ? 'Syncing...' : 'Refresh'}
                            </button>
                        </div>
                    </div>

                    {/* Search Results Info */}
                    {searchTerm && (
                        <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-md p-3">
                            Showing {sortedMovements.length} of {movements.length} movements matching "{searchTerm}"
                        </div>
                    )}

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
                        <>
                            {viewMode === 'list' && (
                                <div className="space-y-4">
                                    {sortedMovements.map((movement) => (
                                        <MovementCard key={movement.id} movement={movement} />
                                    ))}
                                </div>
                            )}
                            
                            {viewMode === 'grid' && (
                                <MarketChangesGrid movements={sortedMovements} />
                            )}
                        </>
                    )}
                </div>

                {/* Movements Overview Chart */}
                {sortedMovements.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Movements Overview
                        </h2>
                        <MovementsChart movements={sortedMovements} />
                    </div>
                )}

                {/* Top Movements Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        <MarketChangesSummary movements={sortedMovements} />
                    </div>
                </div>

                {/* Live Market Activity */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Live Market Activity
                    </h2>
                    <LiveMarketChanges markets={stats.recent_markets || []} />
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
