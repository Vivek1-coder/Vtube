// require('dotenv').config({path : './env'})
import dotenv from "dotenv"
import app from "./app.js"
import connectDB from  "./db/index.js"

dotenv.config({
    path : './env'
})

// as it is async await it will return a promise
connectDB()
.then(()=>{
    app.on("error", (error)=>{
        console.log("Eror : ",error);
        throw error
    })

    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!! ",error)
})








/* 
// First approach to connect db
import express from "express"
import { DB_NAME } from "./constants";
const app = express()


// ()() turant hi execute karva do iffi approach
// function connectDB(){}

// connectDB()
// ; is just for cleaning function
;(async()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error)=>{
            console.log("Eror : ",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`App is listening on ${process.env.PORT}`)
        })
    }catch(error){
        console.log(`Error in database connection : ${error}/DB_NAME`)
        throw error
    }

})()
    */