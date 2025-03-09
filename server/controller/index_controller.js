const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

// Create and Save a new User
async function HandleCreateNewUser(req, res) {
    const { 
        username, email, password, bio, interests, profile_photo, gender, looking_for, dob, 
        location, matches, messages, notifications, reports 
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !dob || !gender || !looking_for) {
        return res.status(400).send({
            message: "Required fields (username, email, password, dob, gender, looking_for) must be provided."
        });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: "User with this email already exists." });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            passwordHash: hashedPassword,
            bio: bio || "",
            interests: interests || [],
            profile_photo: profile_photo || "",
            photo_visibility: false,  // Default is false
            gender,
            looking_for,
            dob,
            location: location || { city: "", country: "" },
            last_active: Date.now(),
            matches: matches || [],
            messages: messages || [],
            notifications: notifications || [],
            reports: reports || [],
            created_at: Date.now()
        });

        // Save user to database
        const savedUser = await newUser.save();
        res.status(201).send(savedUser);

    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        });
    }
}

module.exports = { HandleCreateNewUser };
