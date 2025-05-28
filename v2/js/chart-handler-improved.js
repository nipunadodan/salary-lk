/**
 * Improved chart handling functionality
 */

/**
 * Get chart colors based on current theme
 * @returns {Object} Object containing color values for the chart
 */
const getChartColors = () => {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    gridColor: isDark ? '#333333' : '#e0e0e0',
    textColor: isDark ? '#e0e0e0' : '#666666',
    netSalaryColor: isDark ? '#6ee7b7' : 'rgb(75, 192, 192)',
    deductionColor: isDark ? '#fb7185' : 'rgb(255, 99, 132)',
  };
};

/**
 * Generate chart data (pure function)
 * @param {number} start - Starting gross salary
 * @param {number} end - Ending gross salary
 * @param {number} step - Step size between data points
 * @param {boolean} isMobile - Whether the chart is being rendered on a mobile device
 * @returns {Array} Array of data points for the chart
 */
const generateChartData = (start = 100000, end = 500000, step = 10000, isMobile = false) => {
  const data = [];
  const effectiveStep = isMobile ? 20000 : 10000;

  for (let gross = start; gross <= end; gross += effectiveStep) {
    const components = window.memoizedCalculateSalaryComponents
      ? window.memoizedCalculateSalaryComponents(gross, 0)
      : window.calculateSalaryComponents(gross, 0);

    data.push({
      gross: components.gross,
      net: components.net,
      deductionPercentage: components.deductionPercentage,
      isMobile,
    });
  }
  return data;
};

/**
 * Create chart configuration object
 * @param {Array} data - Chart data points
 * @returns {Object} Chart.js configuration object
 */
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

/**
 * Update chart colors when theme changes
 */
const updateChartColors = () => {
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

/**
 * Initialize the chart
 */
const initChart = () => {
  const ctx = document.getElementById('salaryChart')?.getContext('2d');
  if (!ctx) return;

  // Use responsive memoized function if available
  const chartData = window.createResponsiveMemoizedFn
    ? window.createResponsiveMemoizedFn(
        generateChartData,
        () => window.innerWidth <= 768 ? 'mobile' : 'desktop'
      )(100000, 500000, 10000)
    : generateChartData(100000, 500000, 10000, window.innerWidth <= 768);

  new Chart(ctx, createChartConfig(chartData));

  // Update chart on window resize
  window.addEventListener('resize', debounce(() => {
    const chart = Chart.getChart('salaryChart');
    if (chart) {
      const isMobile = window.innerWidth <= 768;
      const newData = window.createResponsiveMemoizedFn
        ? window.createResponsiveMemoizedFn(
            generateChartData,
            () => isMobile ? 'mobile' : 'desktop'
          )(100000, 500000, 10000)
        : generateChartData(100000, 500000, 10000, isMobile);

      chart.data.labels = newData.map(d => d.gross);
      chart.data.datasets[0].data = newData.map(d => d.net);
      chart.data.datasets[1].data = newData.map(d => d.deductionPercentage);

      // Update tick sizes
      Object.values(chart.options.scales).forEach(scale => {
        if (scale.ticks && scale.ticks.font) {
          scale.ticks.font.size = isMobile ? 8 : 11;
        }
      });

      chart.update();
    }
  }, 250));
};

// Export functions
if (typeof window !== 'undefined') {
  window.getChartColors = getChartColors;
  window.generateChartData = generateChartData;
  window.createChartConfig = createChartConfig;
  window.updateChartColors = updateChartColors;
  window.initChart = initChart;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getChartColors,
    generateChartData,
    createChartConfig,
    updateChartColors,
    initChart
  };
}
