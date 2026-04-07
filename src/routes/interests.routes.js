import { Router } from "express"
import { createNewInterest, getUserInterests, updateStatus } from "../controllers/interest.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const interestRouter = Router()

interestRouter.route("/add-new-interest").post(verifyJWT,createNewInterest)

interestRouter.route("/fetch-interests").get(verifyJWT, getUserInterests)

interestRouter.route("/update-status").patch(verifyJWT, updateStatus)

export default interestRouter