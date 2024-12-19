import {v2 as cloudinary} from "cloudinary"
import fs from "fs"


// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        //upload file path 
        if (!fs.existsSync(localFilePath)) {
            throw new Error("Avatar file is required but missing");
        }
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : "auto"
        })
        //File has been uploaded successfully
        console.log("File is uploaded successfully on cloudinary",response.url)
        fs.unlinkSync(localFilePath)
        return response;
    }catch(error){
        fs.unlinkSync(localFilePath) // Remove the locally saved temporary file as the upload got failed
    }
}
    
export {uploadOnCloudinary}
    