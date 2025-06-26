class Scrollbar {
    constructor(container, scrollbar) {
        this.container = container;
        this.scrollbar = scrollbar;
        this.isMouseInWindow = false;
        this.hideScrollbarTimeout = null;
        
        this.init();
    }

    /**
     * Обновляет позицию и размер ползунка скроллбара
     */
    update() {
        if (!this.scrollbar || !this.container) return;

        const {scrollTop, scrollHeight, clientHeight} = this.container;

        // Вычисляем высоту ползунка (не менее 50px и не более высоты контейнера)
        const thumbHeight = Math.max(
            Math.min(
                (clientHeight / scrollHeight) * clientHeight,
                clientHeight
            ),
            50
        );

        // Вычисляем позицию ползунка
        const maxScroll = scrollHeight - clientHeight;
        const thumbPosition = maxScroll > 0
            ? (scrollTop / maxScroll) * (clientHeight - thumbHeight)
            : 0;

        // Применяем стили
        this.scrollbar.style.height = `${thumbHeight}px`;
        this.scrollbar.style.transform = `translateY(${thumbPosition}px)`;
    }

    /**
     * Показывает скроллбар
     */
    show() {
        if (!this.scrollbar) return;
        clearTimeout(this.hideScrollbarTimeout);
        this.scrollbar.style.opacity = "1";
    }

    /**
     * Прячет скроллбар с задержкой, если курсор вне окна
     */
    hide() {
        if (!this.scrollbar) return;
        clearTimeout(this.hideScrollbarTimeout);

        if (!this.isMouseInWindow) {
            this.hideScrollbarTimeout = setTimeout(() => {
                this.scrollbar.style.opacity = "0";
            }, 300);
        }
    }


    /**
     * Инициализирует скроллбар и настраивает обработчики событий
     */
    init() {
        if (!this.container || !this.scrollbar) return;

        // Начальная настройка стилей
        this.scrollbar.style.position = "absolute";
        this.scrollbar.style.width = "6px";
        this.scrollbar.style.top = "0";
        this.scrollbar.style.right = "0";
        this.scrollbar.style.opacity = "0";
        this.scrollbar.style.transition = "opacity 0.3s ease";

        // Обработчики событий
        this.container.addEventListener("scroll", this.handleScroll.bind(this));
        this.container.addEventListener("mouseenter", this.show.bind(this));
        this.container.addEventListener("mouseleave", this.hide.bind(this));

        window.addEventListener("mousemove", this.handleMouseMove.bind(this));
        window.addEventListener("mouseout", this.handleMouseOut.bind(this));
        window.addEventListener("mouseover", this.handleMouseOver.bind(this));

        // Для тач-устройств
        this.container.addEventListener("touchstart", this.show.bind(this));
        this.container.addEventListener("touchend", this.hide.bind(this));
        window.addEventListener("resize", this.update.bind(this));

        // Инициализация начального состояния
        this.update();
    }


    // Обработчики событий
    handleScroll() {
        this.update();
        this.show();
    }


    handleMouseMove() {
        this.show();
        this.hide();
    }


    handleMouseOut(e) {
        if (e.relatedTarget === null) {
            this.isMouseInWindow = false;
            this.hide();
        }
    }


    handleMouseOver() {
        this.isMouseInWindow = true;
    }
}

// Экспортируем класс для использования в других модулях
export default Scrollbar;
