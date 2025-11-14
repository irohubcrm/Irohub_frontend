
import React, { useState, useEffect, useRef } from 'react';
import { throttle } from 'lodash';

// 2. `useThrottle` Custom Hook
const useThrottle = (value, delay) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecution = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now - lastExecution.current >= delay) {
        setThrottledValue(value);
        lastExecution.current = now;
      }
    }, delay - (Date.now() - lastExecution.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return throttledValue;
};

const ThrottleOptimization = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // 3. Code-Based Solution (Before/After)
  const BeforeOptimization = () => {
    const handlePointerMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    return (
      <div>
        <h2>Before Optimization</h2>
        <div
          onPointerMove={handlePointerMove}
          style={{ width: '100%', height: '200px', backgroundColor: '#eee' }}
        >
          Hover over me
        </div>
        <p>Position: {JSON.stringify(position)}</p>
      </div>
    );
  };

  const AfterOptimization = () => {
    const [throttledPosition, setThrottledPosition] = useState({ x: 0, y: 0 });
    const throttledSetPosition = useThrottle(throttledPosition, 100);

    const handlePointerMove = (e) => {
      setThrottledPosition({ x: e.clientX, y: e.clientY });
    };

    return (
      <div>
        <h2>After Optimization (useThrottle)</h2>
        <div
          onPointerMove={handlePointerMove}
          style={{ width: '100%', height: '200px', backgroundColor: '#eee' }}
        >
          Hover over me
        </div>
        <p>Position: {JSON.stringify(throttledSetPosition)}</p>
      </div>
    );
  };

  // 4. Library-Based Alternative
  const LodashAlternative = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handlePointerMove = throttle((e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    }, 100);

    return (
      <div>
        <h2>Lodash Alternative</h2>
        <div
          onPointerMove={handlePointerMove}
          style={{ width: '100%', height: '200px', backgroundColor: '#eee' }}
        >
          Hover over me
        </div>
        <p>Position: {JSON.stringify(position)}</p>
      </div>
    );
  };

  return (
    <div>
      <h1>Throttle Optimization</h1>
      <BeforeOptimization />
      <AfterOptimization />
      <LodashAlternative />
    </div>
  );
};

export default ThrottleOptimization;
