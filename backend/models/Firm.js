const mongoose=require("mongoose");

const FirmSchema=new mongoose.Schema({
  name:{
    type:String,
    required:true,
  },
  address:{
    type:String,
    required:true,
  },
  gstNumber: {
    type:String,
    required:true,
  },
 owner: {
    type:mongoose.Schema.Types.ObjectId,
    required:true,
    ref:"User"
  }
},{ timestamps: true })

const Firm=mongoose.model("firm",FirmSchema)
module.exports=Firm;