/**
 * Утилита для отображения уведомлений
 * @module Notifications
 */

/**
 * Отображает уведомление
 * @param {string} message - Текст уведомления
 * @param {string} [type='info'] - Тип уведомления: 'info', 'success', 'warning', 'error'
 * @param {number} [duration=5000] - Время отображения в миллисекундах (0 - не скрывать автоматически)
 * @returns {HTMLElement} - Созданный элемент уведомления
 */
export function showNotification(message, type = 'info', duration = 5000) {
    // Создаем контейнер для уведомлений, если его еще нет
    let container = document.querySelector('.notifications-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
    }

    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');

    // Добавляем иконку в зависимости от типа
    let icon;
    switch (type) {
        case 'success':
            icon = '✓';
            break;
        case 'error':
            icon = '✕';
            break;
        case 'warning':
            icon = '⚠';
            break;
        default:
            icon = 'ℹ';
    }

    // Создаем элементы уведомления безопасным способом
    const iconDiv = document.createElement('div');
    iconDiv.className = 'notification-icon';
    iconDiv.setAttribute('aria-hidden', 'true');
    iconDiv.textContent = icon;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'notification-content';
    contentDiv.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.setAttribute('aria-label', 'Закрыть уведомление');
    closeButton.textContent = '×';
    
    // Очищаем и добавляем элементы
    notification.textContent = '';
    notification.appendChild(iconDiv);
    notification.appendChild(contentDiv);
    notification.appendChild(closeButton);

    // Добавляем уведомление в контейнер
    container.appendChild(notification);

    // Запускаем анимацию появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Функция закрытия уведомления
    const closeNotification = () => {
        notification.classList.remove('show');
        notification.classList.add('hide');

        // Удаляем уведомление из DOM после завершения анимации
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }

            // Удаляем контейнер, если больше нет уведомлений
            if (container && container.children.length === 0) {
                document.body.removeChild(container);
            }
        }, 300); // Должно соответствовать длительности анимации в CSS
    };

    // Обработчик кнопки закрытия (используем существующую кнопку)
    closeButton.addEventListener('click', closeNotification);

    // Автоматическое закрытие, если указана длительность
    if (duration > 0) {
        setTimeout(closeNotification, duration);
    }

    return notification;
}

// Добавляем глобальную функцию для обратной совместимости
if (window) {
    window.showNotification = showNotification;
}
