import { Box } from '@mui/material';  // or your preferred UI library

const generateRandomData = (baseValue = 5000, variance = 3000) => {
    return Array.from({ length: 7 }, () => {
        const randomVariance = Math.random() * variance * 2 - variance;
        return Math.max(0, Math.floor(baseValue + randomVariance));
    });
};

export const generateLineChartData = (previousMonthData, twoMonthsAgoData) => {
    const weekDays = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    return {
        labels: weekDays,
        datasets: [
            {
                label: "Steps 2 months ago",
                data: twoMonthsAgoData || generateRandomData(8000, 4000),
                borderColor: "rgb(75, 2, 192)",
                tension: 0.4, // Makes the line smoother
            },
            {
                label: "Steps Last Month",
                data: previousMonthData || generateRandomData(6000, 3000),
                borderColor: "rgb(189, 64, 38)",
                tension: 0.4,
            },
        ],
    };
};

// Example usage if no data is provided
export const LineChartData = generateLineChartData();

const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Store yearly data outside component to persist between renders
let yearlyData = {
    currentYear: generateYearData(),
    previousYear: generateYearData()
};

function generateYearData() {
    const baseValue = Math.random() * 50 + 50; // Base value between 50 and 100
    return Array.from({ length: 12 }, () => {
        const trend = Math.random() * 20 - 10; // Random trend between -10 and +10
        return Math.max(0, Math.floor(baseValue + trend));
    });
}

// Updated bright color palette with specified colors
export const chartColors = {
    backgrounds: [
        'rgba(255, 82, 182, 0.8)',  // Pink
        'rgba(0, 156, 255, 0.8)',   // Blue
        'rgba(255, 159, 67, 0.8)',  // Orange
        'rgba(255, 223, 43, 0.8)',  // Yellow
        'rgba(66, 134, 244, 0.8)',  // Different Blue
    ],
    borders: [
        'rgba(255, 82, 182, 1)',    // Pink
        'rgba(0, 156, 255, 1)',     // Blue
        'rgba(255, 159, 67, 1)',    // Orange
        'rgba(255, 223, 43, 1)',    // Yellow
        'rgba(66, 134, 244, 1)',    // Different Blue
    ]
};

export const generateBarChartData = (startMonth = 0) => {
    // Reset data when starting a new year
    if (startMonth === 0) {
        yearlyData = {
            currentYear: generateYearData(),
            previousYear: generateYearData()
        };
    }

    // Get 6 consecutive months starting from startMonth
    const labels = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (startMonth + i) % 12;
        return months[monthIndex];
    });

    // Get the corresponding data for these months
    const currentYearData = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (startMonth + i) % 12;
        return yearlyData.currentYear[monthIndex];
    });

    const previousYearData = Array.from({ length: 6 }, (_, i) => {
        const monthIndex = (startMonth + i) % 12;
        return yearlyData.previousYear[monthIndex];
    });

    return {
        labels: labels,
        datasets: [
            {
                label: 'Current Year',
                data: currentYearData,
                backgroundColor: chartColors.backgrounds[0], // Pink
                borderColor: chartColors.borders[0],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            },
            {
                label: 'Previous Year',
                data: previousYearData,
                backgroundColor: chartColors.backgrounds[1], // Blue
                borderColor: chartColors.borders[1],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }
        ],
    };
};

export const generatePieChartData = () => {
    const generateBalancedPercentages = (count) => {
        // Generate more balanced random numbers that won't be too small
        let numbers = Array.from({ length: count }, () => Math.random() * 0.8 + 0.2); // Min 20% of average
        const sum = numbers.reduce((a, b) => a + b, 0);
        return numbers.map(n => Math.round((n / sum) * 100));
    };

    const data = generateBalancedPercentages(5);

    return {
        labels: [
            'Strength Training',
            'Cardio',
            'Flexibility',
            'Nutrition',
            'Recovery'
        ],
        datasets: [{
            data: data,
            backgroundColor: [
                chartColors.backgrounds[0], // Pink
                chartColors.backgrounds[1], // Blue
                chartColors.backgrounds[2], // Orange
                chartColors.backgrounds[3], // Yellow
                chartColors.backgrounds[4], // Different Blue
            ],
            borderColor: [
                chartColors.borders[0],
                chartColors.borders[1],
                chartColors.borders[2],
                chartColors.borders[3],
                chartColors.borders[4],
            ],
            borderWidth: 2,
        }],
    };
};