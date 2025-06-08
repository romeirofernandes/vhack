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
  MdCode,
} from "react-icons/md";
import { FaGithub, FaLinkedin, FaGlobe, FaTwitter } from "react-icons/fa";
import { Search, X } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";

const Profile = () => {
  const [profileData, setProfileData] = useState({
    displayName: "",
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    company: "",
    jobTitle: "",
    experience: "",
    skills: [],
    education: [],
    socialLinks: {
      github: "",
      linkedin: "",
      portfolio: "",
      twitter: "",
    },
    achievements: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Skills from database
  const [availableSkills, setAvailableSkills] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    fetchProfile();
    fetchAvailableSkills();
  }, []);

  const fetchAvailableSkills = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/skills`);
      const data = await response.json();
      if (data.success) {
        setAvailableSkills(data.skills);
      }
    } catch (error) {
      console.error("Failed to fetch skills:", error);
      // Fallback skills if API fails
      setAvailableSkills([
        "JavaScript",
        "TypeScript",
        "Python",
        "React",
        "Node.js",
        "Express.js",
        "MongoDB",
        "PostgreSQL",
        "Docker",
        "AWS",
        "Git",
        "HTML",
        "CSS",
        "Tailwind",
      ]);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log("Fetched profile data:", data.data);

        setProfileData({
          displayName: data.data.displayName || "",
          firstName: data.data.profile?.firstName || "",
          lastName: data.data.profile?.lastName || "",
          bio: data.data.profile?.bio || "",
          location: data.data.profile?.location || "",
          company: data.data.profile?.company || "",
          jobTitle: data.data.profile?.jobTitle || "",
          experience: data.data.profile?.experience || "",
          skills: data.data.profile?.skills || [], // Simple array of strings
          education: data.data.profile?.education || [],
          socialLinks: {
            github: data.data.profile?.socialLinks?.github || "",
            linkedin: data.data.profile?.socialLinks?.linkedin || "",
            portfolio: data.data.profile?.socialLinks?.portfolio || "",
            twitter: data.data.profile?.socialLinks?.twitter || "",
          },
          achievements: data.data.profile?.achievements || [],
        });
      } else {
        setError(data.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const validEducation = profileData.education.filter(
        (edu) => edu && edu.institution && edu.degree
      );

      const validAchievements = profileData.achievements.filter(
        (achievement) =>
          achievement && achievement.title && achievement.description
      );

      const dataToSave = {
        ...profileData,
        skills: profileData.skills || [],
        education: validEducation,
        achievements: validAchievements,
      };

      console.log("Saving profile data:", dataToSave);

      const idToken = await user.getIdToken(true);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSave),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
        await fetchProfile();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile save error:", error);
      setError("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setProfileData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const addSkill = (skillName) => {
    if (skillName.trim() && !profileData.skills.includes(skillName.trim())) {
      setProfileData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillName.trim()],
      }));
    }
  };

  const removeSkill = (index) => {
    setProfileData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const addEducation = (education) => {
    setProfileData((prev) => ({
      ...prev,
      education: [...prev.education, { ...education, id: Date.now() }],
    }));
  };

  const removeEducation = (id) => {
    setProfileData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addAchievement = (achievement) => {
    setProfileData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { ...achievement, id: Date.now() }],
    }));
  };

  const removeAchievement = (id) => {
    setProfileData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter(
        (achievement) => achievement.id !== id
      ),
    }));
  };

  const tabs = [
    { id: "basic", label: "Basic Info", icon: MdPerson },
    { id: "professional", label: "Professional", icon: MdWork },
    { id: "education", label: "Education", icon: MdSchool },
    { id: "achievements", label: "Achievements", icon: MdStar },
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
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white">Profile</h1>
          <p className="text-white/60 text-sm">
            Manage your profile information
          </p>
        </div>
        <div className="flex items-center gap-3">
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
                className="bg-emerald-700 hover:bg-emerald-600 text-white h-9 px-4 text-sm"
              >
                <MdSave className="w-4 h-4 mr-1" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reset data
                }}
                variant="outline"
                className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60 h-9 px-4 text-sm"
              >
                <MdCancel className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
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

      {/* Tab Navigation */}
      <div className="flex justify-center flex-shrink-0">
        <div className="flex space-x-1 bg-white/5 p-1 rounded-lg w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center transition-all ${
                activeTab === tab.id
                  ? "bg-white text-zinc-950 font-medium"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              } rounded-md sm:space-x-2 sm:px-3 sm:py-2 px-3 py-2`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeTab === "basic" && (
            <BasicInfoTab
              data={profileData}
              isEditing={isEditing}
              onChange={handleInputChange}
            />
          )}
          {activeTab === "professional" && (
            <ProfessionalTab
              data={profileData}
              isEditing={isEditing}
              onChange={handleInputChange}
              onAddSkill={addSkill}
              onRemoveSkill={removeSkill}
              availableSkills={availableSkills}
            />
          )}
          {activeTab === "education" && (
            <EducationTab
              data={profileData}
              isEditing={isEditing}
              onAddEducation={addEducation}
              onRemoveEducation={removeEducation}
            />
          )}
          {activeTab === "achievements" && (
            <AchievementsTab
              data={profileData}
              isEditing={isEditing}
              onAddAchievement={addAchievement}
              onRemoveAchievement={removeAchievement}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Basic Info Tab
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
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10 h-20 overflow-auto">
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
              value={data.socialLinks?.github || ""}
              onChange={(e) => onChange("socialLinks.github", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://github.com/username"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.socialLinks?.github ? (
                <a
                  href={data.socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.socialLinks.github}
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
              value={data.socialLinks?.linkedin || ""}
              onChange={(e) => onChange("socialLinks.linkedin", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://linkedin.com/in/username"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.socialLinks?.linkedin ? (
                <a
                  href={data.socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.socialLinks.linkedin}
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
              value={data.socialLinks?.portfolio || ""}
              onChange={(e) =>
                onChange("socialLinks.portfolio", e.target.value)
              }
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://yourportfolio.com"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.socialLinks?.portfolio ? (
                <a
                  href={data.socialLinks.portfolio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.socialLinks.portfolio}
                </a>
              ) : (
                <span className="text-white/50">Not set</span>
              )}
            </p>
          )}
        </div>
        <div>
          <Label className="text-white/80 flex items-center gap-2 text-sm">
            <FaTwitter className="w-3 h-3" />
            Twitter
          </Label>
          {isEditing ? (
            <Input
              value={data.socialLinks?.twitter || ""}
              onChange={(e) => onChange("socialLinks.twitter", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="https://twitter.com/username"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.socialLinks?.twitter ? (
                <a
                  href={data.socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:underline"
                >
                  {data.socialLinks.twitter}
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

// Professional Tab with debounced search
const ProfessionalTab = ({
  data,
  isEditing,
  onChange,
  onAddSkill,
  onRemoveSkill,
  availableSkills,
}) => {
  const [newSkill, setNewSkill] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newSkill.trim()) {
        const filtered = availableSkills
          .filter(
            (skill) =>
              skill.toLowerCase().includes(newSkill.toLowerCase()) &&
              !data.skills.includes(skill)
          )
          .slice(0, 8);
        setFilteredSkills(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setFilteredSkills([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [newSkill, data.skills, availableSkills]);

  const handleAddSkill = (skill) => {
    onAddSkill(skill);
    setNewSkill("");
    setShowDropdown(false);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSkills.length > 0) {
        handleAddSkill(filteredSkills[0]);
      } else if (newSkill.trim()) {
        handleAddSkill(newSkill.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setNewSkill("");
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
                <SelectContent className="bg-zinc-900 border-white/20">
                  <SelectItem
                    value="beginner"
                    className="text-white hover:bg-white/10"
                  >
                    Beginner (0-1 years)
                  </SelectItem>
                  <SelectItem
                    value="intermediate"
                    className="text-white hover:bg-white/10"
                  >
                    Intermediate (1-3 years)
                  </SelectItem>
                  <SelectItem
                    value="advanced"
                    className="text-white hover:bg-white/10"
                  >
                    Advanced (3-5 years)
                  </SelectItem>
                  <SelectItem
                    value="expert"
                    className="text-white hover:bg-white/10"
                  >
                    Expert (5+ years)
                  </SelectItem>
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
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <MdCode className="w-5 h-5" />
            Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isEditing && (
            <div className="relative">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-white/40" />
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={handleSkillInputKeyDown}
                    onFocus={() =>
                      newSkill && setShowDropdown(filteredSkills.length > 0)
                    }
                    className="bg-white/5 border-white/20 text-white h-9 text-sm pl-9"
                    placeholder="Search or add skills..."
                  />
                </div>
                <Button
                  onClick={() =>
                    newSkill.trim() && handleAddSkill(newSkill.trim())
                  }
                  className="bg-white/10 text-white border-white/20 hover:bg-white/20 h-9 px-3"
                  variant="outline"
                >
                  <MdAdd className="w-4 h-4" />
                </Button>
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredSkills.map((skill) => (
                    <div
                      key={skill}
                      className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white border-b border-white/10 last:border-b-0"
                      onClick={() => handleAddSkill(skill)}
                    >
                      {skill}
                    </div>
                  ))}
                  {newSkill &&
                    !availableSkills.some(
                      (skill) => skill.toLowerCase() === newSkill.toLowerCase()
                    ) && (
                      <div
                        className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 border-b border-white/10 last:border-b-0 italic"
                        onClick={() => handleAddSkill(newSkill.trim())}
                      >
                        Add "{newSkill}" as custom skill
                      </div>
                    )}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-auto">
            {data.skills?.map((skill, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
              >
                <span className="text-white text-sm">{skill}</span>
                {isEditing && (
                  <Button
                    onClick={() => onRemoveSkill(index)}
                    variant="outline"
                    size="sm"
                    className="border-red-800/50 text-red-400 hover:bg-red-900/20 hover:border-red-700/50 h-6 w-6 p-0"
                  >
                    <MdDelete className="w-3 h-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {(!data.skills || data.skills.length === 0) && (
            <div className="text-center py-8">
              <MdCode className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-white/50 text-sm">No skills added yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Prettier Education Tab
const EducationTab = ({
  data,
  isEditing,
  onAddEducation,
  onRemoveEducation,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEducation, setNewEducation] = useState({
    institution: "",
    degree: "",
    field: "",
    startYear: "",
    endYear: "",
    current: false,
  });

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      onAddEducation(newEducation);
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
        <Card className="bg-emerald-950/20 border-emerald-800/30">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80 text-sm font-medium">
                    Institution *
                  </Label>
                  <Input
                    value={newEducation.institution}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        institution: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1"
                    placeholder="University/School name"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm font-medium">
                    Degree *
                  </Label>
                  <Input
                    value={newEducation.degree}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        degree: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1"
                    placeholder="Bachelor's, Master's, etc."
                  />
                </div>
              </div>

              <div>
                <Label className="text-white/80 text-sm font-medium">
                  Field of Study
                </Label>
                <Input
                  value={newEducation.field}
                  onChange={(e) =>
                    setNewEducation({ ...newEducation, field: e.target.value })
                  }
                  className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1"
                  placeholder="Computer Science, Engineering, etc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80 text-sm font-medium">
                    Start Year
                  </Label>
                  <Input
                    type="number"
                    value={newEducation.startYear}
                    onChange={(e) =>
                      setNewEducation({
                        ...newEducation,
                        startYear: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1"
                    placeholder="2020"
                    min="1950"
                    max="2030"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm font-medium">
                    End Year
                  </Label>
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
                    className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1 disabled:opacity-50 disabled:bg-white/5"
                    placeholder="2024"
                    min="1950"
                    max="2030"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
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
                  className="w-4 h-4 rounded bg-white/10 border-white/30 text-emerald-600"
                />
                <Label className="text-white/90 text-sm font-medium">
                  Currently studying here
                </Label>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddEducation}
                  disabled={!newEducation.institution || !newEducation.degree}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white h-10 px-6 text-sm font-medium disabled:opacity-50"
                >
                  Add Education
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60 h-10 px-6 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.education?.map((edu) => (
          <Card
            key={edu.id}
            className="bg-gradient-to-br from-white/5 to-white/10 border-white/20 hover:from-white/10 hover:to-white/15 transition-all duration-300"
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <MdSchool className="w-5 h-5 text-blue-400 mt-0.5" />
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveEducation(edu.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20 h-6 w-6 p-0 -mt-1"
                      >
                        <MdDelete className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <h4 className="text-white font-semibold text-base mb-1 leading-tight">
                    {edu.institution}
                  </h4>

                  <div className="space-y-1">
                    <p className="text-blue-300 text-sm font-medium">
                      {edu.degree}
                      {edu.field && (
                        <span className="text-white/70 font-normal">
                          {" "}
                          in {edu.field}
                        </span>
                      )}
                    </p>

                    {(edu.startYear || edu.endYear) && (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-white/60 text-xs">
                          <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                          <span>
                            {edu.startYear} -{" "}
                            {edu.current ? (
                              <span className="text-emerald-400 font-medium">
                                Present
                              </span>
                            ) : (
                              edu.endYear || "Unknown"
                            )}
                          </span>
                        </div>
                        {edu.current && (
                          <Badge className="bg-emerald-950/60 text-emerald-300 border-emerald-800/50 text-xs px-2 py-0.5">
                            Current
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!data.education || data.education.length === 0) && !showAddForm && (
        <div className="text-center py-16">
          <div className="bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MdSchool className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/50 mb-6 text-base">No education added yet</p>
          {isEditing && (
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-zinc-950 hover:bg-white/90 h-10 px-6 text-sm font-medium"
            >
              Add Your First Education
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// Achievements Tab with full editing
const AchievementsTab = ({
  data,
  isEditing,
  onAddAchievement,
  onRemoveAchievement,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    type: "",
    date: "",
  });

  const handleAddAchievement = () => {
    if (newAchievement.title && newAchievement.description) {
      onAddAchievement(newAchievement);
      setNewAchievement({
        title: "",
        description: "",
        type: "",
        date: "",
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Your Achievements</h3>
        {isEditing && (
          <Button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-white text-zinc-950 hover:bg-white/90 h-9 px-4 text-sm"
          >
            <MdAdd className="w-4 h-4 mr-1" />
            Add Achievement
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card className="bg-yellow-950/20 border-yellow-800/30">
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80 text-sm font-medium">
                    Title *
                  </Label>
                  <Input
                    value={newAchievement.title}
                    onChange={(e) =>
                      setNewAchievement({
                        ...newAchievement,
                        title: e.target.value,
                      })
                    }
                    className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1"
                    placeholder="Achievement title"
                  />
                </div>
                <div>
                  <Label className="text-white/80 text-sm font-medium">
                    Type
                  </Label>
                  <Select
                    value={newAchievement.type}
                    onValueChange={(value) =>
                      setNewAchievement({ ...newAchievement, type: value })
                    }
                  >
                    <SelectTrigger className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/20">
                      <SelectItem
                        value="hackathon"
                        className="text-white hover:bg-white/10"
                      >
                        Hackathon
                      </SelectItem>
                      <SelectItem
                        value="competition"
                        className="text-white hover:bg-white/10"
                      >
                        Competition
                      </SelectItem>
                      <SelectItem
                        value="certification"
                        className="text-white hover:bg-white/10"
                      >
                        Certification
                      </SelectItem>
                      <SelectItem
                        value="award"
                        className="text-white hover:bg-white/10"
                      >
                        Award
                      </SelectItem>
                      <SelectItem
                        value="project"
                        className="text-white hover:bg-white/10"
                      >
                        Project
                      </SelectItem>
                      <SelectItem
                        value="other"
                        className="text-white hover:bg-white/10"
                      >
                        Other
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white/80 text-sm font-medium">
                  Description *
                </Label>
                <Textarea
                  value={newAchievement.description}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      description: e.target.value,
                    })
                  }
                  className="bg-white/10 border-white/30 text-white text-sm h-24 resize-none mt-1"
                  placeholder="Describe your achievement..."
                />
              </div>

              <div>
                <Label className="text-white/80 text-sm font-medium">
                  Date (Optional)
                </Label>
                <Input
                  type="date"
                  value={newAchievement.date}
                  onChange={(e) =>
                    setNewAchievement({
                      ...newAchievement,
                      date: e.target.value,
                    })
                  }
                  className="bg-white/10 border-white/30 text-white h-10 text-sm mt-1"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleAddAchievement}
                  disabled={
                    !newAchievement.title || !newAchievement.description
                  }
                  className="bg-yellow-700 hover:bg-yellow-600 text-white h-10 px-6 text-sm font-medium disabled:opacity-50"
                >
                  Add Achievement
                </Button>
                <Button
                  onClick={() => setShowAddForm(false)}
                  variant="outline"
                  className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white hover:border-white/60 h-10 px-6 text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.achievements?.map((achievement) => (
          <Card
            key={achievement.id}
            className="bg-gradient-to-br from-yellow-950/20 to-orange-950/20 border-yellow-800/30 hover:from-yellow-950/30 hover:to-orange-950/30 transition-all duration-300"
          >
            <CardContent className="pt-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <MdStar className="w-5 h-5 text-yellow-400 mt-0.5" />
                    {isEditing && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRemoveAchievement(achievement.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/20 h-6 w-6 p-0 -mt-1"
                      >
                        <MdDelete className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  <div className="flex items-start gap-2 mb-2">
                    <h4 className="text-white font-semibold text-base leading-tight flex-1">
                      {achievement.title}
                    </h4>
                    {achievement.type && (
                      <Badge className="bg-yellow-950/60 text-yellow-300 border-yellow-800/50 text-xs px-2 py-0.5 shrink-0">
                        {achievement.type}
                      </Badge>
                    )}
                  </div>

                  <p className="text-white/80 text-sm mb-2 leading-relaxed">
                    {achievement.description}
                  </p>

                  {achievement.date && (
                    <div className="flex items-center gap-1 text-white/60 text-xs">
                      <div className="w-1 h-1 bg-white/60 rounded-full"></div>
                      <span>
                        {new Date(achievement.date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {(!data.achievements || data.achievements.length === 0) &&
        !showAddForm && (
          <div className="text-center py-16">
            <div className="bg-yellow-950/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <MdStar className="w-8 h-8 text-yellow-400/60" />
            </div>
            <p className="text-white/50 mb-6 text-base">
              No achievements added yet
            </p>
            {isEditing && (
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-white text-zinc-950 hover:bg-white/90 h-10 px-6 text-sm font-medium"
              >
                Add Your First Achievement
              </Button>
            )}
          </div>
        )}
    </div>
  );
};

export default Profile;
