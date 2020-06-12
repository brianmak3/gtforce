
const mongoose = require('mongoose'),
 reportSchema = new mongoose.Schema({
    phone:String,
    reports:[
        {
            byId:String,
            date:String,
            report:String,
            action:String
        }
    ]
})
module.exports = mongoose.model('reports', reportSchema);