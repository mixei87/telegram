import ScrollManager from '../core/scrollManager.js';
import {MobileMenu} from '../components/mobileMenu.js';
import {Chat} from '../components/chat.js';
import {DeviceService} from '../services/deviceService.js';
import {domService} from '../services/domService.js';
import {viewportUtils} from '../utils/viewportUtils.js';
import ApiService from '../services/apiService.js';
import {detectMobile} from '../utils/helpers.js';
import {formatFullDateTime, formatMessageDate} from '../utils/dateUtils.js';

// Конфигурация приложения
const CONFIG = {
    SCROLL_THRESHOLD: 100,
    MESSAGE_LIMIT: 50,
    SCROLL_DEBOUNCE: 100,
    WS_RECONNECT_DELAY: 3000
};

// Селекторы элементов
const SELECTORS = {
    MESSAGE_LIST: '#messages-list',
    MESSAGE_INPUT: '#chat-input',
    MESSAGE_FORM: '#chat-form',
    CHAT_LIST: '#chats-sidebar',
    CHAT_ITEMS: '.chat-item',
    CHAT_SUBMIT: '#chat-submit',
    SIDEBAR: '#sidebar',
    MENU_TOGGLE: '#menuToggle',
    SIDEBAR_OVERLAY: '#sidebarOverlay',
    CHAT: '#chat',
    USER_ID_INPUT: '#userIdInput',
    CONNECT_BTN: '#connectBtn'
};

/**
 * Основной класс приложения чата
 */
class ChatApp {
    constructor() {
        this.elements = {};
        this.scrollManager = null;
        this.currentChatId = null;
        this.isMobile = detectMobile();

        // Инициализация сервисов
        this.services = {
            device: new DeviceService(),
            dom: domService,
            api: new ApiService(),
            viewport: viewportUtils
        };

        // Инициализация компонентов
        this.components = {};

        // Привязка контекста для обработчиков
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.handleOutsideClick = this.handleOutsideClick.bind(this);

        // Инициализируем сервисы
        this.initServices();
    }

    /**
     * Инициализирует сервисы
     */
    initServices() {
        // Инициализируем сервис устройств
        this.services.device.init();

        // Инициализируем viewport для мобильных устройств
        if (this.isMobile) {
            this.services.viewport.setupViewportHandlers();
        }
    }

    /**
     * Инициализация приложения
     */
    async initialize() {
        try {
            // Кэшируем элементы
            this.cacheElements();

            // Инициализируем чат
            this.components.chat = new Chat({
                messageListSelector: SELECTORS.MESSAGE_LIST
            });

            // Инициализируем меню для мобильных устройств
            if (this.isMobile) {
                this.components.mobileMenu = new MobileMenu({
                    menuToggle: document.querySelector(SELECTORS.MENU_TOGGLE),
                    chatList: document.querySelector(SELECTORS.SIDEBAR),
                    chatOverlay: document.querySelector(SELECTORS.SIDEBAR_OVERLAY)
                });
            }

            // Инициализация менеджера прокрутки
            this.scrollManager = new ScrollManager({
                container: SELECTORS.MESSAGE_LIST,
                threshold: CONFIG.SCROLL_THRESHOLD,
                onScrollTop: this.handleScrollTop.bind(this)
            });

            // Настройка обработчиков событий
            this.setupEventListeners();

            // Подключение к WebSocket
            await this.connectWebSocket();

            console.log('Приложение инициализировано');
        } catch (error) {
            console.error('Ошибка при инициализации приложения:', error);
            throw error;
        }
    }

    /**
     * Кэширование часто используемых элементов
     */
    cacheElements() {
        this.elements = {
            messageList: document.querySelector(SELECTORS.MESSAGE_LIST),
            messageInput: document.querySelector(SELECTORS.MESSAGE_INPUT),
            messageForm: document.querySelector(SELECTORS.MESSAGE_FORM),
            chatList: document.querySelector(SELECTORS.CHAT_LIST),
            chatSubmit: document.querySelector(SELECTORS.CHAT_SUBMIT),
            sidebar: document.querySelector(SELECTORS.SIDEBAR),
            menuToggle: document.querySelector(SELECTORS.MENU_TOGGLE),
            sidebarOverlay: document.querySelector(SELECTORS.SIDEBAR_OVERLAY),
            chat: document.querySelector(SELECTORS.CHAT),
            userIdInput: document.querySelector(SELECTORS.USER_ID_INPUT),
            connectBtn: document.querySelector(SELECTORS.CONNECT_BTN)
        };
    }

    /**
     * Настройка обработчиков событий
     */
    setupEventListeners() {
        // Отправка сообщения
        this.elements.messageForm?.addEventListener('submit', this.handleMessageSubmit.bind(this));

        // Обработка клика по чату
        this.elements.chatList?.addEventListener('click', this.handleChatClick.bind(this));

        // Обработка клика по кнопке меню
        if (this.elements.menuToggle) {
            this.elements.menuToggle.addEventListener('click', this.toggleSidebar);
        }

        // Обработка клика по оверлею
        if (this.elements.sidebarOverlay) {
            this.elements.sidebarOverlay.addEventListener('click', this.toggleSidebar);
        }

        // Обработка клика по кнопке загрузки чатов
        if (this.elements.connectBtn) {
            this.elements.connectBtn.addEventListener('click', this.loadChats.bind(this));
        }

        // Обработка изменения размера окна
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    /**
     * Обработчик отправки сообщения
     * @param {Event} event
     */
    async handleMessageSubmit(event) {
        event.preventDefault();

        const message = this.elements.messageInput?.value?.trim();
        if (!message || !this.currentChatId) return;

        try {
            // Создаем объект сообщения
            const messageObj = {
                text: message,
                isOutgoing: true,
                timestamp: new Date().toISOString()
            };

            // Добавляем сообщение в чат
            this.addMessageToChat(messageObj);

            // Отправляем сообщение через WebSocket или API
            await this.sendMessage({
                chatId: this.currentChatId,
                text: message,
                external_id: str,
                chat_id: int,

            });

            // Очищаем поле ввода и фокусируемся на нем
            if (this.elements.messageInput) {
                this.elements.messageInput.value = '';
                this.services.dom.focusElement(SELECTORS.MESSAGE_INPUT);
            }

        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            // Показываем уведомление об ошибке
            this.showNotification('Не удалось отправить сообщение', 'error');
        }
    }

    /**
     * Переключает отображение боковой панели на мобильных устройствах
     */
    toggleSidebar() {
        if (!this.elements.sidebar || !this.elements.sidebarOverlay) return;

        const isVisible = this.elements.sidebar.classList.contains('visible');

        if (isVisible) {
            this.elements.sidebar.classList.remove('visible');
            this.elements.sidebarOverlay.classList.remove('visible');
            document.body.classList.remove('menu-open');
        } else {
            this.elements.sidebar.classList.add('visible');
            this.elements.sidebarOverlay.classList.add('visible');
            document.body.classList.add('menu-open');
        }
    }

    /**
     * Обработчик клика вне боковой панели
     * @param {Event} event - Событие клика
     */
    handleOutsideClick(event) {
        if (this.elements.sidebar &&
            !this.elements.sidebar.contains(event.target) &&
            !this.elements.menuToggle.contains(event.target)) {
            this.toggleSidebar();
        }
    }

    /**
     * Загружает список чатов
     */
    async loadChats() {
        const userId = this.elements.userIdInput?.value.trim();
        if (!userId) {
            console.error('ID пользователя не указан');
            return;
        }

        try {
            // Здесь должна быть логика загрузки чатов
            console.log('Загрузка чатов для пользователя:', userId);
            // this.elements.chatList.innerHTML = ...
        } catch (error) {
            console.error('Ошибка при загрузке чатов:', error);
        }
    }

    /**
     * Обработчик клика по чату
     * @param {Event} event - Событие клика
     */
    handleChatClick(event) {
        const chatItem = event.target.closest('.chat-item');
        if (!chatItem) return;

        const chatId = chatItem.dataset.chatId;
        if (!chatId) return;

        this.currentChatId = chatId;
        this.loadMessages(chatId);

        // Прокручиваем к выбранному чату на мобильных устройствах
        if (this.isMobile) {
            this.toggleSidebar();
        }
    }

    /**
     * Загружает сообщения для выбранного чата
     * @param {string} chatId - ID чата
     */
    async loadMessages(chatId) {
        try {
            // Здесь должна быть логика загрузки сообщений
            console.log('Загрузка сообщений для чата:', chatId);

            // Очищаем список сообщений
            if (this.components.chat) {
                this.components.chat.clearMessages();
            }

            // Здесь можно добавить загрузку сообщений с сервера
            // const messages = await this.services.api.getMessages(chatId);
            // messages.forEach(msg => this.addMessageToChat(msg));

        } catch (error) {
            console.error('Ошибка при загрузке сообщений:', error);
            this.showNotification('Не удалось загрузить сообщения', 'error');
        }
    }

    /**
     * Добавляет сообщение в чат
     * @param {Object} message - Объект сообщения
     */
    addMessageToChat(message) {
        if (!this.components.chat) return;

        // Форматируем дату для отображения
        const displayDate = formatMessageDate(message.timestamp);
        const fullDate = formatFullDateTime(message.timestamp);

        this.components.chat.addMessage(
            message.text,
            message.isOutgoing ? 'outgoing' : 'incoming',
            displayDate,
            fullDate
        );
    }

    /**
     * Обработчик изменения размера окна
     */
    handleResize() {
        // Обновляем состояние мобильного меню при изменении размера окна
        if (this.isMobile) {
            this.toggleSidebar(false);
        }
    }

    /**
     * Обработчик прокрутки к верху
     */
    handleScrollTop() {
        // Здесь можно добавить логику загрузки предыдущих сообщений
        console.log('Прокрутка к верху');
    }

    /**
     * Подключается к WebSocket
     */
    async connectWebSocket() {
        try {
            // Здесь должна быть логика подключения к WebSocket
            console.log('Подключение к WebSocket...');

            // Пример:
            // this.socket = new WebSocket(APP_CONFIG.WS_URL);
            // this.socket.onmessage = this.handleWebSocketMessage.bind(this);
            // this.socket.onclose = this.handleWebSocketClose.bind(this);
            // this.socket.onerror = this.handleWebSocketError.bind(this);

        } catch (error) {
            console.error('Ошибка при подключении к WebSocket:', error);
            throw error;
        }
    }

    /**
     * Отправляет сообщение через WebSocket или API
     * @param {Object} message - Объект сообщения
     */
    async sendMessage(message) {
        try {
            // Здесь должна быть логика отправки сообщения
            console.log('Отправка сообщения:', message);

            // Пример отправки через API:
            // await this.services.api.sendMessage(message);

        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            throw error;
        }
    }

    /**
     * Показывает уведомление
     * @param {string} message - Текст уведомления
     * @param {string} type - Тип уведомления (success, error, warning, info)
     */
    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Здесь можно добавить отображение уведомления в интерфейсе
    }
}

// Экспортируем класс ChatApp
export default ChatApp;
