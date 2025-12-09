import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * A hook that returns the current authentication context.
 * This hook can be used to access the current user, token, and other auth-related properties and functions.
 * @returns {AuthContextType} An object containing the current authentication context.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
