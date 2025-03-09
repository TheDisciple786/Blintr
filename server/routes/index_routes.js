const express = require('express');
const router = express.Router();
const { HandleCreateNewUser, HandleGetUsers, HandleUserLogin } = require('../controller/index_controller');
const { Match, Message, User } = require('../models/index_db'); // Import models

router.post('/new_user', HandleCreateNewUser);

router.get('/users', HandleGetUsers);

router.post('/users/login', HandleUserLogin);

router.get('/matches', async (req, res) => {
    const matches = await Match.find().populate('user1 user2');
    res.json(matches);
});

router.get('/messages', async (req, res) => {
    const messages = await Message.find().populate('sender_id receiver_id');
    res.json(messages);
});

router.get('/recommendations', async (req, res) => {
    const recommendations = await User.find().limit(5);
    res.json(recommendations);
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

module.exports = router;