import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { TbCode, TbCalendar, TbUsers, TbTrophy } from 'react-icons/tb';
import { MdAdd, MdRemove, MdGavel } from 'react-icons/md';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const CreateHackathon = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        organizerName: user?.displayName || '',
        description: '',
        problemStatements: '',
        theme: 'Other',
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
        }
    });

    // Judging Criteria State
    const [judgingCriteria, setJudgingCriteria] = useState([
        { title: "Innovation", description: "How creative and innovative is the solution?", weight: 1, maxScore: 10 },
        { title: "Technical Implementation", description: "Quality of code and technical execution", weight: 1, maxScore: 10 },
        { title: "Impact", description: "Potential impact and usefulness of the solution", weight: 1, maxScore: 10 },
        { title: "Presentation", description: "Quality of presentation and demonstration", weight: 1, maxScore: 10 }
    ]);

    // Judging Criteria Handlers
    const validateCriteria = () => {
    const emptyCriteria = judgingCriteria.some(criteria => criteria.title.trim() === '');
    return !emptyCriteria;
};

// Update your addCriteria function:
const addCriteria = () => {
    setJudgingCriteria([...judgingCriteria, { 
        title: "", 
        description: "", 
        weight: 1, 
        maxScore: 10 
    }]);
};

// Update your removeCriteria function:
const removeCriteria = (index) => {
    if (judgingCriteria.length > 1) {
        setJudgingCriteria(judgingCriteria.filter((_, i) => i !== index));
    } else {
        toast.error('At least one judging criteria is required');
    }
};

    const updateCriteria = (index, field, value) => {
        setJudgingCriteria(judgingCriteria.map((criteria, i) => 
            i === index ? { ...criteria, [field]: value } : criteria
        ));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: type === 'checkbox' ? checked : value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        // Validate judging criteria
        const validCriteria = judgingCriteria.filter(criteria => criteria.title.trim() !== '');
        
        if (validCriteria.length === 0) {
            toast.error('At least one judging criteria is required');
            setLoading(false);
            return;
        }

        // Check if any criteria has empty title
        const hasEmptyCriteria = judgingCriteria.some(criteria => criteria.title.trim() === '');
        if (hasEmptyCriteria) {
            toast.error('Please fill in all criteria titles or remove empty criteria');
            setLoading(false);
            return;
        }

        const idToken = await user.getIdToken();
        
        // Include ALL judging criteria in the payload (not filtered)
        const payload = {
            ...formData,
            judgingCriteria: judgingCriteria  // Don't filter here
        };

        console.log('Submitting payload:', payload); // Debug log

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/hackathons/create`,
            payload,
            {
                headers: {
                    Authorization: `Bearer ${idToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            toast.success('Hackathon created successfully!');
            navigate('/organizer/dashboard');
        }
    } catch (error) {
        console.error('Error creating hackathon:', error);
        toast.error(error.response?.data?.message || 'Error creating hackathon');
    } finally {
        setLoading(false);
    }
};

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20 backdrop-blur-sm">
                            <TbCode className="w-8 h-8 text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                                Create New Hackathon
                            </h1>
                            <p className="text-zinc-400 mt-2 text-lg">Design and launch your next amazing hackathon event</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => navigate('/organizer/dashboard')}
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 mb-6"
                    >
                        <span className="text-sm text-zinc-300">Back to Dashboard</span>
                    </Button>
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Hackathon Details Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-purple-500/20 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg border border-purple-500/20">
                                            <TbCode className="w-6 h-6 text-purple-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Hackathon Details</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-zinc-200">Title *</label>
                                        <Input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter hackathon title"
                                            className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-zinc-200">Organizer Name *</label>
                                        <Input
                                            type="text"
                                            name="organizerName"
                                            value={formData.organizerName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter organizer name"
                                            className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-zinc-200">Description *</label>
                                        <Textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            required
                                            rows="4"
                                            placeholder="Describe your hackathon..."
                                            className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-zinc-200">Theme</label>
                                        <select
                                            name="theme"
                                            value={formData.theme}
                                            onChange={handleChange}
                                            className="w-full p-3 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-white focus:border-purple-500/50 focus:ring-purple-500/20 focus:outline-none h-12"
                                        >
                                            <option value="AI">AI</option>
                                            <option value="Fintech">Fintech</option>
                                            <option value="Healthcare">Healthcare</option>
                                            <option value="Education">Education</option>
                                            <option value="Sustainability">Sustainability</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Timelines Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.2 }}
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-blue-500/20 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-lg border border-blue-500/20">
                                            <TbCalendar className="w-6 h-6 text-blue-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Timelines</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Registration Start *</label>
                                            <Input
                                                type="datetime-local"
                                                name="timelines.registrationStart"
                                                value={formData.timelines.registrationStart}
                                                onChange={handleChange}
                                                required
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Registration End *</label>
                                            <Input
                                                type="datetime-local"
                                                name="timelines.registrationEnd"
                                                value={formData.timelines.registrationEnd}
                                                onChange={handleChange}
                                                required
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Hackathon Start *</label>
                                            <Input
                                                type="datetime-local"
                                                name="timelines.hackathonStart"
                                                value={formData.timelines.hackathonStart}
                                                onChange={handleChange}
                                                required
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Hackathon End *</label>
                                            <Input
                                                type="datetime-local"
                                                name="timelines.hackathonEnd"
                                                value={formData.timelines.hackathonEnd}
                                                onChange={handleChange}
                                                required
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Results Date</label>
                                            <Input
                                                type="date"
                                                name="timelines.resultsDate"
                                                value={formData.timelines.resultsDate}
                                                onChange={handleChange}
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-blue-500/50 focus:ring-blue-500/20 h-12"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Team Settings Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.3 }}
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-green-500/20 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg border border-green-500/20">
                                            <TbUsers className="w-6 h-6 text-green-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">Team Settings</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-zinc-200">Minimum Team Size *</label>
                                                <Input
                                                    type="number"
                                                    name="teamSettings.minTeamSize"
                                                    value={formData.teamSettings.minTeamSize}
                                                    onChange={handleChange}
                                                    min="1"
                                                    required
                                                    className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-green-500/50 focus:ring-green-500/20 h-12"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-2 text-zinc-200">Maximum Team Size *</label>
                                                <Input
                                                    type="number"
                                                    name="teamSettings.maxTeamSize"
                                                    value={formData.teamSettings.maxTeamSize}
                                                    onChange={handleChange}
                                                    min="1"
                                                    required
                                                    className="bg-zinc-800/50 border-zinc-700/50 text-white focus:border-green-500/50 focus:ring-green-500/20 h-12"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
                                            <input
                                                type="checkbox"
                                                name="teamSettings.allowSolo"
                                                checked={formData.teamSettings.allowSolo}
                                                onChange={handleChange}
                                                className="w-5 h-5 rounded border-zinc-700/50 bg-zinc-800/50 text-green-500 focus:ring-green-500/20 focus:ring-offset-zinc-900"
                                            />
                                            <label className="text-sm font-medium text-zinc-200">Allow Solo Participants</label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Problem Statements Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.35 }}
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-orange-500/20 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-lg border border-orange-500/20">
                                            <TbCode className="w-6 h-6 text-orange-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">Problem Statements</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Problem Statements *</label>
                                            <Textarea
                                                name="problemStatements"
                                                value={formData.problemStatements}
                                                onChange={handleChange}
                                                required
                                                rows="6"
                                                placeholder="Describe the problem statements for participants..."
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-orange-500/50 focus:ring-orange-500/20"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Judging Criteria Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-indigo-500/20 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 rounded-lg border border-indigo-500/20">
                                            <MdGavel className="w-6 h-6 text-indigo-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">Judging Criteria</span>
                                    </CardTitle>
                                    <p className="text-zinc-400 text-sm mt-2">
                                        Define how projects will be evaluated by judges
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {judgingCriteria.map((criteria, index) => (
                                        <Card key={index} className="bg-zinc-800/30 border-zinc-700/30">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex gap-3">
                                                    <div className="flex-1">
                                                        <Label className="text-zinc-300 text-sm">Criteria Title *</Label>
                                                        <Input
    value={criteria.title}
    onChange={(e) => updateCriteria(index, "title", e.target.value)}
    placeholder="e.g., Innovation"
    className={`bg-zinc-800/50 border-zinc-700/50 text-white mt-1 ${
        criteria.title.trim() === '' ? 'border-red-500/50' : ''
    }`}
    required
/>
                                                    </div>
                                                    <div className="w-24">
                                                        <Label className="text-zinc-300 text-sm">Max Score</Label>
                                                        <Input
                                                            type="number"
                                                            value={criteria.maxScore}
                                                            onChange={(e) => updateCriteria(index, "maxScore", parseInt(e.target.value) || 10)}
                                                            min={1}
                                                            max={100}
                                                            className="bg-zinc-800/50 border-zinc-700/50 text-white mt-1"
                                                        />
                                                    </div>
                                                    <div className="flex items-end">
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => removeCriteria(index)}
                                                            disabled={judgingCriteria.length <= 1}
                                                        >
                                                            <MdRemove className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Label className="text-zinc-300 text-sm">Description (Optional)</Label>
                                                    <Textarea
                                                        value={criteria.description}
                                                        onChange={(e) => updateCriteria(index, "description", e.target.value)}
                                                        placeholder="Describe what judges should look for..."
                                                        className="bg-zinc-800/50 border-zinc-700/50 text-white mt-1 min-h-[60px]"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                    
                                    <Button
                                        type="button"
                                        onClick={addCriteria}
                                        variant="outline"
                                        className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-800/50"
                                    >
                                        <MdAdd className="w-4 h-4 mr-2" />
                                        Add Criteria
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Prizes Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.5 }}
                        >
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm hover:border-yellow-500/20 transition-all duration-300">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-lg border border-yellow-500/20">
                                            <TbTrophy className="w-6 h-6 text-yellow-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">Prizes</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">First Prize *</label>
                                            <Input
                                                type="text"
                                                name="prizes.firstPrize"
                                                value={formData.prizes.firstPrize}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter first prize details"
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-yellow-500/50 focus:ring-yellow-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Second Prize *</label>
                                            <Input
                                                type="text"
                                                name="prizes.secondPrize"
                                                value={formData.prizes.secondPrize}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter second prize details"
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-yellow-500/50 focus:ring-yellow-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Third Prize *</label>
                                            <Input
                                                type="text"
                                                name="prizes.thirdPrize"
                                                value={formData.prizes.thirdPrize}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter third prize details"
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-yellow-500/50 focus:ring-yellow-500/20 h-12"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 text-zinc-200">Participant Prize *</label>
                                            <Input
                                                type="text"
                                                name="prizes.participantPrize"
                                                value={formData.prizes.participantPrize}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter participant prize details"
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-yellow-500/50 focus:ring-yellow-500/20 h-12"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
{/* Validation warning */}
{judgingCriteria.some(criteria => criteria.title.trim() === '') && (
    <div className="bg-red-950/40 border border-red-800/50 rounded-lg p-4 mb-4">
        <p className="text-red-300 text-sm">
            Please fill in all criteria titles or remove empty criteria before submitting.
        </p>
    </div>
)}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex justify-end"
                        >
                            <Button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 px-8 py-3 rounded-lg font-medium transition-all duration-200 text-lg"
                            >
                                {loading ? 'Creating...' : 'Create Hackathon'}
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default CreateHackathon;