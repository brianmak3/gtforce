const Mongoose = require('mongoose'),
schema = new Mongoose.Schema({
    fromId:String,
    toId: String,
    type:{type:String},
    friendPhone:String,
    friendId:String,
    date: Number,
    marked:{type:Boolean, default:false}
})
module.exports = Mongoose.model('calls', schema)