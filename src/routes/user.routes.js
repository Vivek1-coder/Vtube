import { Router } from "express";
import {registerUser,loginUser,logoutUser,refreshAccessToken,changeCurrentPassword,getCurrentUser,updateAccountDetails, updateUserAvatar,updateUserCoverImage,userChannelProfile,getWatchHistory} from "../controllers/user.controller.js";
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
userRouter.route("/change-password").post(verifyJWT,changeCurrentPassword)
userRouter.route("/current-user").get(verifyJWT,getCurrentUser)
userRouter.route("/update-account").patch(verifyJWT,updateAccountDetails) //patch for updating
 
userRouter.route("/avatar-update").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)
userRouter.route("/cover-image").patch(verifyJWT,upload.single("coverImage"),updateUserCoverImage)

userRouter.route("/c/:username").get(verifyJWT,getUserChannelProfile)
userRouter.route("/history").get(verifyJWT,getWatchHistory)


export default userRouter