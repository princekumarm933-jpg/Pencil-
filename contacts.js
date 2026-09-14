const ContactManager = {
    currentTab: "chats",

    getContactName(id) {
        const contacts = StorageManager.getContacts();
        return contacts[id] ? contacts[id].name : id;
    },

    renderList() {
        const list = document.getElementById("list");
        list.innerHTML = "";
        const search = document.getElementById("searchInput").value.toLowerCase();
        const contacts = StorageManager.getContacts();

        Object.keys(contacts).forEach(id => {
            const c = contacts[id];
            if (search && !c.name.toLowerCase().includes(search)) return;

            const div = document.createElement("div");
            div.className = "item";
            div.innerHTML = `
                <div class="avatar">${Utils.escapeHTML(c.name.charAt(0).toUpperCase())}</div>
                <div class="item-main">
                    <div class="item-name">
                        ${Utils.escapeHTML(c.name)}
                        <span class="online-dot" id="dot-${Utils.safeId(id)}"></span>
                    </div>
                    <div class="item-preview">${id}</div>
                </div>
            `;
            div.onclick = () => ChatManager.openChat(id);
            list.appendChild(div);
        });

        if (!Object.keys(contacts).length) {
            list.innerHTML = `
                <div style="padding:25px;color:#718579;text-align:center">
                    No contacts yet.<br><br>Connect to a Peer ID to begin.
                </div>
            `;
        }
    },

    updateProfileUI(user) {
        const name = user.name || "User";
        const initial = name.charAt(0).toUpperCase();
        document.getElementById("profileMini").innerText = initial;
        document.getElementById("profileBig").innerText = initial;
        document.getElementById("profileName").innerText = name;
        document.getElementById("profileId").innerText = "ID: " + user.id;
        document.getElementById("profileState").innerText = "State: " + (user.state || "--");
    }
};
