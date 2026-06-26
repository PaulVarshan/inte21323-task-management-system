import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import commentRoutes from "./routes/comment.routes";
import attachmentRoutes from "./routes/attachment.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import notificationRoutes from "./routes/notification.routes";
import userRoutes from "./routes/user.routes";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "validator.swagger.io"],
      upgradeInsecureRequests: null,
    },
  },
}));

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    process.env.FRONTEND_URL || "http://localhost:5173"
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve static uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/attachments", attachmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

export default app;