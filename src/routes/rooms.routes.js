import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { listRoom } from "../controllers/listings.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const roomRouter = Router();

roomRouter.route("/list-new-room")
    .post(
        verifyJWT,
        upload.array("pictures", 4),
        listRoom
    )

export default roomRouter