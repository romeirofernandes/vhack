const Hackathon = require('../models/Hackathon');
const User = require('../models/User');

// Get all hackathons
exports.getAllHackathons = async (req, res) => {
    try {
        const hackathons = await Hackathon.find()
            .populate('organizerId', 'displayName email photoURL')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate statistics
        const stats = {
            totalHackathons: hackathons.length,
            activeEvents: hackathons.filter(h => h.status === 'ongoing').length,
            totalParticipants: hackathons.reduce((sum, h) => sum + (h.teamSettings?.maxTeamSize || 0), 0),
            successRate: hackathons.length > 0 ? 
                Math.round((hackathons.filter(h => h.status === 'completed').length / hackathons.length) * 100) : 0
        };

        res.status(200).json({
            success: true,
            data: {
                hackathons,
                stats
            }
        });
    } catch (error) {
        console.error('Error in getAllHackathons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hackathons',
            error: error.message
        });
    }
};

// Create a new hackathon
exports.createHackathon = async (req, res) => {
    try {
        const {
            title,
            organizerName,
            description,
            theme,
            bannerImageUrl,
            timelines,
            teamSettings,
            prizes
        } = req.body;

        // Get organizer ID from authenticated user
        const organizerId = req.user._id;

        // Create new hackathon instance
        const hackathon = new Hackathon({
            title,
            organizerName,
            organizerId,
            description,
            theme,
            bannerImageUrl,
            timelines,
            teamSettings,
            prizes,
            status: 'draft' // Set initial status as draft
        });

        // Save the hackathon
        const savedHackathon = await hackathon.save();

        res.status(201).json({
            success: true,
            message: 'Hackathon created successfully as draft',
            data: savedHackathon
        });
    } catch (error) {
        console.error('Error creating hackathon:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating hackathon',
            error: error.message
        });
    }
};

// Get all hackathons for an organizer
exports.getOrganizerHackathons = async (req, res) => {
    try {
        const organizerId = req.user._id;

        const hackathons = await Hackathon.find({ organizerId })
            .populate('organizerId', 'displayName email photoURL')
            .sort({ createdAt: -1 }); // Sort by newest first

        // Calculate statistics
        const stats = {
            totalHackathons: hackathons.length,
            activeEvents: hackathons.filter(h => h.status === 'ongoing').length,
            totalParticipants: hackathons.reduce((sum, h) => sum + (h.teamSettings?.maxTeamSize || 0), 0),
            successRate: hackathons.length > 0 ? 
                Math.round((hackathons.filter(h => h.status === 'completed').length / hackathons.length) * 100) : 0
        };

        res.status(200).json({
            success: true,
            data: {
                hackathons,
                stats
            }
        });
    } catch (error) {
        console.error('Error in getOrganizerHackathons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hackathons',
            error: error.message
        });
    }
};

exports.getHackathonById = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        if (!hackathonId) {
            return res.status(400).json({
                success: false,
                message: 'Hackathon ID is required'
            });
        }

        const hackathon = await Hackathon.findById(hackathonId)
        .populate('judges', 'displayName email photoURL') // Add photoURL here
        .populate('invitedJudges', 'displayName email photoURL') // Add photoURL here

        if (!hackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found'
            });
        }

        res.status(200).json({
            success: true,
            data: hackathon
        });
    } catch (error) {
        console.error('Error fetching hackathon by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching hackathon',
            error: error.message
        });
    }
}

// Update hackathon
exports.updateHackathon = async (req, res) => {
    try {
        const { hackathonId } = req.params;
        const updateData = req.body;

        if (!hackathonId) {
            return res.status(400).json({
                success: false,
                message: 'Hackathon ID is required'
            });
        }

        // Find and update the hackathon
        const updatedHackathon = await Hackathon.findByIdAndUpdate(
            hackathonId,
            {
                ...updateData,
                updatedAt: new Date()
            },
            { 
                new: true, // Return the updated document
                runValidators: true // Run schema validations
            }
        ).populate('judges', 'displayName email photoURL')
         .populate('invitedJudges', 'displayName email photoURL');

        if (!updatedHackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Hackathon updated successfully',
            data: updatedHackathon
        });
    } catch (error) {
        console.error('Error updating hackathon:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating hackathon',
            error: error.message
        });
    }
};

// Delete hackathon
exports.deleteHackathon = async (req, res) => {
    try {
        const { hackathonId } = req.params;

        if (!hackathonId) {
            return res.status(400).json({
                success: false,
                message: 'Hackathon ID is required'
            });
        }

        // Find and delete the hackathon
        const deletedHackathon = await Hackathon.findByIdAndDelete(hackathonId);

        if (!deletedHackathon) {
            return res.status(404).json({
                success: false,
                message: 'Hackathon not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Hackathon deleted successfully',
            data: deletedHackathon
        });
    } catch (error) {
        console.error('Error deleting hackathon:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting hackathon',
            error: error.message
        });
    }
};