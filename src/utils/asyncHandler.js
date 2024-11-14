const asyncHandler = (requestHandler) =>{
    (req,res,next) =>{
        Promise.resolve(requestHandler(req,res,next)).
        catch((err) => next(err))
    }
}
export {asyncHandler}

// async handler is a higher order function
// it is like ()=>{async()=>{}}

//try catch wala
// const asyncHandler = (fn) => async(req,res,next) =>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(err.code || 500).json({
//             success : false,
//             message : err.message
//         })
//     }
// }

