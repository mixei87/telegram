const connectBtn = document.getElementById("connectBtn");
const chatList = document.getElementById("chatList");
const userIdInput = document.getElementById("userIdInput");
const messageList = document.querySelector('.message-list');
const customScrollbar = document.getElementById('custom-scrollbar');

let isUserInteracting = false;

function updateScrollbar() {
    if (!customScrollbar) return;

    const totalHeight = messageList.scrollHeight;
    const visibleHeight = messageList.clientHeight;
    const scrollTop = messageList.scrollTop;

    const thumbHeight = Math.max((visibleHeight / totalHeight) * visibleHeight, 20);
    const thumbTop = (scrollTop / totalHeight) * visibleHeight;

    customScrollbar.style.height = `${thumbHeight}px`;
    customScrollbar.style.transform = `translateY(${thumbTop}px)`;
}

// Показываем скроллбар при скролле или наведении
function showScrollbar() {
    if (!customScrollbar) return;
    customScrollbar.style.opacity = "1";
    clearTimeout(customScrollbar.hideTimeout);
}

function hideScrollbar() {
    if (!customScrollbar) return;
    customScrollbar.hideTimeout = setTimeout(() => {
        customScrollbar.style.opacity = "0";
    }, 300);
}

// Отслеживаем события мыши
function setupEventListenersForScrollbar() {
    if (!messageList || !customScrollbar) return;

    // При скролле обновляем позицию thumb
    messageList.addEventListener("scroll", () => {
        updateScrollbar();
        showScrollbar();
        hideScrollbar();
    });

    // При наведении на область чата
    messageList.addEventListener("mouseenter", () => {
        if (!isUserInteracting) showScrollbar();
    });

    messageList.addEventListener("mouseleave", () => {
        if (!isUserInteracting) hideScrollbar();
    });

    // При движении мыши в окне
    window.addEventListener("mousemove", (e) => {
        const rect = messageList.getBoundingClientRect();
        if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
        ) {
            showScrollbar();
            hideScrollbar();
        }
    });

    // При уходе мыши за пределы окна
    window.addEventListener("mouseout", (e) => {
        if (e.relatedTarget === null) {
            hideScrollbar();
        }
    });

    // Для тач-устройств
    messageList.addEventListener("touchstart", () => {
        showScrollbar();
        hideScrollbar();
    });
}

// Инициализация
function initScrollbar() {
    if (!messageList || !customScrollbar) return;

    customScrollbar.style.position = "absolute";
    customScrollbar.style.width = "6px";
    customScrollbar.style.top = "0";
    customScrollbar.style.right = "0";

    updateScrollbar();

    setupEventListenersForScrollbar();
}

// Вызывай после загрузки чата
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollbar);
} else {
    initScrollbar();
}
// // Проверяем, является ли браузер Chrome
// const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
//
// // Функция для обновления видимости скроллбара с троттлингом
// let lastScrollUpdate = 0;
// const SCROLL_UPDATE_DELAY = 50; // мс
//
// function updateScrollbarVisibility(event) {
//
//     const now = Date.now();
//     if (now - lastScrollUpdate < SCROLL_UPDATE_DELAY) return;
//     lastScrollUpdate = now;
//
//     // Проверяем, находится ли курсор в пределах видимой области
//     const isInViewport = (
//         event.clientX >= 0 &&
//         event.clientX <= window.innerWidth &&
//         event.clientY >= 0 &&
//         event.clientY <= window.innerHeight
//     );
//
//     messageList.style.setProperty('--scrollbar-opacity', isInViewport ? '0.2' : '0');
// }
//
// // Функция для принудительного скрытия скроллбара
// function hideScrollbar() {
//     if (!messageList) return;
//     messageList.style.setProperty('--scrollbar-opacity', '0');
// }
//
// function handleVisibilityChange() {
//     messageList.style.setProperty('--scrollbar-opacity', document.hidden ? '0' : '0.2');
// }
//
// function handleWindowBlur() {
//     messageList.style.setProperty('--scrollbar-opacity', '0');
// }
//
// function setupEventListeners() {
//     if (!isChrome) return;
//
//     document.addEventListener('mousemove', updateScrollbarVisibility);
//     document.addEventListener('mouseleave', hideScrollbar);
//     document.addEventListener('touchstart', updateScrollbarVisibility);
//     document.addEventListener('touchend', hideScrollbar);
//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     window.addEventListener('blur', handleWindowBlur);
//     window.addEventListener('resize', () => hideScrollbar());
// }
//
// // Инициализация при загрузке страницы
// function init() {
//     setupEventListeners();
//     if (isChrome && messageList) {
//         messageList.addEventListener('mouseenter', () => {
//             messageList.style.setProperty('--scrollbar-opacity', '0.2');
//         });
//
//         messageList.addEventListener('mouseleave', () => {
//             messageList.style.setProperty('--scrollbar-opacity', '0');
//         });
//     }
// }
//
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', init);
// } else {
//     init();
// }

let ws = null;
let currentChatId = null;

async function loadChats() {
    const user_id = userIdInput.value.trim();
    if (!user_id) return alert("Введите ID пользователя");

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
    ws = new WebSocket(`ws://localhost:8000/ws/${user_id}`);

    ws.onopen = () => {
        console.log("Подключение установлено");
    };

    ws.onmessage = (event) => {
        console.log("event.data:", event.data);
        const data = JSON.parse(event.data);
        log(data.text, false);
    };
    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
    ws.onclose = () => {
        console.log("Соединение закрыто");
        connectBtn.textContent = "Connect";
    };
}

function selectChat(chatId) {
    currentChatId = chatId;
    document.getElementById("messageInput").focus();
}

async function sendMessage() {
    const text = document.getElementById("messageInput").value.trim();
    if (!currentChatId || !text) return;

    const external_id = crypto.randomUUID();

    // Отправляем сообщение через WebSocket или HTTP
    const msg = {external_id, chat_id: currentChatId, text};
    if (ws && ws.readyState === WebSocket.OPEN) {
        console.log(JSON.stringify(msg));
        ws.send(JSON.stringify(msg));
        log(text, true);
    }
    document.getElementById("messageInput").value = "";
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
