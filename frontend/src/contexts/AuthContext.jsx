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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the Firebase ID token
          const idToken = await firebaseUser.getIdToken();

          // Authenticate with your backend
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/authenticate`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              // Merge Firebase user with backend user data
              setUser({
                ...firebaseUser,
                ...data.user,
                getIdToken: firebaseUser.getIdToken.bind(firebaseUser),
              });
            } else {
              console.error("Backend authentication failed:", data.error);
              setUser(firebaseUser);
            }
          } else {
            // If backend fails, still set Firebase user
            console.error(
              "Backend authentication request failed:",
              response.status
            );
            setUser(firebaseUser);
          }
        } catch (error) {
          console.error("Auth error:", error);
          // If there's an error, still set the Firebase user
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
