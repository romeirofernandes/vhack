import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const CreateHackathonForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        organizerName: '',
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
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/hackathons/create`,
                formData,
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success('Hackathon created successfully!');
                navigate('/organizer/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error creating hackathon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Create New Hackathon</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Hackathon Details Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Hackathon Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Title *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Organizer Name *</label>
                            <input
                                type="text"
                                name="organizerName"
                                value={formData.organizerName}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description *</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Theme</label>
                            <select
                                name="theme"
                                value={formData.theme}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            >
                                <option value="AI">AI</option>
                                <option value="Fintech">Fintech</option>
                                <option value="Healthcare">Healthcare</option>
                                <option value="Education">Education</option>
                                <option value="Sustainability">Sustainability</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Timelines Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Timelines</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Registration Start *</label>
                            <input
                                type="datetime-local"
                                name="timelines.registrationStart"
                                value={formData.timelines.registrationStart}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Registration End *</label>
                            <input
                                type="datetime-local"
                                name="timelines.registrationEnd"
                                value={formData.timelines.registrationEnd}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hackathon Start *</label>
                            <input
                                type="datetime-local"
                                name="timelines.hackathonStart"
                                value={formData.timelines.hackathonStart}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hackathon End *</label>
                            <input
                                type="datetime-local"
                                name="timelines.hackathonEnd"
                                value={formData.timelines.hackathonEnd}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Results Date</label>
                            <input
                                type="date"
                                name="timelines.resultsDate"
                                value={formData.timelines.resultsDate}
                                onChange={handleChange}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                    </div>
                </div>

                {/* Team Settings Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Team Settings</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Minimum Team Size *</label>
                                <input
                                    type="number"
                                    name="teamSettings.minTeamSize"
                                    value={formData.teamSettings.minTeamSize}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Maximum Team Size *</label>
                                <input
                                    type="number"
                                    name="teamSettings.maxTeamSize"
                                    value={formData.teamSettings.maxTeamSize}
                                    onChange={handleChange}
                                    min="1"
                                    required
                                    className="w-full p-2 border rounded-md"
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="teamSettings.allowSolo"
                                checked={formData.teamSettings.allowSolo}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label className="text-sm font-medium">Allow Solo Participants</label>
                        </div>
                    </div>
                </div>

                {/* Prizes Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Prizes</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Prize *</label>
                            <input
                                type="text"
                                name="prizes.firstPrize"
                                value={formData.prizes.firstPrize}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Second Prize *</label>
                            <input
                                type="text"
                                name="prizes.secondPrize"
                                value={formData.prizes.secondPrize}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Third Prize *</label>
                            <input
                                type="text"
                                name="prizes.thirdPrize"
                                value={formData.prizes.thirdPrize}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Participant Prize *</label>
                            <input
                                type="text"
                                name="prizes.participantPrize"
                                value={formData.prizes.participantPrize}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Hackathon'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateHackathonForm; 