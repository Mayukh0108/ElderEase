import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./mongodb.js";
import router from "./userRoutes.js";
import twilio from "twilio";
import mongoose from "mongoose";

const app = express();

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
})();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",

  "http://127.0.0.1:5501",

  "http://localhost:3000",
  "http://localhost:5000",
];

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(express.json());
app.set("trust proxy", 1);


app.use(
  cors({
    origin: "*", // Allow all origins (for development)
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json()); // Keep only one instance
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("trust proxy", 1);

app.use("/api/user", router);
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Twilio setup

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

const sosMessages = [
  "Dad is feeling very weak. Please call as soon as possible! 💔",
  "Mom is having chest pain! Urgent help needed! 🚑",
  "I'm feeling dizzy and unable to move properly. Please check on me! 😞",
  "There is a medical emergency. Please come home quickly! 🏠",
  "I'm having trouble breathing. Call the doctor immediately! 😨",
  "Blood pressure is too high. Need help right now! 📞",
  "I fell down and need assistance. Please respond fast! 🚨",
  "I can't find my medicines. Can you call me? 💊",
  "Severe pain in joints, can't stand properly. Urgent help needed! 😥",
  "I'm scared and feeling uneasy. Please check on me soon. 😓",
];

app.post("/send-sos", async (req, res) => {
  try {
    const randomMessage =
      sosMessages[Math.floor(Math.random() * sosMessages.length)];
    const message = await client.messages.create({
      body: randomMessage,
      from: "+15732675589",
      to: req.body.to,
    });

    res.status(200).json({ success: true, messageSid: message.sid });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Calendar Schema & Model
const CalendarItemSchema = new mongoose.Schema({
  id: Number,
  type: String,
  name: String,
  date: String,
  time: String,
  notes: String,
});

const CalendarItem = mongoose.model("CalendarItem", CalendarItemSchema);

// Route to add calendar item
app.post("/add-item", async (req, res) => {
  console.log("Received Data:", req.body);
  try {
    const { id, type, name, date, time, notes } = req.body;
    const newItem = new CalendarItem({ id, type, name, date, time, notes });
    await newItem.save();
    res.status(201).json({ success: true, message: "Item added!" });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route to fetch calendar items
app.get("/get-items", async (req, res) => {
  try {
    const items = await CalendarItem.find();
    res.status(200).json({ success: true, items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);