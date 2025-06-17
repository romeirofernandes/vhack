import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TbArrowLeft,
  TbCalendar,
  TbTrophy,
  TbUsers,
  TbDeviceFloppy,
  TbLoader,
  TbCode,
  TbStar,
  TbPlus,
  TbTrash
} from 'react-icons/tb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const EditHackathon = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemStatements: '',
    theme: 'AI',
    bannerImageUrl: '',
    timelines: {
      registrationStart: '',
      registrationEnd: '',
      hackathonStart: '',
      hackathonEnd: '',
      resultsDate: ''
    },
    teamSettings: {
      minTeamSize: 1,
      maxTeamSize: 4,
      allowSolo: false
    },
    prizes: {
      firstPrize: '',
      secondPrize: '',
      thirdPrize: '',
      participantPrize: ''
    },
    status: 'draft'
  });

  const [judgingCriteria, setJudgingCriteria] = useState([
    { title: "Innovation", description: "How creative and innovative is the solution?", weight: 1, maxScore: 10 },
    { title: "Technical Implementation", description: "Quality of code and technical execution", weight: 1, maxScore: 10 },
    { title: "Impact", description: "Potential impact and usefulness of the solution", weight: 1, maxScore: 10 },
    { title: "Presentation", description: "Quality of presentation and demonstration", weight: 1, maxScore: 10 }
  ]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathonData();
  }, [hackathonId]);

  const addCriteria = () => {
    setJudgingCriteria([...judgingCriteria, { title: "", description: "", weight: 1, maxScore: 10 }]);
  };

  const removeCriteria = (index) => {
    if (judgingCriteria.length <= 1) {
      toast.error("At least one judging criteria is required");
      return;
    }
    setJudgingCriteria(judgingCriteria.filter((_, i) => i !== index));
  };

  const updateCriteria = (index, field, value) => {
    setJudgingCriteria(judgingCriteria.map((criteria, i) => 
      i === index ? { ...criteria, [field]: value } : criteria
    ));
  };

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        {
          headers: { Authorization: `Bearer ${idToken}` }
        }
      );

      if (response.data.success) {
        const hackathon = response.data.data;
        
        // Format dates for datetime-local input
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          title: hackathon.title || '',
          description: hackathon.description || '',
          problemStatements: hackathon.problemStatements || '',
          theme: hackathon.theme || 'AI',
          bannerImageUrl: hackathon.bannerImageUrl || '',
          timelines: {
            registrationStart: formatDateForInput(hackathon.timelines?.registrationStart),
            registrationEnd: formatDateForInput(hackathon.timelines?.registrationEnd),
            hackathonStart: formatDateForInput(hackathon.timelines?.hackathonStart),
            hackathonEnd: formatDateForInput(hackathon.timelines?.hackathonEnd),
            resultsDate: formatDateForInput(hackathon.timelines?.resultsDate)
          },
          teamSettings: {
            minTeamSize: hackathon.teamSettings?.minTeamSize || 1,
            maxTeamSize: hackathon.teamSettings?.maxTeamSize || 4,
            allowSolo: hackathon.teamSettings?.allowSolo || false
          },
          prizes: {
            firstPrize: hackathon.prizes?.firstPrize || '',
            secondPrize: hackathon.prizes?.secondPrize || '',
            thirdPrize: hackathon.prizes?.thirdPrize || '',
            participantPrize: hackathon.prizes?.participantPrize || ''
          },
          status: hackathon.status || 'draft'
        });

        // Load judging criteria
        if (hackathon.judgingCriteria && hackathon.judgingCriteria.length > 0) {
          setJudgingCriteria(hackathon.judgingCriteria);
        }
      } else {
        toast.error('Failed to fetch hackathon data');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching hackathon:', error);
      toast.error('Error fetching hackathon data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate judging criteria
    const validCriteria = judgingCriteria.filter(criteria => criteria.title.trim() !== '');
    if (validCriteria.length === 0) {
      toast.error('At least one judging criteria is required');
      return;
    }

    try {
      setSaving(true);
      const idToken = await user.getIdToken();
      
      // Convert datetime-local back to ISO dates
      const formatDateForAPI = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toISOString();
      };

      const updateData = {
        ...formData,
        timelines: {
          registrationStart: formatDateForAPI(formData.timelines.registrationStart),
          registrationEnd: formatDateForAPI(formData.timelines.registrationEnd),
          hackathonStart: formatDateForAPI(formData.timelines.hackathonStart),
          hackathonEnd: formatDateForAPI(formData.timelines.hackathonEnd),
          resultsDate: formatDateForAPI(formData.timelines.resultsDate)
        },
        judgingCriteria: validCriteria
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${idToken}` }
        }
      );

      if (response.data.success) {
        toast.success('Hackathon updated successfully!');
        navigate(`/organizer/hackathon/${hackathonId}`);
      } else {
        toast.error('Failed to update hackathon');
      }
    } catch (error) {
      console.error('Error updating hackathon:', error);
      if (error.response?.status === 400 && error.response?.data?.error?.includes('criteria')) {
        toast.error(error.response.data.error);
      } else {
        toast.error(error.response?.data?.message || 'Error updating hackathon');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-white">Loading hackathon data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate(`/organizer/hackathon/${hackathonId}`)}
                variant="ghost"
                className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
              >
                <TbArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Edit Hackathon
                </h1>
                <p className="text-zinc-400 text-sm font-medium">Update your hackathon details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Information */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-200">
              <CardHeader className="border-b border-zinc-800/60 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <TbDeviceFloppy className="w-4 h-4 text-blue-400" />
                  </div>
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title" className="text-zinc-300 text-sm font-medium">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      placeholder="Enter hackathon title"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="theme" className="text-zinc-300 text-sm font-medium">Theme</Label>
                    <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="AI" className="text-sm font-medium">AI</SelectItem>
                        <SelectItem value="Fintech" className="text-sm font-medium">Fintech</SelectItem>
                        <SelectItem value="Healthcare" className="text-sm font-medium">Healthcare</SelectItem>
                        <SelectItem value="Education" className="text-sm font-medium">Education</SelectItem>
                        <SelectItem value="Sustainability" className="text-sm font-medium">Sustainability</SelectItem>
                        <SelectItem value="Other" className="text-sm font-medium">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-zinc-300 text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 min-h-[100px] text-sm font-medium resize-none"
                    placeholder="Describe your hackathon..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="bannerImageUrl" className="text-zinc-300 text-sm font-medium">Banner Image URL (Optional)</Label>
                    <Input
                      id="bannerImageUrl"
                      value={formData.bannerImageUrl}
                      onChange={(e) => handleInputChange('bannerImageUrl', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      placeholder="https://example.com/banner.jpg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-zinc-300 text-sm font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="draft" className="text-sm font-medium">Draft</SelectItem>
                        <SelectItem value="published" className="text-sm font-medium">Published</SelectItem>
                        <SelectItem value="ongoing" className="text-sm font-medium">Ongoing</SelectItem>
                        <SelectItem value="completed" className="text-sm font-medium">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-200">
              <CardHeader className="border-b border-zinc-800/60 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <TbCalendar className="w-4 h-4 text-purple-400" />
                  </div>
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="registrationStart" className="text-zinc-300 text-sm font-medium">Registration Start</Label>
                    <Input
                      id="registrationStart"
                      type="datetime-local"
                      value={formData.timelines.registrationStart}
                      onChange={(e) => handleInputChange('timelines.registrationStart', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="registrationEnd" className="text-zinc-300 text-sm font-medium">Registration End</Label>
                    <Input
                      id="registrationEnd"
                      type="datetime-local"
                      value={formData.timelines.registrationEnd}
                      onChange={(e) => handleInputChange('timelines.registrationEnd', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hackathonStart" className="text-zinc-300 text-sm font-medium">Hackathon Start</Label>
                    <Input
                      id="hackathonStart"
                      type="datetime-local"
                      value={formData.timelines.hackathonStart}
                      onChange={(e) => handleInputChange('timelines.hackathonStart', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="hackathonEnd" className="text-zinc-300 text-sm font-medium">Hackathon End</Label>
                    <Input
                      id="hackathonEnd"
                      type="datetime-local"
                      value={formData.timelines.hackathonEnd}
                      onChange={(e) => handleInputChange('timelines.hackathonEnd', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      required
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="resultsDate" className="text-zinc-300 text-sm font-medium">Results Date (Optional)</Label>
                    <Input
                      id="resultsDate"
                      type="datetime-local"
                      value={formData.timelines.resultsDate}
                      onChange={(e) => handleInputChange('timelines.resultsDate', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Settings */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-200">
              <CardHeader className="border-b border-zinc-800/60 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <div className="p-1.5 rounded-lg bg-green-500/10">
                    <TbUsers className="w-4 h-4 text-green-400" />
                  </div>
                  Team Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="minTeamSize" className="text-zinc-300 text-sm font-medium">Min Team Size</Label>
                    <Input
                      id="minTeamSize"
                      type="number"
                      min="1"
                      value={formData.teamSettings.minTeamSize}
                      onChange={(e) => handleInputChange('teamSettings.minTeamSize', parseInt(e.target.value))}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="maxTeamSize" className="text-zinc-300 text-sm font-medium">Max Team Size</Label>
                    <Input
                      id="maxTeamSize"
                      type="number"
                      min="1"
                      value={formData.teamSettings.maxTeamSize}
                      onChange={(e) => handleInputChange('teamSettings.maxTeamSize', parseInt(e.target.value))}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-zinc-300 text-sm font-medium">Allow Solo Participation</Label>
                    <Select 
                      value={formData.teamSettings.allowSolo.toString()} 
                      onValueChange={(value) => handleInputChange('teamSettings.allowSolo', value === 'true')}
                    >
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-800">
                        <SelectItem value="true" className="text-sm font-medium">Yes</SelectItem>
                        <SelectItem value="false" className="text-sm font-medium">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Problem Statements */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-200">
              <CardHeader className="border-b border-zinc-800/60 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <TbCode className="w-4 h-4 text-orange-400" />
                  </div>
                  Problem Statements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="problemStatements" className="text-zinc-300 text-sm font-medium">Problem Statements</Label>
                  <Textarea
                    id="problemStatements"
                    value={formData.problemStatements}
                    onChange={(e) => handleInputChange('problemStatements', e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 min-h-[150px] text-sm font-medium resize-none"
                    placeholder="Describe the problem statements for participants..."
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Judging Criteria */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-200">
              <CardHeader className="border-b border-zinc-800/60 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <TbStar className="w-4 h-4 text-amber-400" />
                  </div>
                  Judging Criteria
                </CardTitle>
                <p className="text-zinc-400 text-sm mt-1">
                  Define how projects will be evaluated by judges
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {judgingCriteria.map((criteria, index) => (
                  <Card key={index} className="bg-zinc-800/30 border-zinc-700/30 hover:border-zinc-600/50 transition-colors duration-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Label className="text-zinc-300 text-sm font-medium">Criteria Title</Label>
                          <Input
                            value={criteria.title}
                            onChange={(e) => updateCriteria(index, "title", e.target.value)}
                            placeholder="e.g., Innovation"
                            className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 mt-1 h-9 text-sm font-medium"
                            required
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-zinc-300 text-sm font-medium">Max Score</Label>
                          <Input
                            type="number"
                            value={criteria.maxScore}
                            onChange={(e) => updateCriteria(index, "maxScore", parseInt(e.target.value) || 10)}
                            min={1}
                            max={100}
                            className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 mt-1 h-9 text-sm font-medium"
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCriteria(index)}
                            disabled={judgingCriteria.length <= 1}
                            className="h-9"
                          >
                            <TbTrash className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-zinc-300 text-sm font-medium">Description (Optional)</Label>
                        <Textarea
                          value={criteria.description}
                          onChange={(e) => updateCriteria(index, "description", e.target.value)}
                          placeholder="Describe what judges should look for..."
                          className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 mt-1 min-h-[60px] text-sm font-medium resize-none"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Button
                  type="button"
                  onClick={addCriteria}
                  variant="outline"
                  className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800/50 hover:text-white hover:border-zinc-500 transition-all duration-200"
                >
                  <TbPlus className="w-4 h-4 mr-2" />
                  Add Criteria
                </Button>
              </CardContent>
            </Card>

            {/* Prizes */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-zinc-700/60 transition-colors duration-200">
              <CardHeader className="border-b border-zinc-800/60 py-4">
                <CardTitle className="text-white flex items-center gap-2 text-base font-semibold">
                  <div className="p-1.5 rounded-lg bg-yellow-500/10">
                    <TbTrophy className="w-4 h-4 text-yellow-400" />
                  </div>
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="firstPrize" className="text-zinc-300 text-sm font-medium">🥇 First Prize</Label>
                    <Input
                      id="firstPrize"
                      value={formData.prizes.firstPrize}
                      onChange={(e) => handleInputChange('prizes.firstPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      placeholder="e.g., Rs 10,000 + goodies"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="secondPrize" className="text-zinc-300 text-sm font-medium">🥈 Second Prize</Label>
                    <Input
                      id="secondPrize"
                      value={formData.prizes.secondPrize}
                      onChange={(e) => handleInputChange('prizes.secondPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      placeholder="e.g., Rs 5,000 + goodies"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="thirdPrize" className="text-zinc-300 text-sm font-medium">🥉 Third Prize</Label>
                    <Input
                      id="thirdPrize"
                      value={formData.prizes.thirdPrize}
                      onChange={(e) => handleInputChange('prizes.thirdPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      placeholder="e.g., Rs 3,000 + goodies"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="participantPrize" className="text-zinc-300 text-sm font-medium">🎁 Participation Prize</Label>
                    <Input
                      id="participantPrize"
                      value={formData.prizes.participantPrize}
                      onChange={(e) => handleInputChange('prizes.participantPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-blue-500/20 transition-all duration-200 h-9 text-sm font-medium"
                      placeholder="e.g., Participation certificate"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(`/organizer/hackathon/${hackathonId}`)}
                className="text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  {saving ? (
                    <>
                      <TbLoader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <TbDeviceFloppy className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </div>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditHackathon;