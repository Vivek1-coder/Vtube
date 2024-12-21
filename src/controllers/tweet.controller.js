import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet

    const { content } = req.body;
    console.log(content)
    if(!content){
        throw new ApiError(404,"Content is required")
    }
    const user = req.user
    if(!user){
        throw new ApiError(404,"User is required")
    }

    const tweet = await Tweet.create({
        owner : user,
        content : content
    })

    if(!tweet){
        throw new ApiError(404,"Something went wrong while making tweet")
    }
    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"Tweet done successfully")
    )

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;
    if(!userId){
        throw new ApiError(404,"User id is required")
    }
    const user = await User.findById(userId)
    if(!user){
        throw new ApiError(404,"User does not exist")
    }
    const tweets = await Tweet.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project : {
                content : 1
            }
        }
    ])
    if(!tweets){
        throw new ApiError(404,"Error occured while retrieving the tweets")
    }
    return res
    .status(200)
    .json( new ApiResponse(200,tweets,"Retrieved successfully") )
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content} = req.body
    if(!tweetId){
        throw new ApiError(404,"Tweet Id not found")
    }
    if(!content){
        throw new ApiError(404,"Content is required")
    }
    const tweet = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set : {
                content : content
            }
        },
        {
            new : true
        }
    )
    if(!tweet){
        throw new ApiError(404,"Tweet not found in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,tweet,"Tweet Updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    if(!tweetId){
        throw new ApiResponse(404,"Tweet id is empty")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);
    if(!deleteTweet){
        throw new ApiError(500,"Something went wrong while deleting the tweet")
    }


    return res.
    status(200)
    .json(new ApiResponse(200,deletedTweet,"Tweet deleted successfully"))
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}