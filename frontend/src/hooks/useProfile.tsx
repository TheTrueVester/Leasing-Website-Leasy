import { useGetUserById } from "@/api/user";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * useProfile is a custom hook that returns the user's profile information.
 * It includes the user's details, loading state, and error state.
 * It also includes functions to switch between renter and tenant roles.
 * This hook is used in the NavigationBar component to display the user's role.
 * @returns {Object} An object containing the user's profile information and functions to switch roles.
 * @returns {boolean} loading - A boolean that indicates if the user's profile is loading.
 * @returns {string | null} error - A string that contains the error message if an error occurred.
 * @returns {boolean} isRenter - A boolean that indicates if the user is a renter.
 * @returns {Function} switchToTenant - A function that switches the user's role to tenant.
 * @returns {Function} switchToRenter - A function that switches the user's role to renter.
 */
const useProfile = () => {
  const { user, token } = useAuth();
  const { user: me } = useGetUserById(
    user?.id ?? "",
    !!user && user?.id !== ""
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRenter, setIsRenter] = useState(
    location.pathname.split("/")[1] === "sublet"
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }
    setLoading(false);
  }, [user, token, me]);

  const switchToTenant = () => {
    setIsRenter(false);
    navigate("/listings");
  };

  const switchToRenter = () => {
    setIsRenter(true);
    navigate("/sublet/overview");
  };

  return {
    loading,
    error,
    isRenter,
    switchToTenant,
    switchToRenter,
  };
};

export default useProfile;
