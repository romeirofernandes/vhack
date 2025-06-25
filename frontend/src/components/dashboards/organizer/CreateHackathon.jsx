import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { MdAdd, MdRemove, MdArrowBack, MdInfo } from "react-icons/md";
import { ChevronDownIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";

function toUTCISOStringFromIST(date, time) {
  if (!date || !time) return "";
  // date is a Date object (local), time is "HH:mm"
  const [hours, minutes] = time.split(":");
  // Create a new Date in IST
  const istDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    parseInt(hours),
    parseInt(minutes),
    0,
    0
  );
  // IST offset in minutes is +330
  const utcDate = new Date(istDate.getTime() - (330 * 60 * 1000));
  return utcDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}

const CreateHackathon = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organizerName: user?.displayName || "",
    description: "",
    problemStatements: "",
    theme: "Other",
    bannerImageUrl: "",
    timelines: {
      registrationStart: "",
      registrationEnd: "",
      hackathonStart: "",
      hackathonEnd: "",
      resultsDate: "",
    },
    teamSettings: {
      minTeamSize: 1,
      maxTeamSize: 4,
      allowSolo: false,
    },
    prizes: {
      firstPrize: "",
      secondPrize: "",
      thirdPrize: "",
      participantPrize: "",
    },
  });

  // Date and time states for the calendar components
  const [datePickerStates, setDatePickerStates] = useState({
    registrationStart: { open: false, date: undefined, time: "09:00" },
    registrationEnd: { open: false, date: undefined, time: "23:59" },
    hackathonStart: { open: false, date: undefined, time: "09:00" },
    hackathonEnd: { open: false, date: undefined, time: "18:00" },
    resultsDate: { open: false, date: undefined, time: "15:00" },
  });

  // Judging Criteria State
  const [judgingCriteria, setJudgingCriteria] = useState([
    {
      title: "Innovation",
      description: "How creative and innovative is the solution?",
      weight: 1,
      maxScore: 10,
    },
    {
      title: "Technical Implementation",
      description: "Quality of code and technical execution",
      weight: 1,
      maxScore: 10,
    },
    {
      title: "Impact",
      description: "Potential impact and usefulness of the solution",
      weight: 1,
      maxScore: 10,
    },
    {
      title: "Presentation",
      description: "Quality of presentation and demonstration",
      weight: 1,
      maxScore: 10,
    },
  ]);

  // Multi-Stage Hackathon State
  const [multiStage, setMultiStage] = useState(false);
  const [rounds, setRounds] = useState([
    { name: "Round 1", description: "", teamsToShortlist: 0, startTime: "", endTime: "", resultTime: "" },
  ]);

  // Helper function to combine date and time
  const combineDateAndTime = (date, time) => {
    if (!date || !time) return "";
    const combined = new Date(date);
    const [hours, minutes] = time.split(":");
    combined.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return combined.toISOString().slice(0, 16); // Format for datetime-local
  };

  // Update form data when date/time changes
  const updateDateTime = (field, type, value) => {
    const newState = {
      ...datePickerStates[field],
      [type]: value,
    };

    if (type === "date") {
      newState.open = false;
    }

    setDatePickerStates((prev) => ({
      ...prev,
      [field]: newState,
    }));

    // Update form data
    const combinedDateTime = toUTCISOStringFromIST(
      type === "date" ? value : datePickerStates[field].date,
      type === "time" ? value : datePickerStates[field].time
    );

    if (combinedDateTime) {
      setFormData((prev) => ({
        ...prev,
        timelines: {
          ...prev.timelines,
          [field]: combinedDateTime,
        },
      }));
    }
  };

  // Judging Criteria Handlers
  const validateCriteria = () => {
    const emptyCriteria = judgingCriteria.some(
      (criteria) => criteria.title.trim() === ""
    );
    return !emptyCriteria;
  };

  const addCriteria = () => {
    setJudgingCriteria([
      ...judgingCriteria,
      {
        title: "",
        description: "",
        weight: 1,
        maxScore: 10,
      },
    ]);
  };

  const removeCriteria = (index) => {
    if (judgingCriteria.length > 1) {
      setJudgingCriteria(judgingCriteria.filter((_, i) => i !== index));
    } else {
      toast.error("At least one judging criteria is required");
    }
  };

  const updateCriteria = (index, field, value) => {
    setJudgingCriteria(
      judgingCriteria.map((criteria, i) =>
        i === index ? { ...criteria, [field]: value } : criteria
      )
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate judging criteria
      const validCriteria = judgingCriteria.filter(
        (criteria) => criteria.title.trim() !== ""
      );

      if (validCriteria.length === 0) {
        toast.error("At least one judging criteria is required");
        setLoading(false);
        return;
      }

      // Check if any criteria has empty title
      const hasEmptyCriteria = judgingCriteria.some(
        (criteria) => criteria.title.trim() === ""
      );
      if (hasEmptyCriteria) {
        toast.error(
          "Please fill in all criteria titles or remove empty criteria"
        );
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();

      // Include ALL judging criteria in the payload (not filtered)
      const payload = {
        ...formData,
        judgingCriteria,
        multiStage,
        rounds: multiStage ? rounds : [],
      };

      console.log("Submitting payload:", payload); // Debug log

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/hackathons/create`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Hackathon created successfully!");
        navigate("/organizer/dashboard");
      }
    } catch (error) {
      console.error("Error creating hackathon:", error);
      toast.error(error.response?.data?.message || "Error creating hackathon");
    } finally {
      setLoading(false);
    }
  };

  const DateTimePicker = ({ field, label, required = false, tooltip, readOnly = false }) => {
    const state = datePickerStates[field];

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label className="text-white/80 text-sm font-medium">
            {label} {required && "*"}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger>
                <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex flex-col gap-2 sm:gap-3 flex-1">
            <Label htmlFor={`date-picker-${field}`} className="px-1 text-white/60 text-xs">
              Date
            </Label>
            <Popover
              open={state.open}
              onOpenChange={(open) =>
                setDatePickerStates((prev) => ({
                  ...prev,
                  [field]: { ...prev[field], open },
                }))
              }
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id={`date-picker-${field}`}
                  className="w-full justify-between font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-10 text-sm sm:text-base"
                  readOnly={readOnly}
                >
                  {state.date ? state.date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={state.date}
                  captionLayout="dropdown"
                  onSelect={(date) => updateDateTime(field, "date", date)}
                  className="bg-zinc-950 border-0"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex flex-col gap-2 sm:gap-3 w-full sm:w-40">
            <Label htmlFor={`time-picker-${field}`} className="px-1 text-white/60 text-xs">
              Time
            </Label>
            <div className="flex gap-2">
              <Input
                type="time"
                id={`time-picker-${field}`}
                value={state.time}
                onChange={(e) => updateDateTime(field, "time", e.target.value)}
                className="bg-white/5 border-white/10 text-white h-10 flex-1 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none text-sm sm:text-base"
                step="300" // 5 minute increments
                readOnly={readOnly}
              />
              <select
                value={state.time >= "12:00" ? "PM" : "AM"}
                onChange={(e) => {
                  const [hours, minutes] = state.time.split(":");
                  let newHours = parseInt(hours);
                  
                  if (e.target.value === "PM" && newHours < 12) {
                    newHours += 12;
                  } else if (e.target.value === "AM" && newHours >= 12) {
                    newHours -= 12;
                  }
                  
                  const newTime = `${newHours.toString().padStart(2, '0')}:${minutes}`;
                  updateDateTime(field, "time", newTime);
                }}
                className="w-16 h-10 px-2 rounded-md bg-white/5 border border-white/10 text-white text-xs sm:text-sm focus:border-white/20 focus:outline-none"
                readOnly={readOnly}
              >
                <option value="AM" className="bg-zinc-900 text-white">AM</option>
                <option value="PM" className="bg-zinc-900 text-white">PM</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="ghost"
            className="bg-zinc-900 text-white hover:bg-zinc-800 border border-neutral-700 hover:text-white text-sm sm:text-base"
            onClick={() => navigate("/organizer/dashboard")}
          >
            <MdArrowBack className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Page Title */}
          <div className="text-center space-y-3 mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Create New Hackathon
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Design and launch your next hackathon event to bring together
              innovative minds
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
            {/* Basic Details */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-white text-lg sm:text-xl">
                  Basic Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-white/80 text-sm font-medium">
                      Title *
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          Choose a catchy and descriptive title for your
                          hackathon
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Enter hackathon title"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    Organizer Name *
                  </Label>
                  <Input
                    type="text"
                    name="organizerName"
                    value={formData.organizerName}
                    onChange={handleChange}
                    required
                    className="bg-white/5 border-white/10 text-white h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="text-white/80 text-sm font-medium">
                      Description *
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          Provide a detailed description of your hackathon goals
                          and objectives
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Describe your hackathon..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    Theme
                  </Label>
                  <select
                    name="theme"
                    value={formData.theme}
                    onChange={handleChange}
                    className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-md bg-zinc-900 border border-white/10 text-white focus:border-white/20 focus:outline-none text-sm sm:text-base"
                  >
                    <option value="AI" className="bg-zinc-900 text-white">
                      AI
                    </option>
                    <option value="Fintech" className="bg-zinc-900 text-white">
                      Fintech
                    </option>
                    <option
                      value="Healthcare"
                      className="bg-zinc-900 text-white"
                    >
                      Healthcare
                    </option>
                    <option
                      value="Education"
                      className="bg-zinc-900 text-white"
                    >
                      Education
                    </option>
                    <option
                      value="Sustainability"
                      className="bg-zinc-900 text-white"
                    >
                      Sustainability
                    </option>
                    <option value="Other" className="bg-zinc-900 text-white">
                      Other
                    </option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Timelines */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg sm:text-xl">Timeline</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Set up the complete timeline for your hackathon event
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <DateTimePicker
                    field="registrationStart"
                    label="Registration Start"
                    required
                    tooltip="When participants can start registering for the hackathon"
                  />
                  <DateTimePicker
                    field="registrationEnd"
                    label="Registration End"
                    required
                    tooltip="Last date and time for registration"
                  />
                  <DateTimePicker
                    field="hackathonStart"
                    label="Hackathon Start"
                    required
                    tooltip="Official start date and time of the hackathon"
                  />
                  <DateTimePicker
                    field="hackathonEnd"
                    label="Hackathon End"
                    required
                    tooltip="When the hackathon coding period ends"
                  />
                  <DateTimePicker
                    field="resultsDate"
                    label="Results Date"
                    tooltip="When the results will be announced (optional)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Team Settings */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg sm:text-xl">
                    Team Settings
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Configure team size requirements for participants
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm font-medium">
                      Minimum Team Size *
                    </Label>
                    <Input
                      type="number"
                      name="teamSettings.minTeamSize"
                      value={formData.teamSettings.minTeamSize}
                      onChange={handleChange}
                      min="1"
                      required
                      className="bg-white/5 border-white/10 text-white h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm font-medium">
                      Maximum Team Size *
                    </Label>
                    <Input
                      type="number"
                      name="teamSettings.maxTeamSize"
                      value={formData.teamSettings.maxTeamSize}
                      onChange={handleChange}
                      min="1"
                      required
                      className="bg-white/5 border-white/10 text-white h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <input
                    type="checkbox"
                    name="teamSettings.allowSolo"
                    checked={formData.teamSettings.allowSolo}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-600"
                  />
                  <div className="flex items-center gap-2">
                    <Label className="text-white/80 text-sm font-medium">
                      Allow Solo Participants
                    </Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">
                          Allow individuals to participate without forming a
                          team
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problem Statements */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg sm:text-xl">
                    Problem Statements
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Define the challenges participants will work on
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Label className="text-white/80 text-sm font-medium">
                  Problem Statements *
                </Label>
                <Textarea
                  name="problemStatements"
                  value={formData.problemStatements}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Describe the problem statements for participants..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/50 min-h-[140px] sm:min-h-[160px] text-sm sm:text-base"
                />
              </CardContent>
            </Card>

            {/* Judging Criteria */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg sm:text-xl">
                    Judging Criteria
                  </CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Define how projects will be evaluated by judges
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-white/50 text-sm mt-2">
                  Define how projects will be evaluated
                </p>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {judgingCriteria.map((criteria, index) => (
                  <Card key={index} className="bg-white/5 border-white/10">
                    <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <div className="flex-1 space-y-2">
                          <Label className="text-white/80 text-sm font-medium">
                            Criteria Title *
                          </Label>
                          <Input
                            value={criteria.title}
                            onChange={(e) =>
                              updateCriteria(index, "title", e.target.value)
                            }
                            placeholder="e.g., Innovation"
                            className={`bg-white/5 border-white/10 text-white h-10 sm:h-12 text-sm sm:text-base ${
                              criteria.title.trim() === ""
                                ? "border-red-500/50"
                                : ""
                            }`}
                            required
                          />
                        </div>

                        <div className="w-full sm:w-32 space-y-1">
                          <div className="flex items-center gap-1">
                            <Label className="text-white/80 text-xs font-medium">
                              Max Score
                            </Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <MdInfo className="w-3 h-3 text-white/50 hover:text-white/80" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Maximum points for this criteria (1-100)
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={criteria.maxScore}
                              onChange={(e) => {
                                // Only allow numbers
                                const value = e.target.value.replace(/[^0-9]/g, '');
                                if (value === '') {
                                  updateCriteria(index, "maxScore", '');
                                } else {
                                  const numValue = parseInt(value);
                                  if (numValue >= 1 && numValue <= 100) {
                                    updateCriteria(index, "maxScore", numValue);
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                // Set default value if empty
                                if (e.target.value === '' || parseInt(e.target.value) < 1) {
                                  updateCriteria(index, "maxScore", 10);
                                }
                              }}
                              onFocus={(e) => {
                                // Select all text when focused
                                e.target.select();
                              }}
                              className="bg-white/5 border-white/10 text-white h-10 pr-7 text-sm"
                              placeholder="10"
                            />
                            {/* Clear button */}
                            <button
                              type="button"
                              onClick={() => updateCriteria(index, "maxScore", 10)}
                              className="absolute right-1.5 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 text-xs"
                              title="Reset to 10"
                            >
                              ↻
                            </button>
                          </div>
                          <div className="text-xs text-white/30 leading-tight">
                            1-100
                          </div>
                        </div>

                        <div className="flex items-end">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => removeCriteria(index)}
                                disabled={judgingCriteria.length <= 1}
                                className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border-red-600/30 h-10 sm:h-12 w-full sm:w-12"
                              >
                                <MdRemove className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-sm">Remove this criteria</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-white/80 text-sm font-medium">
                          Description
                        </Label>
                        <Textarea
                          value={criteria.description}
                          onChange={(e) =>
                            updateCriteria(index, "description", e.target.value)
                          }
                          placeholder="Describe what judges should look for..."
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/50 min-h-[70px] sm:min-h-[80px] text-sm sm:text-base"
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  type="button"
                  onClick={addCriteria}
                  variant="outline"
                  className="w-full h-10 sm:h-12 border-neutral-700 text-neutral-800 hover:bg-neutral-800 hover:text-white transition-all duration-300 text-sm sm:text-base"
                >
                  <MdAdd className="w-4 h-4 mr-2" />
                  Add Criteria
                </Button>
              </CardContent>
            </Card>

            {/* Multi-Stage Hackathon Toggle */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="text-white text-lg sm:text-xl">Multi-Stage Hackathon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch checked={multiStage} onCheckedChange={setMultiStage} />
                  <span className="text-white/80 text-sm font-medium">
                    Enable Multi-Stage (Multiple Rounds)
                  </span>
                </div>
                {multiStage && (
                  <div className="space-y-4 sm:space-y-6 mt-4">
                    {rounds.map((round, idx) => (
                      <Card key={idx} className="bg-white/5 border-white/10">
                        <CardContent className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <Input
                              type="text"
                              value={round.name}
                              onChange={e => {
                                const newRounds = [...rounds];
                                newRounds[idx].name = e.target.value;
                                setRounds(newRounds);
                              }}
                              placeholder="Round Name"
                              className="bg-white/5 border-white/10 text-white h-10 text-sm sm:text-base"
                            />
                            {/* For rounds after round 1, show a dropdown for teamsToShortlist */}
                            {idx > 0 ? (
                              <select
                                value={round.teamsToShortlist}
                                onChange={e => {
                                  const newRounds = [...rounds];
                                  newRounds[idx].teamsToShortlist = parseInt(e.target.value) || 0;
                                  setRounds(newRounds);
                                }}
                                className="bg-white/5 border-white/10 text-white h-10 w-full sm:w-40 rounded-md text-sm sm:text-base"
                              >
                                <option value={0}>Select teams to shortlist</option>
                                {Array.from({ length: rounds[idx - 1].teamsToShortlist || 100 }, (_, i) => i + 1).map(n => (
                                  <option key={n} value={n}>{n}</option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                type="number"
                                value={round.teamsToShortlist}
                                onChange={e => {
                                  const newRounds = [...rounds];
                                  newRounds[idx].teamsToShortlist = parseInt(e.target.value) || 0;
                                  setRounds(newRounds);
                                }}
                                placeholder="Teams to Shortlist"
                                className="bg-white/5 border-white/10 text-white h-10 w-full sm:w-40 text-sm sm:text-base"
                              />
                            )}
                          </div>
                          <Textarea
                            value={round.description}
                            onChange={e => {
                              const newRounds = [...rounds];
                              newRounds[idx].description = e.target.value;
                              setRounds(newRounds);
                            }}
                            placeholder="Round Description"
                            className="bg-white/5 border-white/10 text-white min-h-[50px] sm:min-h-[60px] text-sm sm:text-base"
                          />
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-2">
                            <div>
                              <label className="text-white/70 text-xs">Start Time</label>
                              <Input
                                type="datetime-local"
                                value={round.startTime}
                                onChange={e => {
                                  const newRounds = [...rounds];
                                  newRounds[idx].startTime = e.target.value;
                                  setRounds(newRounds);
                                }}
                                className="bg-white/5 border-white/10 text-white h-10 text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="text-white/70 text-xs">End Time</label>
                              <Input
                                type="datetime-local"
                                value={round.endTime}
                                onChange={e => {
                                  const newRounds = [...rounds];
                                  newRounds[idx].endTime = e.target.value;
                                  setRounds(newRounds);
                                }}
                                className="bg-white/5 border-white/10 text-white h-10 text-sm sm:text-base"
                              />
                            </div>
                            <div>
                              <label className="text-white/70 text-xs">Result Time</label>
                              <Input
                                type="datetime-local"
                                value={round.resultTime}
                                onChange={e => {
                                  const newRounds = [...rounds];
                                  newRounds[idx].resultTime = e.target.value;
                                  setRounds(newRounds);
                                }}
                                className="bg-white/5 border-white/10 text-white h-10 text-sm sm:text-base"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => setRounds(rounds.filter((_, i) => i !== idx))}
                              disabled={rounds.length === 1}
                              className="text-xs sm:text-sm"
                            >
                              Remove
                            </Button>
                            {idx === rounds.length - 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setRounds([...rounds, { name: `Round ${rounds.length + 1}`, description: "", teamsToShortlist: 0, startTime: "", endTime: "", resultTime: "" }])}
                                className="text-xs sm:text-sm"
                              >
                                Add Round
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Prizes */}
            <Card className="bg-zinc-950 border-white/10">
              <CardHeader className="pb-4 sm:pb-6">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-white text-lg sm:text-xl">Prizes</CardTitle>
                  <Tooltip>
                    <TooltipTrigger>
                      <MdInfo className="w-4 h-4 text-white/50 hover:text-white/80" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-sm">
                        Define the rewards for winners and participants
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    First Prize *
                  </Label>
                  <Input
                    type="text"
                    name="prizes.firstPrize"
                    value={formData.prizes.firstPrize}
                    onChange={handleChange}
                    required
                    placeholder="Enter first prize details"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    Second Prize *
                  </Label>
                  <Input
                    type="text"
                    name="prizes.secondPrize"
                    value={formData.prizes.secondPrize}
                    onChange={handleChange}
                    required
                    placeholder="Enter second prize details"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    Third Prize *
                  </Label>
                  <Input
                    type="text"
                    name="prizes.thirdPrize"
                    value={formData.prizes.thirdPrize}
                    onChange={handleChange}
                    required
                    placeholder="Enter third prize details"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    Participant Prize *
                  </Label>
                  <Input
                    type="text"
                    name="prizes.participantPrize"
                    value={formData.prizes.participantPrize}
                    onChange={handleChange}
                    required
                    placeholder="Enter participant prize details"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 text-sm sm:text-base"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Validation warning */}
            {judgingCriteria.some(
              (criteria) => criteria.title.trim() === ""
            ) && (
              <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-4 sm:p-6">
                <p className="text-red-300 text-sm">
                  Please fill in all criteria titles or remove empty criteria
                  before submitting.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate("/organizer/dashboard")}
                className="text-white bg-white/40 hover:bg-white/20 hover:text-white h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white hover:bg-blue-700 h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-1 sm:order-2"
              >
                {loading ? "Creating..." : "Create Hackathon"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default CreateHackathon;
