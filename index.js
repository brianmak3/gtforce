
const
  express = require('express'),
  app = express(),
  http = require('http').Server(app),
  cors = require('cors'),
  Clients = require('./src/client'),
  io = require('socket.io')({ path: '/io/webrtc' }),
  clients = new Clients(),
  Db = require('./src/database'),
  Modules = require('./src/modules'),
  bodyParser = require('body-parser'),
  WebSocket = require('ws'),
  { returnResp } = require('./src/Functions')
mongoose = require('mongoose');
mongoose.connect('mongodb://gtForceUser:gtForcePassword@127.0.0.1/gt', { useNewUrlParser: true, useUnifiedTopology: true }, (err, res)=>{
  if(err)
   throw err
   else 
   console.log('connected')
});
// mongoose.connect('mongodb://127.0.0.1/gt', { useNewUrlParser: true, useUnifiedTopology: true });
//mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://dndlionuser:dndlionpass@cluster0-sc27x.mongodb.net/Sagar?retryWrites=true&w=majority',{ useNewUrlParser: true });
app.use(cors());
app.use(express.static('www'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
wss = new WebSocket.Server({
  'server': http,
  perMessageDeflate: {
    zlibDeflateOptions: {
      // See zlib defaults.
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    // Other options settable:
    clientNoContextTakeover: true, // Defaults to negotiated value.
    serverNoContextTakeover: true, // Defaults to negotiated value.
    serverMaxWindowBits: 10, // Defaults to negotiated value.
    // Below options specified as default values.
    concurrencyLimit: 10, // Limits zlib concurrency for perf.
    threshold: 1024 // Size (in bytes) below which messages
    // should not be compressed.
  }
});
wss.on('connection', (socket) => {
  socket.setMaxListeners(0);
  socket.on('message', (data) => {
    data = JSON.parse(data);
    const { userId } = data;
    if (userId) {
      socket.id = userId;
      clients.saveClient(userId, socket)
      Modules['users']({ action: 'update', user: { _id: userId, onlineStatus: 'Online' } })
    }
    const { page } = data.data ? data.data : data;
    if (page)
      Modules[page](data.data ? data.data : data, socket, clients);
    socket.on('close', () => {
      clients.deleteClient(socket.id)
      Modules['users']({ action: 'update', user: { _id: socket.id, onlineStatus: Date.now(), socket: '' } })
      //emit to all friends that user is disconnected 
    })
  })
})
app.post('/users', (req, res) => {
  Modules['users'](req.body, res);
})
app.post('/reports', (req, res) => {
  Modules['reports'](req.body, (resp) => {
    returnResp(res, resp)
  });
})
app.post('/messages', (req, res) => {
  Modules['messages'](req.body, res, clients);
  returnResp(res, {})
})
app.post('/appData', (req, res) => {
  var data = req.body;
  switch (data.action) {
    case 'login':
      console.log(data);
      break;
    case 'newMessage':
      var deliVStatus = 'sent';
      if (findClient(data.toId).found) {
        data.friend = data.fromId
        SendData(data.toId, data)
        deliVStatus = 'delivered'
      }
      else {
        data.friend = data.fromId;
        data.unread = true;
        Db.saveMess(data, null)
      }
      returnResp(res, {
        id: data.id,
        toId: data.toId,
        delivStatus: deliVStatus
      })
      break;

  }
})

const port = process.env.PORT || 3001;
const server = http.listen(port, () => {
  console.log('listening on port', port);
});
io.listen(server)
io.on('connection', socket => {
  //console.log(socket.request._query)
});
const peers = io.of('/webrtcPeer');
let connectedPeers = new Map()
peers.on('connection', socket => {
  const { userId } = socket.request._query
  connectedPeers.set(userId, socket)
  socket.on('offerOrAnswer', data => {
    const { payload } = data;
    var { type, sdp, friendId, calling, caller, call } = payload;
    if (call) {
       var { fromId, friendPhone, myPhone } = call
      call = {...call, friendId: fromId, myPhone:friendPhone, friendPhone:myPhone}
    }
    if (clients.findClient(friendId)) {
      if (calling)
        SendData(friendId, {
          type,
          caller,
          friend: caller,
          sdp,
          call,
          action: 'incomingCall'
        })
      else {
        const sqt = connectedPeers.get(friendId)
        if (sqt)
          sqt.emit('offerOrAnswer', sdp)
      }
    } else if (calling) {
      call.action = 'save';
      Modules['calls'](call, () => socket.emit('callFail', 'offline'))
    }

  })
  socket.on('endCall', friend => {
    if (connectedPeers.get(friend))
      connectedPeers.get(friend).emit('endCall')
  })
  socket.on('candidate', (data) => {
    var { payload } = data;
    var { friendId, candidate } = payload;
    // send candidate to the other peer(s) if any
    for (const [socketID, socket] of connectedPeers.entries()) {
      // don't send to self
      if (socketID !== candidate.socketID) {
        socket.emit('candidate', { friendId, candidate })
      }
    }
  })
  //console.log(connectedPeers)
})

const SendData = (userId, data) => {
  if (clients.findClient(userId))
    clients.findClient(userId).send(JSON.stringify(data))
}


