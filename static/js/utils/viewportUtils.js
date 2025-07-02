/**
 * Утилиты для работы с viewport и клавиатурой на мобильных устройствах
 */

export function setupViewportHandlers() {
    if (!document.documentElement.classList.contains('mobile-device')) {
        return; // Только для мобильных устройств
    }

    let viewportHeight = window.innerHeight;
    let currentFocus = null;

    // Обновляем высоту viewport при изменении размера окна
    function updateViewportHeight() {
        viewportHeight = window.innerHeight;
        document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`);
    }

    // Обработчик появления/скрытия клавиатуры
    function handleFocusIn(event) {
        if (event.target.matches('textarea, input, [contenteditable]')) {
            // Предотвращаем стандартное поведение
            event.preventDefault();
            event.stopPropagation();
            
            currentFocus = event.target;
            document.body.classList.add('keyboard-visible');
            
            // Фиксируем положение панели ввода
            const inputGroup = event.target.closest('.input-group');
            if (inputGroup) {
                inputGroup.style.position = 'fixed';
                inputGroup.style.bottom = '0';
                inputGroup.style.left = '0';
                inputGroup.style.right = '0';
            }
            
            // Прокручиваем к фокусу с отступом
            setTimeout(() => {
                if (currentFocus && currentFocus.scrollIntoView) {
                    currentFocus.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center',
                        inline: 'nearest'
                    });
                }
            }, 50);
        }
    }


    // Обработчик потери фокуса
    function handleFocusOut(event) {
        if (currentFocus) {
            // Предотвращаем стандартное поведение
            event && event.preventDefault();
            event && event.stopPropagation();
            
            // Задержка для обработки нативного поведения
            setTimeout(() => {
                const inputGroup = currentFocus.closest('.input-group');
                if (inputGroup) {
                    inputGroup.style.position = 'fixed';
                    inputGroup.style.bottom = '0';
                    inputGroup.style.left = '0';
                    inputGroup.style.right = '0';
                }
                
                document.body.classList.remove('keyboard-visible');
                window.scrollTo(0, 0);
                currentFocus = null;
            }, 50);
        }
    }


    // Инициализация
    updateViewportHeight();
    
    // Обработчики событий
    window.addEventListener('resize', updateViewportHeight);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    // Возвращаем функцию для очистки
    return () => {
        window.removeEventListener('resize', updateViewportHeight);
        document.removeEventListener('focusin', handleFocusIn);
        document.removeEventListener('focusout', handleFocusOut);
    };
}

// Экспортируем объект с утилитами
export const viewportUtils = {
    setupViewportHandlers
};
