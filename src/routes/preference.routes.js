import { Router } from "express"
import { getPreference, upsertPreference } from "../controllers/preference.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const preferenceRouter = Router()


preferenceRouter.route("/upsert").post(verifyJWT, upsertPreference)

preferenceRouter.route("/get").get(verifyJWT, getPreference)



export default preferenceRouter