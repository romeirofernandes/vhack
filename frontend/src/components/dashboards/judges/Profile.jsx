import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Pencil, Save, X } from "lucide-react";
import { FaGithub, FaLinkedin, FaGlobe, FaTwitter } from "react-icons/fa";
import { useAuth } from "@/contexts/AuthContext";

const defaultProfile = {
  expertise: [],
  organization: "",
  yearsOfExperience: "",
  bio: "",
  socialLinks: {
    github: "",
    linkedin: "",
    portfolio: "",
    twitter: "",
  },
};

const Profile = () => {
  const [profileData, setProfileData] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [filteredExpertise, setFilteredExpertise] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();

  // Example expertise areas (customize as needed)
  const expertiseAreas = [
    "Web Development", "AI/ML", "Blockchain", "Cybersecurity", "Cloud", "DevOps", "UI/UX", "Data Science", "Mobile", "Game Development"
  ];

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (expertiseInput.trim()) {
      const filtered = expertiseAreas
        .filter(
          (area) =>
            area.toLowerCase().includes(expertiseInput.toLowerCase()) &&
            !profileData.expertise.includes(area)
        )
        .slice(0, 8);
      setFilteredExpertise(filtered);
      setShowDropdown(filtered.length > 0);
    } else {
      setFilteredExpertise([]);
      setShowDropdown(false);
    }
  }, [expertiseInput, profileData.expertise]);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfileData({
          expertise: data.data.profile?.expertise || [],
          organization: data.data.profile?.organization || "",
          yearsOfExperience: data.data.profile?.yearsOfExperience || "",
          bio: data.data.profile?.bio || "",
          socialLinks: {
            github: data.data.profile?.socialLinks?.github || "",
            linkedin: data.data.profile?.socialLinks?.linkedin || "",
            portfolio: data.data.profile?.socialLinks?.portfolio || "",
            twitter: data.data.profile?.socialLinks?.twitter || "",
          },
        });
      } else {
        setError(data.error || "Failed to fetch profile");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith("socialLinks.")) {
      const key = field.split(".")[1];
      setProfileData((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [key]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addExpertise = (area) => {
    if (!profileData.expertise.includes(area)) {
      setProfileData((prev) => ({
        ...prev,
        expertise: [...prev.expertise, area],
      }));
      setExpertiseInput("");
      setShowDropdown(false);
    }
  };

  const removeExpertise = (areaToRemove) => {
    setProfileData((prev) => ({
      ...prev,
      expertise: prev.expertise.filter((area) => area !== areaToRemove),
    }));
  };

  const handleExpertiseInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredExpertise.length > 0) {
        addExpertise(filteredExpertise[0]);
      } else if (expertiseInput.trim()) {
        addExpertise(expertiseInput.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setExpertiseInput("");
    }
  };

  const saveProfile = async (e) => {
    console.log("Saving profile data:", profileData);
    e.preventDefault();
    if (
      !profileData.expertise.length ||
      !profileData.organization ||
      !profileData.yearsOfExperience ||
      !profileData.bio
    ) {
      setError("Please fill in all required fields");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        fetchProfile();
      } else {
        setError(data.error || "Failed to save profile");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    fetchProfile();
    setIsEditing(false);
    setError("");
    setSuccess("");
    setExpertiseInput("");
    setShowDropdown(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Judge Profile</h2>
          <p className="text-white/70">View and manage your judge profile</p>
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : null}
      </div>

      {(error || success) && (
        <div className="space-y-2 flex-shrink-0">
          {error && (
            <Alert className="bg-red-950/40 border-red-800/50 py-2">
              <AlertDescription className="text-red-300 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="bg-emerald-950/40 border-emerald-800/50 py-2">
              <AlertDescription className="text-emerald-300 text-sm">
                {success}
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={saveProfile} className="space-y-6">
            {/* Expertise */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-2">
                Areas of Expertise
                <Badge className="bg-red-900/50 text-red-200 text-xs">
                  Required
                </Badge>
              </Label>
              {isEditing ? (
                <>
                  {/* Selected Expertise */}
                  {profileData.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {profileData.expertise.map((area) => (
                        <Badge
                          key={area}
                          className="bg-white/10 text-white hover:bg-white/20 cursor-pointer group"
                          onClick={() => removeExpertise(area)}
                        >
                          {area}
                          <X className="w-3 h-3 ml-1 group-hover:text-red-300" />
                        </Badge>
                      ))}
                    </div>
                  )}
                  {/* Search Input with Dropdown */}
                  <div className="relative mt-2">
                    <Input
                      placeholder="Search or add expertise areas..."
                      value={expertiseInput}
                      onChange={(e) => setExpertiseInput(e.target.value)}
                      onKeyDown={handleExpertiseInputKeyDown}
                      onFocus={() =>
                        expertiseInput &&
                        setShowDropdown(filteredExpertise.length > 0)
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10 pl-3"
                    />
                    {showDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredExpertise.map((area) => (
                          <div
                            key={area}
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white border-b border-white/10 last:border-b-0"
                            onClick={() => addExpertise(area)}
                          >
                            {area}
                          </div>
                        ))}
                        {expertiseInput &&
                          !expertiseAreas.some(
                            (area) =>
                              area.toLowerCase() ===
                              expertiseInput.toLowerCase()
                          ) && (
                            <div
                              className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 border-b border-white/10 last:border-b-0 italic"
                              onClick={() => addExpertise(expertiseInput.trim())}
                            >
                              Add "{expertiseInput}" as custom expertise
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                  <p className="text-white/50 text-sm">
                    Start typing to search or add custom expertise. Press Enter to add.
                  </p>
                </>
              ) : profileData.expertise.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profileData.expertise.map((area) => (
                    <Badge key={area} className="bg-white/10 text-white">
                      {area}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-white/50">Not set</span>
              )}
            </div>
            {/* Organization */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-2">
                Organization
                <Badge className="bg-red-900/50 text-red-200 text-xs">
                  Required
                </Badge>
              </Label>
              {isEditing ? (
                <Input
                  value={profileData.organization}
                  onChange={(e) => handleInputChange("organization", e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                  required
                />
              ) : (
                <p className="text-white">{profileData.organization || "Not specified"}</p>
              )}
            </div>
            {/* Years of Experience */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-2">
                Years of Experience
                <Badge className="bg-red-900/50 text-red-200 text-xs">
                  Required
                </Badge>
              </Label>
              {isEditing ? (
                <select
                  value={profileData.yearsOfExperience}
                  onChange={(e) => handleInputChange("yearsOfExperience", e.target.value)}
                  className="w-full h-10 px-3 bg-white/5 border border-white/20 rounded-md text-white focus:border-white/40 focus:outline-none"
                  required
                >
                  <option value="" className="bg-zinc-900">
                    Select experience level
                  </option>
                  <option value="1" className="bg-zinc-900">
                    1-3 years
                  </option>
                  <option value="3" className="bg-zinc-900">
                    3-5 years
                  </option>
                  <option value="5" className="bg-zinc-900">
                    5-10 years
                  </option>
                  <option value="10" className="bg-zinc-900">
                    10+ years
                  </option>
                </select>
              ) : (
                <p className="text-white">{profileData.yearsOfExperience || "Not specified"}</p>
              )}
            </div>
            {/* Bio */}
            <div className="space-y-2">
              <Label className="text-white font-medium flex items-center gap-2">
                Professional Background
                <Badge className="bg-red-900/50 text-red-200 text-xs">
                  Required
                </Badge>
              </Label>
              {isEditing ? (
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  className="w-full h-24 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 resize-none focus:border-white/40 focus:outline-none"
                  required
                />
              ) : (
                <p className="text-white whitespace-pre-wrap">
                  {profileData.bio || "No bio provided"}
                </p>
              )}
            </div>
            {/* Social Links */}
            <div className="space-y-2">
              <Label className="text-white font-medium">Social Links</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80 flex items-center gap-2 text-sm">
                    <FaGithub className="w-3 h-3" />
                    GitHub
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.socialLinks.github}
                      onChange={(e) => handleInputChange("socialLinks.github", e.target.value)}
                      className="bg-white/5 border-white/20 text-white h-9 text-sm"
                      placeholder="https://github.com/username"
                    />
                  ) : profileData.socialLinks.github ? (
                    <a
                      href={profileData.socialLinks.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      {profileData.socialLinks.github}
                    </a>
                  ) : (
                    <span className="text-white/50">Not set</span>
                  )}
                </div>
                <div>
                  <Label className="text-white/80 flex items-center gap-2 text-sm">
                    <FaLinkedin className="w-3 h-3" />
                    LinkedIn
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.socialLinks.linkedin}
                      onChange={(e) => handleInputChange("socialLinks.linkedin", e.target.value)}
                      className="bg-white/5 border-white/20 text-white h-9 text-sm"
                      placeholder="https://linkedin.com/in/username"
                    />
                  ) : profileData.socialLinks.linkedin ? (
                    <a
                      href={profileData.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      {profileData.socialLinks.linkedin}
                    </a>
                  ) : (
                    <span className="text-white/50">Not set</span>
                  )}
                </div>
                <div>
                  <Label className="text-white/80 flex items-center gap-2 text-sm">
                    <FaGlobe className="w-3 h-3" />
                    Portfolio
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.socialLinks.portfolio}
                      onChange={(e) => handleInputChange("socialLinks.portfolio", e.target.value)}
                      className="bg-white/5 border-white/20 text-white h-9 text-sm"
                      placeholder="https://yourportfolio.com"
                    />
                  ) : profileData.socialLinks.portfolio ? (
                    <a
                      href={profileData.socialLinks.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      {profileData.socialLinks.portfolio}
                    </a>
                  ) : (
                    <span className="text-white/50">Not set</span>
                  )}
                </div>
                <div>
                  <Label className="text-white/80 flex items-center gap-2 text-sm">
                    <FaTwitter className="w-3 h-3" />
                    Twitter
                  </Label>
                  {isEditing ? (
                    <Input
                      value={profileData.socialLinks.twitter}
                      onChange={(e) => handleInputChange("socialLinks.twitter", e.target.value)}
                      className="bg-white/5 border-white/20 text-white h-9 text-sm"
                      placeholder="https://twitter.com/username"
                    />
                  ) : profileData.socialLinks.twitter ? (
                    <a
                      href={profileData.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:underline"
                    >
                      {profileData.socialLinks.twitter}
                    </a>
                  ) : (
                    <span className="text-white/50">Not set</span>
                  )}
                </div>
              </div>
            </div>
            {/* Save/Cancel Buttons */}
            {isEditing && (
              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-white text-zinc-950 hover:bg-white/90 font-medium"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;