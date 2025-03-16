import express from "express";
import bcrypt from "bcrypt";
import User from "./userModel.js";
const router = express.Router();
router.post("/signup", async (req, res) => {
  const { username, email, password,elderid } = req.body;
  console.log(username, email, password,elderid);

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      elderid
    });
    console.log(newUser);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/login", async (req, res) => {
  const { email, password ,elderid} = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    req.session.user = user;
    res.json({ message: "Login successful", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.get('/logout', async (req, res, next) => {
  try {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ error: "Error logging out" });
      res.clearCookie("connect.sid");
      res.json({ message: "Logout successful" });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal Server Error in logout",
      success: false,
    });
  }
})

export default router;
