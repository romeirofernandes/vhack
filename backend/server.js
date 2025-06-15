const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const participantRoutes = require("./routes/participantRoutes");
const organizerRoutes = require("./routes/organizerRoutes");
const judgeRoutes = require('./routes/judgeRoutes');
const profileRoutes = require("./routes/profileRoutes");
const projectRoutes = require("./routes/projectRoutes");
const skillsRoutes = require("./routes/skillsRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const hackathonRoutes = require("./routes/hackathonRoutes");

dotenv.config();

const PORT = process.env.PORT || 8000;

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/participant", participantRoutes);
app.use("/organizer", organizerRoutes);
app.use("/judge", judgeRoutes);
app.use("/profile", profileRoutes);
app.use("/projects", projectRoutes);
app.use("/skills", skillsRoutes);
app.use("/achievements", achievementRoutes);
app.use("/upload", uploadRoutes);
app.use("/hackathons", hackathonRoutes);
app.use('/auth', authRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
