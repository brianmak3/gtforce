const Reports = require('../models/reports'),
    { find, update } = require('../database');
module.exports = (data, callback) => {
    const { action, phone, reports } = data;
    switch (action) {
        case "reportContact":
            find('Reports', false, { phone }, {_id:1}, (user) => {
                if (user)
                    update('Reports', false, { phone }, { $push: { reports } }, 
                    ()=>callback('Your report has been submitted succcessifully'))
                else {
                    const newReport = new Reports(data);
                    newReport.save((err, res) => {
                        if (err)
                            throw err;
                        else
                        callback('Your report has been submitted succcessifully')
                    })
                }

            })

            break;
    }
}