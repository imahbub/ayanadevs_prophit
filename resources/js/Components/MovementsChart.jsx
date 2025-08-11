import React, { useEffect, useRef } from 'react'
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

export default function MovementsChart({ movements }) {
    const chartRef = useRef()

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Recent Market Movements',
                font: {
                    size: 16,
                    weight: 'bold',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    title: function(context) {
                        const movement = movements[context[0].dataIndex]
                        return movement.market.question.length > 40 
                            ? movement.market.question.substring(0, 40) + '...'
                            : movement.market.question
                    },
                    label: function(context) {
                        const movement = movements[context[0].dataIndex]
                        return [
                            `Change: ${movement.change_percentage >= 0 ? '+' : ''}${movement.change_percentage.toFixed(2)}%`,
                            `From: ${(movement.probability_before * 100).toFixed(1)}%`,
                            `To: ${(movement.probability_after * 100).toFixed(1)}%`,
                            `Time: ${new Date(movement.movement_detected_at).toLocaleTimeString()}`
                        ]
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
                title: {
                    display: true,
                    text: 'Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price Change (%)'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            },
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
    }

    const data = {
        datasets: [
            {
                label: 'Price Change',
                data: movements.map(movement => ({
                    x: new Date(movement.movement_detected_at),
                    y: movement.change_percentage,
                })),
                borderColor: movements.map(movement => 
                    movement.change_percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                ),
                backgroundColor: movements.map(movement => 
                    movement.change_percentage >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                ),
                borderWidth: 2,
                fill: false,
                tension: 0.1,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: movements.map(movement => 
                    movement.change_percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                ),
                pointBorderColor: 'white',
                pointBorderWidth: 2,
            },
        ],
    }

    return (
        <div className="bg-white rounded-lg shadow border p-6">
            <div className="h-80 w-full">
                <Line ref={chartRef} options={options} data={data} />
            </div>
        </div>
    )
}
