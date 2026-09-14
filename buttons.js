const ButtonManager = {
    bindEvents() {
        // Search
        document.getElementById("searchInput").addEventListener("input", () => ContactManager.renderList());

        // Sidebar Tabs
        document.querySelectorAll(".tabs button").forEach(btn => {
            btn.addEventListener("click", e => {
                document.querySelectorAll(".tabs button").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                ContactManager.currentTab = e.target.getAttribute("data-tab");
                ContactManager.renderList();
            });
        });

        // Profile Buttons
        document.getElementById("profileMini").addEventListener("click", () => {
            document.getElementById("profilePanel").classList.add("show");
        });
        document.getElementById("btnCloseProfile").addEventListener("click", () => {
            document.getElementById("profilePanel").classList.remove("show");
        });

        // Chat Header Buttons
        document.getElementById("btnBack").addEventListener("click", () => ChatManager.closeChat());
        document.getElementById("btnVoiceCall").addEventListener("click", () => CallManager.startCall(false));
        document.getElementById("btnVideoCall").addEventListener("click", () => CallManager.startCall(true));

        // Composer Buttons
        document.getElementById("btnSend").addEventListener("click", () => ChatManager.sendMessage());
        document.getElementById("messageInput").addEventListener("keydown", e => {
            if (e.key === "Enter") ChatManager.sendMessage();
        });
        document.getElementById("messageInput").addEventListener("input", () => ChatManager.handleTypingInput());

        // Attach Media Button
        const fileInput = document.getElementById("fileInput");
        document.getElementById("btnAttach").addEventListener("click", () => fileInput.click());
        fileInput.addEventListener("change", e => {
            ChatManager.sendMedia(e.target.files[0]);
            e.target.value = "";
        });

        // Call Screen Action Buttons
        document.getElementById("btnMute").addEventListener("click", () => CallManager.toggleMute());
        document.getElementById("btnCamera").addEventListener("click", () => CallManager.toggleCamera());
        document.getElementById("btnEndCall").addEventListener("click", () => CallManager.endCall());

        // Incoming Call Action Buttons
        document.getElementById("btnAcceptCall").addEventListener("click", () => CallManager.acceptIncoming());
        document.getElementById("btnRejectCall").addEventListener("click", () => CallManager.rejectIncoming());
    }
};
