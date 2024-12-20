import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    try {
        // Pagination
        const skip = (page - 1) * limit;

        // Build the search filter
        const filter = {
            ...(query && { title: { $regex: query, $options: "i" } }), // Case-insensitive search by title
            ...(userId && { userId }) // Filter by userId if provided
        };

        // Sort options
        const sortOptions = { [sortBy]: sortType === "desc" ? -1 : 1 };

        // Fetch videos with filters, sorting, and pagination
        const videos = await Video.find(filter)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit));

        // Get the total count for pagination metadata
        const totalVideos = await Video.countDocuments(filter);

        // Response with videos and metadata
        res.status(200).json({
            success: true,
            data: videos,
            pagination: {
                totalVideos,
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalVideos / limit),
                limit: parseInt(limit),
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400,"Video is required")
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,"Thumbnail is required")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath)
    if(!videoFile){
        throw new ApiError(400,"Video is required")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400,"Thumbnail is required")
    }
    console.log(videoFile);
    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title,
        durations:videoFile.duration,
        description,
        owner: req.user
    })

    const publishedVideo = await Video.findById(video.id)
    if(!publishedVideo){
        throw new ApiError(500,"Something went wrong while publishing the video")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(200,publishedVideo,"Video Published succesfully")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(500,"Video not found")
    }
    return res.status(200)
    .json(
        new ApiResponse(200,video,"Video found")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    const video = Video.findById(videoId);
    if(!video){
        throw new ApiError(500,"Video not found")
    }
    const {title,description} = req.body
    if(!title || !description){
        throw new ApiError(400,"All fields are required")
    }

    // const flag = 0;
    // const thumbnail = video.thumbnail;
    // const thumbnailLocalPath = req.files?.path 
    // if(!thumbnailLocalPath){
    //     flag = 1;
    // }
    // if(!flag){
    //     thumbnail = await uploadOnCloudinary(thumbnailLocalPath).url;
    // }


    const newVideo = await Video.findByIdAndUpdate(
        video._id,
        {
            $set : {
                title : title,
                description : description,
                // thumbnail : thumbnail
            }
        },
        {new : true}
    )

    return res
    .status(200)
    .json(
        new ApiResponse(200,newVideo,"Video details updated succesfully")
    )


})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const deletedVideo = Video.findByIdAndDelete(videoId);

    if(!deletedVideo){
        throw new ApiError(404,"Video not found")
    }
    return res
    .status(200)
    .json(new ApiResponse(200,{},"Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video = Video.findById(videoId);
    if(!video){
        throw new ApiError(500,"Video not found")
    }
    const newVideo = Video.findByIdAndUpdate(video._id,{
        $set : {
            isPublished : !video.isPublished
        }
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,newVideo,"Video details updated succesfully isPublished")
    )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}