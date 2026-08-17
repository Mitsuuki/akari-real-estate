// --- 100% BULLETPROOF CLOUDFLARE URL ---
const BASE_WEBHOOK_URL = "https://ships-generators-relative-wma.trycloudflare.com/webhook/apex-web-hub";

let currentImageBase64 = "";
let isSending = false; 

// Lightbox Functions
function openGallery(imgSrc, caption) {
    document.getElementById('lightbox-img').src = imgSrc;
    document.getElementById('lightbox-caption').innerText = caption;
    document.getElementById('lightbox').classList.add('active');
}
function closeGallery(e) {
    if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) {
        document.getElementById('lightbox').classList.remove('active');
    }
}

// --- EMAIL PING LOGIC ---
function checkEmailInput() {
    const emailInput = document.getElementById("demo-alert-dest");
    const pingNav = document.getElementById("dev-ping");
    const pingInput = document.getElementById("input-ping");
    
    if(emailInput.value.trim() !== "") {
        if(pingNav) pingNav.style.display = "none";
        if(pingInput) pingInput.style.display = "none";
        emailInput.classList.add("filled");
    } else {
        if(pingNav) pingNav.style.display = "inline-block";
        if(pingInput) pingInput.style.display = "inline-block";
        emailInput.classList.remove("filled");
    }
}

function toggleBackend() { 
    document.getElementById('backendPanel').classList.toggle('open'); 
    
    // Auto-focus the email box when they open it, if it's empty
    const emailInput = document.getElementById("demo-alert-dest");
    if(emailInput && emailInput.value.trim() === "") {
        setTimeout(() => emailInput.focus(), 400);
    }
}

function refreshFrame(id) {
    const frame = document.getElementById(id);
    const btn = document.getElementById('btn-' + id);
    
    btn.classList.add('spinning');
    setTimeout(() => btn.classList.remove('spinning'), 600);
    
    const currentSrc = frame.src;
    frame.src = '';
    setTimeout(() => { frame.src = currentSrc; }, 100);
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.toggle('open');
    toggleBtn.classList.toggle('hidden');
    if (chat.classList.contains('open')) document.getElementById('user-input').focus();
}

setTimeout(() => {
    if (window.innerWidth > 768) {
        const chat = document.getElementById('chatContainer');
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (!chat.classList.contains('open')) {
            chat.classList.add('open');
            toggleBtn.classList.add('hidden');
        }
    }
}, 2000);

function openChatWithPrefill(text) {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.add('open');
    toggleBtn.classList.add('hidden');
    const input = document.getElementById('user-input');
    input.value = text;
    input.style.height = "auto";
    input.style.height = (input.scrollHeight) + "px";
    input.focus();
}

const userInput = document.getElementById("user-input");
userInput.addEventListener("input", function() {
    this.style.height = "auto";
    this.style.height = (this.scrollHeight) + "px";
});

document.getElementById('file-input').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(event) {
        currentImageBase64 = event.target.result;
        document.getElementById('image-preview-container').style.display = 'block';
        document.getElementById('image-preview-img').src = currentImageBase64;
        document.getElementById('user-input').focus();
    };
    reader.readAsDataURL(file);
});

function removeImage() {
    currentImageBase64 = "";
    document.getElementById('image-preview-container').style.display = 'none';
    document.getElementById('file-input').value = "";
}

const sessionId = "session_" + Math.floor(Math.random() * 1000000000);
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

function appendMessage(text, sender) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerHTML = text; 
    chatBox.insertBefore(msgDiv, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendImageMessage(base64Str) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg user-img`;
    msgDiv.innerHTML = `<img src="${base64Str}">`; 
    chatBox.insertBefore(msgDiv, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendButtons(buttonsArray) {
    if (!buttonsArray || buttonsArray.length === 0) return;
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "8px";
    container.style.marginTop = "5px";
    
    buttonsArray.forEach(btnText => {
        const btn = document.createElement("button");
        btn.className = "time-slot-btn";
        btn.innerText = btnText;
        btn.onclick = () => {
            container.style.display = "none";
            userInput.value = btnText;
            userInput.style.height = "auto";
            sendMessage();
        };
        container.appendChild(btn);
    });
    chatBox.insertBefore(container, typingIndicator);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() { typingIndicator.style.display = "flex"; chatBox.scrollTop = chatBox.scrollHeight; }
function hideTyping() { typingIndicator.style.display = "none"; }

function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
}

async function sendMessage() {
    if (isSending) return;
    const text = userInput.value.trim();
    if (!text && !currentImageBase64) return;

    isSending = true;

    if (currentImageBase64) appendImageMessage(currentImageBase64);
    if (text) appendMessage(text, "user");

    const payloadText = text;
    const payloadImage = currentImageBase64;

    userInput.value = "";
    userInput.style.height = "auto";
    removeImage();
    userInput.disabled = true;
    sendBtn.disabled = true;
    
    showTyping();

    const term = document.getElementById("telemetryTerminal");

    try {
        const demoDest = document.getElementById("demo-alert-dest") ? document.getElementById("demo-alert-dest").value.trim() : "";

        // COMMAND LINE LOGIC
        term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > POST /api/v1/engine/transmit ... <span style="color:#e2e8f0">[PENDING]</span>`;
        term.scrollTop = term.scrollHeight;

        const liveUrl = BASE_WEBHOOK_URL + "?t=" + Date.now();
        const response = await fetch(liveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                sessionId: sessionId, 
                message: payloadText,
                image_url: payloadImage,
                alert_destination: demoDest 
            })
        });

        const data = await response.json();
        hideTyping();
        appendMessage(data.text || "Sorry, I encountered an error.", "bot");
        
        if (data.buttons) {
            appendButtons(data.buttons);
        }

        term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > RESPONSE RECEIVED ... <span style="color:#10b981">[200 OK]</span>`;

        // Telemetry Simulation for Real Estate (Checking for booking intents)
        if (data.text.includes("scheduled") || data.text.includes("saved") || data.text.includes("confirmed") || text.toLowerCase().includes("book") || text.toLowerCase().includes("pm") || text.toLowerCase().includes("am") || text.toLowerCase().includes("viewing")) {
            
            setTimeout(() => {
                term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > SQL_INSERT into public.leads ... <span style="color:#10b981">[SUCCESS]</span>`;
                term.scrollTop = term.scrollHeight;
            }, 800);

            setTimeout(() => {
                term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > POST https://www.googleapis.com/calendar/v3/calendars ... <span style="color:#10b981">[SUCCESS]</span>`;
                term.scrollTop = term.scrollHeight;
            }, 1800);

            setTimeout(() => {
                if (demoDest) {
                    term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > DISPATCH_MAIL_SMTP: Routing to <b>${demoDest}</b> ... <span style="color:#3b82f6">[QUEUED & SENT]</span>`;
                    
                    try {
                        let ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        ding.volume = 0.5;
                        ding.play();
                    } catch(e) {}
                    
                    const panel = document.getElementById("backendPanel");
                    if (!panel.classList.contains("open")) {
                        panel.classList.add("open");
                    }
                } else {
                    term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > <span style="color:#f59e0b">WARN: alert_destination is null. Skipping SMTP dispatch.</span>`;
                }
                term.scrollTop = term.scrollHeight;
            }, 3000);
        }

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        appendMessage("Network error or outdated browser detected. Please check your connection or call us directly.", "bot");
        
        term.innerHTML += `<br><span style="color: #64748b">[${getTimestamp()}]</span> > <span style="color:#ef4444">FATAL_ERR: Webhook connection timed out.</span>`;
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
        isSending = false; 
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}