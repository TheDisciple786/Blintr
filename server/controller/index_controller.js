const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

        // Validate profile photo if provided - check if it's a valid base64 string
        let processedProfilePhoto = profile_photo || "";
        if (profile_photo) {
            // Check if it's a valid base64 string - should start with data:image format
            if (!profile_photo.match(/^data:image\/(jpeg|png|gif|bmp|svg\+xml);base64,/)) {
                return res.status(400).send({ 
                    message: "Invalid profile photo format. Must be a valid base64 image string."
                });
            }
            
            // Check base64 string size
            const base64Data = profile_photo.split(',')[1];
            const base64Size = Math.round((base64Data.length * 3) / 4); // Approximate size in bytes
            if (base64Size > 10 * 1024 * 1024) { // 10MB limit
                return res.status(400).send({ 
                    message: "Profile photo too large. Max size is 10MB."
                });
            }
            
            // Store base64 string directly
            processedProfilePhoto = profile_photo;
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
            profile_photo: processedProfilePhoto, // Store the validated base64 string
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
        
        // Return user without the password hash for security
        const userResponse = {
            ...savedUser._doc,
            passwordHash: undefined
        };
        
        res.status(201).send(userResponse);

    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).send({
            message: err.message || "Some error occurred while creating the User."
        });
    }
}

async function HandleGetUsers(req,res)
{
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({
            message: err.message || "Some error occurred while retrieving users."
        });
    }
}

async function HandleUserLogin(req, res) {
    const { username, password } = req.body;

    // Validate inputs
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: "User not found." });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials." });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, "your_secret_key", { expiresIn: "1h" });

        // Make sure to send the user ID in the response
        res.status(200).json({
            message: "Login successful!",
            token,
            userId: user._id
        });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
}

module.exports = { HandleCreateNewUser, HandleGetUsers, HandleUserLogin };
