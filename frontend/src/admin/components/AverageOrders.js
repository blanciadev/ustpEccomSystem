import React from 'react'
import '../admin.css'
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const data = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
  datasets: [
    {
      label: 'Last Month',
      data: [30, 45, 60, 55],
      fill: true,
      backgroundColor: 'rgba(254,191,118, 0.4)',
      borderColor: 'rgba(254,191,118,1)',
      borderWidth: 1,
      tension: 0.3,
    },
    {
      label: 'This Month',
      data: [40, 50, 70, 65],
      fill: true,
      backgroundColor: 'rgba(245,78,78, 0.4)',
      borderColor: 'rgba(245,78,78, 1)',
      borderWidth: 1,
      tension: 0.3,
    },
  ],
};

const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 10,
        boxHeight: 10,
        padding: 10,
        color: '#333',
      },
    },
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          return tooltipItem.dataset.label + ': ' + tooltipItem.raw;
        },
      },
      backgroundColor: 'rgba(0,0,0,0.7)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: '#007bff',
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      title: {
        display: false,
        text: 'Week',
      },
      ticks: {
        display: false,
      },
      grid: {
        display: false,
      },
    },
    y: {
      title: {
        display: false,
        text: 'Average Orders',
      },
      ticks: {
        display: false,
      },
      grid: {
        display: false,
      },
      beginAtZero: true,
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