const mongoose =require("mongoose");

function connectdatabase(url){
    return mongoose.connect(url).then(()=>console.log("mongoDB connected successfully")).catch((err)=>console.log(`Error:${err}`));
}

module.exports={connectdatabase};