// Элементы интерфейса
const messageList = document.querySelector('.message-list');
const customScrollbar = document.getElementById('custom-scrollbar');
let isMouseInWindow = false;
let hideScrollbarTimeout = null;

/**
 * Обновляет позицию и размер ползунка скроллбара
 */
function updateScrollbar() {
    if (!customScrollbar || !messageList) return;

    const {scrollTop, scrollHeight, clientHeight} = messageList;

    // Вычисляем высоту ползунка (не менее 50px и не более высоты контейнера)
    const thumbHeight = Math.max(
        Math.min(
            (clientHeight / scrollHeight) * clientHeight,
            clientHeight
        ),
        50
    );

    // Вычисляем позицию ползунка
    const maxScroll = scrollHeight - clientHeight;
    const thumbPosition = maxScroll > 0
        ? (scrollTop / maxScroll) * (clientHeight - thumbHeight)
        : 0;

    // Применяем стили
    customScrollbar.style.height = `${thumbHeight}px`;
    customScrollbar.style.transform = `translateY(${thumbPosition}px)`;
}

/**
 * Показывает скроллбар
 */
function showScrollbar() {
    if (!customScrollbar) return;
    clearTimeout(hideScrollbarTimeout);
    customScrollbar.style.opacity = "1";
}

/**
 * Прячет скроллбар с задержкой, если курсор вне окна
 */
function hideScrollbar() {
    if (!customScrollbar) return;

    clearTimeout(hideScrollbarTimeout);

    if (!isMouseInWindow) {
        hideScrollbarTimeout = setTimeout(() => {
            customScrollbar.style.opacity = "0";
        }, 300);
    }
}

/**
 * Инициализирует скроллбар и настраивает обработчики событий
 */
function initScrollbar() {
    if (!messageList || !customScrollbar) return;

    // Начальная настройка стилей
    customScrollbar.style.position = "absolute";
    customScrollbar.style.width = "6px";
    customScrollbar.style.top = "0";
    customScrollbar.style.right = "0";
    customScrollbar.style.opacity = "0";
    customScrollbar.style.transition = "opacity 0.3s ease";

    // Обработчики событий
    messageList.addEventListener("scroll", () => {
        updateScrollbar();
        showScrollbar();
    });

    messageList.addEventListener("mouseenter", showScrollbar);
    messageList.addEventListener("mouseleave", hideScrollbar);

    window.addEventListener("mousemove", () => {
        showScrollbar();
        hideScrollbar();
    });

    window.addEventListener("mouseout", (e) => {
        if (e.relatedTarget === null) {
            isMouseInWindow = false;
            hideScrollbar();
        }
    });

    window.addEventListener("mouseover", () => {
        isMouseInWindow = true;
    });

    // Для тач-устройств
    messageList.addEventListener("touchstart", showScrollbar);
    messageList.addEventListener("touchend", hideScrollbar);

    window.addEventListener("resize", updateScrollbar);

    // Инициализация начального состояния
    updateScrollbar();
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', initScrollbar);
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
