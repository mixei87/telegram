/**
 * Сервис для работы с DOM-элементами
 */
class DomService {
    constructor() {
        this.cache = new Map();
    }

    /**
     * Находит первый элемент, соответствующий селектору
     * @param {string} selector - CSS-селектор
     * @param {HTMLElement|Document|{parent?: HTMLElement|Document}} [options] - Опции поиска
     * @returns {HTMLElement|null} Найденный элемент или null
     */
    getElement(selector, options = {}) {
        // Нормализуем параметры
        let parent = document;

        if (options instanceof HTMLElement || options === document) {
            parent = options;
        } else if (options && options.parent) {
            parent = options.parent;
        }
        
        // Используем кеш для одиночного элемента
        const cacheKey = `${selector}_${parent.id || 'root'}`;
        
        if (!this.cache.has(cacheKey)) {
            const element = parent.querySelector(selector);
            if (element) {
                this.cache.set(cacheKey, element);
            }
        }
        
        return this.cache.get(cacheKey) || null;
    }

    /**
     * Находит все элементы, соответствующие селектору
     * @param {string} selector - CSS-селектор
     * @param {HTMLElement|Document|{parent?: HTMLElement|Document}} [options] - Опции поиска
     * @returns {HTMLElement[]} Массив найденных элементов
     */
    getAll(selector, options = {}) {
        // Нормализуем параметры
        let parent = document;

        if (options instanceof HTMLElement || options === document) {
            parent = options;
        } else if (options && options.parent) {
            parent = options.parent;
        }

        // Приводим NodeList к массиву HTMLElement
        return /** @type {HTMLElement[]} */ (Array.from(parent.querySelectorAll(selector)));
    }

    /**
     * Ожидает появления элемента в DOM
     * @param {string} selector - CSS-селектор
     * @param {Object} [options]
     * @param {number} [options.timeout=5000] - Таймаут ожидания (мс)
     * @param {HTMLElement|Document} [options.parent=document] - Родительский элемент
     * @returns {Promise<HTMLElement>}
     */
    waitForElement(selector, { timeout = 5000, parent = document } = {}) {
        return new Promise((resolve, reject) => {
            // Сначала проверяем кеш
            const cachedElement = this.getElement(selector, parent);
            if (cachedElement) {
                return resolve(cachedElement);
            }

            // Если элемента нет, настраиваем наблюдатель
            const observer = new MutationObserver(() => {
                const element = this.getElement(selector, parent);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });

            // Начинаем наблюдение
            observer.observe(parent, {
                childList: true,
                subtree: true
            });

            // Устанавливаем таймаут
            if (timeout) {
                setTimeout(() => {
                    observer.disconnect();
                    reject(new Error(`Элемент ${selector} не найден за ${timeout}мс`));
                }, timeout);
            }
        });
    }

    /**
     * @typedef {Object} CreateElementOptions
     * @property {Record<string, string|number|boolean>} [attrs] - Атрибуты элемента
     * @property {string} [text] - Текстовое содержимое
     * @property {Array<HTMLElement|string>} [children] - Дочерние элементы
     */

    /**
     * Создает DOM-элемент с атрибутами и дочерними элементами
     * @param {string} tagName - Название тега (например, 'div', 'button')
     * @param {CreateElementOptions} [options] - Опции элемента
     * @returns {HTMLElement} Созданный DOM-элемент
     */
    createElement(tagName, { attrs = {}, text = '', children = [] } = {}) {
        const element = document.createElement(tagName);
        
        // Устанавливаем атрибуты
        Object.entries(attrs).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                const stringValue = String(value);
                element.setAttribute(key, stringValue);
            }
        });
        
        // Устанавливаем текст, если передан
        if (text) {
            element.textContent = text;
        }
        
        // Добавляем дочерние элементы
        children.forEach(child => {
            if (child instanceof HTMLElement) {
                element.appendChild(child);
            } else if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            }
        });
        
        return element;
    }

    /**
     * Безопасно удаляет все дочерние элементы
     * @param {HTMLElement} element - Родительский элемент
     */
    removeAllChildren(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Добавляет обработчик события с поддержкой делегирования
     * @param {string} event - Имя события
     * @param {string} selector - CSS-селектор целевых элементов
     * @param {Function} handler - Обработчик события
     * @param {Object} [options] - Дополнительные опции
     * @returns {Function} Функция для удаления обработчика
     */
    delegate(event, selector, handler, options = {}) {
        const listener = (e) => {
            if (e.target.matches(selector)) {
                handler(e);
            } else if (e.target.closest(selector)) {
                const closest = e.target.closest(selector);
                const newEvent = Object.assign({}, e, {
                    delegateTarget: closest
                });
                handler(newEvent);
            }
        };

        const target = options.parent || document;
        target.addEventListener(event, listener, options);
        
        // Возвращаем функцию для удаления обработчика
        return () => {
            target.removeEventListener(event, listener, options);
        };
    }
}

// Экспортируем синглтон
const domService = new DomService();
export { domService };
