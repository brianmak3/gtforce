const mongoose = require('mongoose'),
Schema = new mongoose.Schema({
    phone:{type:String, required:true},
    name:String,
    status:String,
    pic:String,
    status:String,
    onlineStatus:String,
    socket:String,
    subscriptionEnds:Number,
    dateReg:Number,
    paymentMode:'',
    delRead:[
        {
            friendId:String,
            chats:[],
            delivStatus:String
        }
    ],
})
module.exports = mongoose.model('Users',Schema)