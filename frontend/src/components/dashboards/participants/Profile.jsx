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
} from "react-icons/md";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";
import { Search, X } from "lucide-react";
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
        fetchProfile();
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
        fetchProfile();
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

  const tabs = [
    { id: "basic", label: "Basic Info", icon: MdPerson },
    { id: "professional", label: "Professional", icon: MdWork },
    { id: "education", label: "Education", icon: MdSchool },
    { id: "achievements", label: "Achievements", icon: MdStar },
    { id: "settings", label: "Settings", icon: MdSettings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white">Profile</h1>
          <p className="text-white/60 text-sm">
            Manage your profile information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            variant={profileData?.profileCompleted ? "default" : "destructive"}
            className={`text-xs px-3 py-1 ${
              profileData?.profileCompleted
                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                : "bg-amber-950/60 text-amber-400 border-amber-800/50"
            }`}
          >
            {profileData?.profileCompleted ? "Complete" : "Incomplete"}
          </Badge>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-white text-zinc-950 hover:bg-white/90 h-9 px-4 text-sm"
            >
              <MdEdit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={saveProfile}
                disabled={saving}
                className="bg-emerald-700 hover:bg-emerald-600 h-9 px-4 text-sm"
              >
                <MdSave className="w-4 h-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedData(profileData?.profile || {});
                }}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/5 h-9 px-4 text-sm"
              >
                <MdCancel className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Compact Alerts */}
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

      {/* Compact Tabs */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-lg flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all text-sm ${
              activeTab === tab.id
                ? "bg-white text-zinc-950 font-medium"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area - No Scrollbars */}
      <div className="flex-1 min-h-0">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
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
    </div>
  );
};

// Basic Info Tab Component
const BasicInfoTab = ({ data, isEditing, onChange }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-white/80 text-sm">First Name</Label>
            {isEditing ? (
              <Input
                value={data.firstName || ""}
                onChange={(e) => onChange("firstName", e.target.value)}
                className="bg-white/5 border-white/20 text-white h-9 text-sm"
                placeholder="Enter first name"
              />
            ) : (
              <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
                {data.firstName || (
                  <span className="text-white/50">Not set</span>
                )}
              </p>
            )}
          </div>
          <div>
            <Label className="text-white/80 text-sm">Last Name</Label>
            {isEditing ? (
              <Input
                value={data.lastName || ""}
                onChange={(e) => onChange("lastName", e.target.value)}
                className="bg-white/5 border-white/20 text-white h-9 text-sm"
                placeholder="Enter last name"
              />
            ) : (
              <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
                {data.lastName || (
                  <span className="text-white/50">Not set</span>
                )}
              </p>
            )}
          </div>
        </div>
        <div>
          <Label className="text-white/80 text-sm">Bio</Label>
          {isEditing ? (
            <Textarea
              value={data.bio || ""}
              onChange={(e) => onChange("bio", e.target.value)}
              className="bg-white/5 border-white/20 text-white text-sm h-20 resize-none"
              placeholder="Tell us about yourself..."
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10 h-20 overflow-hidden">
              {data.bio || <span className="text-white/50">Not set</span>}
            </p>
          )}
        </div>
        <div>
          <Label className="text-white/80 text-sm">Location</Label>
          {isEditing ? (
            <Input
              value={data.location || ""}
              onChange={(e) => onChange("location", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="City, Country"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.location || <span className="text-white/50">Not set</span>}
            </p>
          )}
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Social Links</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-white/80 flex items-center gap-2 text-sm">
            <FaGithub className="w-3 h-3" />
            GitHub
          </Label>
          {isEditing ? (
            <Input
              value={data.github || ""}
              onChange={(e) => onChange("github", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://github.com/username"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.github ? (
                <a
                  href={data.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.github}
                </a>
              ) : (
                <span className="text-white/50">Not set</span>
              )}
            </p>
          )}
        </div>
        <div>
          <Label className="text-white/80 flex items-center gap-2 text-sm">
            <FaLinkedin className="w-3 h-3" />
            LinkedIn
          </Label>
          {isEditing ? (
            <Input
              value={data.linkedin || ""}
              onChange={(e) => onChange("linkedin", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://linkedin.com/in/username"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.linkedin ? (
                <a
                  href={data.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.linkedin}
                </a>
              ) : (
                <span className="text-white/50">Not set</span>
              )}
            </p>
          )}
        </div>
        <div>
          <Label className="text-white/80 flex items-center gap-2 text-sm">
            <FaGlobe className="w-3 h-3" />
            Portfolio
          </Label>
          {isEditing ? (
            <Input
              value={data.portfolio || ""}
              onChange={(e) => onChange("portfolio", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://yourportfolio.com"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.portfolio ? (
                <a
                  href={data.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.portfolio}
                </a>
              ) : (
                <span className="text-white/50">Not set</span>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Professional Tab Component with Fixed Skill Management
const ProfessionalTab = ({ data, isEditing, onChange }) => {
  const [skillInputs, setSkillInputs] = useState({
    programmingLanguages: "",
    frameworks: "",
    interests: "",
  });
  const [filteredSkills, setFilteredSkills] = useState({
    programmingLanguages: [],
    frameworks: [],
    interests: [],
  });
  const [showDropdowns, setShowDropdowns] = useState({
    programmingLanguages: false,
    frameworks: false,
    interests: false,
  });

  const skillSuggestions = {
    programmingLanguages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "C#",
      "Go",
      "Rust",
      "Ruby",
      "Swift",
      "Kotlin",
      "PHP",
      "Dart",
      "Scala",
    ],
    frameworks: [
      "React",
      "Vue.js",
      "Angular",
      "Next.js",
      "Node.js",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      "Laravel",
      "Ruby on Rails",
      "FastAPI",
    ],
    interests: [
      "AI/ML",
      "Web Development",
      "Mobile Development",
      "Blockchain",
      "Cloud Computing",
      "DevOps",
      "Cybersecurity",
      "Game Development",
      "IoT",
      "Data Science",
    ],
  };

  // Debounced search effect
  useEffect(() => {
    Object.keys(skillInputs).forEach((category) => {
      const timer = setTimeout(() => {
        if (skillInputs[category].trim()) {
          const filtered = skillSuggestions[category]
            .filter(
              (skill) =>
                skill
                  .toLowerCase()
                  .includes(skillInputs[category].toLowerCase()) &&
                !(data[category] || []).includes(skill)
            )
            .slice(0, 6);
          setFilteredSkills((prev) => ({ ...prev, [category]: filtered }));
          setShowDropdowns((prev) => ({
            ...prev,
            [category]: filtered.length > 0,
          }));
        } else {
          setFilteredSkills((prev) => ({ ...prev, [category]: [] }));
          setShowDropdowns((prev) => ({ ...prev, [category]: false }));
        }
      }, 300);

      return () => clearTimeout(timer);
    });
  }, [skillInputs, data]);

  const addSkill = (category, skill) => {
    const currentSkills = data[category] || [];
    if (!currentSkills.includes(skill)) {
      onChange(category, [...currentSkills, skill]);
      setSkillInputs((prev) => ({ ...prev, [category]: "" }));
      setShowDropdowns((prev) => ({ ...prev, [category]: false }));
    }
  };

  const removeSkill = (category, skillToRemove) => {
    const currentSkills = data[category] || [];
    onChange(
      category,
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const handleSkillInputChange = (category, value) => {
    setSkillInputs((prev) => ({ ...prev, [category]: value }));
  };

  const handleSkillInputKeyDown = (category, e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSkills[category].length > 0) {
        addSkill(category, filteredSkills[category][0]);
      } else if (skillInputs[category].trim()) {
        addSkill(category, skillInputs[category].trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdowns((prev) => ({ ...prev, [category]: false }));
      setSkillInputs((prev) => ({ ...prev, [category]: "" }));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">Work Experience</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label className="text-white/80 text-sm">Company</Label>
            {isEditing ? (
              <Input
                value={data.company || ""}
                onChange={(e) => onChange("company", e.target.value)}
                className="bg-white/5 border-white/20 text-white h-9 text-sm"
                placeholder="Company name"
              />
            ) : (
              <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
                {data.company || <span className="text-white/50">Not set</span>}
              </p>
            )}
          </div>
          <div>
            <Label className="text-white/80 text-sm">Job Title</Label>
            {isEditing ? (
              <Input
                value={data.jobTitle || ""}
                onChange={(e) => onChange("jobTitle", e.target.value)}
                className="bg-white/5 border-white/20 text-white h-9 text-sm"
                placeholder="Your job title"
              />
            ) : (
              <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
                {data.jobTitle || (
                  <span className="text-white/50">Not set</span>
                )}
              </p>
            )}
          </div>
          <div>
            <Label className="text-white/80 text-sm">Experience Level</Label>
            {isEditing ? (
              <Select
                value={data.experience || ""}
                onValueChange={(value) => onChange("experience", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white h-9 text-sm">
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
              <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10 capitalize">
                {data.experience || (
                  <span className="text-white/50">Not set</span>
                )}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg">
            Skills & Technologies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Programming Languages */}
          <div>
            <Label className="text-white/80 text-sm">
              Programming Languages
            </Label>
            {isEditing ? (
              <div className="space-y-2">
                {/* Selected Skills */}
                {(data.programmingLanguages || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.programmingLanguages.map((lang, index) => (
                      <Badge
                        key={index}
                        className="bg-violet-950/60 text-violet-300 border-violet-800/50 text-xs px-2 py-0.5 cursor-pointer group"
                        onClick={() =>
                          removeSkill("programmingLanguages", lang)
                        }
                      >
                        {lang}
                        <X className="w-3 h-3 ml-1 group-hover:text-red-300" />
                      </Badge>
                    ))}
                  </div>
                )}
                {/* Input with Dropdown */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/40" />
                    <Input
                      value={skillInputs.programmingLanguages}
                      onChange={(e) =>
                        handleSkillInputChange(
                          "programmingLanguages",
                          e.target.value
                        )
                      }
                      onKeyDown={(e) =>
                        handleSkillInputKeyDown("programmingLanguages", e)
                      }
                      onFocus={() =>
                        skillInputs.programmingLanguages &&
                        setShowDropdowns((prev) => ({
                          ...prev,
                          programmingLanguages:
                            filteredSkills.programmingLanguages.length > 0,
                        }))
                      }
                      className="bg-white/5 border-white/20 text-white h-9 text-sm pl-7"
                      placeholder="Search or add languages..."
                    />
                  </div>
                  {showDropdowns.programmingLanguages && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                      {filteredSkills.programmingLanguages.map((skill) => (
                        <div
                          key={skill}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white text-sm border-b border-white/10 last:border-b-0"
                          onClick={() =>
                            addSkill("programmingLanguages", skill)
                          }
                        >
                          {skill}
                        </div>
                      ))}
                      {skillInputs.programmingLanguages &&
                        !skillSuggestions.programmingLanguages.some(
                          (skill) =>
                            skill.toLowerCase() ===
                            skillInputs.programmingLanguages.toLowerCase()
                        ) && (
                          <div
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 text-sm italic"
                            onClick={() =>
                              addSkill(
                                "programmingLanguages",
                                skillInputs.programmingLanguages.trim()
                              )
                            }
                          >
                            Add "{skillInputs.programmingLanguages}"
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1 py-2 px-3 bg-white/5 rounded border border-white/10 min-h-[36px] items-center">
                {(data.programmingLanguages || []).length > 0 ? (
                  data.programmingLanguages.map((lang, index) => (
                    <Badge
                      key={index}
                      className="bg-violet-950/60 text-violet-300 border-violet-800/50 text-xs px-2 py-0.5"
                    >
                      {lang}
                    </Badge>
                  ))
                ) : (
                  <span className="text-white/50 text-sm">Not set</span>
                )}
              </div>
            )}
          </div>

          {/* Frameworks & Tools */}
          <div>
            <Label className="text-white/80 text-sm">Frameworks & Tools</Label>
            {isEditing ? (
              <div className="space-y-2">
                {(data.frameworks || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.frameworks.map((framework, index) => (
                      <Badge
                        key={index}
                        className="bg-emerald-950/60 text-emerald-300 border-emerald-800/50 text-xs px-2 py-0.5 cursor-pointer group"
                        onClick={() => removeSkill("frameworks", framework)}
                      >
                        {framework}
                        <X className="w-3 h-3 ml-1 group-hover:text-red-300" />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/40" />
                    <Input
                      value={skillInputs.frameworks}
                      onChange={(e) =>
                        handleSkillInputChange("frameworks", e.target.value)
                      }
                      onKeyDown={(e) =>
                        handleSkillInputKeyDown("frameworks", e)
                      }
                      onFocus={() =>
                        skillInputs.frameworks &&
                        setShowDropdowns((prev) => ({
                          ...prev,
                          frameworks: filteredSkills.frameworks.length > 0,
                        }))
                      }
                      className="bg-white/5 border-white/20 text-white h-9 text-sm pl-7"
                      placeholder="Search or add frameworks..."
                    />
                  </div>
                  {showDropdowns.frameworks && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                      {filteredSkills.frameworks.map((skill) => (
                        <div
                          key={skill}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white text-sm border-b border-white/10 last:border-b-0"
                          onClick={() => addSkill("frameworks", skill)}
                        >
                          {skill}
                        </div>
                      ))}
                      {skillInputs.frameworks &&
                        !skillSuggestions.frameworks.some(
                          (skill) =>
                            skill.toLowerCase() ===
                            skillInputs.frameworks.toLowerCase()
                        ) && (
                          <div
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 text-sm italic"
                            onClick={() =>
                              addSkill(
                                "frameworks",
                                skillInputs.frameworks.trim()
                              )
                            }
                          >
                            Add "{skillInputs.frameworks}"
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1 py-2 px-3 bg-white/5 rounded border border-white/10 min-h-[36px] items-center">
                {(data.frameworks || []).length > 0 ? (
                  data.frameworks.map((framework, index) => (
                    <Badge
                      key={index}
                      className="bg-emerald-950/60 text-emerald-300 border-emerald-800/50 text-xs px-2 py-0.5"
                    >
                      {framework}
                    </Badge>
                  ))
                ) : (
                  <span className="text-white/50 text-sm">Not set</span>
                )}
              </div>
            )}
          </div>

          {/* Interests */}
          <div>
            <Label className="text-white/80 text-sm">Interests</Label>
            {isEditing ? (
              <div className="space-y-2">
                {(data.interests || []).length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {data.interests.map((interest, index) => (
                      <Badge
                        key={index}
                        className="bg-indigo-950/60 text-indigo-300 border-indigo-800/50 text-xs px-2 py-0.5 cursor-pointer group"
                        onClick={() => removeSkill("interests", interest)}
                      >
                        {interest}
                        <X className="w-3 h-3 ml-1 group-hover:text-red-300" />
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/40" />
                    <Input
                      value={skillInputs.interests}
                      onChange={(e) =>
                        handleSkillInputChange("interests", e.target.value)
                      }
                      onKeyDown={(e) => handleSkillInputKeyDown("interests", e)}
                      onFocus={() =>
                        skillInputs.interests &&
                        setShowDropdowns((prev) => ({
                          ...prev,
                          interests: filteredSkills.interests.length > 0,
                        }))
                      }
                      className="bg-white/5 border-white/20 text-white h-9 text-sm pl-7"
                      placeholder="Search or add interests..."
                    />
                  </div>
                  {showDropdowns.interests && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md shadow-lg z-10 max-h-32 overflow-y-auto">
                      {filteredSkills.interests.map((skill) => (
                        <div
                          key={skill}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white text-sm border-b border-white/10 last:border-b-0"
                          onClick={() => addSkill("interests", skill)}
                        >
                          {skill}
                        </div>
                      ))}
                      {skillInputs.interests &&
                        !skillSuggestions.interests.some(
                          (skill) =>
                            skill.toLowerCase() ===
                            skillInputs.interests.toLowerCase()
                        ) && (
                          <div
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 text-sm italic"
                            onClick={() =>
                              addSkill(
                                "interests",
                                skillInputs.interests.trim()
                              )
                            }
                          >
                            Add "{skillInputs.interests}"
                          </div>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1 py-2 px-3 bg-white/5 rounded border border-white/10 min-h-[36px] items-center">
                {(data.interests || []).length > 0 ? (
                  data.interests.map((interest, index) => (
                    <Badge
                      key={index}
                      className="bg-indigo-950/60 text-indigo-300 border-indigo-800/50 text-xs px-2 py-0.5"
                    >
                      {interest}
                    </Badge>
                  ))
                ) : (
                  <span className="text-white/50 text-sm">Not set</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Education Tab Component
const EducationTab = ({ data, isEditing, onChange }) => {
  const [education, setEducation] = useState(data.education || []);
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    current: false,
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const addEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      const updatedEducation = [
        ...education,
        { ...newEducation, id: Date.now() },
      ];
      setEducation(updatedEducation);
      onChange("education", updatedEducation);
      setNewEducation({
        institution: "",
        degree: "",
        field: "",
        startYear: "",
        endYear: "",
        current: false,
      });
      setShowAddForm(false);
    }
  };

  const removeEducation = (id) => {
    const updatedEducation = education.filter((edu) => edu.id !== id);
    setEducation(updatedEducation);
    onChange("education", updatedEducation);
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">
          Educational Background
        </h3>
        {isEditing && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white text-zinc-950 hover:bg-white/90 h-9 px-4 text-sm"
          >
            <MdAdd className="w-4 h-4 mr-1" />
            Add Education
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-white/80 text-sm">Institution</Label>
                  <Input
                    value={newEducation.institution}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        institution: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/20 text-white h-9 text-sm"
                    placeholder="University/School name"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Degree</Label>
                  <Input
                    value={newEducation.degree}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        degree: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/20 text-white h-9 text-sm"
                    placeholder="Bachelor's, Master's, etc."
                  />
                </div>
              </div>
              <div>
                <Label className="text-white/80 text-sm">Field of Study</Label>
                <Input
                  value={newEducation.field}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, field: e.target.value })
                  }
                  className="bg-white/5 border-white/20 text-white h-9 text-sm"
                  placeholder="Computer Science, Engineering, etc."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white/80 text-sm">Start Year</Label>
                  <Input
                    type="number"
                    value={newEducation.startYear}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        startYear: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/20 text-white h-9 text-sm"
                    placeholder="2020"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">End Year</Label>
                  <Input
                    type="number"
                    value={newEducation.endYear}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        endYear: e.target.value,
                      })
                    }
                    disabled={newEducation.current}
                    className="bg-white/5 border-white/20 text-white h-9 text-sm"
                    placeholder="2024"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newEducation.current}
                  onChange={(e) =>
                    setNewEducation({
                      ...newEducation,
                      current: e.target.checked,
                      endYear: e.target.checked ? "" : newEducation.endYear,
                    })
                  }
                  className="w-4 h-4"
                />
                <Label className="text-white/80 text-sm">
                  Currently studying here
                </Label>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={addEducation}
                  className="bg-emerald-700 hover:bg-emerald-600 h-9 px-4 text-sm"
                >
                  Add Education
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 h-9 px-4 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {education.map((edu) => (
          <Card key={edu.id} className="bg-white/5 border-white/10">
            <CardContent className="pt-3">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="text-white font-medium text-sm">
                    {edu.institution}
                  </h4>
                  <p className="text-white/70 text-xs">
                    {edu.degree} {edu.field && `in ${edu.field}`}
                  </p>
                  <p className="text-white/50 text-xs">
                    {edu.startYear} - {edu.current ? "Present" : edu.endYear}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeEducation(edu.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/20 h-6 w-6 p-0"
                  >
                    <MdDelete className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {education.length === 0 && !showAddForm && (
        <div className="text-center py-12">
          <MdSchool className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4 text-sm">No education added yet</p>
          {isEditing && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-zinc-950 hover:bg-white/90 h-9 px-4 text-sm"
            >
              Add Your First Education
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

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
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Your Achievements</h3>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-white text-zinc-950 hover:bg-white/90 h-9 px-4 text-sm"
        >
          <MdAdd className="w-4 h-4 mr-1" />
          Add Achievement
        </Button>
      </div>

      {showAddForm && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-white/80 text-sm">Title</Label>
                  <Input
                    value={newAchievement.title}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        title: e.target.value,
                      })
                    }
                    className="bg-white/5 border-white/20 text-white h-9 text-sm"
                    placeholder="Achievement title"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Type</Label>
                  <Select
                    value={newAchievement.type}
                    onValueChange={(value) =>
                      setNewAchievement({ ...newAchievement, type: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white h-9 text-sm">
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
                <Label className="text-white/80 text-sm">Description</Label>
                <Textarea
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/20 text-white text-sm h-16 resize-none"
                  placeholder="Describe your achievement..."
                  required
                />
              </div>
              <div>
                <Label className="text-white/80 text-sm">Date</Label>
                <Input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      date: e.target.value,
                    })
                  }
                  className="bg-white/5 border-white/20 text-white h-9 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-600 h-9 px-4 text-sm"
                >
                  Add Achievement
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/5 h-9 px-4 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <Card key={achievement._id} className="bg-white/5 border-white/10">
            <CardContent className="pt-3">
              <div className="flex items-start justify-between mb-2">
                <Badge
                  className={`text-xs px-2 py-1 ${
                    achievement.type === "hackathon"
                      ? "bg-cyan-950/60 text-cyan-300 border-cyan-800/50"
                      : achievement.type === "certification"
                      ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                      : achievement.type === "award"
                      ? "bg-amber-950/60 text-amber-300 border-amber-800/50"
                      : "bg-violet-950/60 text-violet-300 border-violet-800/50"
                  }`}
                >
                  {achievement.type}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemove(achievement._id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-950/20 h-6 w-6 p-0"
                >
                  <MdDelete className="w-3 h-3" />
                </Button>
              </div>
              <h4 className="text-white font-medium mb-2 text-sm">
                {achievement.title}
              </h4>
              <p className="text-white/70 text-xs mb-2 leading-relaxed">
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
          <MdStar className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50 mb-4 text-sm">No achievements yet</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-zinc-950 hover:bg-white/90 h-9 px-4 text-sm"
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
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MdVisibility className="w-4 h-4" />
          Privacy Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-white/80 text-sm">Profile Visibility</Label>
          <Select defaultValue="public">
            <SelectTrigger className="bg-white/5 border-white/20 text-white h-9 text-sm">
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
          <p className="text-white/50 text-xs mt-1">
            Control who can view your profile information
          </p>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <MdNotifications className="w-4 h-4" />
          Notification Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-white/80 text-sm">Email Notifications</Label>
            <p className="text-white/50 text-xs mt-1">
              Manage your email notification preferences
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/5 hover:border-white/30 h-8 px-3 text-xs"
          >
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default Profile;
