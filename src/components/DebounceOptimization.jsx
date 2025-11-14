
import React, { useState, useEffect } from 'react';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const DebounceOptimization = () => {
  const [text, setText] = useState('');
  const debouncedText = useDebounce(text, 500);

  const ExpensiveComponent = ({ value }) => {
    // This component is expensive to render
    console.log(`Rendering ExpensiveComponent with value: ${value}`);
    return <div>{value}</div>;
  };

  const BeforeOptimization = () => (
    <div>
      <h2>Before Optimization</h2>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ExpensiveComponent value={text} />
    </div>
  );

  const AfterOptimization = () => (
    <div>
      <h2>After Optimization</h2>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ExpensiveComponent value={debouncedText} />
    </div>
  );

  return (
    <div>
      <h1>Debounce Optimization</h1>
      <BeforeOptimization />
      <AfterOptimization />
    </div>
  );
};

export default DebounceOptimization;
