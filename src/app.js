// import passport from "passport";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
// import './config/passport.js';

const app = express();

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

// app.use(passport.initialize());


import userRouter from "./routes/user.routes.js";
import preferenceRouter from "./routes/preference.routes.js";
import roomRouter from "./routes/rooms.routes.js";
import interestRouter from "./routes/interests.routes.js";

app.use("/api/user", userRouter)

app.use("/api/preference", preferenceRouter)

app.use("/api/rooms", roomRouter)

app.use("/api/interests", interestRouter)

export default app