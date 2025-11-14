import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useState, useEffect, useCallback, useContext } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { listconvertedcustomers } from '../../services/customersRouter';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Example context (replace with your actual context)
const SomeContext = React.createContext(null);

// Error boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div style={{ textAlign: 'center', color: 'red' }}>Something went wrong with the chart.</div>;
    }
    return this.props.children;
  }
}

const PaymentDonutChart = () => {
  // Hooks called at the top level (ensures consistent order)
  const context1 = useContext(SomeContext);
  const context2 = useContext(SomeContext);
  const context3 = useContext(SomeContext);

  const [chartState, setChartState] = useState({ isVisible: true });

  const handleChartUpdate = useCallback(() => {
    setChartState((prev) => ({ ...prev, isVisible: !prev.isVisible }));
  }, []);

  // useEffect(() => {
  //   console.log('Chart state updated:', chartState);
  // }, [chartState]);

  const syncState = React.useSyncExternalStore(
    (callback) => {
      window.addEventListener('resize', callback);
      return () => window.removeEventListener('resize', callback);
    },
    () => window.innerWidth
  );

  // Fetch all customers without pagination
  const { data: allCustomers, isLoading, error } = useQuery({
    queryKey: ['listCustomer', 'all'],
    queryFn: async () => {
      let allData = [];
      let currentPage = 1;
      let totalPages = 1;

      while (currentPage <= totalPages) {
        const response = await listconvertedcustomers({ page: currentPage });
        allData = [...allData, ...response.customers];
        totalPages = response.totalPages;
        currentPage += 1;
      }

      return {
        customers: allData,
        totalCustomers: allData.length,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // Memoize payment status count
  const paymentStatusCount = useMemo(() => {
    if (!allCustomers?.customers) return {};
    return allCustomers.customers.reduce((acc, customer) => {
      const status = customer.payment || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [allCustomers]);

  // Memoize total customers
  const totalCustomers = useMemo(() => {
    return allCustomers?.totalCustomers || allCustomers?.customers?.length || 0;
  }, [allCustomers]);

  // Memoize chart data
  const chartData = useMemo(() => ({
    labels: Object.keys(paymentStatusCount),
    datasets: [
      {
        data: Object.values(paymentStatusCount),
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
        hoverOffset: 20,
      },
    ],
  }), [paymentStatusCount]);

  // Memoize chart options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 14, family: 'Arial, sans-serif' },
          color: '#333',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    animation: false,
  }), []);

  // Early returns after all hooks
  if (isLoading) return <div style={{ textAlign: 'center', fontSize: '1.2rem' }}>Loading...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red', fontSize: '1.2rem' }}>Error: {error.message}</div>;

  // Render the chart, status counts, and total customers
  return (
    <ErrorBoundary>
      <div
        style={{
          margin: '2rem auto',
          padding: '1.5rem',
          maxWidth: '1000px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2
          style={{
            fontSize: '1.8rem',
            fontWeight: '600',
            color: '#1f2937',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          Payment Status Distribution
        </h2>
        <div
          style={{
            backgroundColor: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '1.2rem',
            fontWeight: '500',
            color: '#374151',
          }}
        >
          Total Customers: {totalCustomers}
        </div>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {/* Pie Chart */}
          <div
            style={{
              width: '100%',
              maxWidth: '',
              height: '400px',
              backgroundColor: 'white',
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            }}
          >
            {Object.keys(paymentStatusCount).length > 0 ? (
              <Pie data={chartData} options={options} />
            ) : (
              <div style={{ textAlign: 'center', color: '#6b7280' }}>No payment data available</div>
            )}
          </div>
          {/* Status Count Boxes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1rem',
              width: '100%',
              maxWidth: '400px',
            }}
          >
            {Object.entries(paymentStatusCount).map(([status, count], index) => (
              <div
                key={status}
                style={{
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'][index % 5],
                  color: '#fff',
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <strong>{status}</strong>: {count}
              </div>
            ))}
          </div>
        </div>
        {/* Example: Use other hooks' data */}
 
      </div>
    </ErrorBoundary>
  );
};

export default React.memo(PaymentDonutChart);