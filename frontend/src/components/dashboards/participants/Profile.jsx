import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MdEdit,
  MdSave,
  MdCancel,
  MdAdd,
  MdDelete,
  MdPerson,
  MdWork,
  MdSchool,
  MdStar,
  MdSettings,
  MdVisibility,
  MdNotifications,
  MdEmail,
} from "react-icons/md";
import { FaGithub, FaLinkedin, FaTwitter, FaGlobe } from "react-icons/fa";
import { useAuth } from "../../../contexts/AuthContext";

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setProfileData(data.data);
        setEditedData(data.data.profile || {});
      } else {
        setError(data.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    setError("");
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedData),
      });

      const data = await response.json();
      if (data.success) {
        setProfileData({ ...profileData, ...data.data });
        setIsEditing(false);
        setSuccess("Profile updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addAchievement = async (achievement) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/achievements`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(achievement),
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchProfile(); // Refresh profile data
        setSuccess("Achievement added successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to add achievement");
      }
    } catch (error) {
      console.error("Add achievement error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  const removeAchievement = async (achievementId) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/profile/achievements/${achievementId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        fetchProfile(); // Refresh profile data
        setSuccess("Achievement removed successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to remove achievement");
      }
    } catch (error) {
      console.error("Remove achievement error:", error);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleInputChange = (field, value) => {
    setEditedData({ ...editedData, [field]: value });
  };

  const handleArrayFieldChange = (field, value) => {
    const array = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    setEditedData({ ...editedData, [field]: array });
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: MdPerson },
    { id: "professional", label: "Professional", icon: MdWork },
    { id: "education", label: "Education", icon: MdSchool },
    { id: "achievements", label: "Achievements", icon: MdStar },
    { id: "settings", label: "Settings", icon: MdSettings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-white/70">Manage your profile information</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={profileData?.profileCompleted ? "default" : "destructive"}
            className="text-sm"
          >
            {profileData?.profileCompleted ? "Complete" : "Incomplete"}
          </Badge>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-white text-zinc-950 hover:bg-white/90"
            >
              <MdEdit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <MdSave className="w-4 h-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedData(profileData?.profile || {});
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <MdCancel className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="bg-red-900/20 border-red-800/50">
          <AlertDescription className="text-red-200">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-900/20 border-green-800/50">
          <AlertDescription className="text-green-200">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
              activeTab === tab.id
                ? "bg-white text-zinc-950"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "basic" && (
          <BasicInfoTab
            data={editedData}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
        )}
        {activeTab === "professional" && (
          <ProfessionalTab
            data={editedData}
            isEditing={isEditing}
            onChange={handleInputChange}
            onArrayChange={handleArrayFieldChange}
          />
        )}
        {activeTab === "education" && (
          <EducationTab
            data={editedData}
            isEditing={isEditing}
            onChange={handleInputChange}
          />
        )}
        {activeTab === "achievements" && (
          <AchievementsTab
            achievements={profileData?.profile?.achievements || []}
            onAdd={addAchievement}
            onRemove={removeAchievement}
          />
        )}
        {activeTab === "settings" && (
          <SettingsTab profileData={profileData} onUpdate={fetchProfile} />
        )}
      </motion.div>
    </div>
  );
};

// Basic Info Tab Component
const BasicInfoTab = ({ data, isEditing, onChange }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white/80">First Name</Label>
            {isEditing ? (
              <Input
                value={data.firstName || ""}
                onChange={(e) => onChange("firstName", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="Enter first name"
              />
            ) : (
              <p className="text-white mt-1">{data.firstName || "Not set"}</p>
            )}
          </div>
          <div>
            <Label className="text-white/80">Last Name</Label>
            {isEditing ? (
              <Input
                value={data.lastName || ""}
                onChange={(e) => onChange("lastName", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="Enter last name"
              />
            ) : (
              <p className="text-white mt-1">{data.lastName || "Not set"}</p>
            )}
          </div>
        </div>
        <div>
          <Label className="text-white/80">Bio</Label>
          {isEditing ? (
            <Textarea
              value={data.bio || ""}
              onChange={(e) => onChange("bio", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Tell us about yourself..."
              rows={3}
            />
          ) : (
            <p className="text-white mt-1">{data.bio || "Not set"}</p>
          )}
        </div>
        <div>
          <Label className="text-white/80">Location</Label>
          {isEditing ? (
            <Input
              value={data.location || ""}
              onChange={(e) => onChange("location", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="City, Country"
            />
          ) : (
            <p className="text-white mt-1">{data.location || "Not set"}</p>
          )}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div>
            <Label className="text-white/80 flex items-center gap-2">
              <FaGithub className="w-4 h-4" />
              GitHub
            </Label>
            {isEditing ? (
              <Input
                value={data.github || ""}
                onChange={(e) => onChange("github", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="https://github.com/username"
              />
            ) : (
              <p className="text-white mt-1">{data.github || "Not set"}</p>
            )}
          </div>
          <div>
            <Label className="text-white/80 flex items-center gap-2">
              <FaLinkedin className="w-4 h-4" />
              LinkedIn
            </Label>
            {isEditing ? (
              <Input
                value={data.linkedin || ""}
                onChange={(e) => onChange("linkedin", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="https://linkedin.com/in/username"
              />
            ) : (
              <p className="text-white mt-1">{data.linkedin || "Not set"}</p>
            )}
          </div>
          <div>
            <Label className="text-white/80 flex items-center gap-2">
              <FaGlobe className="w-4 h-4" />
              Portfolio
            </Label>
            {isEditing ? (
              <Input
                value={data.portfolio || ""}
                onChange={(e) => onChange("portfolio", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="https://yourportfolio.com"
              />
            ) : (
              <p className="text-white mt-1">{data.portfolio || "Not set"}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Professional Tab Component
const ProfessionalTab = ({ data, isEditing, onChange, onArrayChange }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Work Experience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white/80">Company</Label>
          {isEditing ? (
            <Input
              value={data.company || ""}
              onChange={(e) => onChange("company", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Company name"
            />
          ) : (
            <p className="text-white mt-1">{data.company || "Not set"}</p>
          )}
        </div>
        <div>
          <Label className="text-white/80">Job Title</Label>
          {isEditing ? (
            <Input
              value={data.jobTitle || ""}
              onChange={(e) => onChange("jobTitle", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="Your job title"
            />
          ) : (
            <p className="text-white mt-1">{data.jobTitle || "Not set"}</p>
          )}
        </div>
        <div>
          <Label className="text-white/80">Experience Level</Label>
          {isEditing ? (
            <Select
              value={data.experience || ""}
              onValueChange={(value) => onChange("experience", value)}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select experience level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                <SelectItem value="mid">Mid Level (2-5 years)</SelectItem>
                <SelectItem value="senior">Senior (5+ years)</SelectItem>
                <SelectItem value="lead">Lead/Manager</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-white mt-1 capitalize">
              {data.experience || "Not set"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Skills & Technologies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white/80">Programming Languages</Label>
          {isEditing ? (
            <Input
              value={data.programmingLanguages?.join(", ") || ""}
              onChange={(e) =>
                onArrayChange("programmingLanguages", e.target.value)
              }
              className="bg-white/5 border-white/20 text-white"
              placeholder="JavaScript, Python, Java (comma separated)"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.programmingLanguages?.map((lang, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-blue-900/50 text-blue-200"
                >
                  {lang}
                </Badge>
              )) || <span className="text-white/50">Not set</span>}
            </div>
          )}
        </div>
        <div>
          <Label className="text-white/80">Frameworks & Tools</Label>
          {isEditing ? (
            <Input
              value={data.frameworks?.join(", ") || ""}
              onChange={(e) => onArrayChange("frameworks", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="React, Node.js, Docker (comma separated)"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.frameworks?.map((framework, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-green-900/50 text-green-200"
                >
                  {framework}
                </Badge>
              )) || <span className="text-white/50">Not set</span>}
            </div>
          )}
        </div>
        <div>
          <Label className="text-white/80">Interests</Label>
          {isEditing ? (
            <Input
              value={data.interests?.join(", ") || ""}
              onChange={(e) => onArrayChange("interests", e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              placeholder="AI, Web Development, Mobile Apps (comma separated)"
            />
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {data.interests?.map((interest, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-purple-900/50 text-purple-200"
                >
                  {interest}
                </Badge>
              )) || <span className="text-white/50">Not set</span>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Education Tab Component
const EducationTab = ({ data, isEditing, onChange }) => (
  <Card className="bg-white/5 border-white/10">
    <CardHeader>
      <CardTitle className="text-white">Educational Background</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-white/70 text-center py-8">
        Education management coming soon! You'll be able to add your degrees,
        certifications, and academic achievements.
      </p>
    </CardContent>
  </Card>
);

// Achievements Tab Component
const AchievementsTab = ({ achievements, onAdd, onRemove }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    type: "hackathon",
    date: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(newAchievement);
    setNewAchievement({
      title: "",
      description: "",
      type: "hackathon",
      date: "",
    });
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Your Achievements</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white text-zinc-950 hover:bg-white/90"
        >
          <MdAdd className="w-4 h-4 mr-2" />
          Add Achievement
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80">Title</Label>
                  <Input
                    value={newAchievement.title}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        title: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Achievement title"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80">Type</Label>
                  <Select
                    value={newAchievement.type}
                    onValueChange={(value) =>
                      setNewAchievement({ ...newAchievement, type: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="certification">
                        Certification
                      </SelectItem>
                      <SelectItem value="award">Award</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-white/80">Description</Label>
                <Textarea
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Describe your achievement..."
                  required
                />
              </div>
              <div>
                <Label className="text-white/80">Date</Label>
                <Input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      date: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Add Achievement
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card key={achievement._id} className="bg-white/5 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-2">
                <Badge
                  variant="secondary"
                  className={`${
                    achievement.type === "hackathon"
                      ? "bg-blue-900/50 text-blue-200"
                      : achievement.type === "certification"
                      ? "bg-green-900/50 text-green-200"
                      : achievement.type === "award"
                      ? "bg-yellow-900/50 text-yellow-200"
                      : "bg-purple-900/50 text-purple-200"
                  }`}
                >
                  {achievement.type}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(achievement._id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                >
                  <MdDelete className="w-4 h-4" />
                </Button>
              </div>
              <h4 className="text-white font-medium mb-2">
                {achievement.title}
              </h4>
              <p className="text-white/70 text-sm mb-2">
                {achievement.description}
              </p>
              <p className="text-white/50 text-xs">
                {new Date(achievement.date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {achievements.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <MdStar className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4">No achievements yet</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-zinc-950 hover:bg-white/90"
          >
            Add Your First Achievement
          </Button>
        </div>
      )}
    </div>
  );
};

// Settings Tab Component
const SettingsTab = ({ profileData, onUpdate }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MdVisibility className="w-5 h-5" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-white/80">Profile Visibility</Label>
          <Select defaultValue="public">
            <SelectTrigger className="bg-white/5 border-white/20 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="participants-only">
                Participants Only
              </SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MdNotifications className="w-5 h-5" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-white/80">Email Notifications</Label>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Profile;
