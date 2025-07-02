/**
 * Сервис для работы с устройством
 */
export class DeviceService {
    constructor() {
        // Конструктор класса
    }
    /**
     * Проверяет, является ли устройство iOS
     * @returns {boolean}
     */
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent);
    }

    /**
     * Инициализирует сервис
     */
    init() {
        if (this.isIOS()) {
            document.documentElement.classList.add('ios-device');
            console.log('Обнаружено iOS устройство');
        }
    }
}

// Для обратной совместимости с глобальным объектом
window.DeviceService = DeviceService;
