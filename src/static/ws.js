let ws = null;
const connectBtn = document.getElementById("connectBtn");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

function toggleConnection() {
    const chatId = document.getElementById("chatId").value.trim();
    if (!chatId) {
        alert("Введите ID чата");
        return;
    }

    if (!ws || ws.readyState === WebSocket.CLOSED) {
        // Подключаемся
        ws = new WebSocket(`ws://localhost:8000/ws/${chatId}`);


        ws.onopen = () => {
            log("✅ Подключение установлено");
            enableMessageUI(true);
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            log(data.text, false);  // Полученные сообщения — не свои
        };

        ws.onclose = () => {
            log("🔌 Соединение закрыто");
            enableMessageUI(false);
            connectBtn.textContent = "Connect";
        };
    } else {
        // Закрываем соединение
        ws.close();
        connectBtn.textContent = "Connect";
    }
}

function log(text, is_own = false) {
    const output = document.getElementById("output");
    const line = document.createElement("div");
    line.style.margin = "4px 0";
    line.style.padding = "8px";
    line.style.borderRadius = "4px";
    line.style.whiteSpace = "pre-wrap";
    line.textContent = text;

    if (is_own) {
        line.style.backgroundColor = "#e0f7ff";
        line.style.textAlign = "right";
        line.style.marginLeft = "20%";
    } else {
        line.style.backgroundColor = "#f9f9f9";
        line.style.textAlign = "left";
        line.style.marginRight = "20%";
    }

    output.appendChild(line);
    output.scrollTop = output.scrollHeight;
}

function sendMessage() {
    const chatId = document.getElementById("chatId").value;
    const text = document.getElementById("messageInput").value;

    const msg = {
        external_id: crypto.randomUUID(),
        text: text,
        chat_id: parseInt(chatId)
    };

    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(msg));
        log(msg.text, true);  // Отмечаем как своё
        document.getElementById("messageInput").value = "";
    } else {
        alert("Соединение не установлено");
    }
}

function enableMessageUI(enabled) {
    if (enabled) {
        connectBtn.textContent = "Disconnect";
        connectBtn.setAttribute("disconnected", "");
    } else {
        connectBtn.textContent = "Connect";
        connectBtn.removeAttribute("disconnected",);
    }
    messageInput.disabled = !enabled;

    sendBtn.disabled = !enabled;
    // sendBtn.enabled = enabled;
}