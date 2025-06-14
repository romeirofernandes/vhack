import React, { useState, useEffect } from 'react';
import { useParams,useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TbSearch, TbUserPlus, TbUsers, TbMail } from 'react-icons/tb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AllotJudges = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [judges, setJudges] = useState([]);
    const [filteredJudges, setFilteredJudges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const { user } = useAuth();
    const { hackathonId } = useParams();
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter an email to search');
            return;
        }

        setIsLoading(true);
        try {
            const idToken = await user.getIdToken();
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/users/search?email=${searchQuery}&role=judge`,
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (response.data.success) {
                if (response.data.users.length === 0) {
                    toast.error('No users found with this email');
                    setFilteredJudges([]);
                } else {
                    setFilteredJudges(response.data.users);
                    toast.success(`Found ${response.data.users.length} user(s)`);
                }
            } else {
                toast.error(response.data.error || 'Failed to search users');
                setFilteredJudges([]);
            }
        } catch (error) {
            console.error('Error searching users:', error.response?.data || error);
            toast.error(error.response?.data?.error || 'Error searching users');
            setFilteredJudges([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInviteJudge = async (judgeId) => {
        setIsInviting(true);
        try {
            const idToken = await user.getIdToken();
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/users/hackathon/${hackathonId}/invite`,
                { judgeId },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (response.data.success) {
                toast.success('Judge invited successfully');
            } else {
                toast.error(response.data.error || 'Failed to invite judge');
            }
        } catch (error) {
            console.error('Error inviting judge:', error);
            toast.error(error.response?.data?.error || 'Error inviting judge');
        } finally {
            setIsInviting(false);
        }
    };

    useEffect(() => {
        const fetchJudges = async () => {
            setIsLoading(true);
            try {
                const idToken = await user.getIdToken();
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/users/judges`,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                if (response.data.success) {
                    setJudges(response.data.judges);
                    setFilteredJudges(response.data.judges);
                } else {
                    toast.error(response.data.error || 'Failed to fetch judges');
                }
            } catch (error) {
                console.error('Error fetching judges:', error.response?.data || error);
                toast.error(error.response?.data?.error || 'Error fetching judges');
            } finally {
                setIsLoading(false);
            }
        };

        fetchJudges();
    }, [hackathonId, user]);
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl flex items-center justify-center border border-purple-500/20 backdrop-blur-sm">
                            <TbUsers className="w-8 h-8 text-purple-300" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                                Invite Judges
                            </h1>
                            <p className="text-zinc-400 mt-2 text-lg">Search and invite judges to your hackathon</p>
                        </div>
                    </div>

                    <Button
                        as="a"
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                        leftIcon={<TbUserPlus className="w-5 h-5" />}
                        size="lg"
                    >
                        <span>Back to Dashboard</span>
                    </Button>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Search Section */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center space-x-3 text-xl">
                                        <div className="p-2.5 bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-lg border border-purple-500/20">
                                            <TbSearch className="w-6 h-6 text-purple-300" />
                                        </div>
                                        <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">Search Judges</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex space-x-4">
                                        <div className="relative flex-1">
                                            <Input
                                                type="email"
                                                placeholder="Enter judge's email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="bg-zinc-800/50 border-zinc-700/50 text-white placeholder:text-zinc-500 focus:border-purple-500/50 focus:ring-purple-500/20 h-12 pl-12"
                                            />
                                            <TbSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        </div>
                                        <Button
                                            onClick={handleSearch}
                                            disabled={isLoading}
                                            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 h-12 px-6"
                                        >
                                            {isLoading ? 'Searching...' : 'Search'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Judges List */}
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle className="text-white">Search Results</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isLoading ? (
                                        <div className="text-center py-8 text-zinc-400">
                                            <p>Searching...</p>
                                        </div>
                                    ) : filteredJudges.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-400">
                                            <p>No judges found</p>
                                            <p className="text-sm mt-2">Try searching with a different email</p>
                                        </div>
                                    ) : (
                                        filteredJudges.map((judge) => (
                                            <motion.div
                                                key={judge._id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30 hover:border-purple-500/20 transition-colors"
                                            >
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 rounded-full border-2 border-purple-500/20 bg-zinc-700 flex items-center justify-center">
                                                        <span className="text-lg font-medium text-white">
                                                            {judge.displayName?.charAt(0) || judge.email?.charAt(0)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-medium text-white">{judge.displayName || 'Anonymous'}</h3>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/20">
                                                                {judge.email}
                                                            </Badge>
                                                            {judge.profile?.expertise && (
                                                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/20">
                                                                    {judge.profile.expertise}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() => handleInviteJudge(judge._id)}
                                                    disabled={isInviting}
                                                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                                                >
                                                    <TbMail className="w-5 h-5 mr-2" />
                                                    Send Invite
                                                </Button>
                                            </motion.div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info Section */}
                        <div className="lg:col-span-1">
                            <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm sticky top-6">
                                <CardHeader>
                                    <CardTitle className="text-white">About Judge Invites</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4 text-zinc-400">
                                        <p>
                                            Invite judges to evaluate projects in your hackathon. Judges will receive an email notification and can accept or decline the invitation.
                                        </p>
                                        <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/30">
                                            <h4 className="font-medium text-white mb-2">Tips:</h4>
                                            <ul className="space-y-2 text-sm">
                                                <li>• Search judges by their email address</li>
                                                <li>• Make sure the user has a judge role</li>
                                                <li>• Consider inviting 3-5 judges for balanced evaluation</li>
                                                <li>• Judges can be added or removed until the hackathon starts</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AllotJudges; 