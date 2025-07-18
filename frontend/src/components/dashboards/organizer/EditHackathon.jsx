import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
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

const EditHackathon = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hackathonId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    organizerName: "",
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
    status: "draft",
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

  useEffect(() => {
    fetchHackathonData();
  }, [hackathonId]);

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        }
      );

      if (response.data.success) {
        const hackathon = response.data.data;

        // Parse datetime and split into date and time
        const parseDateTime = (dateString) => {
          if (!dateString) return { date: undefined, time: "09:00" };
          const date = new Date(dateString);
          const timeString = date.toTimeString().slice(0, 5);
          return { date, time: timeString };
        };

        // Update form data
        setFormData({
          title: hackathon.title || "",
          organizerName: hackathon.organizerName || "",
          description: hackathon.description || "",
          problemStatements: hackathon.problemStatements || "",
          theme: hackathon.theme || "Other",
          bannerImageUrl: hackathon.bannerImageUrl || "",
          timelines: {
            registrationStart: hackathon.timelines?.registrationStart
              ? new Date(hackathon.timelines.registrationStart)
                  .toISOString()
                  .slice(0, 16)
              : "",
            registrationEnd: hackathon.timelines?.registrationEnd
              ? new Date(hackathon.timelines.registrationEnd)
                  .toISOString()
                  .slice(0, 16)
              : "",
            hackathonStart: hackathon.timelines?.hackathonStart
              ? new Date(hackathon.timelines.hackathonStart)
                  .toISOString()
                  .slice(0, 16)
              : "",
            hackathonEnd: hackathon.timelines?.hackathonEnd
              ? new Date(hackathon.timelines.hackathonEnd)
                  .toISOString()
                  .slice(0, 16)
              : "",
            resultsDate: hackathon.timelines?.resultsDate
              ? new Date(hackathon.timelines.resultsDate)
                  .toISOString()
                  .slice(0, 16)
              : "",
          },
          teamSettings: {
            minTeamSize: hackathon.teamSettings?.minTeamSize || 1,
            maxTeamSize: hackathon.teamSettings?.maxTeamSize || 4,
            allowSolo: hackathon.teamSettings?.allowSolo || false,
          },
          prizes: {
            firstPrize: hackathon.prizes?.firstPrize || "",
            secondPrize: hackathon.prizes?.secondPrize || "",
            thirdPrize: hackathon.prizes?.thirdPrize || "",
            participantPrize: hackathon.prizes?.participantPrize || "",
          },
          status: hackathon.status || "draft",
        });

        // Update date picker states
        setDatePickerStates({
          registrationStart: parseDateTime(
            hackathon.timelines?.registrationStart
          ),
          registrationEnd: parseDateTime(hackathon.timelines?.registrationEnd),
          hackathonStart: parseDateTime(hackathon.timelines?.hackathonStart),
          hackathonEnd: parseDateTime(hackathon.timelines?.hackathonEnd),
          resultsDate: parseDateTime(hackathon.timelines?.resultsDate),
        });

        // Load judging criteria
        if (hackathon.judgingCriteria && hackathon.judgingCriteria.length > 0) {
          setJudgingCriteria(hackathon.judgingCriteria);
        }
      } else {
        toast.error("Failed to fetch hackathon data");
        navigate("/organizer/dashboard");
      }
    } catch (error) {
      console.error("Error fetching hackathon:", error);
      toast.error("Error fetching hackathon data");
      navigate("/organizer/dashboard");
    } finally {
      setLoading(false);
    }
  };

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
    const combinedDateTime = combineDateAndTime(
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
    setSaving(true);

    try {
      // Validate judging criteria
      const validCriteria = judgingCriteria.filter(
        (criteria) => criteria.title.trim() !== ""
      );

      if (validCriteria.length === 0) {
        toast.error("At least one judging criteria is required");
        setSaving(false);
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
        setSaving(false);
        return;
      }

      const idToken = await user.getIdToken();

      // Convert datetime-local strings to proper Date objects for the backend
      const processedPayload = {
        ...formData,
        judgingCriteria: judgingCriteria,
        timelines: {
          registrationStart: formData.timelines.registrationStart ? new Date(formData.timelines.registrationStart) : null,
          registrationEnd: formData.timelines.registrationEnd ? new Date(formData.timelines.registrationEnd) : null,
          hackathonStart: formData.timelines.hackathonStart ? new Date(formData.timelines.hackathonStart) : null,
          hackathonEnd: formData.timelines.hackathonEnd ? new Date(formData.timelines.hackathonEnd) : null,
          resultsDate: formData.timelines.resultsDate ? new Date(formData.timelines.resultsDate) : null,
        }
      };

      console.log("Updating payload:", processedPayload); // Debug log

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        processedPayload,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        toast.success("Hackathon updated successfully!");
        navigate(`/organizer/hackathon/${hackathonId}`);
      }
    } catch (error) {
      console.error("Error updating hackathon:", error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           "Error updating hackathon";
        toast.error(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error setting up request:", error.message);
        toast.error("Error setting up request");
      }
    } finally {
      setSaving(false);
    }
  };

  const DateTimePicker = ({ field, label, required = false, tooltip }) => {
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
        <div className="flex gap-4">
          <div className="flex flex-col gap-3 flex-1">
            <Label
              htmlFor={`date-picker-${field}`}
              className="px-1 text-white/60 text-xs"
            >
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
                  className="w-full justify-between font-normal bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white h-10"
                >
                  {state.date ? state.date.toLocaleDateString() : "Select date"}
                  <ChevronDownIcon className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
              >
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
          <div className="flex flex-col gap-3 w-40">
            <Label
              htmlFor={`time-picker-${field}`}
              className="px-1 text-white/60 text-xs"
            >
              Time
            </Label>
            <div className="flex gap-2">
              <Input
                type="time"
                id={`time-picker-${field}`}
                value={state.time}
                onChange={(e) => updateDateTime(field, "time", e.target.value)}
                className="bg-white/5 border-white/10 text-white h-10 flex-1 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                step="300" // 5 minute increments
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

                  const newTime = `${newHours
                    .toString()
                    .padStart(2, "0")}:${minutes}`;
                  updateDateTime(field, "time", newTime);
                }}
                className="w-16 h-10 px-2 rounded-md bg-white/5 border border-white/10 text-white text-sm focus:border-white/20 focus:outline-none"
              >
                <option value="AM" className="bg-zinc-900 text-white">
                  AM
                </option>
                <option value="PM" className="bg-zinc-900 text-white">
                  PM
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <div className="text-white">Loading hackathon data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <Button
            variant="ghost"
            className="bg-zinc-900 text-white hover:bg-zinc-800 border border-neutral-700 hover:text-white text-sm sm:text-base"
            onClick={() => navigate(`/organizer/hackathon/${hackathonId}`)}
          >
            <MdArrowBack className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            <span className="hidden sm:inline">Back to Details</span>
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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Edit Hackathon</h1>
            <p className="text-white/70 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Update your hackathon details and settings
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                      <option
                        value="Fintech"
                        className="bg-zinc-900 text-white"
                      >
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

                  <div className="space-y-2">
                    <Label className="text-white/80 text-sm font-medium">
                      Status
                    </Label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full h-10 sm:h-12 px-3 sm:px-4 rounded-md bg-zinc-900 border border-white/10 text-white focus:border-white/20 focus:outline-none text-sm sm:text-base"
                    >
                      <option value="draft" className="bg-zinc-900 text-white">
                        Draft
                      </option>
                      <option
                        value="published"
                        className="bg-zinc-900 text-white"
                      >
                        Published
                      </option>
                      <option
                        value="ongoing"
                        className="bg-zinc-900 text-white"
                      >
                        Ongoing
                      </option>
                      <option
                        value="completed"
                        className="bg-zinc-900 text-white"
                      >
                        Completed
                      </option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium">
                    Banner Image URL (Optional)
                  </Label>
                  <Input
                    type="url"
                    name="bannerImageUrl"
                    value={formData.bannerImageUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/banner.jpg"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/50 h-10 sm:h-12 text-sm sm:text-base"
                  />
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

                        <div className="w-full sm:w-28 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-white/80 text-sm font-medium">
                              Max Score
                            </Label>
                            <Tooltip>
                              <TooltipTrigger>
                                <MdInfo className="w-3 h-3 text-white/50 hover:text-white/80" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-sm">
                                  Maximum points for this criteria
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <Input
                            type="number"
                            value={criteria.maxScore}
                            onChange={(e) =>
                              updateCriteria(
                                index,
                                "maxScore",
                                parseInt(e.target.value) || 10
                              )
                            }
                            min={1}
                            max={100}
                            className="bg-white/5 border-white/10 text-white h-10 sm:h-12 text-sm sm:text-base"
                          />
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
                onClick={() => navigate(`/organizer/hackathon/${hackathonId}`)}
                className="text-white bg-white/40 hover:bg-white/20 hover:text-white h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white hover:bg-blue-700 h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-1 sm:order-2"
              >
                {saving ? "Updating..." : "Update Hackathon"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </TooltipProvider>
  );
};

export default EditHackathon;
