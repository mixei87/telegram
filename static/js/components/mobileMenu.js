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
    constructor({menuToggle, chatList, chatOverlay, messageInput = null}) {
        this.menuToggle = menuToggle;
        this.chatList = chatList;
        this.chatOverlay = chatOverlay;
        this.messageInput = messageInput;
        this.body = document.body;
        this.isOpen = false;
        this.isInputFocused = false;

        // Привязываем контекст для обработчиков
        this.toggleMenu = this.toggleMenu.bind(this);
        this.handleOverlayClick = this.handleOverlayClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleInputFocus = this.handleInputFocus.bind(this);
        this.handleInputBlur = this.handleInputBlur.bind(this);
        this.handleResize = this.handleResize.bind(this);

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
        this.closeMenu(true);

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
            this.chatOverlay.addEventListener('click', this.handleOverlayClick, {passive: true});
        }

        // Обработка клавиши Escape
        document.addEventListener('keydown', this.handleKeyDown);

        // Обработка свайпов
        document.addEventListener('touchstart', this.handleTouchStart, {passive: true});
        document.addEventListener('touchend', this.handleTouchEnd, {passive: true});

        // Обработка фокуса на поле ввода (для мобильных устройств)
        if (this.messageInput) {
            this.messageInput.addEventListener('focus', this.handleInputFocus);
            this.messageInput.addEventListener('blur', this.handleInputBlur);
        }

        // Обработка изменения размера окна
        window.addEventListener('resize', this.handleResize, {passive: true});
    }

    /**
     * Обработчик изменения размера окна
     */
    handleResize() {
        const isMobileView = window.innerWidth <= 1024; // То же значение, что и в CSS

        // Если перешли с мобильной на десктопную версию, сбрасываем состояние меню
        if (!isMobileView && this.isOpen) {
            this.closeMenu(true);
        }
        // Если перешли с десктопной на мобильную версию, убедимся, что меню закрыто
        else if (isMobileView) {
            this.closeMenu(true);
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
     * @param {boolean} [force=false] - Принудительное закрытие без анимации
     */
    closeMenu(force = false) {
        console.log('closeMenu вызван, force:', force);
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

            if (force) {
                // Сбрасываем стили, которые могут быть установлены анимацией
                this.chatList.style.transition = 'none';
                // Возвращаем стандартные стили после обновления DOM
                setTimeout(() => {
                    this.chatList.style.transition = '';
                }, 10);
            }
        }

        if (this.chatOverlay) {
            console.log('Удаляем класс visible у chatOverlay');

            if (force) {
                // Мгновенно скрываем оверлей без анимации
                this.chatOverlay.style.opacity = '0';
                this.chatOverlay.style.display = 'none';
                this.chatOverlay.setAttribute('aria-hidden', 'true');
                this.chatOverlay.classList.remove('visible');
                // Сбрасываем стили анимации
                this.chatOverlay.style.transition = 'none';
                // Возвращаем стандартные стили после обновления DOM
                setTimeout(() => {
                    this.chatOverlay.style.transition = '';
                }, 10);
            } else {
                // Обычное закрытие с анимацией
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
     * Обработчик начала касания (для свайпов)
     * @param {TouchEvent} e - Событие касания
     */
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    /**
     * Обработчик окончания касания (для свайпов)
     * @param {TouchEvent} e - Событие окончания касания
     */
    handleTouchEnd(e) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const diffX = this.touchStartX - touchEndX;
        const diffY = this.touchStartY - touchEndY;

        // Если свайп влево и меню открыто, закрываем его
        if (this.isOpen && diffX > 50 && Math.abs(diffY) < 50) {
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
        // Прокручиваем страницу вниз при фокусе на поле ввода (для мобильных устройств)
        window.scrollTo(0, document.body.scrollHeight);
    }

    /**
     * Обработчик потери фокуса с поля ввода
     */
    handleInputBlur() {
        this.isInputFocused = false;
        // Восстанавливаем прокрутку страницы после потери фокуса
        if (!this.isOpen) {
            document.body.style.overflow = '';
        }
    }

    /**
     * Генерация кастомного события изменения состояния меню
     */
    dispatchMenuStateChange() {
        const event = new CustomEvent('menuStateChange', {
            detail: {isOpen: this.isOpen}
        });
        document.dispatchEvent(event);
    }

    /**
     * Уничтожение компонента
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
        window.removeEventListener('resize', this.handleResize);

        if (this.messageInput) {
            this.messageInput.removeEventListener('focus', this.handleInputFocus);
            this.messageInput.removeEventListener('blur', this.handleInputBlur);
        }

        // Закрываем меню при уничтожении
        this.closeMenu(true);
    }
}

export {MobileMenu};
