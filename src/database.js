const
    Users = require('./models/users'),
    Mess = require('./models/messages'),
    Reports = require('./models/reports'),
    Calls = require('./models/calls'),
    Collections = {  Users, Mess, Reports , Calls},
    saveMess = (mess, callback) => {
        var newMess = new Mess(mess);
            newMess.save((err, res) => resp(err, res, callback));
    },
    storeUser = (phone, callback) => {
        const dateReg = Date.now();
        var newUser = new Users({phone, dateReg, subscriptionEnds: dateReg+(30*24*60*60*1000)});
        newUser.save((err, res) => resp(err, res, callback));
    },
    find = (coll, many, match, project, callback) => {
        coll = Collections[coll];
        if (many)
            coll.find(match, project, (err, res) => resp(err, res, callback))
        else
            Users.findOne(match, project, (err, res) => resp(err, res, callback))
    },
    update = (coll, many, match, update, callback) => {
        coll = Collections[coll];
        if (many)
            coll.updateMany(match, update, (err, res) => resp(err, res, callback))
        else
            coll.updateOne(match, update, (err, res) => resp(err, res, callback))
    },
    Delete = (coll, many, match, callback) => {
        coll = Collections[coll];
        if (many)
            coll.deleteMany(match, (err, res) => resp(err, res, callback))
        else
            coll.deleteOne(match, (err, res) => resp(err, res, callback))
    },
    resp = (err, res, callback) => {
        if (err)
            throw err;
        else if (callback) {
            callback(res)
        }
    }
module.exports = {
    find,
    storeUser,
    update,
    Delete,
    saveMess
}