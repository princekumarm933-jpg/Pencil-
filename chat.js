const ChatManager = {
    activeConnection: null,
    currentPeerId: null,
    typingTimeout: null,

    openChat(id) {
        this.currentPeerId = id;
        StorageManager.saveContact(id);

        document.getElementById("emptyState").style.display = "none";
        document.getElementById("chatView").style.display = "flex";
        document.getElementById("app").classList.add("chat-open");

        const name = ContactManager.getContactName(id);
        document.getElementById("chatName").innerText = name;
        document.getElementById("chatAvatar").innerText = name.charAt(0).toUpperCase();
        document.getElementById("chatStatus").innerText = "Connecting...";

        this.loadHistory(id);
        this.connectToPeer(id);
    },

    closeChat() {
        document.getElementById("app").classList.remove("chat-open");
        document.getElementById("chatView").style.display = "none";
        document.getElementById("emptyState").style.display = "flex";
    },

    connectToPeer(id) {
        if (this.activeConnection && this.activeConnection.peer === id && this.activeConnection.open) {
            document.getElementById("chatStatus").innerText = "online";
            return;
        }
        if (!App.peer) return;
        const conn = App.peer.connect(id);
        this.setupDataConnection(conn);
    },

    setupDataConnection(conn) {
        this.activeConnection = conn;
        StorageManager.saveContact(conn.peer);

        conn.on("open", () => {
            document.getElementById("chatStatus").innerText = "online";
            ContactManager.renderList();
        });

        conn.on("data", data => {
            if (data.type === "CHAT_MSG") {
                StorageManager.saveMessage(conn.peer, "text", data.text, "received");
                this.renderMessage({ type: "text", content: data.text, time: Date.now() }, "received");
            }
            if (data.type === "TYPING" && this.currentPeerId === conn.peer) {
                document.getElementById("typing").innerText = data.value ? "typing..." : "";
            }
            if (data.type === "MEDIA_FILE") {
                StorageManager.saveMessage(conn.peer, data.fileType, data.data, "received");
                this.renderMessage({ type: data.fileType, content: data.data, time: Date.now() }, "received");
            }
        });

        conn.on("close", () => {
            if (this.currentPeerId === conn.peer) {
                document.getElementById("chatStatus").innerText = "offline";
            }
        });
    },

    ensureConnection(callback) {
        if (!this.currentPeerId) {
            alert("पहले contact चुनें");
            return;
        }
        if (this.activeConnection && this.activeConnection.peer === this.currentPeerId && this.activeConnection.open) {
            callback();
            return;
        }
        this.connectToPeer(this.currentPeerId);
        if (this.activeConnection) {
            this.activeConnection.once("open", callback);
        }
    },

    sendMessage() {
        const input = document.getElementById("messageInput");
        const text = input.value.trim();
        if (!text) return;

        this.ensureConnection(() => {
            this.activeConnection.send({ type: "CHAT_MSG", text: text });
            StorageManager.saveMessage(this.currentPeerId, "text", text, "sent");
            this.renderMessage({ type: "text", content: text, time: Date.now() }, "sent");
            input.value = "";
            this.sendTyping(false);
        });
    },

    sendTyping(value) {
        if (this.activeConnection && this.activeConnection.open) {
            this.activeConnection.send({ type: "TYPING", value: value });
        }
    },

    handleTypingInput() {
        this.sendTyping(true);
        clearTimeout(this.typingTimeout);
        this.typingTimeout = setTimeout(() => this.sendTyping(false), 1000);
    },

    sendMedia(file) {
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) {
            alert("Demo version: media size 8MB से कम रखें.");
            return;
        }
        this.ensureConnection(() => {
            const reader = new FileReader();
            reader.onload = () => {
                const type = file.type.startsWith("image/") ? "image" : "video";
                this.activeConnection.send({ type: "MEDIA_FILE", fileType: type, data: reader.result });
                StorageManager.saveMessage(this.currentPeerId, type, reader.result, "sent");
                this.renderMessage({ type: type, content: reader.result, time: Date.now() }, "sent");
            };
            reader.readAsDataURL(file);
        });
    },

    loadHistory(id) {
        const box = document.getElementById("messages");
        box.innerHTML = "";
        const history = StorageManager.getChatHistory(id);
        history.forEach(item => this.renderMessage(item, item.direction));
    },

    renderMessage(item, direction) {
        if (this.currentPeerId === null) return;
        const box = document.getElementById("messages");
        const bubble = document.createElement("div");
        bubble.className = "message " + direction;

        if (item.type === "text") {
            bubble.innerText = item.content;
        } else if (item.type === "image") {
            const img = document.createElement("img");
            img.src = item.content;
            bubble.appendChild(img);
        } else if (item.type === "video") {
            const video = document.createElement("video");
            video.src = item.content;
            video.controls = true;
            bubble.appendChild(video);
        }

        const small = document.createElement("small");
        small.innerText = Utils.formatTime(item.time);
        bubble.appendChild(small);

        box.appendChild(bubble);
        box.scrollTop = box.scrollHeight;
    }
};
