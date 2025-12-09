import {
  toCurrency, toAbbreviatedCurrency, toPercentage, toLocaleDateString,
} from './numberTools';

export const apexUpColor = '#00AA2688';
export const apexUpColorStrong = '#00AA26';
export const apexDownColor = '#DD444488';
export const apexDownColorStrong = '#DD4444';
export const apexFlatColor = '#88888899';
export const apexFlatColorStrong = '#888888';
export const apexAxisColor = '#888888CC';

export const sparklineOptions = trend => ({
  chart: {
    type: 'line',
    sparkline: {
      enabled: true, // Recommended for sparklines, simplifies configuration
    },
    animations: { enabled: false },
  },
  xaxis: {
    type: 'datetime',
  },
  stroke: {
    width: [0.6, 2, 0.4],
    curve: 'smooth',
    colors: [
      trend > 0 ? apexUpColor : trend < 0 ? apexDownColor : apexFlatColor,
      trend > 0 ? apexUpColorStrong : trend < 0 ? apexDownColorStrong : apexFlatColorStrong,
      apexAxisColor,
    ],
  },

  // Ensure all axis and data labels are off
  dataLabels: { enabled: false },
  tooltip: { enabled: false },

});

export const dashboardCompositionDoughnutOptions = (dataLabels, chartLabelLocations) => ({
  chart: {
    type: 'donut',
  },
  theme: {
    palette: 'palette1',
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
    fontSize: '10px', // Your desired font size
  },
  tooltip: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '10px',
          },
          value: {
            show: true,
            formatter(w) {
              const value = parseFloat(w);
              const valueDigits = Math.floor(Math.log10(Math.abs(value)));
              const nDigits = Math.max(0, Math.min(2, 5 - valueDigits)) || 0;

              return toCurrency(value, nDigits || 0);
            },
          },
          total: {
            show: true,
            label: 'Total',
            formatter(w) {
              const value = parseFloat(w.globals.seriesTotals.reduce((a, b) => a + b, 0));
              const valueDigits = Math.floor(Math.log10(Math.abs(value)));
              const nDigits = Math.max(0, Math.min(2, 5 - valueDigits)) || 0;

              return toCurrency(value, nDigits);
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
    zoom: {
      enabled: false,
      autoScaleYaxis: true,
      allowMouseWheelZoom: false,
    },
  },

  plotOptions: {
    candlestick: {
      colors: {
        upward: apexUpColorStrong,
        downward: apexDownColorStrong,
      },
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
      showDuplicates: false,
      align: 'left',
      formatter: x => toAbbreviatedCurrency(x, 0),
    },
  },

  stroke: { width: 1 }, // Candlestick strokes are usually thinner
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
          + `<td class="apexcharts-tooltip-value caption text-right"><pre>${toCurrency(o)}</pre></td>`
          + '</tr>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption pe-4">Close</td>'
          + `<td class="apexcharts-tooltip-value caption text-right"><pre>${toCurrency(c)}</pre></td>`
          + '</tr>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption">Day &Delta;</td>'
          + `<td class="apexcharts-tooltip-value caption text-right"><pre>${toCurrency(c - o)}</pre></td>`
          + '</tr>'
          + '<tr>'
          + '<td class="apexcharts-tooltip-label caption">Day &Delta;%</td>'
          + `<td class="apexcharts-tooltip-value caption text-right"><pre>${toPercentage((c - o) / o)}</pre></td>`
          + '</tr>'
          + '</table>'
          + '</div>'
      );
    },
  },
};
