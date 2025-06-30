import ScrollManager from '../components/ScrollManager.js';
import MobileMenu from '../components/MobileMenu.js';
import ApiService from './ApiService.js';
import { detectMobile } from '../utils/helpers.js';

// Конфигурация приложения
const CONFIG = {
    SCROLL_THRESHOLD: 100,
    MESSAGE_LIMIT: 50,
    SCROLL_DEBOUNCE: 100,
    WS_RECONNECT_DELAY: 3000
};

// Селекторы элементов
const SELECTORS = {
    MESSAGE_LIST: '#messageList', // Изменено с .message-list на #messageList
    SCROLLBAR: '#custom-scrollbar',
    USER_INPUT: '#userIdInput',
    MESSAGE_INPUT: '#messageInput',
    MESSAGE_FORM: '#messageForm',
    MENU_TOGGLE: '#menuToggle',
    CHAT_LIST: '#chatListContainer',
    CHAT_OVERLAY: '#chatOverlay',
    CHAT_ITEMS: '.chats > div' // Обновленный селектор для элементов чата
};

export default class ChatApp {
    constructor() {
        this.elements = {};
        this.scrollManager = null;
        this.apiService = new ApiService();
        this.ws = null;
        this.currentChatId = null;
        this.isMobile = detectMobile();
        this.initializePromise = null;
        this.mobileMenu = null;
        
        // Привязываем контекст для обработчиков
        this.handleMobileViewChange = this.handleMobileViewChange.bind(this);
    }

    // Инициализация приложения
    async initialize() {
        if (this.initializePromise) {
            return this.initializePromise;
        }

        this.initializePromise = (async () => {
            this.cacheElements();
            this.setupEventListeners();
            this.setupScrollManager();
            this.setupMobileMenu();
            
            // Добавляем обработчик изменения размера окна
            window.addEventListener('mobileViewChange', this.handleMobileViewChange);
            
            const userId = this.getUserId();
            if (userId) {
                await this.loadChats();
                this.setupWebSocket(userId);
            }
        })();

        return this.initializePromise;
    }
    
    /**
     * Обработчик изменения режима отображения (мобильный/десктоп)
     * @param {Event} event - Событие mobileViewChange
     */
    handleMobileViewChange(event) {
        const wasMobile = this.isMobile;
        this.isMobile = event.detail.isMobile;
        
        console.log(`Режим отображения изменился: ${wasMobile ? 'мобильный' : 'десктоп'} -> ${this.isMobile ? 'мобильный' : 'десктоп'}`);
        
        // Если режим изменился, переинициализируем меню
        if (wasMobile !== this.isMobile) {
            this.setupMobileMenu();
        }
    }


    // Кэширование элементов DOM
    cacheElements() {
        const elements = {
            messageList: document.querySelector(SELECTORS.MESSAGE_LIST),
            scrollbar: document.querySelector(SELECTORS.SCROLLBAR),
            userIdInput: document.querySelector(SELECTORS.USER_INPUT),
            messageInput: document.querySelector(SELECTORS.MESSAGE_INPUT),
            messageForm: document.querySelector(SELECTORS.MESSAGE_FORM),
            menuToggle: document.querySelector(SELECTORS.MENU_TOGGLE),
            chatList: document.querySelector(SELECTORS.CHAT_LIST),
            chatOverlay: document.querySelector(SELECTORS.CHAT_OVERLAY),
            chatItems: document.querySelectorAll(SELECTORS.CHAT_ITEMS)
        };

        // Отладочный вывод
        console.log('Найденные элементы DOM:');
        Object.entries(elements).forEach(([key, element]) => {
            console.log(`${key}:`, element ? 'найден' : 'не найден', element);
        });

        this.elements = elements;
    }


    // Настройка менеджера прокрутки
    setupScrollManager() {
        if (this.elements.messageList && this.elements.scrollbar) {
            // Приводим типы к HTMLElement, так как querySelector возвращает Element
            const messageList = /** @type {HTMLElement} */ (this.elements.messageList);
            const scrollbar = /** @type {HTMLElement} */ (this.elements.scrollbar);
            
            this.scrollManager = new ScrollManager({
                container: messageList,
                scrollbar: scrollbar,
                onNearBottom: this.handleScrollNearBottom.bind(this)
            });
        }
    }

    // Настройка мобильного меню
    setupMobileMenu() {
        console.log('Настройка мобильного меню...');
        console.log('isMobile:', this.isMobile);
        console.log('menuToggle:', this.elements.menuToggle);
        console.log('chatList:', this.elements.chatList);
        console.log('chatOverlay:', this.elements.chatOverlay);
        
        const hasAllElements = this.elements.menuToggle && this.elements.chatList && this.elements.chatOverlay;
        console.log('Все необходимые элементы найдены:', hasAllElements);
        
        // Удаляем предыдущий экземпляр меню, если он есть
        if (this.mobileMenu) {
            // Здесь можно добавить метод destroy, если он есть у MobileMenu
            this.mobileMenu = null;
        }
        
        // Показываем/скрываем кнопку меню в зависимости от режима
        if (this.elements.menuToggle) {
            this.elements.menuToggle.style.display = this.isMobile ? 'flex' : 'none';
        }
        
        if (this.isMobile && hasAllElements) {
            console.log('Инициализация мобильного меню...');
            
            // Приводим типы к HTMLElement, так как querySelector возвращает Element
            const menuToggle = /** @type {HTMLElement} */ (this.elements.menuToggle);
            const chatList = /** @type {HTMLElement} */ (this.elements.chatList);
            const chatOverlay = /** @type {HTMLElement} */ (this.elements.chatOverlay);
            const messageInput = this.elements.messageInput ? 
                /** @type {HTMLElement} */ (this.elements.messageInput) : undefined;
            
            try {
                this.mobileMenu = new MobileMenu({
                    menuToggle,
                    chatList,
                    chatOverlay,
                    messageInput
                });
                
                // Добавляем мобильное меню в глобальную область видимости для отладки
                window.mobileMenu = this.mobileMenu;
                console.log('Мобильное меню инициализировано:', this.mobileMenu);
                
                // Добавляем обработчик для ручного тестирования
                menuToggle.addEventListener('click', (e) => {
                    console.log('Клик по кнопке меню (ручной обработчик)');
                    console.log('Текущий класс chatList:', chatList.className);
                    console.log('Текущий класс chatOverlay:', chatOverlay.className);
                });
                
            } catch (error) {
                console.error('Ошибка при инициализации мобильного меню:', error);
            }
        } else if (!this.isMobile) {
            console.log('Мобильное меню не инициализировано: режим не мобильный');
            // Убедимся, что боковое меню видимо в десктопном режиме
            if (this.elements.chatList) {
                this.elements.chatList.style.transform = '';
                this.elements.chatList.style.position = 'relative';
            }
            if (this.elements.chatOverlay) {
                this.elements.chatOverlay.style.display = 'none';
            }
        } else {
            console.log('Мобильное меню не инициализировано: не все элементы найдены');
        }
    }


    // Настройка WebSocket соединения
    setupWebSocket(userId) {
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        const wsUrl = `${protocol}${window.location.host}/ws/${userId}`;
        
        try {
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => {
                console.log('WebSocket соединение установлено');
            };
            
            this.ws.onmessage = (event) => {
                this.handleIncomingMessage(JSON.parse(event.data));
            };
            
            this.ws.onclose = () => {
                console.log('WebSocket соединение закрыто. Попытка переподключения...');
                setTimeout(() => this.setupWebSocket(userId), CONFIG.WS_RECONNECT_DELAY);
            };
            
            this.ws.onerror = (error) => {
                console.error('WebSocket ошибка:', error);
            };
            
        } catch (error) {
            console.error('Ошибка при подключении к WebSocket:', error);
        }
    }

    // Обработка входящих сообщений
    handleIncomingMessage(message) {
        // TODO: Реализовать обработку входящих сообщений
        console.log('Получено сообщение:', message);
    }


    // Загрузка списка чатов
    async loadChats() {
        try {
            const chats = await this.apiService.fetchChats();
            this.renderChatList(chats);
        } catch (error) {
            console.error('Ошибка при загрузке чатов:', error);
        }
    }


    // Отрисовка списка чатов
    renderChatList(chats) {
        // TODO: Реализовать отрисовку списка чатов
        console.log('Рендерим список чатов:', chats);
    }

    // Получение ID текущего пользователя
    getUserId() {
        return this.elements.userIdInput?.value.trim() || null;
    }

    // Обработчик приближения к верху списка сообщений
    handleScrollNearBottom() {
        // TODO: Реализовать подгрузку предыдущих сообщений
        console.log('Приближение к началу истории сообщений');
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        if (!this.elements.messageForm) return;
        
        // Отправка сообщения
        this.elements.messageForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                await this.sendMessage();
            } catch (error) {
                console.error('Ошибка при отправке сообщения:', error);
                // Можно показать уведомление пользователю
                if (window.showNotification) {
                    window.showNotification('Не удалось отправить сообщение', 'error');
                }
            }
        });
        
        // Обработка кликов по чатам
        if (this.elements.chatList) {
            this.elements.chatList.addEventListener('click', (e) => {
                const chatItem = e.target.closest(SELECTORS.CHAT_ITEMS);
                if (chatItem) {
                    const chatId = chatItem.dataset.chatId;
                    if (chatId) {
                        this.selectChat(chatId);
                    }
                }
            });
        }
    }

    // Отправка сообщения
    async sendMessage() {
        const messageText = this.elements.messageInput?.value.trim();
        if (!messageText || !this.currentChatId) return Promise.resolve();
        
        try {
            await this.apiService.sendMessage({
                chatId: this.currentChatId,
                text: messageText
            });
            
            // Очищаем поле ввода
            this.elements.messageInput.value = '';
            
            // Возвращаем промис для обработки в вызывающем коде
            return Promise.resolve();
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            return Promise.reject(error);
        }
    }


    // Выбор чата
    async selectChat(chatId) {
        if (this.currentChatId === chatId) return Promise.resolve();
        
        this.currentChatId = chatId;
        
        // Обновляем активный чат в UI
        this.updateActiveChatUI(chatId);
        
        try {
            // Загружаем сообщения выбранного чата
            const messages = await this.apiService.fetchMessages(chatId, {
                limit: CONFIG.MESSAGE_LIMIT
            });
            
            // Отрисовываем сообщения
            this.renderMessages(messages);
            
            // Прокручиваем к последнему сообщению
            this.scrollToBottom();
            
            return Promise.resolve(messages);
        } catch (error) {
            console.error(`Ошибка при загрузке сообщений чата ${chatId}:`, error);
            return Promise.reject(error);
        }
    }

    // Обновление UI активного чата
    updateActiveChatUI(chatId) {
        // Удаляем класс active у всех чатов
        this.elements.chatItems?.forEach(item => {
            item.classList.remove('active');
        });
        
        // Добавляем класс active выбранному чату
        const activeChat = document.querySelector(`[data-chat-id="${chatId}"]`);
        if (activeChat) {
            activeChat.classList.add('active');
        }
        
        // Обновляем заголовок чата
        const chatTitle = activeChat?.querySelector('.chat-title')?.textContent || 'Чат';
        const chatHeader = document.querySelector('.chat-header h2');
        if (chatHeader) {
            chatHeader.textContent = chatTitle;
        }
    }

    // Отрисовка сообщений
    renderMessages(messages) {
        if (!this.elements.messageList) return;
        
        // Очищаем список сообщений
        this.elements.messageList.innerHTML = '';
        
        // Добавляем сообщения в DOM
        messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            this.elements.messageList.appendChild(messageElement);
        });
    }

    // Создание элемента сообщения
    createMessageElement(message) {
        const messageElement = document.createElement('div');
        // Используем свойство isOwn из объекта message
        const messageClass = message.isOwn ? 'outgoing' : 'incoming';
        messageElement.className = `message ${messageClass}`;
        
        messageElement.innerHTML = `
            <div class="message-content">
                ${message.text}
            </div>
            <div class="message-time">
                ${new Date(message.timestamp).toLocaleTimeString()}
            </div>
        `;
        
        return messageElement;
    }

    // Прокрутка к нижней части чата
    scrollToBottom() {
        if (this.scrollManager) {
            this.scrollManager.scrollToBottom();
        }
    }


}
