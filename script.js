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

function toggleBackend() { document.getElementById('backendPanel').classList.toggle('open'); }

function toggleChat() {
    const chat = document.getElementById('chatContainer');
    const toggleBtn = document.getElementById('chatToggleBtn');
    chat.classList.toggle('open');
    toggleBtn.classList.toggle('hidden');
    if (chat.classList.contains('open')) document.getElementById('user-input').focus();
}

// UX FIX: Only auto-open chat if screen is larger than mobile (768px)
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

    try {
        const liveUrl = BASE_WEBHOOK_URL + "?t=" + Date.now();
        const response = await fetch(liveUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                sessionId: sessionId, 
                message: payloadText,
                image_url: payloadImage 
            })
        });

        const data = await response.json();
        hideTyping();
        appendMessage(data.text || "Sorry, I encountered an error.", "bot");
        
        if (data.buttons) {
            appendButtons(data.buttons);
        }

    } catch (error) {
        hideTyping();
        console.error("Transmission Error:", error);
        appendMessage("Network error or outdated browser detected. Please check your connection or call us directly.", "bot");
        
        const errorTrace = `[DIAGNOSTIC TRACE]<br>Error: ${error.name}<br>Message: ${error.message}<br>Check n8n CORS settings or Cloudflare connection!`;
        appendMessage(`<div style="font-size: 11px; color: #e11d48; margin-top: 8px; border-top: 1px solid rgba(225,29,72,0.2); padding-top: 8px; font-family: monospace; line-height: 1.3;">${errorTrace}</div>`, "bot");
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