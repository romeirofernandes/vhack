import React, { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import PodiumResults from "../../results/PodiumResults";

const ResultsChecker = ({ hackathons }) => {
  const { user } = useAuth();
  const [resultsToShow, setResultsToShow] = useState(null);
  const [checkedHackathons, setCheckedHackathons] = useState(new Set());

  useEffect(() => {
    if (!user || !hackathons.length) return;

    const checkForResults = async () => {
      for (const hackathon of hackathons) {
        if (checkedHackathons.has(hackathon._id)) continue;

        try {
          const idToken = await user.getIdToken();
          const response = await fetch(
            `http://${import.meta.env.VITE_API_URL}/results/hackathon/${hackathon._id}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();

            if (data.success && data.results.length > 0) {
              // Show results for this hackathon
              setResultsToShow({
                hackathon: data.hackathon,
                results: data.results,
              });

              // Mark as checked
              setCheckedHackathons((prev) => new Set([...prev, hackathon._id]));
              break; // Show one at a time
            }
          }
        } catch (error) {
          console.error("Error checking results:", error);
        }
      }
    };

    // Check immediately
    checkForResults();

    // Check every minute for new results
    const interval = setInterval(checkForResults, 60000);

    return () => clearInterval(interval);
  }, [user, hackathons, checkedHackathons]);

  const handleCloseResults = () => {
    setResultsToShow(null);
  };

  return (
    <PodiumResults
      hackathon={resultsToShow?.hackathon}
      results={resultsToShow?.results || []}
      isVisible={!!resultsToShow}
      onClose={handleCloseResults}
    />
  );
};

export default ResultsChecker;
