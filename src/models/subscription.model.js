import mongoose,{Schema} from "mongoose";

const subsSchema = new Schema({
    subscriber : {
        type : Schema.Type.ObjectId,
        ref : "User"
    },
    
    channel : {
        type : Schema.Type.ObjectId,
        ref : "User"
    }
},{
    timestamps : true
})


export const Subscription = mongoose.model("Subscription",subsSchema)