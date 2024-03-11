import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Call this function after a user logs in
  const login = async () => {
    try {
      const response = await fetch("/api/auth/validate", {
        credentials: "include", // Needed for cookies to be sent with the request
      });
      const data = await response.json();
      if (data.isAuthenticated) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error validating session:", error);
    }
  };

  const logout = () => {
    fetch("/logout", { credentials: "include" })
      .then(() => {
        setIsAuthenticated(false);
      })
      .catch((error) => console.error("Logout error:", error));
  };

  useEffect(() => {
    // Automatically check if the user is already authenticated when the app loads
    login();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
