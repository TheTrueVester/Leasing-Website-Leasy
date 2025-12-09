import { useLogout } from "@/api/auth";
import { baseUrl } from "@/api/base";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

/**
 * PrivateRoute is a component that checks if the user is authenticated.
 * If the user is authenticated, the component renders the child components.
 * If the user is not authenticated, the component redirects the user to the login page.
 */
const PrivateRoute = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { token, user } = useAuth();
  const { mutateAsync: logout } = useLogout();
  const location = useLocation();

  useEffect(() => {
    const checkToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${baseUrl}/auth/`, {
          method: "GET",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 400) {
          logout();
          toast({
            title: "Your session has expired. Please login again.",
            description: "You will be redirected to the homepage.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "An error occurred",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      checkToken();
    }
  }, [token, logout]);

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return !isLoading && <Outlet />;
};

export default PrivateRoute;
