const aws = require('aws-sdk'),
Db = require('./database'),
    S3bk = 'dndleon',
    s3 = new aws.S3({
        region: 'us-east-2',
        sslEnabled: true,
        accessKeyId: "AKIAZAJ4S56AOTISMCG4",
        secretAccessKey: "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"
    }),
    returnResp = (res, data) => {
        res.status(201).json(data)
    },
    socketSend = (socket, data) => {
        try{
            socket.send(JSON.stringify(data))

        }catch{
            console.log('erro')
        }
    },
    removePic = (pic) => {
        if(pic){
        var removePic =  pic.split('%')[1] ? pic.split('%')[1] : '';
        if (removePic) {
            const filename = 'uploads/' + removePic.substr(2, removePic.length - 2);
            const s3Params = {
                Bucket: S3bk,
                Key: filename,
            };
            s3.deleteObject(s3Params, function (err, resp) {
                if (err)
                    console.log(err);
                else
                    console.log(resp)
            })
        }
    }
    }
module.exports = {
    returnResp,
    socketSend,
    removePic
}