/**
 * Компонент мобильного меню
 */
class MobileMenu {
    /**
     * @param {Object} options - Настройки меню
     * @param {HTMLElement} options.menuToggle - Кнопка переключения меню
     * @param {HTMLElement} options.chatList - Контейнер списка чатов
     * @param {HTMLElement} options.chatOverlay - Оверлей меню
     * @param {HTMLElement} [options.messageInput] - Поле ввода сообщения (опционально)
     */
    constructor({ menuToggle, chatList, chatOverlay, messageInput = null }) {
        this.menuToggle = menuToggle;
        this.chatList = chatList;
        this.chatOverlay = chatOverlay;
        this.messageInput = messageInput;
        this.body = document.body;
        this.isOpen = false;
        
        // Привязываем контекст для обработчиков
        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleInputFocus = this.handleInputFocus.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        
        this.init();
    }
    
    /**
     * Инициализация компонента
     */
    init() {
        if (!this.menuToggle || !this.chatList || !this.chatOverlay) {
            console.error('Не все необходимые элементы меню найдены');
            return;
        }
        
        // Устанавливаем начальное состояние
        this.closeMenu();
        
        // Добавляем обработчики событий
        this.addEventListeners();
    }
    
    /**
     * Добавление обработчиков событий
     */
    addEventListeners() {
        // Клик по кнопке меню
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', this.toggleMenu);
        }
        
        // Клик по оверлею
        if (this.chatOverlay) {
            this.chatOverlay.addEventListener('click', this.handleOverlayClick, { passive: true });
        }
        
        // Обработка клавиши Escape
        document.addEventListener('keydown', this.handleKeyDown);
        
        // Обработка свайпов
        document.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: true });
        
        // Обработка фокуса на поле ввода (для мобильных устройств)
        if (this.messageInput) {
            this.messageInput.addEventListener('focus', this.handleInputFocus);
            this.messageInput.addEventListener('blur', this.handleInputBlur);
        }
    }
    
    /**
     * Переключение состояния меню
     * @param {Event} [e] - Событие
     */
    toggleMenu(e) {
        console.log('toggleMenu вызван');
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        console.log('Текущее состояние isOpen:', this.isOpen);
        
        if (this.isOpen) {
            console.log('Закрываем меню');
            this.closeMenu();
        } else {
            console.log('Открываем меню');
            this.openMenu();
        }
        
        console.log('Новое состояние isOpen:', this.isOpen);
    }
    
    /**
     * Открытие меню
     */
    openMenu() {
        console.log('openMenu вызван');
        if (this.isOpen) {
            console.log('Меню уже открыто');
            return;
        }
        
        this.body.classList.add('menu-open');
        this.isOpen = true;
        
        if (this.menuToggle) {
            console.log('Устанавливаем атрибут aria-expanded в true');
            this.menuToggle.setAttribute('aria-expanded', 'true');
        }
        
        if (this.chatList) {
            console.log('Добавляем класс visible к chatList');
            this.chatList.classList.add('visible');
        }
        
        if (this.chatOverlay) {
            console.log('Добавляем класс visible к chatOverlay');
            this.chatOverlay.setAttribute('aria-hidden', 'false');
            this.chatOverlay.style.display = 'block';
            this.chatOverlay.classList.add('visible');
            
            // Запускаем анимацию после отрисовки
            requestAnimationFrame(() => {
                this.chatOverlay.style.opacity = '1';
            });
        }
        
        // Генерируем кастомное событие
        this.dispatchMenuStateChange();
        console.log('Меню открыто');
    }
    
    /**
     * Закрытие меню
     */
    closeMenu() {
        console.log('closeMenu вызван');
        if (!this.isOpen) {
            console.log('Меню уже закрыто');
            return;
        }
        
        this.body.classList.remove('menu-open');
        this.isOpen = false;
        
        if (this.menuToggle) {
            console.log('Устанавливаем атрибут aria-expanded в false');
            this.menuToggle.setAttribute('aria-expanded', 'false');
        }
        
        if (this.chatList) {
            console.log('Удаляем класс visible у chatList');
            this.chatList.classList.remove('visible');
        }
        
        if (this.chatOverlay) {
            console.log('Удаляем класс visible у chatOverlay');
            this.chatOverlay.style.opacity = '0';
            this.chatOverlay.setAttribute('aria-hidden', 'true');
            this.chatOverlay.classList.remove('visible');
            
            // Скрываем оверлей после завершения анимации
            setTimeout(() => {
                if (!this.isOpen) {
                    this.chatOverlay.style.display = 'none';
                }
            }, 300);
        }
        
        // Восстанавливаем прокрутку страницы
        if (!this.isInputFocused) {
            document.body.style.overflow = '';
        }
        
        // Генерируем кастомное событие
        this.dispatchMenuStateChange();
        console.log('Меню закрыто');
    }
    
    /**
     * Обработчик клика по оверлею
     * @param {Event} e - Событие клика
     */
    handleOverlayClick(e) {
        if (e.target === this.chatOverlay) {
            this.closeMenu();
        }
    }
    
    /**
     * Обработчик нажатия клавиш
     * @param {KeyboardEvent} e - Событие клавиатуры
     */
    handleKeyDown(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.closeMenu();
        }
    }
    
    /**
     * Обработчик начала касания
     * @param {TouchEvent} e - Событие касания
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
        this.touchStartY = e.changedTouches[0].screenY;
    }
    
    /**
     * Обработчик окончания касания
     * @param {TouchEvent} e - Событие окончания касания
     */
    handleTouchEnd(e) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touchEndX = e.changedTouches[0].screenX;
        const touchEndY = e.changedTouches[0].screenY;
        
        const diffX = this.touchStartX - touchEndX;
        const diffY = Math.abs(this.touchStartY - touchEndY);
        const SWIPE_THRESHOLD = 50;
        const VERTICAL_THRESHOLD = 30;
        
        // Проверяем, что движение в основном горизонтальное
        if (diffY > VERTICAL_THRESHOLD) return;
        
        // Свайп вправо (открытие)
        if (diffX < -SWIPE_THRESHOLD && !this.isOpen) {
            this.openMenu();
        }
        // Свайп влево (закрытие)
        else if (diffX > SWIPE_THRESHOLD && this.isOpen) {
            this.closeMenu();
        }
        
        // Сбрасываем начальные координаты
        this.touchStartX = null;
        this.touchStartY = null;
    }
    
    /**
     * Обработчик фокуса на поле ввода
     */
    handleInputFocus() {
        this.isInputFocused = true;
        document.body.style.overflow = 'hidden';
        
        // Прокручиваем к полю ввода при фокусе
        if (this.messageInput) {
            setTimeout(() => {
                this.messageInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    }
    
    /**
     * Обработчик потери фокуса с поля ввода
     */
    handleInputBlur() {
        this.isInputFocused = false;
        
        // Восстанавливаем прокрутку страницы, если меню закрыто
        if (!this.isOpen) {
            document.body.style.overflow = '';
        }
    }
    
    /**
     * Генерация кастомного события изменения состояния меню
     */
    dispatchMenuStateChange() {
        const event = new CustomEvent('menuStateChange', {
            detail: { isOpen: this.isOpen }
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        // Удаляем обработчики событий
        if (this.menuToggle) {
            this.menuToggle.removeEventListener('click', this.toggleMenu);
        }
        
        if (this.chatOverlay) {
            this.chatOverlay.removeEventListener('click', this.handleOverlayClick);
        }
        
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchend', this.handleTouchEnd);
        
        if (this.messageInput) {
            this.messageInput.removeEventListener('focus', this.handleInputFocus);
            this.messageInput.removeEventListener('blur', this.handleInputBlur);
        }
        
        // Сбрасываем состояние
        this.body.classList.remove('menu-open');
        
        if (this.chatOverlay) {
            this.chatOverlay.style.display = 'none';
            this.chatOverlay.style.opacity = '0';
        }
        
        // Очищаем ссылки
        this.menuToggle = null;
        this.chatList = null;
        this.chatOverlay = null;
        this.messageInput = null;
        this.body = null;
    }
}

export default MobileMenu;
