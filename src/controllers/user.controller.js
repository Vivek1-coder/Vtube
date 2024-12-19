import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAceessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    }catch(error){
        throw new ApiError(500,"something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req,res) =>{

    // get User details from frontend
    const {fullName,email,username,password} = req.body// form aur json vala body me mil jaega
    console.log(email,password)

    // Validation - not empty
    // if(fullName === ""){
    //     throw new ApiError(400,"fullname is required")
    // }
    if(
        [fullName,email,username,password].some((field)=>field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    //  Check if user already exists : username,email
    const existedUser = await User.findOne({
        $or : [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or Username already exists")
    }

    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage [0]?.path;

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    
    // upload them to cloudinary, avataar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    // remove password and refresh token field from response
    const createdUser = await User.findById(user.id).select(
        "-password -refreshToken"
    )

    // check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }
    
    // return res
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registered successfully")
    )

})

const loginUser = asyncHandler(async(req,res) =>{
   //request body se data
   const {email,username,password} = req.body

   //username or email 
   if(!email && !username){
        throw new ApiError(400,"Username or Email is required")
   }

   // find the user
   const user = await User.findOne({
    $or : [{username},{email}]
   })

   if (!user){
    throw new ApiError(404,"User does not exist")
   }
   //password Check
   const isPasswordValid = await user.isPasswordCorrect(password)
   if (!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
   }

   // generate access and refresh token
   const {accessToken,refreshToken} = await generateAceessAndRefreshTokens(user._id)


   //send cookies
   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
    httpOnly : true,
    secure : true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
        new ApiResponse(
            200,
            {
                user : loggedInUser, accessToken,
                refreshToken
            },
            "User logged In Successfully"
        )
   )
})

const logoutUser = asyncHandler(async(req,res) => {
    // middleware execute ho chuka h to iske paas req.user as accesToken hoga
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            }
        },{
            new: true
        }
        
    )
    const options = {
        httpOnly : true,
        secure : true
       }

    return res
    .status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }


    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id)
        if(!user){
            throw new ApiError(401,"Invalid refresh Token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options = {
            httpOnly : true,
            secure : true
        }
    
        const {accessToken,newRefreshToken} = await generateAceessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken,refreshToken : newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req,res) => {
    const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    isPassCorrect = user.isPasswordCorrect(oldPassword)
    if(!isPassCorrect){
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Password Change successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res
    .status(200)
    .json(200,req.user,"current user fetched successfully")
})

const updateAccountDetails = asyncHandler(async(req,res) => {
    const {fullName,email} = req.body

    if(!fullName || !email){
        throw new ApiError(400,"All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                fullName,
                email : email
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))
    
})

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(400,"Error while uploading on avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
            avatar : avatar.url
        }
    },{new : true})
    .select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover iamge file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(400,"Error while uploading on coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set: {
            coverImage : coverImage.url
        }
    },{new : true})
    .select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"CoverImage updated successfully")
    )
})

const userChannelProfile = asyncHandler(async(req,res) => {
   const {username} = req.params

   if(!username?.trim()){
    throw new ApiError(400,"username is missing")
   }

   const channel = await User.aggregate([
    {
        $match : {
            username : username?.toLowerCase()
        }
    },
    {
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as : "subscribers"
        }
    },
    {
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as : "subscribedTo"
        }
    },
    {
        $addFields:{
            subscribersCount : {
                $size : "$subscribers"
            },
            channelsSubscribedToCount : {
                $size : "subscribedTo"
            },
            isSubscribed: {
                $cond: {
                    if: {$in: [req.user?._id,"$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            }
        }
    },
    {
        $project: {
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            channelsSubscribedToCount: 1,
            isSubscribed: 1,
            avatar: 1,
            coverImage: 1,
            email: 1
        }
    }
   ])

   if(!channel?.length){
    throw new ApiError(404,"channel does not exists")
   }

   return res
   .status(200)
   .json(
        new ApiResponse(200,channel[0],"User channel fetched successfully")
   )

})

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id : new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from : "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline : [
                    {
                        $lookup: {
                            from : "users",
                            localField: "owner",
                            foreignField: "_id",
                            as : "owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch History fetched successfully"

        )
    )
}
)

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails, 
    updateUserAvatar,
    updateUserCoverImage,
    userChannelProfile,
    getWatchHistory
}