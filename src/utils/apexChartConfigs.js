import { toCurrency, toPercentage, toLocaleDateString } from './numberTools';

export const apexUpColor = '#00A726';
export const apexDownColor = '#CF403C';
export const apexFlatColor = '#888';

export const sparklineOptions = (trend, width = 40, height = 25) => ({
  chart: {
    type: 'line',
    height,
    width,
    sparkline: {
      enabled: true, // Recommended for sparklines, simplifies configuration
    },
  },
  xaxis: {
    type: 'datetime',
  },
  stroke: {
    width: 1.5,
    curve: 'smooth',
    colors: [trend > 0 ? apexUpColor : trend < 0 ? apexDownColor : apexFlatColor],
  },

  // Ensure all axis and data labels are off
  dataLabels: { enabled: false },
  tooltip: { enabled: false },

});

export const dashboardCompositionDoughnutOptions = (dataLabels, chartLabelLocations) => ({
  chart: {
    type: 'donut',
  },
  labels: dataLabels,
  dataLabels: {
    enabled: true,
    style: {
      fontSize: '12px',
    },
  },
  legend: {
    position: chartLabelLocations || 'right',
    horizontalAlign: 'center',
    itemMargin: {
      horizontal: 2,
      vertical: 4,
    },
  },
  tooltip: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          value: {
            formatter(w) {
              return toCurrency(parseFloat(w));
            },
          },
          total: {
            show: true,
            fontSize: '10px',
            label: 'Total',
            formatter(w) {
              return toCurrency(w.globals.seriesTotals.reduce((a, b) => a + b, 0));
            },
          },
        },
      },
    },
  },
});

export const dashboardCandlesticksOptions = {
  chart: {
    type: 'candlestick',
    toolbar: { show: false },
    offsetX: -15,
  },

  // 2. Update plotOptions for candlestick
  plotOptions: {
    candlestick: {
      // You can customize colors for rising/falling candles here
      colors: {
        up: apexUpColor, // Green for rising (Close > Open)
        down: apexUpColor, // Red for falling (Close < Open)
      },

      // Remove bar-specific options like columnWidth, distributed, borderRadius
    },
  },

  dataLabels: { enabled: false },
  legend: { show: false },

  xaxis: {
    type: 'datetime',
    axisBorder: { show: true },
    axisTicks: { show: true },
    labels: {
      show: true,
      style: { fontSize: '12px' },
    },
  },

  yaxis: {
    show: true,
    tickAmount: 4,
    axisBorder: { show: true },
    axisTicks: { show: true },
    labels: {
      offsetY: 3,
      formatter: x => toCurrency(x, 0),
    },
  },

  stroke: { width: [1] }, // Candlestick strokes are usually thinner
  grid: {
    strokeDashArray: 5, // Use a finer dash array
    padding: { right: 0 },
    xaxis: { lines: { show: true } },
  },

  tooltip: {
    enabled: true,

    // Custom Tooltip for Candlestick charts
    custom({ seriesIndex, dataPointIndex, w }) {
      const o = w.globals.seriesCandleO[seriesIndex][dataPointIndex];
      const c = w.globals.seriesCandleC[seriesIndex][dataPointIndex];
      const x = w.globals.seriesX[seriesIndex][dataPointIndex];

      return (
        '<div class="apexcharts-tooltip-candlestick pa-3">'
          + `<div><strong>${toLocaleDateString(x)}</strong></div><hr class="my-2"/>`
          + '<table>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption">Open</td>'
          + `<td class="apexcharts-tooltip-value caption text-right">${toCurrency(o, false)}</td>`
          + '</tr>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption pe-4">Close</td>'
          + `<td class="apexcharts-tooltip-value caption text-right">${toCurrency(c, false)}</td>`
          + '</tr>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption">&Delta;</td>'
          + `<td class="apexcharts-tooltip-value caption text-right">${toCurrency(c - o)}</td>`
          + '</tr>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption">&Delta;%</td>'
          + `<td class="apexcharts-tooltip-value caption text-right">${toPercentage((c - o) / o)}</td>`
          + '</tr>'
          + '</table>'
          + '</div>'
      );
    },
  },
};
