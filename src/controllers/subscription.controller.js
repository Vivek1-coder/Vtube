import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user._id; // Get the user ID from the authenticated user

    try {
        // Check if the subscription already exists
        const existingSubscription = await Subscription.findOne({ channel: channelId, subscriber: userId });

        if (!existingSubscription) {
            // If not subscribed, create a new subscription
            const channel = await User.findById(channelId); // Ensure the channel exists
            if (!channel) {
                throw new ApiError(404, "Channel not found");
            }

            const newSubscription = await Subscription.create({
                subscriber: userId,
                channel: channelId,
            });

            return res.status(201).json(
                new ApiResponse(201, newSubscription, "Subscribed successfully")
            );
        } else {
            // If already subscribed, remove the subscription (unsubscribe)
            await Subscription.findByIdAndDelete(existingSubscription._id);

            return res.status(200).json(
                new ApiResponse(200, existingSubscription, "Unsubscribed successfully")
            );
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel ID is missing");
    }

    // Validate the channel exists
    const channelExists = await User.findById(channelId);
    if (!channelExists) {
        throw new ApiError(404, "Channel not found");
    }

    // Aggregate to fetch subscribers
    try {
        const subscribersList = await Subscription.aggregate([
            {
                $match: {
                    channel: new mongoose.Types.ObjectId(channelId), // Correctly create ObjectId
                },
            },
            {
                $lookup: {
                    from: "users", // Name of the `User` collection
                    localField: "subscriber", // Field in `Subscription` collection
                    foreignField: "_id", // Field in `User` collection
                    as: "subscribers", // Alias for the joined data
                },
            },
            {
                $unwind: "$subscribers", // Flatten the array to simplify the structure
            },
            {
                $project: {
                    subscriber: "$subscribers.username", // Only include the username of subscribers
                },
            },
        ]);

        return res.status(200).json(
            new ApiResponse(200, subscribersList, "Subscribers fetched successfully")
        );
    } catch (error) {
        console.error("Error in aggregation pipeline:", error.message);
        throw new ApiError(500, "An error occurred while fetching subscribers");
    }
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if(!subscriberId){
        throw new ApiError(404,"SubscriberId is empty")
    }

    const subscriber = await User.findById(subscriberId);
    if(!subscriber){
        throw new ApiError(404,"Subscriber is not registered")
    }

    const channelList =await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "channel",
                foreignField : "_id",
                as : "channels"
            }
        },
        {
            $unwind : "$channels"
        },
        {
            $project :{
                channel : "$channels.username"} 
        }
    ]);

    return res.status(200).json(
        new ApiResponse(200, channelList, "Channels fetched successfully")
    );

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}