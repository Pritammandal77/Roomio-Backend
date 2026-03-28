import { Router } from "express"
import { addPreference, getPreference, updatePreference } from "../controllers/preference.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js"

const preferenceRouter = Router()

preferenceRouter.route("/add-preference").post(verifyJWT, addPreference)

preferenceRouter.route("/get-preference").get(verifyJWT, getPreference)

preferenceRouter.route("/update-preference").put(verifyJWT, updatePreference)

export default preferenceRouter