import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const authenticateWithBackend = async (firebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();

      // Check if user exists in backend
      const authResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/authenticate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (authResponse.ok) {
        const data = await authResponse.json();
        return data.success ? data.user : null;
      }

      // If user doesn't exist, create them via login endpoint
      const loginResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        }
      );

      const loginData = await loginResponse.json();
      return loginData.success ? loginData.user : null;
    } catch (error) {
      console.error("Backend authentication error:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          const backendUser = await authenticateWithBackend(firebaseUser);
          setUser({
            ...firebaseUser,
            ...backendUser,
            getIdToken: () => firebaseUser.getIdToken(),
          });
        } catch (error) {
          console.error("Auth state change error:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
