
import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

// Before: The component is imported statically
// import Subadminreports from './pages/Subadminreports';

// After: The component is imported dynamically using React.lazy
const Subadminreports = lazy(() => import('./pages/Subadminreports'));

const Spinner = () => <div>Loading...</div>;

const LazyLoadingOptimization = () => {
  const BeforeOptimization = () => (
    <Routes>
      {/* <Route path="/subadminreports" element={<Subadminreports />} /> */}
    </Routes>
  );

  const AfterOptimization = () => (
    <Routes>
      <Route
        path="/subadminreports"
        element={
          <Suspense fallback={<Spinner />}>
            <Subadminreports />
          </Suspense>
        }
      />
    </Routes>
  );

  return (
    <div>
      <h1>Lazy Loading Optimization</h1>
      <p>Before: The component is imported statically, blocking the main thread.</p>
      <p>After: The component is lazy-loaded, improving initial page load time.</p>
      {/* <BeforeOptimization /> */}
      <AfterOptimization />
    </div>
  );
};

export default LazyLoadingOptimization;
