// Chart colors based on theme
const getChartColors = () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    return {
        gridColor: isDark ? '#333333' : '#e0e0e0',
        textColor: isDark ? '#e0e0e0' : '#666666',
        netSalaryColor: isDark ? '#6ee7b7' : 'rgb(75, 192, 192)',
        deductionColor: isDark ? '#fb7185' : 'rgb(255, 99, 132)',
    };
};

// Chart data generation (pure function)
const generateChartDataBase = (start = 100000, end = 500000, step = 10000, isMobile = window.innerWidth <= 768) => {
    const data = [];
    const effectiveStep = isMobile ? 20000 : 10000;

    for (let gross = start; gross <= end; gross += effectiveStep) {
        const components = window.memoizedCalculateSalaryComponents
            ? window.memoizedCalculateSalaryComponents(gross, 0)
            : calculateSalaryComponents(gross, 0);

        data.push({
            gross: components.gross,
            net: components.net,
            deductionPercentage: components.deductionPercentage,
            isMobile,
        });
    }
    return data;
};

// Make base function available for memoization
window.generateChartDataBase = generateChartDataBase;

const createChartConfig = (data) => {
    const colors = getChartColors();
    return {
        type: 'line',
        data: {
            labels: data.map(d => d.gross),
            datasets: [{
                label: 'Net Salary',
                data: data.map(d => d.net),
                borderColor: colors.netSalaryColor,
                tension: 0.2,
                fill: false,
                yAxisID: 'y',
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: colors.netSalaryColor,
            },
                {
                    label: 'Deduction %',
                    data: data.map(d => d.deductionPercentage),
                    borderColor: colors.deductionColor,
                    tension: 0.2,
                    fill: false,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    pointHoverBackgroundColor: colors.deductionColor,
                }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            plugins: {
                legend: {
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line',
                        length: 40,
                    },
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.dataset.yAxisID === 'y') {
                                return `Net: LKR ${context.parsed.y.toFixed(0).toLocaleString()}`;
                            }
                            return `Deduction: ${context.parsed.y.toFixed(1)}%`;
                        },
                        title: function (context) {
                            return `Gross: LKR ${parseInt(context[0].label).toLocaleString()}`;
                        },
                    },
                },
            },
            scales: {
                x: {
                    grid: {color: colors.gridColor},
                    title: {
                        display: true,
                        text: 'Gross Salary (LKR)',
                        font: {family: 'Inter'},
                        color: colors.textColor,
                    },
                    ticks: {
                        callback: (_, index) => {
                            const point = data[index];
                            const salary = point.gross;
                            const threshold = point.isMobile ? 100000 : 50000;
                            if (salary % threshold === 0) {
                                return point.isMobile
                                    ? `LKR ${(salary / 1000).toFixed(0)}K`
                                    : `LKR ${salary.toLocaleString()}`;
                            }
                            return '';
                        },
                        font: {
                            family: 'JetBrains Mono',
                            size: data[0]?.isMobile ? 8 : 11,
                        },
                        color: colors.textColor,
                    },
                },
                y: {
                    grid: {color: colors.gridColor},
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Net Salary (LKR)',
                        font: {family: 'Inter'},
                        color: colors.textColor,
                    },
                    ticks: {
                        callback: (value) => {
                            const isMobile = data[0]?.isMobile;
                            return isMobile
                                ? `LKR ${(value / 1000).toFixed(0)}K`
                                : `LKR ${value.toLocaleString()}`;
                        },
                        font: {
                            family: 'JetBrains Mono',
                            size: data[0]?.isMobile ? 8 : 11,
                        },
                        color: colors.textColor,
                    },
                },
                y1: {
                    grid: {display: false},
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Deduction %',
                        font: {family: 'Inter'},
                        color: colors.textColor,
                    },
                    ticks: {
                        font: {
                            family: 'JetBrains Mono',
                            size: data[0]?.isMobile ? 8 : 11,
                        },
                        color: colors.textColor,
                    },
                },
            },
        },
    };
};

// Function to update chart colors when theme changes
window.updateChartColors = () => {
    const chart = Chart.getChart('salaryChart');
    if (chart) {
        const colors = getChartColors();

        // Update dataset colors
        chart.data.datasets[0].borderColor = colors.netSalaryColor;
        chart.data.datasets[0].pointHoverBackgroundColor = colors.netSalaryColor;
        chart.data.datasets[1].borderColor = colors.deductionColor;
        chart.data.datasets[1].pointHoverBackgroundColor = colors.deductionColor;

        // Update grid and text colors
        Object.entries(chart.options.scales).forEach(([key, scale]) => {
            if (scale.grid) scale.grid.color = colors.gridColor;
            if (scale.title) scale.title.color = colors.textColor;
            scale.ticks.color = colors.textColor;
        });

        chart.update('none'); // Update without animation for immediate effect
    }
};
