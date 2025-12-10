import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'
import NotificationManager from '../components/NotificationManager'

const ProtectedRoute = ({ children }) => {
  const user = useSelector(state => state.auth.user)

  if (!user) {
    return <Navigate to="/" />
  }

  return (
    <>
      <NotificationManager />
      {children}
    </>
  )
}

export default ProtectedRoute
