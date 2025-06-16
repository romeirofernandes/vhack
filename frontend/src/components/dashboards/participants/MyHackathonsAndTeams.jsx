import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

const MyHackathonsAndTeams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myTeams, setMyTeams] = useState([]);

  useEffect(() => {
    const fetchMyTeams = async () => {
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/teams/my`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        setMyTeams(data.data || []);
      } catch (err) {
        toast.error("Failed to load your teams");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyTeams();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white mb-4">My Hackathons & Teams</h2>
      {myTeams.length === 0 ? (
        <div className="text-white/60 text-center py-12">
          You are not part of any teams yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myTeams.map((team) => (
            <Card key={team._id} className="bg-zinc-950 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span>{team.hackathon?.title || "Untitled Hackathon"}</span>
                  <Badge className="bg-purple-600/20 text-purple-300">
                    {team.hackathon?.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="font-semibold text-white">Team:</span>{" "}
                  <span className="text-white/80">{team.name}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-white">Code:</span>{" "}
                  <span className="font-mono text-purple-300">{team.joinCode}</span>
                </div>
                <div className="mb-2">
                  <span className="font-semibold text-white">Members:</span>{" "}
                  <span className="text-white/80">
                    {team.members.map((m) => m.user.displayName || m.user.email).join(", ")}
                  </span>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() =>
                      navigate(`/participant/hackathon/${team.hackathon?._id}`)
                    }
                  >
                    View Hackathon
                  </Button>
                  <Button
                    className="bg-green-600 text-white hover:bg-green-700"
                    onClick={() =>
                      navigate(`/participant/hackathon/${team.hackathon?._id}/team`)
                    }
                  >
                    View Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyHackathonsAndTeams;