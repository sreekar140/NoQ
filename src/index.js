import express from "express";
import "dotenv/config";
import authRoutes from "./routes/authRoutes.js"
import profileRoutes from "./routes/profileRoutes.js"
import { connectDB } from "./lib/db.js"
import cors from "cors";
import job from "./lib/cron.js";
import crowd from "./routes/crowd.js"
const app = express();
const PORT = process.env.PORT;

job.start();
app.use(express.json());
app.use(cors());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api",crowd)
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`); 
  });
});

