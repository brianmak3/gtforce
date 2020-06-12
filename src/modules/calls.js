const Calls = require('../models/calls');
module.exports = (call, callBack) => {
    const { action } = call;
    switch (action) {
        case 'save':
            var newCall = new Calls(call);
            newCall.save((err, res) => {
                if (err)
                    throw err;
                    callBack(res)
            })
            break;
    }

}