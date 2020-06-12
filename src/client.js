class Clients {
    constructor() {
      this.clientList = {};
      this.saveClient = this.saveClient.bind(this);
    }
    saveClient(userId, client) {
      this.clientList[userId] = client
    }
    findClient(userId) {
      return this.clientList[userId];
    }
    deleteClient(userId){
        delete this.clientList[userId]
    }
  }
  module.exports = Clients;