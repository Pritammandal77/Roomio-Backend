import { Router } from "express";
import { resendOtp, sendOtp, verifyOtp } from "../controllers/otp.controller.js";

const otpRouter = Router()

otpRouter.route("/send").post(sendOtp)
otpRouter.route("/verify").post(verifyOtp)
otpRouter.route("/resend").post(resendOtp)

export default otpRouter