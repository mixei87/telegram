/**
 * Сервис для работы с API чата
 */
class ApiService {
    /**
     * Создает экземпляр ApiService
     * @param {string} [baseUrl='/api'] - Базовый URL API
     */
    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    /**
     * Обрабатывает ответ от сервера
     * @private
     * @param {Response} response - Ответ от fetch
     * @returns {Promise<Object>} Распарсенные данные ответа
     * @throws {Error} Ошибка с сообщением от сервера
     */
    async handleResponse(response) {
        if (!response.ok) {
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorMessage;
            } catch (e) {
                // Не удалось распарсить JSON с ошибкой, используем стандартное сообщение
            }
            throw new Error(errorMessage);
        }
        return response.json();
    }

    /**
     * Получение списка чатов
     * @returns {Promise<Array>} Список чатов
     */
    /**
     * Получает список чатов
     * @returns {Promise<Array>} Список чатов
     * @throws {Error} Ошибка при загрузке чатов
     */
    async fetchChats() {
        const response = await fetch(`${this.baseUrl}/chats`);
        return this.handleResponse(response);
    }

    /**
     * Получение сообщений чата
     * @param {string} chatId - ID чата
     * @param {Object} params - Параметры запроса
     * @returns {Promise<Array>} Список сообщений
     */
    /**
     * Получает сообщения чата
     * @param {string} chatId - ID чата
     * @param {Object} [params={}] - Параметры запроса
     * @returns {Promise<Array>} Список сообщений
     * @throws {Error} Ошибка при загрузке сообщений
     */
    async fetchMessages(chatId, params = {}) {
        const queryParams = new URLSearchParams(params);
        const response = await fetch(`${this.baseUrl}/chats/${chatId}/messages?${queryParams}`);
        return this.handleResponse(response);
    }

    /**
     * Отправка сообщения
     * @param {Object} messageData - Данные сообщения
     * @param {string} messageData.chatId - ID чата
     * @param {string} messageData.text - Текст сообщения
     * @returns {Promise<Object>} Ответ сервера
     */
    /**
     * Отправляет сообщение в чат
     * @param {Object} messageData - Данные сообщения
     * @param {string} messageData.chatId - ID чата
     * @param {string} messageData.text - Текст сообщения
     * @returns {Promise<Object>} Отправленное сообщение
     * @throws {Error} Ошибка при отправке сообщения
     */
    async sendMessage({ chatId, text }) {
        const response = await fetch(`${this.baseUrl}/chats/${chatId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text })
        });
        return this.handleResponse(response);
    }

    /**
     * Отметка сообщений как прочитанные
     * @param {string} chatId - ID чата
     * @param {Array<string>} messageIds - Массив ID сообщений
     * @returns {Promise<Object>} Ответ сервера
     */

}

export default ApiService;
