import express from "express";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.send("Backend is working");
});

export default app;