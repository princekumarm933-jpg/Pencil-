const App = {
    currentUser: null,
    peer: null,

    init() {
        this.currentUser = StorageManager.getUser();
        ContactManager.updateProfileUI(this.currentUser);
        ButtonManager.bindEvents();
        this.initPeer();
    },

    initPeer() {
        this.peer = new Peer(this.currentUser.id);

        this.peer.on("open", id => {
            console.log("Peer online:", id);
            ContactManager.renderList();
        });

        this.peer.on("connection", conn => {
            ChatManager.setupDataConnection(conn);
        });

        this.peer.on("call", call => {
            CallManager.handleIncomingCall(call);
        });

        this.peer.on("error", err => {
            console.error("PeerJS error:", err);
        });
    }
};

window.addEventListener("DOMContentLoaded", () => App.init());
