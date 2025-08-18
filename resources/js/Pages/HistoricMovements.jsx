import React, { useState } from 'react'
import { router } from '@inertiajs/react'
import Layout from '../Components/Layout'
import MovementCard from '../Components/MovementCard'

export default function HistoricMovements({ movements, stats, timeframe, minThreshold }) {
    const [currentTimeframe, setCurrentTimeframe] = useState(timeframe)
    const [currentThreshold, setCurrentThreshold] = useState(minThreshold)

    const handleTimeframeChange = (newTimeframe) => {
        setCurrentTimeframe(newTimeframe)
        router.get('/historic', {
            timeframe: newTimeframe,
            min_threshold: currentThreshold
        }, {
            preserveState: true
        })
    }

    const handleThresholdChange = (newThreshold) => {
        setCurrentThreshold(newThreshold)
        router.get('/historic', {
            timeframe: currentTimeframe,
            min_threshold: newThreshold
        }, {
            preserveState: true
        })
    }

    const formatPercentage = (value) => {
        if (!value) return 'N/A'
        return `${value > 0 ? '+' : ''}${parseFloat(value).toFixed(2)}%`
    }

    return (
        <Layout title="Historic Market Movements">
            <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Historic Market Movements
                    </h1>
                    <p className="text-gray-600">
                        Explore historical significant movements in prediction markets over time
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Timeframe
                            </label>
                            <select
                                value={currentTimeframe}
                                onChange={(e) => handleTimeframeChange(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="7">Last 7 days</option>
                                <option value="30">Last 30 days</option>
                                <option value="90">Last 90 days</option>
                                <option value="365">Last year</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Min Movement
                            </label>
                            <select
                                value={currentThreshold}
                                onChange={(e) => handleThresholdChange(e.target.value)}
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="0.5">0.5%+ movements</option>
                                <option value="1">1%+ movements</option>
                                <option value="5">5%+ movements</option>
                                <option value="10">10%+ movements</option>
                                <option value="20">20%+ movements</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-bold">📊</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Movements</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total_movements}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-green-600 font-bold">🎯</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Largest Movement</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {stats.largest_movement ? formatPercentage(stats.largest_movement.change_percentage) : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 font-bold">📈</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Avg Movement</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {formatPercentage(stats.average_movement_size)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="text-red-600 font-bold">🔥</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Most Volatile</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {stats.most_volatile_market ? 
                                        `${stats.most_volatile_market.movements_count} movements` : 
                                        'N/A'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Movements List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Historic Movements
                            {movements.data && movements.data.length > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-500">
                                    ({movements.total} total)
                                </span>
                            )}
                        </h2>
                    </div>
                    
                    <div className="p-6">
                        {movements.data && movements.data.length > 0 ? (
                            <div className="space-y-4">
                                {movements.data.map((movement) => (
                                    <MovementCard key={movement.id} movement={movement} />
                                ))}
                                
                                {/* Pagination */}
                                {movements.links && movements.links.length > 3 && (
                                    <div className="flex justify-center pt-6">
                                        <nav className="flex space-x-2">
                                            {movements.links.map((link, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => link.url && router.get(link.url)}
                                                    disabled={!link.url}
                                                    className={`px-3 py-2 text-sm rounded-md ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-gray-400 text-6xl mb-4">📈</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    No Historic Movements Found
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    No significant movements were detected in the selected timeframe.
                                </p>
                                <p className="text-sm text-gray-400">
                                    Try adjusting the timeframe or lowering the movement threshold to see more data.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    )
}
