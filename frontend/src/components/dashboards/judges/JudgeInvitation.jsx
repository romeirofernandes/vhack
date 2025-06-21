import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdClose, MdAccessTime, MdVisibility, MdEvent, MdGroup, MdEmojiEvents, MdCode, MdInfo } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const JudgeInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedHackathon, setSelectedHackathon] = useState(null);
  const [hackathonDetails, setHackathonDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/judge/invitations`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        setInvitations(response.data.invitations);
      } else {
        toast.error(response.data.error || 'Failed to load invitations');
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Something went wrong while fetching invitations');
    } finally {
      setLoading(false);
    }
  };

  const fetchHackathonDetails = async (hackathonId) => {
    try {
      setDetailsLoading(true);
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/hackathons/${hackathonId}`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        setHackathonDetails(response.data.data);
      } else {
        toast.error('Failed to fetch hackathon details');
      }
    } catch (error) {
      console.error('Error fetching hackathon details:', error);
      toast.error('Failed to fetch hackathon details');
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleViewDetails = async (hackathon) => {
    setSelectedHackathon(hackathon);
    setDetailsModalOpen(true);
    await fetchHackathonDetails(hackathon._id);
  };

  const handleInvitationResponse = async (hackathonId, accept) => {
    try {
      setActionLoading(hackathonId);
      const idToken = await user.getIdToken();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/judge/invitations/${hackathonId}/respond`,
        { accept },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(accept ? 'Invitation accepted!' : 'Invitation declined');
        fetchInvitations(); // Refresh the list
      } else {
        toast.error(response.data.error || 'Failed to process your response');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
      </div>
    );
  }

  return (
    <>
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MdAccessTime className="mr-2 w-5 h-5" />
            Hackathon Invitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invitations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/70">No pending invitations</p>
            </div>
          ) : (
            invitations.map((invitation) => (
              <motion.div
                key={invitation._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all"
              >
                <div className="mb-4 sm:mb-0">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-white mr-3">
                      {invitation.hackathon.title}
                    </h3>
                    <Badge className="bg-purple-900/50 text-purple-200">
                      {new Date(invitation.hackathon.timelines.hackathonStart).toLocaleDateString()} - {new Date(invitation.hackathon.timelines.hackathonEnd).toLocaleDateString()}
                    </Badge>
                  </div>
                  <p className="text-sm text-white/70 mb-2">
                    Organized by {invitation.hackathon.organizerName}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-white/10 text-white/80">
                      {invitation.hackathon.theme}
                    </Badge>
                    <Badge className="bg-blue-900/50 text-blue-200">
                      Invitation sent {new Date(invitation.invitedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-center">
                  <Button
                    onClick={() => handleViewDetails(invitation.hackathon)}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/30 text-blue-400 hover:bg-blue-950/30 hover:text-blue-300"
                  >
                    <MdVisibility className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  <Button
                    onClick={() => handleInvitationResponse(invitation.hackathon._id, false)}
                    variant="outline"
                    size="sm"
                    disabled={actionLoading === invitation.hackathon._id}
                    className="border-red-500/30 text-red-400 hover:bg-red-950/30 hover:text-red-300"
                  >
                    <MdClose className="w-4 h-4 mr-1" />
                    Decline
                  </Button>
                  <Button
                    onClick={() => handleInvitationResponse(invitation.hackathon._id, true)}
                    size="sm"
                    disabled={actionLoading === invitation.hackathon._id}
                    className="bg-green-700 hover:bg-green-600 text-white"
                  >
                    {actionLoading === invitation.hackathon._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <MdCheck className="w-4 h-4 mr-1" />
                        Accept
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Hackathon Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-zinc-950 border-zinc-800 text-white overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white text-xl flex items-center gap-2">
              <MdInfo className="w-5 h-5 text-blue-400" />
              Hackathon Details
            </DialogTitle>
          </DialogHeader>
          
          {detailsLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/70"></div>
            </div>
          ) : hackathonDetails ? (
            <div className="space-y-6">
              {/* Basic Information */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{hackathonDetails.title}</CardTitle>
                  <p className="text-zinc-400">Organized by {hackathonDetails.organizerName}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600 text-white">{hackathonDetails.theme}</Badge>
                    <Badge className="bg-zinc-600 text-white">{hackathonDetails.status}</Badge>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{hackathonDetails.description}</p>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <MdEvent className="w-5 h-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-sm">Registration Start</p>
                      <p className="text-white">{formatDate(hackathonDetails.timelines?.registrationStart)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-sm">Registration End</p>
                      <p className="text-white">{formatDate(hackathonDetails.timelines?.registrationEnd)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-sm">Hackathon Start</p>
                      <p className="text-white">{formatDate(hackathonDetails.timelines?.hackathonStart)}</p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-zinc-400 text-sm">Hackathon End</p>
                      <p className="text-white">{formatDate(hackathonDetails.timelines?.hackathonEnd)}</p>
                    </div>
                    {hackathonDetails.timelines?.resultsDate && (
                      <div className="space-y-2">
                        <p className="text-zinc-400 text-sm">Results Date</p>
                        <p className="text-white">{formatDate(hackathonDetails.timelines.resultsDate)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Settings */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <MdGroup className="w-5 h-5" />
                    Team Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <p className="text-zinc-400 text-sm">Min Team Size</p>
                      <p className="text-white text-xl font-bold">{hackathonDetails.teamSettings?.minTeamSize}</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <p className="text-zinc-400 text-sm">Max Team Size</p>
                      <p className="text-white text-xl font-bold">{hackathonDetails.teamSettings?.maxTeamSize}</p>
                    </div>
                    <div className="text-center p-3 bg-zinc-800 rounded-lg">
                      <p className="text-zinc-400 text-sm">Solo Allowed</p>
                      <p className="text-white text-xl font-bold">{hackathonDetails.teamSettings?.allowSolo ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Problem Statements */}
              {hackathonDetails.problemStatements && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <MdCode className="w-5 h-5" />
                      Problem Statements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {hackathonDetails.problemStatements}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Judging Criteria */}
              {hackathonDetails.judgingCriteria && hackathonDetails.judgingCriteria.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">Judging Criteria</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hackathonDetails.judgingCriteria.map((criteria, index) => (
                      <div key={index} className="p-3 bg-zinc-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-white font-medium">{criteria.title}</h4>
                          <Badge className="bg-blue-600 text-white">Max: {criteria.maxScore} pts</Badge>
                        </div>
                        {criteria.description && (
                          <p className="text-zinc-400 text-sm">{criteria.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Prizes */}
              {hackathonDetails.prizes && (
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      <MdEmojiEvents className="w-5 h-5" />
                      Prizes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {hackathonDetails.prizes.firstPrize && (
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-white">🥇 First Prize</span>
                        <span className="text-zinc-300">{hackathonDetails.prizes.firstPrize}</span>
                      </div>
                    )}
                    {hackathonDetails.prizes.secondPrize && (
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-white">🥈 Second Prize</span>
                        <span className="text-zinc-300">{hackathonDetails.prizes.secondPrize}</span>
                      </div>
                    )}
                    {hackathonDetails.prizes.thirdPrize && (
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-white">🥉 Third Prize</span>
                        <span className="text-zinc-300">{hackathonDetails.prizes.thirdPrize}</span>
                      </div>
                    )}
                    {hackathonDetails.prizes.participantPrize && (
                      <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                        <span className="text-white">🎁 Participation Prize</span>
                        <span className="text-zinc-300">{hackathonDetails.prizes.participantPrize}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">Failed to load hackathon details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JudgeInvitations;