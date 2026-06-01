import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute Component
 * Prevents unauthorized access to dashboard and analysis pages.
 * If no user state is loaded, it redirects the user to the login screen.
 */
export default function PrivateRoute({ user, children }) {
  // If the user state is null, they are not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the protected component
  return children;
}
