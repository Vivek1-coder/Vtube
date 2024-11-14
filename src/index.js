// require('dotenv').config({path : './env'})
import dotenv from "dotenv"

import connectDB from  "./db/index.js"

dotenv.config({
    path : './env'
})


connectDB()








/* 
// First approach to connect db
import express from "express"

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