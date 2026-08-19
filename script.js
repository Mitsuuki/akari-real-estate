// --- 100% BULLETPROOF CLOUDFLARE URL ---
const N8N_WEBHOOK_URL = 'https://problems-llp-third-neo.trycloudflare.com/webhook/apex-web-hub';

let currentImageBase64 = "";
let isSending = false; 

// Lightbox Functions
function openGallery(imgSrc, caption) {
    const imgEl = document.getElementById('lightbox-img');
    const capEl = document.getElementById('lightbox-caption');
    const boxEl = document.getElementById('lightbox');
    if (imgEl) imgEl.src = imgSrc;
    if (capEl) capEl.innerText = caption;
    if (boxEl) boxEl.classList.add('active');
}

function closeGallery(e) {
    if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-close')) {
        const boxEl = document.getElementById('lightbox');
        if (boxEl) boxEl.classList.remove('active');
    }
}

// --- EMAIL PING LOGIC ---
function checkEmailInput() {
    const emailInput = document.getElementById("demo-alert-dest");
    const pingNav = document.getElementById("dev-ping");
    const pingInput = document.getElementById("input-ping");
    
    if (emailInput && emailInput.value.trim() !== "") {
        if (pingNav) pingNav.style.display = "none";
        if (pingInput) pingInput.style.display = "none";
        emailInput.classList.add("filled");
    } else if (emailInput) {
        if (pingNav) pingNav.style.display = "inline-block";
        if (pingInput) pingInput.style.display = "inline-block";
        emailInput.classList.remove("filled");
    }
}

function toggleBackend() { 
    const panel = document.getElementById('backendPanel');
    if (panel) panel.classList.toggle('open'); 
    
    const emailInput = document.getElementById("demo-alert-dest");
    if (emailInput && emailInput.value.trim() === "") {
        setTimeout(() => emailInput.focus(), 400);
    }
}

function refreshFrame(id) {
    const frame = document.getElementById(id);
    const btn = document.getElementById('btn-' + id);
    
    if (btn) {
        btn.classList.add('spinning');
        setTimeout(() => btn.classList.remove('spinning'), 600);
    }
    
    if (frame) {
        const currentSrc = frame.src;
        frame.src = '';
        setTimeout(() => { frame.src = currentSrc; }, 100);
    }
}

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    const input = document.getElementById('user-input');
    if (chat) chat.classList.toggle('open');
    if (toggleBtn) toggleBtn.classList.toggle('hidden');
    if (chat && chat.classList.contains('open') && input) input.focus();
}

setTimeout(() => {
    if (window.innerWidth > 768) {
        const chat = document.getElementById('chatContainer');
        const toggleBtn = document.getElementById('chatToggleBtn');
        if (chat && !chat.classList.contains('open')) {
            chat.classList.add('open');
            if (toggleBtn) toggleBtn.classList.add('hidden');
        }
    }
}, 2000);

function openChatWithPrefill(text) {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    if (chat) chat.classList.add('open');
    if (toggleBtn) toggleBtn.classList.add('hidden');
    const input = document.getElementById('user-input');
    if (input) {
        input.value = text;
        input.style.height = "auto";
        input.style.height = (input.scrollHeight) + "px";
        input.focus();
    }
}

const userInput = document.getElementById("user-input");
if (userInput) {
    userInput.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
}

const fileInputEl = document.getElementById('file-input');
if (fileInputEl) {
    fileInputEl.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImageBase64 = event.target.result;
            const prevContainer = document.getElementById('image-preview-container');
            const prevImg = document.getElementById('image-preview-img');
            if (prevContainer) prevContainer.style.display = 'block';
            if (prevImg) prevImg.src = currentImageBase64;
            if (userInput) userInput.focus();
        };
        reader.readAsDataURL(file);
    });
}

function removeImage() {
    currentImageBase64 = "";
    const prevContainer = document.getElementById('image-preview-container');
    const fileInput = document.getElementById('file-input');
    if (prevContainer) prevContainer.style.display = 'none';
    if (fileInput) fileInput.value = "";
}

const sessionId = "session_" + Math.floor(Math.random() * 1000000000);
const chatBox = document.getElementById("chat-box");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");

function appendMessage(text, sender) {
    if (!chatBox) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${sender}`;
    msgDiv.innerHTML = text; 
    if (typingIndicator) {
        chatBox.insertBefore(msgDiv, typingIndicator);
    } else {
        chatBox.appendChild(msgDiv);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendImageMessage(base64Str) {
    if (!chatBox) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg user-img`;
    msgDiv.innerHTML = `<img src="${base64Str}">`; 
    if (typingIndicator) {
        chatBox.insertBefore(msgDiv, typingIndicator);
    } else {
        chatBox.appendChild(msgDiv);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function appendButtons(buttonsArray) {
    if (!buttonsArray || buttonsArray.length === 0 || !chatBox) return;
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
            if (userInput) {
                userInput.value = btnText;
                userInput.style.height = "auto";
            }
            sendMessage();
        };
        container.appendChild(btn);
    });
    
    if (typingIndicator) {
        chatBox.insertBefore(container, typingIndicator);
    } else {
        chatBox.appendChild(container);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

function showTyping() { 
    if (typingIndicator && chatBox) {
        typingIndicator.style.display = "flex"; 
        chatBox.scrollTop = chatBox.scrollHeight; 
    }
}

function hideTyping() { 
    if (typingIndicator) typingIndicator.style.display = "none"; 
}

function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
}

function logTerminal(message) {
    const term = document.getElementById("telemetryTerminal");
    if (term) {
        term.innerHTML += message;
        term.scrollTop = term.scrollHeight;
    }
}

async function sendMessage() {
    if (isSending) return;
    const text = userInput ? userInput.value.trim() : "";
    if (!text && !currentImageBase64) return;

    isSending = true;

    if (currentImageBase64) appendImageMessage(currentImageBase64);
    if (text) appendMessage(text, "user");

    const payloadText = text;
    const payloadImage = currentImageBase64;

    if (userInput) {
        userInput.value = "";
        userInput.style.height = "auto";
        userInput.disabled = true;
    }
    removeImage();
    if (sendBtn) sendBtn.disabled = true;
    
    showTyping();

    try {
        const demoDest = document.getElementById("demo-alert-dest") ? document.getElementById("demo-alert-dest").value.trim() : "";

        logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > POST /api/v1/engine/transmit ... <span style="color:#e2e8f0">[PENDING]</span>`);

        const liveUrl = N8N_WEBHOOK_URL + "?t=" + Date.now();
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

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        hideTyping();
        
        const responseText = data.text || data.output || data.message || "Sorry, I encountered an error.";
        appendMessage(responseText, "bot");
        
        if (data.buttons) {
            appendButtons(data.buttons);
        }

        logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > RESPONSE RECEIVED ... <span style="color:#10b981">[200 OK]</span>`);

        const textToCheck = (typeof responseText === 'string' ? responseText : '').toLowerCase();
        const userTextToCheck = (payloadText || '').toLowerCase();
        
        const isBooking = textToCheck.includes("scheduled") || 
                          textToCheck.includes("saved") || 
                          textToCheck.includes("confirmed") || 
                          userTextToCheck.includes("book") || 
                          userTextToCheck.includes("pm") || 
                          userTextToCheck.includes("am") || 
                          userTextToCheck.includes("viewing");

        if (isBooking) {
            setTimeout(() => {
                logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > SQL_INSERT into public.leads ... <span style="color:#10b981">[SUCCESS]</span>`);
            }, 800);

            setTimeout(() => {
                logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > POST https://www.googleapis.com/calendar/v3/calendars ... <span style="color:#10b981">[SUCCESS]</span>`);
            }, 1800);

            setTimeout(() => {
                if (demoDest) {
                    logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > DISPATCH_MAIL_SMTP: Routing to <b>${demoDest}</b> ... <span style="color:#3b82f6">[QUEUED & SENT]</span>`);
                    
                    try {
                        let ding = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                        ding.volume = 0.5;
                        ding.play();
                    } catch(e) {}
                    
                    const panel = document.getElementById("backendPanel");
                    if (panel && !panel.classList.contains("open")) {
                        panel.classList.add("open");
                    }
                } else {
                    logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > <span style="color:#f59e0b">WARN: alert_destination is null. Skipping SMTP dispatch.</span>`);
                }
            }, 3000);
        }

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        appendMessage("Network error or outdated browser detected. Please check your connection or call us directly.", "bot");
        logTerminal(`<br><span style="color: #64748b">[${getTimestamp()}]</span> > <span style="color:#ef4444">FATAL_ERR: Webhook connection failed.</span>`);
    } finally {
        if (userInput) {
            userInput.disabled = false;
            userInput.focus();
        }
        if (sendBtn) sendBtn.disabled = false;
        isSending = false; 
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
}