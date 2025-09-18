import { Navigate, useLocation } from "react-router-dom";

interface AuthRouteProps {
  children: React.ReactNode;
}

export const AuthRoute = ({ children }: AuthRouteProps) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const from = location.state?.from?.pathname || "/dashboard";

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};
