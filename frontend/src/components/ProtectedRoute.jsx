import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  // reject the old dev mock token
  if (!token || token === 'mock-token') {
    localStorage.removeItem('token')
    return <Navigate to="/login" replace />
  }
  return children
}
