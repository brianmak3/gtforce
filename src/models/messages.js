const mongoose =require('mongoose'),
Schema = new mongoose.Schema({
    text:String,
    time:Date,
    toId:String,
    fromId:String,
    delivStatus:String,
    friend:String,
    unread:false,
    media:{
        uri0:String,
        type:{type:String},
        height:Number,
        width:Number,
        download:{type: Boolean, default:false}
    },
    id:Number
}) 
module.exports=mongoose.model('messages',Schema)