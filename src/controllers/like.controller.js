import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(404,"Video is required")
    }
    const userId = req.user._id
    if(!userId){
        throw new ApiError(404,"User is required")
    }
    const likedvideo = await Like.findOne({video : videoId,likedBy : userId})
    if(likedvideo){
       const deletedLike = await Like.findByIdAndDelete(likedvideo._id)

        return res
        .status(200)
        .json(new ApiResponse(200,deletedLike,"Unliked successful"))
    }
    else{
        const video = await Video.findById(videoId)
        const newLike = await Like.create({
            video : video,
            likedBy : req.user
        })

        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"liked successful"))
    }

    

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(404,"comment is required")
    }
    const userId = req.user._id
    if(!userId){
        throw new ApiError(404,"User is required")
    }
    const likedComment = await Like.findOne({comment : commentId,likedBy : userId})
    if(likedComment){
       const deletedLike = await Like.findByIdAndDelete(likedComment._id)

        return res
        .status(200)
        .json(new ApiResponse(200,deletedLike,"Unliked successful"))
    }
    else{
        const comment = await Comment.findById(commentId)
        const newLike = await Like.create({
            comment : comment,
            likedBy : req.user
        })

        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"liked successful"))
    }


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(404,"tweetId is required")
    }
    const userId = req.user._id
    if(!userId){
        throw new ApiError(404,"User is required")
    }
    const likedTweet = await Like.findOne({tweet : tweetId,likedBy : userId})
    if(likedTweet){
       const deletedLike = await Like.findByIdAndDelete(likedTweet._id)

       if(!deletedLike){
        throw new ApiError(404,"Something went wrong while deleting like")
       }

        return res
        .status(200)
        .json(new ApiResponse(200,deletedLike,"Unliked successful"))
    }
    else{
        const tweet = await Tweet.findById(tweetId)
        const newLike = await Like.create({
            tweet : tweet,
            likedBy : req.user
        })

        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"liked successful"))
    }

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    // Get all liked videos for a user
    const userId = req.user._id;
    if (!userId) {
        throw new ApiError(404, "User required");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: userId // Match likes by the user
            }
        },
        {
            $lookup: {
                from: "videos", // Reference the 'videos' collection
                localField: "video", // Field in the 'Like' collection
                foreignField: "_id", // Corresponding field in the 'videos' collection
                as: "videoDetails" // Alias for the joined data
            }
        },
        {
            $unwind: "$videoDetails" // Flatten the video details array
        },
        {
            $project: {
                video: "$videoId", // Keep the video ID
                videoTitle: "$videoDetails.title", // Include video title
                thumbnail: "$videoDetails.thumbnail", // Include thumbnail
                likedAt: "$createdAt" // Optionally include the timestamp of the like
            }
        }
    ]);

    if (!likedVideos || likedVideos.length === 0) {
        throw new ApiError(404, "No liked videos found");
    }

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}