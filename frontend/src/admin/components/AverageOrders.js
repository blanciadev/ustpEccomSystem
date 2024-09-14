import React from 'react'
import '../admin.css'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components needed for Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], // X-axis labels
  datasets: [
    {
      label: 'Last Month',
      data: [30, 45, 60, 55], // Average orders for last month
      fill: true,
      backgroundColor: 'rgba(254,191,118, 0.4)', // Background color with transparency
      borderColor: 'rgba(254,191,118,1)', // Line color
      borderWidth: 1, // Line width
      tension: 0.3, // Curve of the line
    },
    {
      label: 'This Month',
      data: [40, 50, 70, 65], // Average orders for this month
      fill: true,
      backgroundColor: 'rgba(245,78,78, 0.4)', // Background color with transparency
      borderColor: 'rgba(245,78,78, 1)', // Line color
      borderWidth: 1, // Line width
      tension: 0.3, // Curve of the line
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false, // Allow the chart to adjust to the container's size
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        padding: 10,
        color: '#333', // Color of the legend text
      },
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
        },
      },
      backgroundColor: 'rgba(0,0,0,0.7)', // Tooltip background color
      titleColor: '#fff', // Tooltip title color
      bodyColor: '#fff', // Tooltip body color
      borderColor: '#007bff', // Tooltip border color
      borderWidth: 1, // Tooltip border width
    },
  },
  scales: {
    x: {
      title: {
        display: false,
        text: 'Week',
      },
      ticks: {
        display: false, // Hide x-axis labels
      },
      grid: {
        display: false, // Hide y-axis grid lines
      },
    },
    y: {
      title: {
        display: false,
        text: 'Average Orders',
      },
      ticks: {
        display: false, // Hide x-axis labels
      },
      grid: {
        display: false, // Hide y-axis grid lines
      },
      beginAtZero: true, // Start y-axis at zero
    },
  },
};


const AverageOrders = () => {
  return (
    <div className='avg-orders'>
         <div className='header'>
            <div className='title'>
                <h5>Average Orders</h5>
            </div> 
        </div>
        <div className='area-chart'>
          <Line data={data} options={options} />
        </div>
    </div>
  )
}

export default AverageOrders