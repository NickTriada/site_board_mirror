// scripts.js
// const apiKey = 'e69c0e8f872a4232ba96d27925f95f3e'; // <<< Replace with your real API key
// Function to fetch stock data and update charts
async function fetchStockData(symbol, chart, timestampElement, titleElement) {
    const apiKey = 'e69c0e8f872a4232ba96d27925f95f3e'; // Replace with your real TwelveData API key
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1week&start_date=2023-01-01&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        console.log(`Data fetched for ${symbol}:`, data);

        if (data.status === 'ok' && data.values.length > 0) {
            const chartData = data.values.map(item => ({
                x: new Date(item.datetime),
                o: parseFloat(item.open),
                h: parseFloat(item.high),
                l: parseFloat(item.low),
                c: parseFloat(item.close)
            }));

            // Sort the data by date ascending (older first)
            chartData.sort((a, b) => a.x - b.x);

            // Update the chart
            chart.data.datasets[0].data = chartData;
            chart.update();

            // Update last updated time
            timestampElement.textContent = `Last updated: ${new Date().toLocaleString()}`;

            // Update the title element with the latest price and date
            const latestData = chartData[chartData.length - 1];
            const latestPrice = latestData.c.toFixed(2);
            const latestDate = latestData.x.toLocaleDateString();
            titleElement.textContent = `${symbol}: $${latestPrice} (${latestDate})`;
        } else {
            console.error(`Error fetching data for ${symbol}:`, data);
        }
    } catch (error) {
        console.error(`Error fetching data for ${symbol}: ${error}`);
        alert(`Error fetching data for ${symbol}: ${error}`);
    }
}

// Create Chart
function createChart(chartElement) {
    const ctx = chartElement.getContext('2d');
    return new Chart(ctx, {
        type: 'candlestick',
        data: {
            datasets: [{
                label: '',
                data: [],
                borderColor: '#00ff99',
                backgroundColor: '#00ff99',
                borderWidth: 1,
                barThickness: 5,
                categoryPercentage: 0.8,
                barPercentage: 1,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'week',
                        displayFormats: {
                            week: 'yyyy/MMM'
                        },
                        isoWeekday: 1
                    },
                    ticks: {
                        source: 'auto',
                        autoSkip: false,
                        stepSize: 4,
                        color: '#ffffff',
                        maxRotation: 45,
                        minRotation: 45,
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        color: '#444',
                        display: true
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Price (USD)',
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    },
                    ticks: {
                        color: '#ffffff',
                        font: {
                            size: 14
                        }
                    },
                    grid: {
                        color: '#444'
                    }
                }
            }
        }
    });
}

// Initialize charts
document.addEventListener('DOMContentLoaded', () => {
    const charts = [
        { symbol: 'DIA', chartId: 'dowChart', timeId: 'dowTimestamp', titleId: 'dowTitle' },
        { symbol: 'QQQ', chartId: 'nasdaqChart', timeId: 'nasdaqTimestamp', titleId: 'nasdaqTitle' },
        { symbol: 'SPY', chartId: 'sp500Chart', timeId: 'sp500Timestamp', titleId: 'sp500Title' },
        { symbol: 'TSLA', chartId: 'teslaChart', timeId: 'teslaTimestamp', titleId: 'teslaTitle' }
    ];

    charts.forEach(({ symbol, chartId, timeId, titleId }) => {
        const chartElement = document.getElementById(chartId);
        const timestampElement = document.getElementById(timeId);
        const titleElement = document.getElementById(titleId);

        const chart = createChart(chartElement);

        fetchStockData(symbol, chart, timestampElement, titleElement);

        // Refresh every 5 minutes
        setInterval(() => {
            fetchStockData(symbol, chart, timestampElement, titleElement);
        }, 5 * 60 * 1000);
    });
});
