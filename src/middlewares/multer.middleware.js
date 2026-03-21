import multer from "multer";
import os from "os";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, os.tmpdir()); 
    },
    filename: function (req, file, cb) {
        const uniqueName = `${Date.now()}-${file.originalname}`;
        cb(null, uniqueName);    
    }
})

export const upload = multer({
    storage: storage
})
