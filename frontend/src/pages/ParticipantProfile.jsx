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

const ParticipantProfile = () => {
  const [formData, setFormData] = useState({
    skills: [],
    experience: "",
    github: "",
    linkedin: "",
    portfolio: "",
    bio: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const popularSkills = [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "C",
    "C++",
    "C#",
    "Go",
    "Rust",
    "Ruby",
    "Swift",
    "Kotlin",
    "PHP",
    "R",
    "Scala",
    "Dart",
    "Shell",
    "Perl",
    "Haskell",
    "React",
    "Next.js",
    "Vue.js",
    "Nuxt.js",
    "Angular",
    "Svelte",
    "SolidJS",
    "Alpine.js",
    "jQuery",
    "Node.js",
    "Express.js",
    "FastAPI",
    "Django",
    "Flask",
    "Spring Boot",
    "NestJS",
    "Ruby on Rails",
    "ASP.NET",
    "Laravel",
    "Hapi.js",
    "Koa.js",
    "MongoDB",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "Redis",
    "MariaDB",
    "Firebase",
    "Supabase",
    "Cassandra",
    "DynamoDB",
    "OracleDB",
    "Neo4j",
    "Docker",
    "Kubernetes",
    "AWS",
    "Google Cloud",
    "Azure",
    "Heroku",
    "Vercel",
    "Netlify",
    "DigitalOcean",
    "Render",
    "GraphQL",
    "REST API",
    "gRPC",
    "WebSockets",
    "Apollo",
    "tRPC",
    "HTML",
    "CSS",
    "Tailwind",
    "Bootstrap",
    "Sass",
    "Less",
    "Material UI",
    "Chakra UI",
    "Git",
    "GitHub",
    "GitLab",
    "Bitbucket",
    "Jest",
    "Mocha",
    "Chai",
    "Cypress",
    "Playwright",
    "Testing Library",
    "Figma",
    "Adobe XD",
    "Canva",
    "TensorFlow",
    "PyTorch",
    "OpenCV",
    "Scikit-learn",
    "Pandas",
    "NumPy",
    "Matplotlib",
    "Keras",
    "Blockchain",
    "Solidity",
    "Hardhat",
    "Truffle",
    "Ether.js",
    "Web3.js",
    "Metamask",
    "Zustand",
    "Redux",
    "Recoil",
    "MobX",
    "RxJS",
    "TanStack Query",
    "CI/CD",
    "Jenkins",
    "CircleCI",
    "Travis CI",
    "GitHub Actions",
    "Linux",
    "Bash",
    "Zsh",
    "WSL",
    "WordPress",
    "Shopify",
    "Strapi",
    "Contentful",
    "Sanity",
    "Three.js",
    "Babylon.js",
    "Unity",
    "Unreal Engine",
    "OpenAI API",
    "LangChain",
    "Hugging Face",
    "Whisper",
    "Gemini API",
    "Postman",
    "Insomnia",
    "Swagger",
    "RapidAPI",
    "ESLint",
    "Prettier",
    "Webpack",
    "Vite",
    "Parcel",
    "Babel",
  ];

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (skillInput.trim()) {
        const filtered = popularSkills
          .filter(
            (skill) =>
              skill.toLowerCase().includes(skillInput.toLowerCase()) &&
              !formData.skills.includes(skill)
          )
          .slice(0, 8); // Limit to 8 results
        setFilteredSkills(filtered);
        setShowDropdown(filtered.length > 0);
      } else {
        setFilteredSkills([]);
        setShowDropdown(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [skillInput, formData.skills]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addSkill = (skill) => {
    if (!formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
      setSkillInput("");
      setShowDropdown(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredSkills.length > 0) {
        addSkill(filteredSkills[0]);
      } else if (skillInput.trim()) {
        addSkill(skillInput.trim());
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSkillInput("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.skills.length || !formData.experience || !formData.bio) {
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
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Complete Your Profile
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
              {/* Skills Section */}
              <div className="space-y-3">
                <Label className="text-white font-medium flex items-center gap-2">
                  Technical Skills
                  <Badge className="bg-red-900/50 text-red-200 text-xs">
                    Required
                  </Badge>
                </Label>

                {/* Selected Skills */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge
                        key={skill}
                        className="bg-white/10 text-white hover:bg-white/20 cursor-pointer group"
                        onClick={() => removeSkill(skill)}
                      >
                        {skill}
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
                      placeholder="Search or add skills..."
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyDown={handleSkillInputKeyDown}
                      onFocus={() =>
                        skillInput && setShowDropdown(filteredSkills.length > 0)
                      }
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10 pl-10"
                    />
                  </div>

                  {/* Dropdown */}
                  {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/20 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredSkills.map((skill) => (
                        <div
                          key={skill}
                          className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white border-b border-white/10 last:border-b-0"
                          onClick={() => addSkill(skill)}
                        >
                          {skill}
                        </div>
                      ))}
                      {skillInput &&
                        !popularSkills.some(
                          (skill) =>
                            skill.toLowerCase() === skillInput.toLowerCase()
                        ) && (
                          <div
                            className="px-3 py-2 hover:bg-white/10 cursor-pointer text-white/80 border-b border-white/10 last:border-b-0 italic"
                            onClick={() => addSkill(skillInput.trim())}
                          >
                            Add "{skillInput}" as custom skill
                          </div>
                        )}
                    </div>
                  )}
                </div>

                <p className="text-white/50 text-sm">
                  Start typing to search skills or add custom ones. Press Enter
                  to add the first result.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Experience */}
                <div className="space-y-2">
                  <Label className="text-white font-medium flex items-center gap-2">
                    Experience
                    <Badge className="bg-red-900/50 text-red-200 text-xs">
                      Required
                    </Badge>
                  </Label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full h-10 px-3 bg-white/5 border border-white/20 rounded-md text-white focus:border-white/40 focus:outline-none"
                    required
                  >
                    <option value="" className="bg-zinc-900">
                      Select level
                    </option>
                    <option value="beginner" className="bg-zinc-900">
                      Beginner (0-1 years)
                    </option>
                    <option value="intermediate" className="bg-zinc-900">
                      Intermediate (1-3 years)
                    </option>
                    <option value="advanced" className="bg-zinc-900">
                      Advanced (3-5 years)
                    </option>
                    <option value="expert" className="bg-zinc-900">
                      Expert (5+ years)
                    </option>
                  </select>
                </div>

                {/* GitHub */}
                <div className="space-y-2">
                  <Label className="text-white">GitHub</Label>
                  <Input
                    name="github"
                    placeholder="github.com/username"
                    value={formData.github}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                  />
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label className="text-white">LinkedIn</Label>
                  <Input
                    name="linkedin"
                    placeholder="linkedin.com/in/username"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                  />
                </div>

                {/* Portfolio */}
                <div className="space-y-2">
                  <Label className="text-white">Portfolio</Label>
                  <Input
                    name="portfolio"
                    placeholder="yourportfolio.com"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 h-10"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-white font-medium flex items-center gap-2">
                  About You
                  <Badge className="bg-red-900/50 text-red-200 text-xs">
                    Required
                  </Badge>
                </Label>
                <textarea
                  name="bio"
                  placeholder="Tell us about your coding journey, what motivates you, and your hackathon goals..."
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

export default ParticipantProfile;
