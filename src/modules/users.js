const { socketSend, removePic, returnResp } = require('../Functions');
const { find, update, storeUser } = require('../database');
const col = 'Users';
module.exports = (data, socket, clients) => {
    const { action, phone, phoneNumbers, contacts, desc, prevPic, friendId, user, from, to, type } = data;
    switch (action) {
        case 'login':
            find(col, false, { phone: phone }, { __v: 0 }, (user) => {
                if (!user)
                    storeUser(phone, (user) => returnResp(socket, user))
                else
                    returnResp(socket, user)
            })
            break;
        case 'update':
            update(col, false, { _id: user._id }, { $set: user }, (res) => {
                if (prevPic)
                    removePic(data.pic)
                if (socket)
                    returnResp(socket, '')
            })
            break;
        case 'checkNumbers':
            find(col, true, { phone: { $in: phoneNumbers } }, { __v: 0 }, (gtcontacts) =>
                returnResp(socket, gtcontacts.length ? { gtcontacts, contacts, action } : {contacts:[], gtcontacts:[]})
            )
            break;
        case 'checkUser':
            //What if user closed account
            find(col, false, { _id: friendId }, { _id: 0, onlineStatus: 1 }, (resp) => {
                if (resp)
                    socketSend(socket, { action: 'userOnlineStatus', friendId, status: resp.onlineStatus })
            })
            break;
        case 'call':
            var frienSocket = clients.findClient(to);
            if (frienSocket) {
                socketSend(frienSocket, {
                    action: 'incomingCall',
                    type,
                    from,
                    to,
                    desc
                })
            } else {
                //friend is offline
            }
            break;
        case 'received':
            var frienSocket = clients.findClient(to);
            //console.log(frienSocket)
            if (frienSocket) {
                socketSend(frienSocket, {
                    action: 'callReceived',
                    from,
                    to,
                    desc
                })
            }
            break;
    }
}