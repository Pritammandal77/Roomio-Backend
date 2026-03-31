import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { listRoom } from "../controllers/listings.controller.js";

const roomRouter = Router();

roomRouter.route("/list-new-room").post(verifyJWT, listRoom)

export default roomRouter