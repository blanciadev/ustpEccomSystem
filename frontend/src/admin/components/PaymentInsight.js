import React from 'react'
import '../admin.css'
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the components needed for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], // X-axis labels
  datasets: [
    {
      label: 'GCash',
      data: [50, 70, 65, 80, 85, 90, 95, 100, 105, 110, 120, 130], // Data points for GCash/Online Payment
      backgroundColor: 'rgba(54, 162, 235, 0.6)', // Bar color
      borderColor: 'rgba(54, 162, 235, 1)', // Border color of bars
      borderWidth: 1, // Border width
    },
    {
      label: 'Cash on Delivery',
      data: [30, 50, 45, 55, 60, 65, 70, 75, 80, 85, 90, 95], // Data points for COD/Cash on Delivery
      backgroundColor: 'rgba(255, 99, 132, 0.6)', // Bar color
      borderColor: 'rgba(255, 99, 132, 1)', // Border color of bars
      borderWidth: 1, // Border width
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
        text: 'Month',
      },
    },
    y: {
      title: {
        display: false,
        text: 'Amount',
      },
      beginAtZero: true, // Start y-axis at zero
    },
  },
};


const PaymentInsight = () => {
  return (
    <div className='payment-insight'>
        <div className='header'>
            <div className='title'>
                <h5>Payment Insight</h5>
            </div> 
            <div className='see-all'></div>
        </div>
        <div className='bar-chart'>
        <Bar data={data} options={options} />
        </div>
    </div>
  )
}

export default PaymentInsight