import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mail, Building, Briefcase, Globe, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setProfile(data.data.profile);
      } else {
        setError(data.error || "Failed to fetch profile");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="bg-red-900/20 border-red-800/50">
        <AlertDescription className="text-red-200">{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Profile</h2>
          <p className="text-white/70">View and manage your organizer profile</p>
        </div>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
          onClick={() => window.location.href = "/organizer/profile/edit"}
        >
          Edit Profile
        </Button>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email */}
          <div className="flex items-start gap-4">
            <Mail className="w-5 h-5 text-white/70 mt-1" />
            <div>
              <p className="text-sm text-white/70">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
          </div>

          {/* Company */}
          <div className="flex items-start gap-4">
            <Building className="w-5 h-5 text-white/70 mt-1" />
            <div>
              <p className="text-sm text-white/70">Company/Organization</p>
              <p className="text-white">{profile?.company || "Not specified"}</p>
            </div>
          </div>

          {/* Position */}
          <div className="flex items-start gap-4">
            <Briefcase className="w-5 h-5 text-white/70 mt-1" />
            <div>
              <p className="text-sm text-white/70">Position</p>
              <p className="text-white">{profile?.position || "Not specified"}</p>
            </div>
          </div>

          {/* Website */}
          {profile?.website && (
            <div className="flex items-start gap-4">
              <Globe className="w-5 h-5 text-white/70 mt-1" />
              <div>
                <p className="text-sm text-white/70">Website</p>
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  {profile.website}
                </a>
              </div>
            </div>
          )}

          {/* Bio */}
          <div className="flex items-start gap-4">
            <FileText className="w-5 h-5 text-white/70 mt-1" />
            <div>
              <p className="text-sm text-white/70">About</p>
              <p className="text-white whitespace-pre-wrap">
                {profile?.bio || "No bio provided"}
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="pt-4">
            <Badge className="bg-green-900/50 text-green-200">
              Profile Complete
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile; 