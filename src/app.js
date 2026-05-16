import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import passport from "passport";
import "./config/passport.js"; // Import your config

const app = express();
app.set("trust proxy", 1);





// Read the string from Render and split it by the comma into an array
const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ["http://localhost:3000", "http://localhost:5173"]; // Fallbacks for local development

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like Postman, mobile testing, or server-to-server requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Blocked by CORS policy'));
        }
    },
    credentials: true
}));




// app.use(cors({
//     origin: process.env.CORS_ORIGIN,
//     credentials: true
// }))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())


import userRouter from "./routes/user.routes.js";
import preferenceRouter from "./routes/preference.routes.js";
import roomRouter from "./routes/rooms.routes.js";
import interestRouter from "./routes/interests.routes.js";
import otpRouter from "./routes/otp.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import chatRouter from "./routes/chat.routes.js";

app.use("/api/user", userRouter)

app.use("/api/preference", preferenceRouter)

app.use("/api/rooms", roomRouter)

app.use("/api/interests", interestRouter)

app.use("/api/otp", otpRouter)

app.use("/api/chats", chatRouter)

app.use(errorHandler); // error handler middleware to handle errors 

export default app
