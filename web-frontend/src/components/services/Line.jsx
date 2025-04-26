import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as chartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { generateLineChartData } from './TestData';
import { Box } from '@mui/material';

chartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const LineGraph = ({ previousMonthData, twoMonthsAgoData, updateInterval = 3000 }) => {
    const [chartData, setChartData] = useState(generateLineChartData(previousMonthData, twoMonthsAgoData));
    
    const options = {
        responsive: true,
        animation: {
            duration: 750
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                },
                ticks: {
                    color: '#000'
                }
            },
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: '#000'
                }
            }
        },
        plugins: {
            legend: {
                labels: {
                    color: '#000',
                    font: {
                        size: 14,
                        weight: 'bold'
                    },
                    padding: 20
                }
            }
        }
    }; 

    useEffect(() => {
        const interval = setInterval(() => {
            setChartData(generateLineChartData(previousMonthData, twoMonthsAgoData));
        }, updateInterval);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [previousMonthData, twoMonthsAgoData, updateInterval]);

    return (
        <Box sx={{ 
            backgroundColor: 'rgba(240, 240, 240, 0.9)',
            borderRadius: 4,
            p: 2
        }}>
            <Line options={options} data={chartData} />
        </Box>
    );
};