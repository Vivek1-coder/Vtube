import { Router } from "express";
import {registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router()


userRouter.route("/register").post(
    upload.fields([
    {
        name:"avatar",
        maxCount : 1
    },
    {
        name : "coverImage",
        maxCount : 1
    }

    ]),
    registerUser) 
//http://localhost:8000/users/register
// userRouter.route("/login").post(loginUser) 
//http://localhost:8000/users/login

export default userRouter