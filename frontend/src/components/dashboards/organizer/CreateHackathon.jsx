import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { TbCode, TbCalendar, TbUsers, TbTrophy } from 'react-icons/tb';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const CreateHackathon = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        organizerName: user?.displayName || '',
        description: '',
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
            const idToken = await user.getIdToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/hackathons/create`,
                formData,
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
                        className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-3 rounded-lg transition-colors duration-200"
                    >
                    <span className="text-sm text-zinc-400 ml-2">Back to Dashboard</span>
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

                        {/* Prizes Section */}
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: 0.4 }}
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

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
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