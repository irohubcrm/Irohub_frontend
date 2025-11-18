import React, { lazy, Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import Spinner from './components/Spinner';

const Auth = lazy(() => import('./pages/Auth'));
const Stafflist = lazy(() => import('./pages/Stafflist'));
const Subadmincustomer = lazy(() => import('./pages/Subadmincustomer'));
const Subadminleads = lazy(() => import('./pages/Subadminleads'));
const Subadminfollowups = lazy(() => import('./pages/Subadminfollowups'));
const Subadminreports = lazy(() => import('./pages/Subadminreports'));
const Admindashboard = lazy(() => import('./pages/Admindashboard'));
const Admintasks = lazy(() => import('./pages/Admintasks'));
const Subadminstafflist = lazy(() => import('./pages/Subadminstafflist'));
const Subadmintask = lazy(() => import('./pages/Subadmintask'));
const Agenttask = lazy(() => import('./pages/Agenttask'));
const Settings = lazy(() => import('./pages/Settings'));
const Protectedroute = lazy(() => import('./pages/Protectedroute'));
const Paymentreports = lazy(() => import('./pages/Paymentreports'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const PaymentDetails = lazy(() => import('./components/payments/PaymentDetails.jsx'));
const ProductPaymentDetails = lazy(() => import('./components/payments/ProductPaymentDetails'));
const PaymentReportSide = lazy(() => import('./pages/PaymentReportSide'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public Route */}
        <Route path='/' element={<Auth />} />
        <Route path='/unauthorized' element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route path='/admindashboard' element={<Protectedroute roles={['Admin']}><Admindashboard /></Protectedroute>} />
        <Route path='/subadminhome' element={<Protectedroute roles={['Sub-Admin']}><Admindashboard /></Protectedroute>} />
        <Route path='/agents' element={<Protectedroute roles={['Admin']}><Stafflist /></Protectedroute>} />
        <Route path='/staffs' element={<Protectedroute roles={['Sub-Admin']}><Subadminstafflist /></Protectedroute>} />
        <Route path='/leads' element={<Protectedroute roles={['Admin', 'Sub-Admin']}><Subadminleads /></Protectedroute>} />
        <Route path='/customers' element={<Protectedroute roles={['Admin', 'Sub-Admin']}><Subadmincustomer /></Protectedroute>} />
        <Route path='/tasks' element={<Protectedroute roles={['Admin']}><Admintasks /></Protectedroute>} />
        <Route path='/subadmintasks' element={<Protectedroute roles={['Sub-Admin']}><Subadmintask /></Protectedroute>} />
        <Route path='/agenttasks' element={<Protectedroute roles={['Agent']}><Agenttask /></Protectedroute>} />
        <Route path='/followups' element={<Protectedroute roles={['Admin', 'Sub-Admin']}><Subadminfollowups /></Protectedroute>} />
        <Route path='/payments' element={<Protectedroute roles={['Admin', 'Sub-Admin']}><Paymentreports /></Protectedroute>} />
        <Route path='/subadminreports' element={<Protectedroute roles={['Admin', 'Sub-Admin']}><Subadminreports /></Protectedroute>} />
        <Route path='/settings' element={<Protectedroute roles={['Admin']}><Settings /></Protectedroute>} />
        
        {/* Payment Routes - need clarification on protection */}
        <Route path="/payment-details/:productId" element={<PaymentDetails />} />
        
        <Route path='/paymentDetails' element={<PaymentDetails />} />
        <Route path='/productPaymentDetails' element={<ProductPaymentDetails />} />
        <Route path='paymentReports' element={<PaymentReportSide/>}/>

        <Route path='*' element={<Navigate to='/' />} />
      </Routes>
    </Suspense>
  );
}

export default App;
