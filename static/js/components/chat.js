export class Chat {
    /**
     * @param {Object} [options] - Настройки компонента
     * @param {string} [options.messageListSelector='#messageList'] - Селектор контейнера списка сообщений
     */
    constructor(options = {}) {
        this.selectors = {
            messageList: options.messageListSelector || '#messageList'
        };

        this.elements = {
            list: null
        };
    }

    init() {
        this.cacheElements();
        console.log('Чат инициализирован', {
            selector: this.selectors.messageList,
            element: this.elements.list
        });

        if (!this.elements.list) {
            console.error('Не удалось найти элемент списка сообщений по селектору:', this.selectors.messageList);
        }
    }

    cacheElements() {
        this.elements.list = document.querySelector(this.selectors.messageList);
    }

    /**
     * Очищает список сообщений
     */
    clear() {
        if (this.elements.list) {
            this.elements.list.innerHTML = '';
            return true;
        }
        console.warn('Не удалось очистить список сообщений: элемент не найден');
        return false;
    }

    /**
     * Добавляет сообщение в чат
     * @param {string} text - Текст сообщения
     * @param {string} [type='incoming'] - Тип сообщения: 'incoming' или 'outgoing'
     * @param {string} [timestamp] - Временная метка сообщения (опционально)
     */
    addMessage(text, type = 'incoming', timestamp = new Date().toISOString()) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;

        // Форматируем время
        const time = new Date(timestamp);
        const formattedTime = time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        const fullDateTime = time.toLocaleString();

        // Создаем элементы сообщения безопасным способом
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.title = fullDateTime;
        timeDiv.textContent = formattedTime;

        // Очищаем и добавляем элементы
        messageElement.textContent = '';
        messageElement.appendChild(contentDiv);
        messageElement.appendChild(timeDiv);

        if (this.elements.list) {
            this.elements.list.appendChild(messageElement);
            this.elements.list.scrollTop = this.elements.list.scrollHeight;
        }
    }
}

export default Chat;
