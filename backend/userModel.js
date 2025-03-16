import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  elderid: { type: String },
});

// Create the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
