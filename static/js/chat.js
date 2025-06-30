// Основной файл приложения
// Теперь использует модульную структуру в директории /app

// Импортируем точку входа приложения
import './app/index.js';

// Оставляем глобальные функции для обратной совместимости
window.sendMessage = async function () {
    if (window.app) {
        try {
            await window.app.sendMessage();
            return true;
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            if (window.showNotification) {
                window.showNotification('Не удалось отправить сообщение', 'error');
            }
            return false;
        }
    } else {
        const errorMsg = 'Приложение не инициализировано';
        console.error(errorMsg);
        if (window.showNotification) {
            window.showNotification(errorMsg, 'error');
        }
        return Promise.reject(new Error(errorMsg));
    }
};

// // Функция для отладки
// debugger; // Можно убрать в продакшене
