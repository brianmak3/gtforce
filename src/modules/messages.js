const { find, update, saveMess, Delete } = require('../database'),
    { socketSend, returnResp } = require('../Functions'),
    newMessage = (socket, data, clients) => {
        var deliVStatus = 'sent';
        const { id, toId, fromId } = data;
        data.friend = fromId
        find('Users', false, { _id: toId }, { _id: 1, deviceToken: 1, onlineStatus: 1 }, (user) => {
            if (user.onlineStatus == 'Online' && clients.findClient(toId)) {
                socketSend(clients.findClient(toId), data)
            } else {
                data.unread = true;
                saveMess(data, null)
            }
            socketSend(socket, {
                action: 'updateMess',
                id: id,
                toId: toId,
                delivStatus: deliVStatus
            });
            //sendNotification(user.deviceToken, data);
            //console.log(user)
        })
    },
    sendToFriend = (clients, to, data) => {
        if (clients.findClient(to))
            socketSend(clients.findClient(to), data)
    },
    handleMessageDelivery = (data, clients) => {
        find('Users', false, { _id: data.friendId, onlineStatus: 'Online' }, { _id: 1 }, (user) => {
            if (user)
                sendToFriend(clients, data.friendId, data)
            else
                update('Users', false, { _id: data.friendId }, {
                    $push: {
                        delRead: {
                            friendId: data.friendId,
                            chats: data.chats,
                            delivStatus: data.delivStatus
                        }
                    }
                })
        })
    },
    getUndelivered = (socket, userId) => {
        find('Mess', true, { toId: userId }, { _id: 0 }, (messages) =>
            Delete('Mess', true, { toId: userId }, () => {
                find('Users', false, { _id: userId }, { delRead: 1, _id: 0 }, drafts =>
                    find('Calls', true, { toId: userId }, {}, (missedCalls) =>{
                       Delete('Calls', true, { toId: userId }, () => {
                            socketSend(socket, {missedCalls, messages, drafts, action: 'undelivered' })
                            update('Users', false, { _id: userId }, { $set: { drafts: [] } })
                       })
                    })
                )
            })
        )
    }

module.exports = (data, socket, clients) => {
    const { action, chats, userOnline, to, userId } = data;
    switch (action) {
        case 'newMessage':
            newMessage(socket, data, clients);
            break;
        case 'drafts':
            getUndelivered(socket, userId);
            chats.forEach(chat => {
                chat.action = 'newMessage';
                newMessage(socket, chat, clients);
            })
            break;
        case 'typing':
            if (userOnline === 'Online' || userOnline === 'Typing...') {
                data.action = 'userOnlineStatus';
                if (clients.findClient(to))
                    sendToFriend(clients, to, data)
            }
        case 'updateRead':
            handleMessageDelivery(data, clients);
            break;
    }
}