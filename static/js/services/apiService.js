/**
 * Сервис для работы с API чата
 */
class ApiService {
    /**
     * Создает экземпляр ApiService
     */
    constructor() {
        console.log('ApiService инициализирован с относительными путями');
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
            // Пробуем получить текст ошибки от сервера
            let errorMessage = `HTTP error! status: ${response.status}`;
            let errorData = {};
            
            try {
                errorData = await response.json();
                console.error('Error response from server:', errorData);
                
                if (errorData.detail) {
                    errorMessage += `, details: ${typeof errorData.detail === 'string' 
                        ? errorData.detail 
                        : JSON.stringify(errorData.detail)}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (e) {
                // Если не удалось распарсить JSON, просто логируем и используем стандартное сообщение
                console.error('Failed to parse error response:', e);
            }
            
            const error = new Error(errorMessage);
            error.status = response.status;
            error.response = response;
            error.details = errorData;
            return Promise.reject(error);
        }

        try {
            const data = await response.json();
            console.log('Response data:', data);
            return data;
        } catch (e) {
            console.error('Failed to parse response:', e);
            const error = new Error('Не удалось обработать ответ сервера');
            error.originalError = e;
            return Promise.reject(error);
        }
    }

    /**
     * Получает список чатов пользователя
     * @param {string|number} userId - ID пользователя
     * @returns {Promise<Array>} Список чатов пользователя
     * @throws {Error} Ошибка при загрузке чатов
     */
    async fetchChats(userId) {
        console.log('=== fetchChats called ===');
        if (!userId) {
            const error = new Error('User ID is required to fetch chats');
            console.error('Ошибка в fetchChats:', error.message);
            return Promise.reject(error);
        }

        // Используем относительный путь к API
        const url = `/users/${userId}/chats`;
        console.log('Sending request to:', url);

        try {
            const response = await fetch(url);
            console.log('Response status:', response.status, response.statusText);

            // handleResponse уже парсит JSON и возвращает данные
            const data = await this.handleResponse(response);
            console.log('Response data:', data);
            
            // Возвращаем данные как есть, предполагая, что сервер возвращает массив чатов
            return data || [];
        } catch (error) {
            console.error('Error in fetchChats:', error.message, 'Stack:', error.stack);
            error.message = `[ApiService] ${error.message}`;
            return Promise.reject(error);
        }
    }

    /**
     * Получение сообщений чата
     * @param {string} chatId - ID чата
     * @param {Object} params - Параметры запроса
     * @returns {Promise<Array>} Список сообщений
     */
    /**
     * Получает сообщения чата
     * @param {string|number} chatId - ID чата
     * @param {Object} [params={}] - Параметры запроса
     * @returns {Promise<Array>} Список сообщений
     * @throws {Error} Ошибка при загрузке сообщений
     */
    async fetchMessages(chatId, params = {}) {
        console.log('=== fetchMessages called ===');

        // Преобразуем chatId в число, если это возможно
        const chatIdNum = typeof chatId === 'string' ? parseInt(chatId, 10) : chatId;
        if (isNaN(chatIdNum)) {
            const error = new Error(`Invalid chatId: ${chatId}`);
            console.error('Error in fetchMessages:', error.message);
            return Promise.reject(error);
        }

        // Преобразуем параметры в числа с проверкой
        const limit = params.limit ? Math.max(1, parseInt(params.limit, 10)) : 50;
        const offset = params.offset ? Math.max(0, parseInt(params.offset, 10)) : 0;

        console.log('Request params:', {chatId: chatIdNum, limit, offset});

        // Формируем URL с query-параметрами для получения сообщений
        const url = new URL(`/history/${chatIdNum}`, window.location.origin);

        // Добавляем query-параметры
        url.searchParams.append('limit', limit.toString());
        url.searchParams.append('offset', offset.toString());

        const requestUrl = url.toString();
        console.log('Fetching messages from:', requestUrl);

        try {
            const response = await fetch(requestUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include' // Важно для передачи куки с сессией
            });

            // Используем handleResponse для обработки ответа
            const messages = await this.handleResponse(response);
            console.log('Fetched messages:', messages);
            
            // Возвращаем массив сообщений (или пустой массив, если ответ пустой)
            return Array.isArray(messages) ? messages : [];

        } catch (error) {
            console.error('Error in fetchMessages:', {
                message: error.message,
                stack: error.stack,
                params: {chatId, ...params}
            });
            error.message = `[ApiService] ${error.message}`;
            return Promise.reject(error);
        }
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
    async sendMessage({chatId, text, senderId}) {
        // Валидация входных данных
        if (!chatId || !text || !senderId) {
            const error = new Error('Необходимо указать chatId, text и senderId');
            console.error('Ошибка валидации в sendMessage:', error.message);
            return Promise.reject(error);
        }

        const url = new URL('/messages/', window.location.origin);

        // Генерируем UUID для external_id
        const externalId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        const messageData = {
            external_id: externalId,
            chat_id: parseInt(chatId, 10),
            sender_id: parseInt(senderId, 10),
            text: text
        };

        console.log('Отправка сообщения по URL:', url.toString(), messageData);

        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include', // Важно для передачи куки с сессией
                body: JSON.stringify(messageData)
            });

            console.log('Статус ответа при отправке сообщения:', response.status);
            
            // Используем handleResponse для обработки ответа
            const responseData = await this.handleResponse(response);
            console.log('Ответ сервера:', responseData);
            
            return responseData;
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', {
                message: error.message,
                stack: error.stack,
                chatId,
                text: text ? `${text.substring(0, 50)}...` : 'empty',
                senderId
            });
            error.message = `[ApiService] ${error.message}`;
            return Promise.reject(error);
        }
    }

    /**
     * Отметка сообщений как прочитанные
     * @param {string} chatId - ID чата
     * @param {Array<string>} messageIds - Массив ID сообщений
     * @returns {Promise<Object>} Ответ сервера
     */

}

// Экспортируем класс ApiService как default
export default ApiService;
