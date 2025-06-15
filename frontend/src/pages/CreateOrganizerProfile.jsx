import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const OrganizerProfile = () => {
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    website: "",
    bio: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.position || !formData.bio) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ profile: formData }),
        }
      );

      const data = await response.json();
      if (data.success) {
        window.location.href = "/organizer/dashboard";
      } else {
        setError(data.error || "Failed to save profile");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-4 overflow-y-auto">
      <div className="max-w-3xl mx-auto space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/select-role")}
          className="text-white/70 hover:text-white hover:bg-white/5"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="bg-white/5 border-white/10">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl text-white">
              Organizer Profile Setup
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="bg-red-900/20 border-red-800/50">
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company */}
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    Company/Organization
                    <Badge className="bg-red-900/50 text-red-200 text-xs">
                      Required
                    </Badge>
                  </Label>
                  <Input
                    name="company"
                    placeholder="Your company, startup, university..."
                    value={formData.company}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                    required
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    Your Role
                    <Badge className="bg-red-900/50 text-red-200 text-xs">
                      Required
                    </Badge>
                  </Label>
                  <Input
                    name="position"
                    placeholder="CTO, Developer Relations, HR Director..."
                    value={formData.position}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                    required
                  />
                </div>
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label className="text-white font-medium">
                  Company Website
                </Label>
                <Input
                  name="website"
                  placeholder="https://yourcompany.com"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  About Your Organization & Goals
                  <Badge className="bg-red-900/50 text-red-200 text-xs">
                    Required
                  </Badge>
                </Label>
                <textarea
                  name="bio"
                  placeholder="Tell us about your organization, why you want to organize hackathons, and what makes your events special..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full h-32 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 resize-none focus:border-white/40 focus:outline-none"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-zinc-950 hover:bg-white/90 h-12 font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerProfile;
