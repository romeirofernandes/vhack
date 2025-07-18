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
import { useAuth } from "@/contexts/AuthContext";

const defaultProfile = {
  firstName: "",
  lastName: "",
  bio: "",
  location: "",
  organization: "",
  yearsOfExperience: "",
  expertise: [],
  education: [],
  socialLinks: {
    github: "",
    linkedin: "",
    portfolio: "",
    twitter: "",
  },
  achievements: [],
};

const expertiseAreas = [
  "Web Development", "AI/ML", "Blockchain", "Cybersecurity", "Cloud", "DevOps", "UI/UX", "Data Science", "Mobile", "Game Development"
];

const yearsOptions = [
  { value: "1", label: "1-3 years" },
  { value: "3", label: "3-5 years" },
  { value: "5", label: "5-10 years" },
  { value: "10", label: "10+ years" },
];

const getYearsLabel = (value) => {
  const found = yearsOptions.find((opt) => opt.value === value);
  return found ? found.label : value;
};

const Profile = () => {
  const [profileData, setProfileData] = useState(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [expertiseInput, setExpertiseInput] = useState("");
  const [filteredExpertise, setFilteredExpertise] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  const { user } = useAuth();

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
          firstName: data.data.profile?.firstName || "",
          lastName: data.data.profile?.lastName || "",
          bio: data.data.profile?.bio || "",
          location: data.data.profile?.location || "",
          organization: data.data.profile?.organization || "",
          yearsOfExperience: data.data.profile?.yearsOfExperience || "",
          expertise: data.data.profile?.expertise || [],
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
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const idToken = await user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
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

  // Expertise logic
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

  // Education logic
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

  // Achievements logic
  const addAchievement = (achievement) => {
    setProfileData((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { ...achievement, id: Date.now() }],
    }));
  };

  const removeAchievement = (id) => {
    setProfileData((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((a) => a.id !== id),
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
          <h1 className="text-2xl font-semibold text-white">Judge Profile</h1>
          <p className="text-white/60 text-sm">
            Manage your judge profile information
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
              expertiseInput={expertiseInput}
              setExpertiseInput={setExpertiseInput}
              filteredExpertise={filteredExpertise}
              showDropdown={showDropdown}
              addExpertise={addExpertise}
              removeExpertise={removeExpertise}
              handleExpertiseInputKeyDown={handleExpertiseInputKeyDown}
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

// Professional Tab
const ProfessionalTab = ({
  data,
  isEditing,
  onChange,
  expertiseInput,
  setExpertiseInput,
  filteredExpertise,
  showDropdown,
  addExpertise,
  removeExpertise,
  handleExpertiseInputKeyDown,
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
    <Card className="bg-white/5 border-white/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-white text-lg">Professional</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label className="text-white/80 text-sm">Organization</Label>
          {isEditing ? (
            <Input
              value={data.organization || ""}
              onChange={(e) => onChange("organization", e.target.value)}
              className="bg-white/5 border-white/20 text-white h-9 text-sm"
              placeholder="Organization"
            />
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
              {data.organization || <span className="text-white/50">Not set</span>}
            </p>
          )}
        </div>
        <div>
          <Label className="text-white/80 text-sm">Years of Experience</Label>
          {isEditing ? (
            <Select
              value={data.yearsOfExperience || ""}
              onValueChange={(value) => onChange("yearsOfExperience", value)}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white h-9 text-sm">
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/20">
                <SelectItem value="1" className="text-white hover:bg-white/10">
                  1-3 years
                </SelectItem>
                <SelectItem value="3" className="text-white hover:bg-white/10">
                  3-5 years
                </SelectItem>
                <SelectItem value="5" className="text-white hover:bg-white/10">
                  5-10 years
                </SelectItem>
                <SelectItem value="10" className="text-white hover:bg-white/10">
                  10+ years
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <p className="text-white text-sm mt-1 py-2 px-3 bg-white/5 rounded border border-white/10">
                {data.yearsOfExperience
                    ? getYearsLabel(data.yearsOfExperience)
                    : <span className="text-white/50">Not set</span>}
            </p>
          )}
        </div>
        <div>
          <Label className="text-white/80 text-sm">Expertise</Label>
          {isEditing ? (
            <>
              {data.expertise.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {data.expertise.map((area) => (
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
          ) : data.expertise.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.expertise.map((area) => (
                <Badge key={area} className="bg-white/10 text-white">
                  {area}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-white/50">Not set</span>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Education Tab (reuse from participant, or keep simple)
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

// Achievements Tab (reuse from participant)
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