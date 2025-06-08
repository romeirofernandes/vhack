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

  const syncWithBackend = async (firebaseUser) => {
    try {
      // Always get a fresh token for backend sync
      const idToken = await firebaseUser.getIdToken(true);

      // Try to get user data from backend
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/authenticate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.user;
        }
      }

      // If user doesn't exist in backend, create via login endpoint
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

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        if (loginData.success) {
          return loginData.user;
        }
      }

      // If backend sync fails, still return basic Firebase user data
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: null,
        profileCompleted: false,
      };
    } catch (error) {
      console.error("Backend sync error:", error);
      // Return basic Firebase user data on error
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: null,
        profileCompleted: false,
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);

      if (firebaseUser) {
        try {
          const backendUser = await syncWithBackend(firebaseUser);
          setUser({
            ...firebaseUser,
            ...backendUser,
            // Enhanced getIdToken function
            getIdToken: (forceRefresh = false) =>
              firebaseUser.getIdToken(forceRefresh),
          });
        } catch (error) {
          console.error("Auth state change error:", error);
          // Still set user with Firebase data on error
          setUser({
            ...firebaseUser,
            id: firebaseUser.uid,
            role: null,
            profileCompleted: false,
            getIdToken: (forceRefresh = false) =>
              firebaseUser.getIdToken(forceRefresh),
          });
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
