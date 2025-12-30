const User = require("../models/User");
const Hospital = require("../models/Hospital");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user or hospital
// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Escape special regex characters in email
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const normalizedEmail = email.trim();
    
    // First check User model (case-insensitive)
    let account = await User.findOne({ 
      email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' } 
    });
    let accountType = "user";

    // If not found in User, check Hospital model (case-insensitive)
    if (!account) {
      account = await Hospital.findOne({ 
        email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: 'i' } 
      });
      accountType = "hospital";
      console.log("Found in Hospital model:", account ? "Yes" : "No");
      if (account) {
        console.log("Hospital status:", account.status);
        console.log("Hospital email in DB:", account.email);
        console.log("Hospital password hash exists:", account.password ? "Yes" : "No");
        console.log("Password hash length:", account.password ? account.password.length : 0);
      } else {
        console.log("No hospital found with email:", normalizedEmail);
        // Try to find any hospitals to debug
        const allHospitals = await Hospital.find({}).select('email status');
        console.log("All hospitals in DB:", allHospitals.map(h => ({ email: h.email, status: h.status })));
      }
    }

    // If still not found, invalid credentials
    if (!account) {
      console.log("Account not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if hospital is approved (only for hospitals)
    if (accountType === "hospital" && account.status !== "approved") {
      console.log("Hospital not approved. Status:", account.status);
      return res.status(403).json({ 
        message: "Hospital account is pending approval. Please contact admin." 
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      console.log("Password mismatch for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Determine role
    const role = accountType === "hospital" ? "hospital" : account.role;

    console.log("Login successful. Role:", role);

    res.json({
      _id: account.id,
      name: account.name,
      email: account.email,
      role: role,
      token: generateToken(account.id, role),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = async (req, res) => {
  res.json(req.user);
};
