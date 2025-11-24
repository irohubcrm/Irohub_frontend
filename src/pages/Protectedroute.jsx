import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, roles }) => {
  const user = useSelector(state => state.auth.user);

  if (!user) {
    // user is not authenticated
    return <Navigate to="/" />;
  }

  if (roles && !roles.includes(user.role)) {
    // user is authenticated but not authorized
    return <Navigate to="/unauthorized" />; // Or a "Not Found" page
  }

  return children;
};

export default ProtectedRoute;
