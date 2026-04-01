import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllListings, getListingsByID, listRoom } from "../controllers/listings.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const roomRouter = Router();

roomRouter.route("/list-new-room")
    .post(
        verifyJWT,
        upload.array("pictures", 4),
        listRoom
    )

roomRouter.route("/all-listings").get(getAllListings)

roomRouter.route("/listing/:id").get(getListingsByID)
export default roomRouter