console.log('Скрипт index.js загружен');

import ChatApp from './core/ChatApp.js';
import { showNotification } from './utils/notifications.js';

// Инициализация приложения после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM загружен, инициализация приложения...');
    
    // Создаем экземпляр приложения
    const app = new ChatApp();
    
    // Инициализируем приложение
    app.initialize().catch(error => {
        console.error('Ошибка при инициализации приложения:', error);
    });
    
    // Экспортируем приложение в глобальную область видимости для отладки
    window.app = app;
});

// Обработка ошибок, которые не были перехвачены
window.addEventListener('error', (event) => {
    console.error('Неперехваченная ошибка:', event.error || event.message, event);
    
    // Показываем пользователю сообщение об ошибке
    showNotification(
        'Произошла ошибка. Пожалуйста, обновите страницу.',
        'error',
        5000
    );
});

// Обработка неперехваченных промисов
window.addEventListener('unhandledrejection', (event) => {
    console.error('Неперехваченный промис:', event.reason);
});
