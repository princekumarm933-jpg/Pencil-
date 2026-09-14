const CallManager = {
    currentCall: null,
    localStream: null,
    incomingCall: null,
    incomingVideo: false,
    callStartTime: null,
    callTimerInterval: null,
    ringtone: null,

    async startCall(isVideo) {
        if (!ChatManager.currentPeerId) return alert("पहले contact चुनें");
        if (!App.peer) return alert("Calling system तैयार नहीं है");

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
            this.openCallScreen(ContactManager.getContactName(ChatManager.currentPeerId), isVideo);
            document.getElementById("localVideo").srcObject = this.localStream;

            const call = App.peer.call(ChatManager.currentPeerId, this.localStream, {
                metadata: { isVideo: isVideo }
            });
            this.setupCall(call, isVideo);
        } catch (err) {
            alert("Microphone/Camera error: " + err.message);
        }
    },

    handleIncomingCall(call) {
        this.incomingCall = call;
        this.incomingVideo = !!(call.options && call.options.metadata && call.options.metadata.isVideo);
        const name = ContactManager.getContactName(call.peer);

        document.getElementById("incomingName").innerText = name;
        document.getElementById("incomingAvatar").innerText = name.charAt(0).toUpperCase();
        document.getElementById("incomingType").innerText = this.incomingVideo ? "Incoming Video Call" : "Incoming Audio Call";
        document.getElementById("incomingScreen").classList.add("show");
        this.playRingtone();
    },

    async acceptIncoming() {
        this.stopRingtone();
        if (!this.incomingCall) return;

        try {
            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: this.incomingVideo });
            document.getElementById("incomingScreen").classList.remove("show");

            ChatManager.currentPeerId = this.incomingCall.peer;
            StorageManager.saveContact(ChatManager.currentPeerId);

            this.openCallScreen(ContactManager.getContactName(ChatManager.currentPeerId), this.incomingVideo);
            if (this.incomingVideo) {
                document.getElementById("localVideo").srcObject = this.localStream;
            }

            this.incomingCall.answer(this.localStream);
            this.setupCall(this.incomingCall, this.incomingVideo);
            this.incomingCall = null;
        } catch (err) {
            alert("Camera/Microphone error: " + err.message);
            this.rejectIncoming();
        }
    },

    rejectIncoming() {
        this.stopRingtone();
        if (this.incomingCall) {
            this.incomingCall.close();
            this.incomingCall = null;
        }
        document.getElementById("incomingScreen").classList.remove("show");
    },

    setupCall(call, isVideo) {
        this.currentCall = call;
        document.getElementById("callState").innerText = "Connecting...";

        call.on("stream", stream => {
            document.getElementById("remoteVideo").srcObject = stream;
            document.getElementById("callState").innerText = "Call Active";
            this.startTimer();
        });

        call.on("close", () => this.endCall(false));
        call.on("error", () => this.endCall(false));
    },

    endCall(closeRemote = true) {
        this.stopRingtone();
        if (this.currentCall && closeRemote) {
            try { this.currentCall.close(); } catch (e) {}
        }
        this.currentCall = null;
        clearInterval(this.callTimerInterval);

        if (this.localStream) {
            this.localStream.getTracks().forEach(track => track.stop());
            this.localStream = null;
        }

        document.getElementById("remoteVideo").srcObject = null;
        document.getElementById("localVideo").srcObject = null;
        document.getElementById("callScreen").classList.remove("show");
        document.getElementById("callTimer").innerText = "00:00";
    },

    openCallScreen(name, isVideo) {
        document.getElementById("callScreen").classList.add("show");
        document.getElementById("callName").innerText = name;
        document.getElementById("callAvatar").innerText = name.charAt(0).toUpperCase();
        document.getElementById("callTypeText").innerText = isVideo ? "Video Call" : "Audio Call";
        document.getElementById("callVideos").style.display = isVideo ? "block" : "none";
        document.getElementById("audioCallUser").style.display = isVideo ? "none" : "block";
    },

    startTimer() {
        this.callStartTime = Date.now();
        clearInterval(this.callTimerInterval);
        this.callTimerInterval = setInterval(() => {
            const seconds = Math.floor((Date.now() - this.callStartTime) / 1000);
            const min = String(Math.floor(seconds / 60)).padStart(2, "0");
            const sec = String(seconds % 60).padStart(2, "0");
            document.getElementById("callTimer").innerText = min + ":" + sec;
        }, 1000);
    },

    toggleMute() {
        if (!this.localStream) return;
        const track = this.localStream.getAudioTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        document.getElementById("btnMute").classList.toggle("active", !track.enabled);
    },

    toggleCamera() {
        if (!this.localStream) return;
        const track = this.localStream.getVideoTracks()[0];
        if (!track) return;
        track.enabled = !track.enabled;
        document.getElementById("btnCamera").classList.toggle("active", !track.enabled);
    },

    playRingtone() {
        try {
            this.ringtone = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
            this.ringtone.loop = true;
            this.ringtone.play().catch(() => {});
        } catch (e) {}
    },

    stopRingtone() {
        if (this.ringtone) {
            this.ringtone.pause();
            this.ringtone.currentTime = 0;
        }
    }
};
