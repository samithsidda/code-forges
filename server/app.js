require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const authMiddleware = require("./middleware/authMiddleware");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const problemRoutes = require("./routes/problemRoutes");
const solutionRoutes = require("./routes/solutionRoutes");
const compilerRoutes = require("./routes/compilerRoutes");


connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users",authMiddleware,userRoutes);
app.use("/api/rooms",authMiddleware,roomRoutes);
app.use("/api/problems", authMiddleware, problemRoutes);
app.use("/api/solutions", authMiddleware, solutionRoutes);
app.use("/api/compiler",authMiddleware,compilerRoutes);
app.get("/", (req, res) => {
    res.send("CodeForge API is running successfully!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});