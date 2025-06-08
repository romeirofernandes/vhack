import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Search, ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const JudgeProfile = () => {
  const [formData, setFormData] = useState({
    expertise: [],
    organization: "",
    yearsOfExperience: "",
    bio: "",
  });
  const [expertiseInput, setExpertiseInput] = useState("");
  const [filteredExpertise, setFilteredExpertise] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const expertiseAreas = [
    "Web Development",
    "Mobile Development",
    "iOS Development",
    "Android Development",
    "Cross-Platform Development",
    "Frontend Development",
    "Backend Development",
    "Full Stack Development",
    "API Development",
    "Microservices",
    "AI/ML",
    "Machine Learning",
    "Deep Learning",
    "Computer Vision",
    "Natural Language Processing",
    "Data Science",
    "Big Data",
    "Blockchain",
    "Cryptocurrency",
    "Smart Contracts",
    "DeFi",
    "NFTs",
    "Web3",
    "Cloud Computing",
    "AWS",
    "Google Cloud",
    "Azure",
    "Cloud Architecture",
    "Serverless",
    "DevOps",
    "CI/CD",
    "Docker",
    "Kubernetes",
    "Infrastructure",
    "Site Reliability Engineering",
    "Cybersecurity",
    "Security Architecture",
    "Penetration Testing",
    "Cryptography",
    "Network Security",
    "Game Development",
    "Unity",
    "Unreal Engine",
    "Mobile Games",
    "VR Games",
    "AR Games",
    "IoT",
    "Embedded Systems",
    "Hardware",
    "Robotics",
    "Edge Computing",
    "AR/VR",
    "Augmented Reality",
    "Virtual Reality",
    "Mixed Reality",
    "3D Development",
    "Fintech",
    "Payment Systems",
    "Banking",
    "Insurance",
    "Trading Systems",
    "Database Design",
    "SQL",
    "NoSQL",
    "Data Architecture",
    "Data Engineering",
    "UI/UX Design",
    "Product Design",
    "User Research",
    "Design Systems",
    "Prototyping",
    "Enterprise Software",
    "SaaS",
    "E-commerce",
    "CRM",
    "ERP",
    "Quantum Computing",
    "Edge AI",
    "5G",
    "Healthcare Tech",
    "EdTech",
    "CleanTech",
  ];

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (expertiseInput.trim()) {
        const filtered = expertiseAreas
          .filter(
            (area) =>
              area.toLowerCase().includes(expertiseInput.toLowerCase()) &&
              !formData.expertise.includes(area)
          )
          .slice(0, 8); // Limit to 8 results
        setFilteredExpertise(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setFilteredExpertise([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [expertiseInput, formData.expertise]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addExpertise = (area) => {
    if (!formData.expertise.includes(area)) {
      setFormData({ ...formData, expertise: [...formData.expertise, area] });
      setExpertiseInput("");
      setShowDropdown(false);
    }
  };

  const removeExpertise = (areaToRemove) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((area) => area !== areaToRemove),
    });
  };

  const handleExpertiseInputChange = (e) => {
    setExpertiseInput(e.target.value);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.expertise.length ||
      !formData.organization ||
      !formData.yearsOfExperience ||
      !formData.bio
    ) {
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
          body: JSON.stringify({
            profile: {
              ...formData,
              yearsOfExperience: parseInt(formData.yearsOfExperience),
            },
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        navigate("/dashboard");
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
      <div className="max-w-4xl mx-auto space-y-4">
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
              Judge Profile Setup
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
              {/* Expertise Section */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  Areas of Expertise
                  <Badge className="bg-red-900/50 text-red-200 text-xs">
                    Required
                  </Badge>
                </Label>

                {/* Selected Expertise */}
                {formData.expertise.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((area) => (
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
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Search or add expertise areas..."
                      value={expertiseInput}
                      onChange={handleExpertiseInputChange}
                      onKeyDown={handleExpertiseInputKeyDown}
                      onFocus={() =>
                        expertiseInput &&
                        setShowDropdown(filteredExpertise.length > 0)
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10 pl-10"
                    />
                  </div>

                  {/* Dropdown */}
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
                            area.toLowerCase() === expertiseInput.toLowerCase()
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
                  Start typing to search expertise areas or add custom ones.
                  Press Enter to add the first result.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Organization */}
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    Organization
                    <Badge className="bg-red-900/50 text-red-200 text-xs">
                      Required
                    </Badge>
                  </Label>
                  <Input
                    name="organization"
                    placeholder="Google, Microsoft, Startup, University..."
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                    required
                  />
                </div>

                {/* Years of Experience */}
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    Experience
                    <Badge className="bg-red-900/50 text-red-200 text-xs">
                      Required
                    </Badge>
                  </Label>
                  <select
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 bg-white/5 border border-white/20 rounded-md text-white focus:border-white/40 focus:outline-none"
                    required
                  >
                    <option value="" className="bg-zinc-900">
                      Select experience level
                    </option>
                    <option value="3" className="bg-zinc-900">
                      3-5 years
                    </option>
                    <option value="5" className="bg-zinc-900">
                      5-10 years
                    </option>
                    <option value="10" className="bg-zinc-900">
                      10-15 years
                    </option>
                    <option value="15" className="bg-zinc-900">
                      15+ years
                    </option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  Professional Background
                  <Badge className="bg-red-900/50 text-red-200 text-xs">
                    Required
                  </Badge>
                </Label>
                <textarea
                  name="bio"
                  placeholder="Tell us about your background, achievements, and what makes you a great judge..."
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full h-24 px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white placeholder:text-white/40 resize-none focus:border-white/40 focus:outline-none"
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

export default JudgeProfile;
