const Utils = {
    formatTime(time) {
        return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    },
    safeId(value) {
        return value.replace(/[^a-zA-Z0-9]/g, "_");
    },
    escapeHTML(str) {
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};
