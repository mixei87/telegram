/**
 * Проверяет, является ли устройство мобильным
 * @returns {boolean}
 */
// Глобальная переменная для хранения состояния мобильного режима
let isMobileView = false;

/**
 * Определяет, является ли текущий вид мобильным
 * @returns {boolean}
 */
function checkMobileView() {
    // Проверяем User-Agent на наличие мобильных устройств, кроме iPad
    const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) && 
                     !/iPad/i.test(navigator.userAgent);
    
    // Проверяем размер окна (такой же как в медиа-запросах CSS)
    const isSmallScreen = window.innerWidth <= 1024; // Соответствует @media (max-width: 1024px)
    
    // Возвращаем true, если это мобильное устройство или маленький экран
    return isMobileUA || isSmallScreen;
}

/**
 * Инициализирует отслеживание изменения размера окна
 */
function initMobileViewListener() {
    // Проверяем начальное состояние
    isMobileView = checkMobileView();
    
    // Добавляем обработчик изменения размера окна
    window.addEventListener('resize', () => {
        const wasMobile = isMobileView;
        isMobileView = checkMobileView();
        
        // Если состояние изменилось, генерируем событие
        if (wasMobile !== isMobileView) {
            window.dispatchEvent(new CustomEvent('mobileViewChange', { 
                detail: { isMobile: isMobileView } 
            }));
        }
    }, { passive: true });
}

// Инициализируем при загрузке
if (typeof window !== 'undefined') {
    initMobileViewListener();
}

/**
 * Проверяет, является ли текущий вид мобильным
 * @returns {boolean}
 */
export function detectMobile() {
    return isMobileView;
}

/**
 * Форматирует дату в читаемый вид
 * @param {Date|string|number} date - Дата для форматирования
 * @param {string} [format='time'] - Формат вывода: 'time', 'date' или 'datetime'
 * @returns {string} Отформатированная дата
 */
export function formatDate(date, format = 'time') {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    };
    
    const dateOptions = { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit' 
    };
    
    switch (format) {
        case 'time':
            return d.toLocaleTimeString([], timeOptions);
            
        case 'date':
            return d.toLocaleDateString([], dateOptions);
            
        case 'datetime':
            return `${d.toLocaleDateString([], dateOptions)} ${d.toLocaleTimeString([], timeOptions)}`;
            
        default:
            return d.toLocaleString();
    }
}

/**
 * Экранирует HTML-теги в строке
 * @param {string} unsafe - Небезопасная строка с HTML
 * @returns {string} Безопасная строка с экранированными тегами
 */
export function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Создает debounce-функцию
 * @param {Function} func - Функция для обертки
 * @param {number} wait - Время задержки в мс
 * @returns {Function} Новая функция с debounce-логикой
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Создает throttle-функцию
 * @param {Function} func - Функция для обертки
 * @param {number} limit - Лимит времени между вызовами в мс
 * @returns {Function} Новая функция с throttle-логикой
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}

/**
 * Генерирует уникальный ID
 * @param {number} [length=8] - Длина ID
 * @returns {string} Уникальный ID
 */
export function generateId(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Проверяет, является ли значение объектом
 * @param {*} value - Значение для проверки
 * @returns {boolean}
 */
export function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Глубокое слияние объектов
 * @param {Object} target - Целевой объект
 * @param {Object} sources - Объекты для слияния
 * @returns {Object} Новый объединенный объект
 */
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    
    return deepMerge(target, ...sources);
}

/**
 * Копирует текст в буфер обмена
 * @param {string} text - Текст для копирования
 * @returns {Promise<boolean>} Успешно ли выполнено копирование
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Ошибка при копировании в буфер обмена:', err);
        return false;
    }
}

/**
 * Форматирует размер в байтах в читаемый вид
 * @param {number} bytes - Размер в байтах
 * @returns {string} Отформатированный размер (например, "1.5 MB")
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Проверяет, находится ли элемент в области видимости
 * @param {HTMLElement} element - Элемент для проверки
 * @param {Object} [options] - Дополнительные настройки
 * @param {number} [options.threshold=0] - Порог в пикселях
 * @param {HTMLElement} [options.container=window] - Родительский контейнер
 * @returns {boolean}
 */
export function isElementInViewport(element, { threshold = 0, container = window } = {}) {
    if (!element) return false;
    
    let rect;
    
    if (container === window) {
        rect = element.getBoundingClientRect();
        
        return (
            rect.top - threshold <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom + threshold >= 0 &&
            rect.left - threshold <= (window.innerWidth || document.documentElement.clientWidth) &&
            rect.right + threshold >= 0
        );
    } else {
        const containerRect = container.getBoundingClientRect();
        rect = element.getBoundingClientRect();
        
        return (
            rect.top - threshold <= containerRect.bottom &&
            rect.bottom + threshold >= containerRect.top &&
            rect.left - threshold <= containerRect.right &&
            rect.right + threshold >= containerRect.left
        );
    }
}
