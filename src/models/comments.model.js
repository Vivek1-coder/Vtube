import mongoose,{Schema} from "mongoose";

const commentSchema = new Schema({
    content : {
        type : String,
        required : true
    },
    video : {
        type : Schema.Type.ObjectId,
        ref : "Video"
    },
    user : {
        type : Schema.Type.ObjectId,
        ref : "User"
    }
},{
    timestamps: true
})

export const Comment = mongoose.model("Comment",commentSchema)