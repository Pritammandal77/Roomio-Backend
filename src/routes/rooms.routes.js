import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { filterRooms, getAllListings, getCitiesOfListings, getListingsByID, listRoom } from "../controllers/listings.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { optionalVerifyJWT } from "../middlewares/optional.auth.middleware.js";

const roomRouter = Router();

roomRouter.route("/list-new-room")
    .post(
        verifyJWT,
        upload.array("pictures", 4),
        listRoom
    )

roomRouter.route("/all-listings").get(optionalVerifyJWT, getAllListings)

roomRouter.route("/listing/:id").get(getListingsByID)

roomRouter.route("/filter").post(filterRooms)

roomRouter.route("/cities").get(getCitiesOfListings)

export default roomRouter