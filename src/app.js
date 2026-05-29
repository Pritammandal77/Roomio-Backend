import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js"; // Import passport config

const app = express();
app.set("trust proxy", 1);

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

app.get('/ping', (req, res) => {
    res.status(200).send('Server is alive');
});

import userRouter from "./routes/user.routes.js";
import preferenceRouter from "./routes/preference.routes.js";
import roomRouter from "./routes/rooms.routes.js";
import interestRouter from "./routes/interests.routes.js";
import otpRouter from "./routes/otp.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import chatRouter from "./routes/chat.routes.js";
import aiservicerouter from "./routes/aiservice.routes.js";

app.use("/api/user", userRouter)

app.use("/api/preference", preferenceRouter)

app.use("/api/rooms", roomRouter)

app.use("/api/interests", interestRouter)

app.use("/api/otp", otpRouter)

app.use("/api/chats", chatRouter)

app.use("/api/ai", aiservicerouter)

app.use(errorHandler); // error handler middleware to handle errors 

export default app
