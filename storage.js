const StorageManager = {
    getUser() {
        const saved = localStorage.getItem("permanent_device_identity");
        if (!saved) {
            return {
                id: "IN-DEMO-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
                name: "PGN User",
                state: "IN"
            };
        }
        try {
            return JSON.parse(saved);
        } catch (e) {
            return { id: "IN-DEMO-USER", name: "PGN User", state: "IN" };
        }
    },
    getContacts() {
        return JSON.parse(localStorage.getItem("pgn_contacts") || "{}");
    },
    saveContact(id) {
        const contacts = this.getContacts();
        if (!contacts[id]) {
            const parts = id.split("-");
            contacts[id] = {
                name: parts[2] || id.substring(0, 8),
                state: parts[1] || "IN",
                timestamp: Date.now()
            };
            localStorage.setItem("pgn_contacts", JSON.stringify(contacts));
        }
    },
    saveMessage(id, type, content, direction) {
        const key = "pgn_chat_" + id;
        const history = JSON.parse(localStorage.getItem(key) || "[]");
        history.push({ type, content, direction, time: Date.now() });
        localStorage.setItem(key, JSON.stringify(history));
    },
    getChatHistory(id) {
        return JSON.parse(localStorage.getItem("pgn_chat_" + id) || "[]");
    }
};
