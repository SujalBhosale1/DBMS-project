const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const Joi = require("joi"); // Input validation
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/flightBooking", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --------------------- USER REGISTRATION ---------------------

// User Schema & Model
const UserSchema = new mongoose.Schema({
    name: String,
    age: Number,
    username: { type: String, unique: true },
    password: String
});
const User = mongoose.model("User", UserSchema);

// Joi validation schema
const userSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    age: Joi.number().min(1).max(120).required(),
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required()
});

// Registration Route
app.post("/register", async (req, res) => {
    try {
        // Validate request data
        const { error } = userSchema.validate(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });

        const { name, age, username, password } = req.body;

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already taken" });

        // Save user to DB
        const newUser = new User({ name, age, username, password });
        await newUser.save();

        res.json({ message: "User Registered Successfully" });
    } catch (error) {
        console.error("❌ Error Registering User:", error);
        res.status(500).json({ message: "Error Registering User" });
    }
});

// --------------------- TICKET BOOKING ---------------------

// Ticket Schema & Model
const ticketSchema = new mongoose.Schema({
    from: String,
    to: String,
    travelDate: String,
    classType: String,
    price: String
});
const Ticket = mongoose.model("Ticket", ticketSchema);

// Booking Route
app.post("/book-ticket", async (req, res) => {
    try {
        const { from, to, travelDate, classType, price } = req.body;

        if (!from || !to || !travelDate || !classType || !price) {
            return res.status(400).json({ message: "All fields are required!" });
        }

        const newTicket = new Ticket({ from, to, travelDate, classType, price });
        await newTicket.save();

        res.status(201).json({ message: "🎟️ Ticket Booked Successfully!", ticket: newTicket });
    } catch (error) {
        console.error("❌ Error booking ticket:", error);
        res.status(500).json({ message: "Server error. Try again later." });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
