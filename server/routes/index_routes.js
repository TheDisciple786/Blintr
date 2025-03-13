const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { HandleCreateNewUser, HandleGetUsers, HandleUserLogin } = require('../controller/index_controller');
const { Match, Message, User } = require('../models/index_db'); // Import models
const config = require('../config/config');

router.post('/new_user', HandleCreateNewUser);

router.get('/users', HandleGetUsers);

router.post('/users/login', HandleUserLogin);

router.get('/matches', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token to get current user
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        // Find matches where the current user is either user1 or user2
        const matches = await Match.find({
            $or: [
                { user1: currentUserId },
                { user2: currentUserId }
            ]
        }).populate('user1 user2');
        
        console.log(`Found ${matches.length} matches for user ${currentUserId}`);
        
        res.json(matches);
    } catch (error) {
        console.error("Error fetching matches:", error);
        res.status(500).json({ message: "Error fetching matches" });
    }
});

router.get('/messages', async (req, res) => {
    const messages = await Message.find().populate('sender_id receiver_id');
    res.json(messages);
});

router.get('/recommendations', async (req, res) => {
    try {
        // Get token and verify it
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        
        // Extract user ID from token
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        // Find 5 users excluding the current user
        const recommendations = await User.find({ 
            _id: { $ne: currentUserId } 
        })
        .select('-passwordHash') // Exclude password hash from results
        .limit(5);
        
        res.json(recommendations);
    } catch (error) {
        console.error("Error fetching recommendations:", error);
        res.status(500).json({ message: "Error fetching recommendations" });
    }
});

// Add a new route to get user by ID
router.get('/users/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // Remove sensitive information
        const { passwordHash, ...userData } = user.toObject();
        res.json(userData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile
router.put('/users/:userId', async (req, res) => {
    try {
        console.log("Received update request:", req.body);
        
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        // Check if the user is updating their own profile
        if (currentUserId !== req.params.userId) {
            return res.status(403).json({ message: "Not authorized to update this profile" });
        }
        
        // Fields that are allowed to be updated
        const allowedUpdates = [
            'username', 'email', 'bio', 'interests', 
            'location', 'dob', 'gender', 'looking_for'
        ];
        
        // Filter out any fields that shouldn't be updated
        const updates = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (allowedUpdates.includes(key)) {
                // Handle empty values appropriately
                if (value === '' || value === null || value === undefined) {
                    if (key === 'interests') {
                        updates[key] = []; // Empty array for interests
                    } else {
                        updates[key] = undefined; // Remove field when using $set
                    }
                } else {
                    updates[key] = value;
                }
            }
        }
        
        console.log("Processed updates:", updates);
        
        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            currentUserId,
            { $set: updates },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Remove sensitive information before sending back
        const { passwordHash, ...userData } = updatedUser.toObject();
        res.json(userData);
    } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// Get single match by ID
router.get('/matches/:matchId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        const match = await Match.findById(req.params.matchId).populate('user1 user2');
        
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        
        // Check if the current user is part of this match
        if (match.user1._id.toString() !== currentUserId && match.user2._id.toString() !== currentUserId) {
            return res.status(403).json({ message: "Not authorized to view this match" });
        }
        
        res.json(match);
    } catch (error) {
        console.error("Error fetching match:", error);
        res.status(500).json({ message: "Error fetching match details" });
    }
});

// Get messages for a specific match
router.get('/messages/:matchId', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        // Find match first to verify access
        const match = await Match.findById(req.params.matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        
        // Check if the current user is part of this match
        if (match.user1.toString() !== currentUserId && match.user2.toString() !== currentUserId) {
            return res.status(403).json({ message: "Not authorized to view these messages" });
        }
        
        // Get messages for this match
        const messages = await Message.find({ match_id: req.params.matchId })
            .populate('sender_id receiver_id')
            .sort({ sent_at: 1 }); // Sort messages by time
        
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Error fetching messages" });
    }
});

// Send new message
router.post('/messages/send', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        const senderId = decoded.userId;
        
        const { match_id, receiver_id, message } = req.body;
        
        if (!match_id || !receiver_id || !message) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        // Find match to verify access
        const match = await Match.findById(match_id);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        
        // Check if the current user is part of this match
        if (match.user1.toString() !== senderId && match.user2.toString() !== senderId) {
            return res.status(403).json({ message: "Not authorized to send messages in this match" });
        }
        
        // Create and save the new message
        const newMessage = new Message({
            match_id,
            sender_id: senderId,
            receiver_id,
            message,
            sent_at: new Date(),
            seen: false
        });
        
        await newMessage.save();
        
        // Check if photos should be unlocked (after 5 messages)
        if (!match.photos_unlocked) {
            const messageCount = await Message.countDocuments({ match_id });
            
            if (messageCount >= 5) {
                match.photos_unlocked = true;
                await match.save();
            }
        }
        
        // Mark that chat has started
        if (!match.chat_started) {
            match.chat_started = true;
            await match.save();
        }
        
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ message: "Error sending message" });
    }
});

// Mark messages as read
router.post('/messages/:matchId/read', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        const matchId = req.params.matchId;
        
        // Find match to verify access
        const match = await Match.findById(matchId);
        if (!match) {
            return res.status(404).json({ message: "Match not found" });
        }
        
        // Check if the current user is part of this match
        if (match.user1.toString() !== currentUserId && match.user2.toString() !== currentUserId) {
            return res.status(403).json({ message: "Not authorized" });
        }
        
        // Mark all messages sent to the current user as read
        await Message.updateMany(
            { match_id: matchId, receiver_id: currentUserId, seen: false },
            { seen: true }
        );
        
        res.status(200).json({ message: "Messages marked as read" });
    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({ message: "Error updating message status" });
    }
});

// Add a new route to create a match between users
router.post('/matches/create', async (req, res) => {
    try {
        const { userId, matchedUserId } = req.body;
        
        // Check if users exist
        const user1 = await User.findById(userId);
        const user2 = await User.findById(matchedUserId);
        
        if (!user1 || !user2) {
            return res.status(404).json({ message: "One or both users not found" });
        }
        
        // Check if match already exists
        const existingMatch = await Match.findOne({
            $or: [
                { user1: userId, user2: matchedUserId },
                { user1: matchedUserId, user2: userId }
            ]
        });
        
        if (existingMatch) {
            return res.status(200).json({ 
                success: true, 
                message: "Match already exists",
                matchId: existingMatch._id
            });
        }
        
        // Create a new match record
        const newMatch = new Match({
            user1: userId,
            user2: matchedUserId,
            matched_at: new Date(),  // Using matched_at instead of createdAt
            photos_unlocked: false,
            chat_started: false
        });
        
        const savedMatch = await newMatch.save();
        
        res.status(201).json({ 
            success: true, 
            message: "Match created successfully",
            matchId: savedMatch._id
        });
    } catch (error) {
        console.error("Error creating match:", error);
        res.status(500).json({ message: "Error creating match", error: error.message });
    }
});

// Change Password route - fixing the implementation
router.post('/users/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token
        const decoded = jwt.verify(token, config.jwtSecret);
        const currentUserId = decoded.userId;
        
        // Check if user is changing their own password
        if (currentUserId !== req.body.userId) {
            return res.status(403).json({ message: "Not authorized to change this user's password" });
        }
        
        // Get current and new password from request
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Both current and new password are required" });
        }
        
        // Find the user
        const user = await User.findById(currentUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        console.log("Verifying password for user:", user.username);
        
        // Verify current password
        try {
            // Using bcrypt.compare with await to properly handle the async comparison
            const passwordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            
            if (!passwordValid) {
                return res.status(400).json({ message: "Current password is incorrect" });
            }
            
            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            
            // Update user's password
            user.passwordHash = hashedPassword;
            await user.save();
            
            console.log("Password updated successfully for user:", user.username);
            res.status(200).json({ message: "Password updated successfully" });
        } catch (bcryptError) {
            console.error("Bcrypt error:", bcryptError);
            return res.status(500).json({ message: "Error verifying password", error: bcryptError.message });
        }
    } catch (error) {
        console.error("Error changing password:", error);
        res.status(500).json({ message: "Error changing password", error: error.message });
    }
});

module.exports = router;