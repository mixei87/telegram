/**
 * Утилита для определения типа устройства и ОС
 */

export const DeviceDetector = {
    /**
     * Определяет, является ли устройство мобильным
     * @returns {boolean}
     */
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },

    /**
     * Определяет, является ли устройство iOS
     * @returns {boolean}
     */
    isIOS() {
        const userAgent = navigator.userAgent;
        const isIOS = /iPad|iPhone|iPod/.test(userAgent);
        
        // Проверяем, что это не Windows Phone (который может содержать iPhone в userAgent)
        const isWindowsPhone = /Windows Phone|IEMobile|WPDesktop/.test(userAgent);
        
        return isIOS && !isWindowsPhone;
    },

    /**
     * Инициализирует определение устройства и добавляет соответствующие классы
     */
    init() {
        if (this.isMobile()) {
            document.documentElement.classList.add('mobile-device');
        }
        
        if (this.isIOS()) {
            document.documentElement.classList.add('ios-device');
        }
        
        // Для отладки
        console.log('Device detection:', {
            isMobile: this.isMobile(),
            isIOS: this.isIOS(),
            userAgent: navigator.userAgent
        });
    }
};

// Автоматическая инициализация при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DeviceDetector.init());
} else {
    DeviceDetector.init();
}
