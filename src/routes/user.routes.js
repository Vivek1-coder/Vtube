import { Router } from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

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

userRouter.route("/login").post(loginUser)

//secured routes
userRouter.route("/logout").post(verifyJWT, logoutUser) // next ki vajah se verify vale ke bad logout pr aa jaega
userRouter.route("/refresh-token").post(refreshAccessToken) //sara kam hamne usi ke andar kiya h so no need of verifyjwt

export default userRouter