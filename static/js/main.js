// Основной файл приложения
// Точка входа в приложение

// Конфигурация приложения
window.APP_CONFIG = {
    WS_URL: "{{ config.get('WS_URL') }}",
    API_BASE_URL: ""
};

// Импортируем приложение чата
import ChatApp from './core/chatApp.js';

// Инициализируем приложение
const app = new ChatApp();
app.initialize().catch(error => {
    console.error('Ошибка при инициализации приложения:', error);
});

// Для обратной совместимости
window.app = app;

// Оставляем глобальные функции для обратной совместимости
window.sendMessage = async function () {
    if (window.app) {
        try {
            await window.app.sendMessage();
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
            // Показываем уведомление об ошибке
            const notifications = document.getElementById('notifications');
            if (notifications) {
                const notification = document.createElement('div');
                notification.className = 'notification error';
                notification.textContent = 'Не удалось отправить сообщение';
                notifications.appendChild(notification);

                // Удаляем уведомление через 5 секунд
                setTimeout(() => {
                    notification.remove();
                }, 5000);
            }
        }
    } else {
        console.error('Приложение не инициализировано');
    }
};
