// Импортируем класс Scrollbar
import Scrollbar from './scrollbar.js';

// Элементы интерфейса
const messageList = document.querySelector('.message-list');
const customScrollbar = document.getElementById('custom-scrollbar');
const userIdInput = document.getElementById('userIdInput');
let messageInput = null;  // Кэшируем элемент ввода сообщения

// Инициализация скроллбара
let scrollbar;

function init() {
    // Инициализируем кастомный скроллбар
    if (messageList && customScrollbar) {
        scrollbar = new Scrollbar(messageList, customScrollbar);
    }

    // Загружаем чаты, если указан ID пользователя

    if (userIdInput) {
        const userId = userIdInput.value.trim();
        if (userId) {
            loadChats().catch(error => {
                console.error('Ошибка при загрузке чатов:', error);
            });
        }
    }
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем кэшированные элементы
    messageInput = document.getElementById("messageInput");

    // Назначаем обработчики событий
    const connectBtn = document.getElementById("connectBtn");
    if (connectBtn) {
        connectBtn.addEventListener("click", () => {
            if (userIdInput && userIdInput.value.trim()) {
                loadChats().catch(error => {
                    console.error('Ошибка при загрузке чатов:', error);
                    alert('Не удалось загрузить чаты. Пожалуйста, проверьте соединение и попробуйте снова.');
                });
            } else {
                alert('Пожалуйста, введите ID пользователя');
            }
        });
    }

    // Функция для безопасного вызова sendMessage
    const safeSendMessage = async () => {
        try {
            await sendMessage();
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    };

    // Обработчики событий для кнопки отправки и нажатия Enter
    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) sendBtn.addEventListener("click", safeSendMessage);

    if (messageInput) {
        messageInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") safeSendMessage();
        });
    }

    init();
});

let ws = null;
let currentChatId = null;

async function loadChats() {
    const userIdInput = document.getElementById('userIdInput');
    if (!userIdInput) {
        console.error('Поле ввода ID пользователя не найдено');
        return;
    }
    const user_id = userIdInput.value.trim();
    if (!user_id) {
        alert("Введите ID пользователя");
        return;
    }

    connectWebSocket(user_id);
    const res = await fetch(`/users/${user_id}/chats`);
    console.log(res);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData?.detail || 'Ошибка загрузки чатов');
        return;
    }

    const data = await res.json();
    if (!('chats' in data)) {
        console.error('Ключ "chats" отсутствует в ответе:', data);
        return;
    }
    const chats = data.chats;

    if (!Array.isArray(chats)) {
        console.error('Ошибка: ожидался массив чатов, получено:', chats);
        return;
    }

    const chatList = document.getElementById('chatList');
    if (!chatList) {
        console.error('Элемент chatList не найден');
        return;
    }
    chatList.innerHTML = "";
    chats.forEach(chat => {
        const div = document.createElement("div");
        div.className = "chat-item";
        div.textContent = chat.name + ` (id=${chat.id})`;
        div.dataset.chatId = chat.id;
        div.onclick = () => selectChat(chat.id);
        chatList.appendChild(div);
    });
}

function connectWebSocket(user_id) {
    const wsUrl = window.APP_CONFIG.WS_URL
    ws = new WebSocket(`${wsUrl}/ws/${user_id}`);

    ws.onopen = () => {
        console.log("Подключение установлено");
    };

    ws.onmessage = (event) => {
        try {
            console.log("event.data:", event.data);
            const data = JSON.parse(event.data);
            if (data && typeof data.text === 'string') {
                console.log('Получено сообщение:', data.text);
                log(data.text, false);
            } else {
                console.warn('Получены некорректные данные:', data);
            }
        } catch (error) {
            console.error('Ошибка при обработке сообщения:', error);
        }
    };
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
        console.log("Соединение закрыто");
    };
}

function selectChat(chatId) {
    currentChatId = chatId;
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({action: "get_chat_members", chat_id: chatId}));
    }
    const messageInput = document.getElementById("messageInput");
    if (messageInput) {
        messageInput.focus();
    } else {
        console.error('Поле ввода сообщения не найдено');
    }
}

async function sendMessage() {
    if (!messageInput) {
        console.error('Поле ввода сообщения не найдено');
        return;
    }
    const text = messageInput.value.trim();
    if (!currentChatId || !text) return;

    const external_id = crypto.randomUUID();

    // Отправляем сообщение через WebSocket или HTTP
    const msg = {external_id, chat_id: currentChatId, text};
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(JSON.stringify(msg));
        ws.send(JSON.stringify({action: "send_message", msg: msg}));
        log(text, true);
    }
    messageInput.value = "";
}


function log(text, is_own = false) {
    const messagesContainer = document.getElementById("messages");
    if (!messagesContainer) {
        console.error("Элемент с id='messages' не найден");
        return;
    }

    const messageElement = document.createElement("div");
    messageElement.className = is_own ? "message own" : "message";
    messageElement.textContent = text;

    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}
