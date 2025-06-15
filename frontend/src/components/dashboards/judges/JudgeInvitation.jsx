import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdClose, MdAccessTime } from 'react-icons/md';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const JudgeInvitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/70"></div>
      </div>
    );
  }

  return (
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
  );
};

export default JudgeInvitations;