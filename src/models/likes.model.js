import mongoose,{Schema} from "mongoose";

const likesSchema = new Schema({
    comment : {
        type : Schema.Type.ObjectId,
        ref : "Comment"
    },
    video : {
        type : Schema.Type.ObjectId,
        ref : "Video"
    },
    likedBy : {
        type : Schema.Type.ObjectId,
        ref : "User"
    },
    tweet : {
        type : Schema.Type.ObjectId,
        ref : "Tweet"
    }
},{
    timestamps : true
})

export const Likes = mongoose.model("Likes",likesSchema)

