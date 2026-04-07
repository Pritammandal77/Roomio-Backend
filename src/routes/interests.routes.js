import { Router } from "express"
import { createNewInterest, getUserInterests } from "../controllers/interest.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"


const interestRouter = Router()

interestRouter.route("/add-new-interest").post(verifyJWT,createNewInterest)

interestRouter.route("/fetch-interests").get(verifyJWT, getUserInterests)


export default interestRouter