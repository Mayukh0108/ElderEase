import mongoose from "mongoose";
const CalendarItem = mongoose.model("CalendarItem", CalendarItemSchema);

// Calendar Schema & Model
const CalendarItemSchema = new mongoose.Schema({
    id: Number,
    type: String,
    name: String,
    date: String,
    time: String,
    notes: String,
  });

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
