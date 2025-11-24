import React from 'react'
import { useQuery } from '@tanstack/react-query'


import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, defaults } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { getpaymentDetailsed } from '../../services/paymentstatusRouter';
ChartJS.register(ChartDataLabels);

defaults.responsive = true;
defaults.maintainAspectRatio = false;
export default function YearlyReportChart() {

    const {data,isLoading,isError} =useQuery({
        queryKey:["paymentDetails"],
        queryFn:getpaymentDetailsed,
        

    });


    if(isLoading)return <p>Loading the Chart............................</p>
    if(isError) return <p>Error loading Chart data....</p>
    const payment =data?.allPayment || [];

    const startYear=2020;
    const currentYear=new Date().getFullYear();
    const years=[];
    for(let y=startYear ;y <=currentYear ;y++){
        years.push(y);
    }

   const yearlyTotals = years.map((year) => {
    const filtered = payment.filter(
      (item) => new Date(item.createdAt).getFullYear() === year
    );

return {
    
            year,
            totalPaid:filtered.reduce((sum,i)=>sum +  (i.totalPaid || 0),0),
            totalAmount:filtered.reduce((sum,i)=>sum +(i.totalAmount || 0),0)
             }
             }
             )


    
    const chartData = {
    labels: years,
    datasets: [
      {
        label: "Total Paid (₹)",
        data: yearlyTotals.map((y) => y.totalPaid),
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#3b82f6",
      },
      {
        label: "Total Amount (₹)",
        data: yearlyTotals.map((y) => y.totalAmount),
        borderColor: "#f59e0b",
        backgroundColor: "#f59e0b",
        borderWidth: 3,
        tension: 0.4,
        fill: false,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#f59e0b",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      title: {
        display: true,
        text: "Yearly Payment Performance (From 2024)",
        font: { size: 18, weight: "bold" },
        color: "#111827",
      },
      legend: {
        position: "top",
        labels: { color: "#374151", font: { size: 14 } },
      },
      datalabels: {
        color: "#111",
        anchor: "end",
        align: "top",
        font: { size: 12, weight: "bold" },
        formatter: (value) => (value ? `₹${value}` : ""),
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ₹${context.formattedValue}`,
        },
      },
    },
    interaction: { mode: "index", intersect: false },
    scales: {
      x: {
        title: {
          display: true,
          text: "Year",
          color: "#374151",
          font: { size: 14, weight: "bold" },
        },
        ticks: { color: "#4b5563" },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Amount (₹)",
          color: "#374151",
          font: { size: 14, weight: "bold" },
        },
        beginAtZero: true,
        ticks: {
          color: "#4b5563",
          callback: (value) => `₹${value.toLocaleString()}`,
        },
        grid: { color: "#e5e7eb" },
      },
    },
  };


  return (
    <div>

 <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
  
      </h2>
      <div className="h-[400px]">
        
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>

      
    </div>
  )
}


