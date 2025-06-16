import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TbArrowLeft,
  TbCalendar,
  TbTrophy,
  TbUsers,
  TbDeviceFloppy,
  TbLoader
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
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathonData();
  }, [hackathonId]);

  const fetchHackathonData = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/hackathons/${hackathonId}`,
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
        }
      };

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/hackathons/${hackathonId}`,
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
      toast.error(error.response?.data?.message || 'Error updating hackathon');
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(`/organizer/hackathon/${hackathonId}`)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <TbArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </Button>
              <div>
                <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                  Edit Hackathon
                </h1>
                <p className="text-zinc-400 mt-2">Update your hackathon details</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      placeholder="Enter hackathon title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme" className="text-white">Theme</Label>
                    <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AI">AI</SelectItem>
                        <SelectItem value="Fintech">Fintech</SelectItem>
                        <SelectItem value="Healthcare">Healthcare</SelectItem>
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Sustainability">Sustainability</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white min-h-[120px]"
                    placeholder="Describe your hackathon..."
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bannerImageUrl" className="text-white">Banner Image URL (Optional)</Label>
                  <Input
                    id="bannerImageUrl"
                    value={formData.bannerImageUrl}
                    onChange={(e) => handleInputChange('bannerImageUrl', e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700/50 text-white"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-white">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TbCalendar className="w-5 h-5 mr-2" />
                  Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="registrationStart" className="text-white">Registration Start</Label>
                    <Input
                      id="registrationStart"
                      type="datetime-local"
                      value={formData.timelines.registrationStart}
                      onChange={(e) => handleInputChange('timelines.registrationStart', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="registrationEnd" className="text-white">Registration End</Label>
                    <Input
                      id="registrationEnd"
                      type="datetime-local"
                      value={formData.timelines.registrationEnd}
                      onChange={(e) => handleInputChange('timelines.registrationEnd', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hackathonStart" className="text-white">Hackathon Start</Label>
                    <Input
                      id="hackathonStart"
                      type="datetime-local"
                      value={formData.timelines.hackathonStart}
                      onChange={(e) => handleInputChange('timelines.hackathonStart', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hackathonEnd" className="text-white">Hackathon End</Label>
                    <Input
                      id="hackathonEnd"
                      type="datetime-local"
                      value={formData.timelines.hackathonEnd}
                      onChange={(e) => handleInputChange('timelines.hackathonEnd', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="resultsDate" className="text-white">Results Date (Optional)</Label>
                    <Input
                      id="resultsDate"
                      type="datetime-local"
                      value={formData.timelines.resultsDate}
                      onChange={(e) => handleInputChange('timelines.resultsDate', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Settings */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TbUsers className="w-5 h-5 mr-2" />
                  Team Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="minTeamSize" className="text-white">Min Team Size</Label>
                    <Input
                      id="minTeamSize"
                      type="number"
                      min="1"
                      value={formData.teamSettings.minTeamSize}
                      onChange={(e) => handleInputChange('teamSettings.minTeamSize', parseInt(e.target.value))}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxTeamSize" className="text-white">Max Team Size</Label>
                    <Input
                      id="maxTeamSize"
                      type="number"
                      min="1"
                      value={formData.teamSettings.maxTeamSize}
                      onChange={(e) => handleInputChange('teamSettings.maxTeamSize', parseInt(e.target.value))}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Allow Solo Participation</Label>
                    <Select 
                      value={formData.teamSettings.allowSolo.toString()} 
                      onValueChange={(value) => handleInputChange('teamSettings.allowSolo', value === 'true')}
                    >
                      <SelectTrigger className="bg-zinc-800/50 border-zinc-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prizes */}
            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TbTrophy className="w-5 h-5 mr-2" />
                  Prizes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstPrize" className="text-white">🥇 First Prize</Label>
                    <Input
                      id="firstPrize"
                      value={formData.prizes.firstPrize}
                      onChange={(e) => handleInputChange('prizes.firstPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      placeholder="e.g., Rs 10,000 + goodies"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secondPrize" className="text-white">🥈 Second Prize</Label>
                    <Input
                      id="secondPrize"
                      value={formData.prizes.secondPrize}
                      onChange={(e) => handleInputChange('prizes.secondPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      placeholder="e.g., Rs 5,000 + goodies"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="thirdPrize" className="text-white">🥉 Third Prize</Label>
                    <Input
                      id="thirdPrize"
                      value={formData.prizes.thirdPrize}
                      onChange={(e) => handleInputChange('prizes.thirdPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      placeholder="e.g., Rs 3,000 + goodies"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="participantPrize" className="text-white">🎁 Participation Prize</Label>
                    <Input
                      id="participantPrize"
                      value={formData.prizes.participantPrize}
                      onChange={(e) => handleInputChange('prizes.participantPrize', e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700/50 text-white"
                      placeholder="e.g., Participation certificate"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/organizer/hackathon/${hackathonId}`)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
              >
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
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditHackathon;