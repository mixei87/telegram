// Импортируем класс Scrollbar
import Scrollbar from './scrollbar.js';

// Элементы интерфейса
let messageList, customScrollbar, userIdInput, messageInput;

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

// Функции для работы с мобильным меню
function setupMobileMenu() {
    console.log('setupMobileMenu вызвана');
    
    const menuToggle = document.getElementById('menuToggle');
    const chatList = document.getElementById('chatListContainer');
    const chatOverlay = document.getElementById('chatOverlay');
    const body = document.body;
    
    console.log('Элементы меню:', { menuToggle, chatList, chatOverlay });
    
    if (!menuToggle || !chatList || !chatOverlay) {
        console.error('Не найдены необходимые элементы меню');
        return;
    }
    
    function openMenu() {
        console.log('Открываем меню');
        body.classList.add('menu-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        chatOverlay.setAttribute('aria-hidden', 'false');
        chatOverlay.style.display = 'block';
        setTimeout(() => chatOverlay.style.opacity = '1', 10);
        console.log('Классы body после открытия:', body.className);
    }
    
    function closeMenu() {
        console.log('Закрываем меню');
        body.classList.remove('menu-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        chatOverlay.style.opacity = '0';
        chatOverlay.setAttribute('aria-hidden', 'true');
        setTimeout(() => chatOverlay.style.display = 'none', 300);
        console.log('Классы body после закрытия:', body.className);
    }
    
    function toggleMenu(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (body.classList.contains('menu-open')) {
            closeMenu();
        } else {
            openMenu();
        }
    }
    
    // Обработчик клика по кнопке меню
    menuToggle.addEventListener('click', (e) => {
        console.log('Клик по кнопке меню', e);
        toggleMenu(e);
    });
    
    // Проверяем, что обработчик добавлен
    console.log('Обработчики кнопки меню:', menuToggle.onclick);
    
    // Закрытие при клике на оверлей
    chatOverlay.addEventListener('click', closeMenu);
    
    // Закрытие при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('menu-open')) {
            closeMenu();
        }
    });
    
    // Обработка свайпов
    let touchStartX = 0;
    let touchEndX = 0;
    const SWIPE_THRESHOLD = 50;
    
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        // Свайп вправо (открытие)
        if (diff < -SWIPE_THRESHOLD && !body.classList.contains('menu-open')) {
            openMenu();
        }
        // Свайп влево (закрытие)
        else if (diff > SWIPE_THRESHOLD && body.classList.contains('menu-open')) {
            closeMenu();
        }
    }, { passive: true });
    
    // Инициализация состояния
    closeMenu();
}

// Инициализация элементов интерфейса
function initElements() {
    messageList = document.querySelector('.message-list');
    customScrollbar = document.getElementById('custom-scrollbar');
    userIdInput = document.getElementById('userIdInput');
    messageInput = document.getElementById("messageInput");
}

// Запуск инициализации после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM полностью загружен');
    
    // Инициализируем элементы
    console.log('Инициализация элементов...');
    initElements();
    
    // Проверяем, мобильное ли устройство
    const isMobile = window.innerWidth <= 768;
    console.log('Мобильное устройство:', isMobile, 'ширина экрана:', window.innerWidth);
    
    // Настраиваем мобильное меню
    console.log('Настройка мобильного меню...');
    setupMobileMenu();
    
    // Добавляем глобальную переменную для отладки
    window.debugMenu = {
        openMenu: () => document.body.classList.add('menu-open'),
        closeMenu: () => document.body.classList.remove('menu-open')
    };
    console.log('Отладка: используйте window.debugMenu.openMenu() и window.debugMenu.closeMenu() для управления меню');
    
    // Обработчик изменения размера окна
    window.addEventListener('resize', () => {
        const currentIsMobile = window.innerWidth <= 768;
        
        // Переинициализируем меню при переходе между мобильной и десктопной версией
        if (isMobile !== currentIsMobile) {
            if (currentIsMobile) {
                setupMobileMenu();
            } else {
                // На десктопе сбрасываем состояние меню
                const chatList = document.getElementById('chatListContainer');
                const messageArea = document.getElementById('messageArea');
                
                if (chatList) chatList.classList.remove('visible');
                if (messageArea) messageArea.classList.remove('chat-hidden');
                document.body.style.overflow = '';
            }
        }
    });

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

    // Обработчики событий для кнопки отправки и нажатия Enter
    const sendBtn = document.getElementById("sendBtn");
    if (sendBtn) sendBtn.addEventListener("click", sendMessage);

    if (messageInput) {
        messageInput.addEventListener("keypress", async (e) => {
                if (e.key === "Enter") await sendMessage();
            }
        )
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
    ws = new WebSocket(`/ws/${user_id}`);
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
