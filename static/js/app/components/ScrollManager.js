/**
 * Менеджер прокрутки для чата
 */
class ScrollManager {
    /**
     * @param {Object} options - Настройки менеджера
     * @param {HTMLElement} options.container - Контейнер с сообщениями
     * @param {HTMLElement} [options.scrollbar] - Ползунок скроллбара
     * @param {Function} [options.onNearTop] - Колбэк при приближении к верху
     * @param {Function} [options.onNearBottom] - Колбэк при приближении к низу
     * @param {number} [options.threshold=100] - Порог срабатывания (в пикселях)
     */
    constructor({
        container,
        scrollbar = null,
        onNearTop = null,
        onNearBottom = null,
        threshold = 100
    }) {
        if (!container) {
            throw new Error('ScrollManager: container is required');
        }

        this.container = container;
        this.scrollbar = scrollbar;
        this.onNearTop = onNearTop;
        this.onNearBottom = onNearBottom;
        this.threshold = Math.max(0, threshold);
        this.scrollEndTimeout = null;
        this.resizeObserver = null;
        this.scrollOptions = {
            passive: true,
            capture: false
        };
        
        // Проверяем поддержку passive events
        try {
            const opts = Object.defineProperty({}, 'passive', {
                get: () => {
                    this.scrollOptions.passive = true;
                    return true;
                }
            });
            window.addEventListener('test', null, opts);
            window.removeEventListener('test', null, opts);
        } catch (e) {
            this.scrollOptions.passive = false;
        }
        
        this.handleScroll = this.throttle(this.handleScroll.bind(this), 100);
        this.handleScrollEnd = this.handleScrollEnd.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        this.init();
    }
    
    /**
     * Инициализация менеджера
     */
    init() {
        // Добавляем обработчики событий
        this.container.addEventListener('scroll', this.handleScroll, this.scrollOptions);
        
        // Инициализация кастомного скроллбара, если передан
        if (this.scrollbar) {
            this.initCustomScrollbar();
            
            // Добавляем обработчик ресайза для обновления скроллбара
            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver(this.handleResize);
                this.resizeObserver.observe(this.container);
            } else {
                window.addEventListener('resize', this.handleResize, this.scrollOptions);
            }
        }
        
        // Инициализируем скроллбар
        this.updateScrollbar();
    }
    
    /**
     * Инициализация кастомного скроллбара
     */
    initCustomScrollbar() {
        // Обновляем позицию ползунка при скролле
        this.updateScrollbar();
    }
    
    /**
     * Обновление позиции ползунка
     */
    updateScrollbar() {
        if (!this.scrollbar || !this.container) return;
        
        const { scrollTop, scrollHeight, clientHeight } = this.container;
        const trackHeight = this.scrollbar.parentElement.clientHeight;
        const thumbHeight = Math.max((clientHeight / scrollHeight) * trackHeight, 40);
        const maxScroll = scrollHeight - clientHeight;
        const scrollPercentage = maxScroll > 0 ? (scrollTop / maxScroll) : 0;
        const thumbPosition = (trackHeight - thumbHeight) * scrollPercentage;
        
        this.scrollbar.style.height = `${thumbHeight}px`;
        this.scrollbar.style.transform = `translateY(${thumbPosition}px)`;
    }
    
    /**
     * Обработчик события скролла
     */
    handleScroll() {
        const { scrollTop, scrollHeight, clientHeight } = this.container;
        const scrollBottom = scrollHeight - (scrollTop + clientHeight);
        

        
        // Обновляем ползунок скроллбара
        this.updateScrollbar();
        
        // Проверяем приближение к верху
        if (scrollTop <= this.threshold && typeof this.onNearTop === 'function') {
            this.onNearTop(scrollTop, scrollBottom);
        }
        
        // Проверяем приближение к низу
        if (scrollBottom <= this.threshold && typeof this.onNearBottom === 'function') {
            this.onNearBottom(scrollTop, scrollBottom);
        }
        
        // Запускаем таймер окончания скролла
        this.handleScrollEnd();
    }
    
    /**
     * Обработчик окончания скролла
     */
    handleScrollEnd() {
        if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
        }
        
        this.scrollEndTimeout = setTimeout(() => {
        }, 150);
    }
    
    /**
     * Прокрутка к нижней части контейнера
     * @param {boolean} [smooth=true] - Плавная прокрутка
     */
    scrollToBottom(smooth = true) {
        if (!this.container) return;
        
        this.container.scrollTo({
            top: this.container.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
    

    
    /**
     * Обработчик изменения размера контейнера
     */
    handleResize() {
        if (this.resizeRaf) {
            cancelAnimationFrame(this.resizeRaf);
        }
        
        this.resizeRaf = requestAnimationFrame(() => {
            this.updateScrollbar();
            this.resizeRaf = null;
        });
    }
    
    /**
     * Троттлинг функции
     * @private
     * @param {Function} func - Функция для троттлинга
     * @param {number} limit - Интервал в мс
     * @returns {Function}
     */
    throttle(func, limit) {
        let lastFunc;
        let lastRan;
        
        return function(...args) {
            const context = this;
            
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                if (lastFunc) {
                    clearTimeout(lastFunc);
                }
                
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Удаляем обработчики событий
        if (this.container) {
            this.container.removeEventListener('scroll', this.handleScroll, this.scrollOptions);
        }
        
        // Очищаем таймеры
        if (this.scrollEndTimeout) {
            clearTimeout(this.scrollEndTimeout);
        }
        
        // Отключаем ResizeObserver
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        } else if (this.handleResize) {
            window.removeEventListener('resize', this.handleResize, this.scrollOptions);
        }
        
        // Отменяем отложенные вызовы
        if (this.resizeRaf) {
            cancelAnimationFrame(this.resizeRaf);
        }
        
        // Очищаем ссылки
        this.container = null;
        this.scrollbar = null;
        this.onNearTop = null;
        this.onNearBottom = null;
        this.scrollEndTimeout = null;
        this.resizeObserver = null;
    }
}

export default ScrollManager;
