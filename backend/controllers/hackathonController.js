const Hackathon = require('../models/Hackathon');

// Get all hackathons
exports.getAllHackathons = async (req, res) => {
    try {
        console.log('Fetching all hackathons'); // Debug log

        const hackathons = await Hackathon.find()
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log('Found hackathons:', hackathons); // Debug log

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

        // Create new hackathon instance
        const hackathon = new Hackathon({
            title,
            organizerName,
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
        const { organizerName } = req.params;
        
        console.log('Fetching hackathons for organizer:', organizerName); // Debug log

        if (!organizerName) {
            return res.status(400).json({
                success: false,
                message: 'Organizer name is required'
            });
        }

        const hackathons = await Hackathon.find({ organizerName })
            .sort({ createdAt: -1 }); // Sort by newest first

        console.log('Found hackathons:', hackathons); // Debug log

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