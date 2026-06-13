const express = require('express');
const http = require("http");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require("compression");
const hpp = require("hpp");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require('./Config/db');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require("morgan");

require('dotenv').config()
const { initSocket } = require('./socket')
const authRoutes = require('./Routes/authRoutes');
const { errorMiddleware } = require("./Middleware/errMiddleware");
const userRoutes = require('./Routes/userRoutes');
const workspaceRoutes = require('./Routes/workspaceRoutes');
const teamRoutes = require('./Routes/teamRoutes');
const projectRoutes = require("./Routes/projectRoutes");
const taskRoutes = require("./Routes/taskRoutes");
const notificationRoutes = require('./Routes/notificationRoutes');
const { globalLimiter } = require('./Middleware/rateLimitMiddleware');
const logger = require("./Utils/logger");
const fileRoutes = require('./Routes/filesRoutes');
const taskStatic = require('./Routes/taskStaticRoutes');
const commentRoutes = require('./Routes/commentRoutes')

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

app.use(cookieParser());

// security middlewares
// app.use(mongoSanitize({ sanitizeQuery: false }));
app.use(hpp());

// performance
app.use(compression());

// rate limit LAST (before routes)
app.use(globalLimiter);

app.use(
    morgan("combined", {
        stream: {
            write: (message) => {
                logger.info(message.trim());
            }
        }
    })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/team", teamRoutes);
app.use("/project", projectRoutes);
app.use("/task", taskRoutes);
app.use("/notification", notificationRoutes);
app.use("/files", fileRoutes)
app.use("/stat", taskStatic)
app.use("/comment", commentRoutes);

app.use(errorMiddleware);

//if wants to deploy client -> proxy server -> server. for rate limiting and evreything
// if (process.env.NODE_ENV === "production") {
//   app.set("trust proxy", 1);
// }

connectDB()
    .then(() => {
        initSocket(server);
        server.listen(5000, () => {
            console.log("Database Connected\nServer is listening...");
            logger.info("MongoDB connected");
            logger.info("Server started", {
                port: process.env.PORT
            });
        })
    })
    .catch((err) => {
        logger.error("Database query failed", {
            error: err.message,
            stack: err.stack
        });
        console.log("Database not connected")
    })