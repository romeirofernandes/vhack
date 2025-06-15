import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TbSearch, TbUserPlus, TbUsers, TbMail, TbUserCheck } from 'react-icons/tb';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '../../../contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const AllotJudges = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [judges, setJudges] = useState([]);
    const [filteredJudges, setFilteredJudges] = useState([]);
    const [hackathonData, setHackathonData] = useState(null);
    const [invitedJudges, setInvitedJudges] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const { user } = useAuth();
    const { hackathonId } = useParams();
    const navigate = useNavigate();

    // Fetch hackathon data to get invited judges
    useEffect(() => {
        const fetchHackathonData = async () => {
            try {
                const idToken = await user.getIdToken();
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/hackathons`,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );
                console.log('Hackathon response:', response.data);
                if (response.data.success) {
                    const filteredData = response.data.data.hackathons.find(hackathon => hackathon._id === hackathonId);
                    if (!filteredData) {
                        toast.error('Hackathon not found');
                        return;
                    }
                    setHackathonData(filteredData);
                    // Extract invited judge IDs
                    const invitedJudgeIds = filteredData.invitedJudges?.map(judge => 
                        typeof judge === 'string' ? judge : judge._id
                    ) || [];
                    const acceptedJudgeIds = filteredData.judges?.map(judge => 
                        typeof judge === 'string' ? judge : judge._id
                    ) || [];
                    
                    // Combine both invited and accepted judges
                    const allInvitedIds = [...invitedJudgeIds, ...acceptedJudgeIds];
                    setInvitedJudges(allInvitedIds);
                } else {
                    toast.error('Failed to fetch hackathon data');
                }
            } catch (error) {
                console.error('Error fetching hackathon:', error);
                toast.error('Error fetching hackathon data');
            }
        };

        if (hackathonId && user) {
            fetchHackathonData();
        }
    }, [hackathonId, user]);

    const filterAlreadyInvitedJudges = (judgesList) => {
        return judgesList.filter(judge => {
            const judgeId = typeof judge === 'string' ? judge : judge._id;
            return !invitedJudges.includes(judgeId);
        });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter an email to search');
            return;
        }

        setIsLoading(true);
        try {
            const idToken = await user.getIdToken();
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/judge/search?email=${searchQuery}&role=judge`,
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
                    // Filter out already invited judges
                    const availableJudges = filterAlreadyInvitedJudges(response.data.users);
                    setFilteredJudges(availableJudges);
                    
                    const totalFound = response.data.users.length;
                    const availableCount = availableJudges.length;
                    const alreadyInvited = totalFound - availableCount;
                    
                    if (availableCount === 0) {
                        toast.info(`Found ${totalFound} judge(s) but all are already invited to this hackathon`);
                    } else if (alreadyInvited > 0) {
                        toast.success(`Found ${availableCount} available judge(s) (${alreadyInvited} already invited)`);
                    } else {
                        toast.success(`Found ${availableCount} available judge(s)`);
                    }
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
                `${import.meta.env.VITE_API_URL}/judge/hackathon/${hackathonId}/invite`,
                { judgeId },
                {
                    headers: {
                        Authorization: `Bearer ${idToken}`,
                    },
                }
            );

            if (response.data.success) {
                toast.success('Judge invited successfully');
                
                // Add the invited judge to the list to filter them out
                setInvitedJudges(prev => [...prev, judgeId]);
                
                // Remove the judge from filtered judges list
                setFilteredJudges(prev => prev.filter(judge => judge._id !== judgeId));
                
                // Refresh hackathon data
                const hackathonResponse = await axios.get(
                    `${import.meta.env.VITE_API_URL}/hackathons`,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );
                
                if (hackathonResponse.data.success) {
                    const filteredData = hackathonResponse.data.data.hackathons.find(hackathon => hackathon._id === hackathonId);
                    if (!filteredData) {
                        toast.error('Hackathon not found');
                        return;
                    }
                    setHackathonData(filteredData);
                }
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

    const isJudgeAlreadyInvited = (judgeId) => {
        return invitedJudges.includes(judgeId);
    };

    useEffect(() => {
        const fetchJudges = async () => {
            setIsLoading(true);
            try {
                const idToken = await user.getIdToken();
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/judge`,
                    {
                        headers: {
                            Authorization: `Bearer ${idToken}`,
                        },
                    }
                );

                if (response.data.success) {
                    setJudges(response.data.judges);
                    // Filter out already invited judges
                    const availableJudges = filterAlreadyInvitedJudges(response.data.judges);
                    setFilteredJudges(availableJudges);
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

        if (user && invitedJudges.length >= 0) { // Only fetch when we have invited judges data
            fetchJudges();
        }
    }, [hackathonId, user, invitedJudges]);

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
                            <p className="text-zinc-400 mt-2 text-lg">
                                Search and invite judges to your hackathon
                                {hackathonData && (
                                    <span className="block text-sm mt-1">
                                        Hackathon: {hackathonData.title}
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={() => navigate('/dashboard')}
                        className="mb-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700"
                        size="lg"
                    >
                        <TbUserPlus className="w-5 h-5 mr-2" />
                        Back to Dashboard
                    </Button>

                    {/* Show invited judges count */}
                    {hackathonData && (
                        <Card className="bg-zinc-900/40 border-zinc-800/60 backdrop-blur-sm mb-6">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-2">
                                            <TbUserCheck className="w-5 h-5 text-green-400" />
                                            <span className="text-white">
                                                Already Invited: {invitedJudges.length} judges
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <TbUsers className="w-5 h-5 text-blue-400" />
                                            <span className="text-white">
                                                Accepted: {hackathonData.judges?.length || 0} judges
                                            </span>
                                        </div>
                                    </div>
                                    {hackathonData.invitedJudges?.length > 0 && (
                                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/20">
                                            {hackathonData.invitedJudges.length} pending invitations
                                        </Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

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
                                    <CardTitle className="text-white">Available Judges</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isLoading ? (
                                        <div className="text-center py-8 text-zinc-400">
                                            <p>Searching...</p>
                                        </div>
                                    ) : filteredJudges.length === 0 ? (
                                        <div className="text-center py-8 text-zinc-400">
                                            <p>No available judges found</p>
                                            <p className="text-sm mt-2">
                                                {searchQuery ? 
                                                    'Try searching with a different email or all judges matching this search are already invited' : 
                                                    'Try searching with an email address'
                                                }
                                            </p>
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
                                                    disabled={isInviting || isJudgeAlreadyInvited(judge._id)}
                                                    className="bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <TbMail className="w-5 h-5 mr-2" />
                                                    {isJudgeAlreadyInvited(judge._id) ? 'Already Invited' : 'Send Invite'}
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
                                            Invite judges to evaluate projects in your hackathon. Already invited judges are automatically filtered out.
                                        </p>
                                        <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/30">
                                            <h4 className="font-medium text-white mb-2">Tips:</h4>
                                            <ul className="space-y-2 text-sm">
                                                <li>• Search judges by their email address</li>
                                                <li>• Already invited judges won't appear in results</li>
                                                <li>• Consider inviting 3-5 judges for balanced evaluation</li>
                                                <li>• Judges can be added until the hackathon starts</li>
                                            </ul>
                                        </div>
                                        {hackathonData && (
                                            <div className="bg-green-900/20 p-4 rounded-lg border border-green-700/30">
                                                <h4 className="font-medium text-green-300 mb-2">Status:</h4>
                                                <p className="text-sm">
                                                    <span className="text-green-300">{hackathonData.judges?.length || 0}</span> judges accepted
                                                </p>
                                                <p className="text-sm">
                                                    <span className="text-yellow-300">{hackathonData.invitedJudges?.length || 0}</span> invitations pending
                                                </p>
                                            </div>
                                        )}
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