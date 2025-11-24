
import React, { useState, useMemo } from 'react';

// Assume this is a third-party chart component
const GenericChartComponent = ({ data }) => {
  // This component is expensive to render

  return <div>Chart with {data.length} data points</div>;
};

const MemoizedChart = React.memo(GenericChartComponent);

const ChartOptimization = () => {
  const [chartData, setChartData] = useState([
    { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
    { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
    { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
    { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
    { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
    { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
  ]);
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // BEFORE: The chart component re-renders every time the theme changes
  const BeforeOptimization = () => {
    const processedData = chartData.map(d => ({ ...d, uv: d.uv * 1.1 }));
    return (
      <div>
        <h2>Before Optimization</h2>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <GenericChartComponent data={processedData} />
      </div>
    );
  };

  // AFTER: The chart component is memoized and the data is memoized
  const AfterOptimization = () => {
    const processedData = useMemo(() => {
      return chartData.map(d => ({ ...d, uv: d.uv * 1.1 }));
    }, [chartData]);

    return (
      <div>
        <h2>After Optimization</h2>
        <button onClick={toggleTheme}>Toggle Theme</button>
        <MemoizedChart data={processedData} />
      </div>
    );
  };

  return (
    <div>
      <h1>Chart Optimization</h1>
      <BeforeOptimization />
      <AfterOptimization />
    </div>
  );
};

export default ChartOptimization;
