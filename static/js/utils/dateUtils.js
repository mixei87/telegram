/**
 * Конвертирует дату из UTC в локальный часовой пояс
 * @param {string|Date} dateInput - Строка с датой в формате ISO (UTC) или объект Date
 * @returns {Date} Дата в локальном часовом поясе
 */
function utcToLocal(dateInput) {
    if (!dateInput) return null;
    
    let date;
    
    if (typeof dateInput === 'string') {
        // Если пришла строка, добавляем 'Z' если его нет
        const dateString = dateInput.endsWith('Z') ? dateInput : `${dateInput}Z`;
        date = new Date(dateString);
    } else if (dateInput instanceof Date) {
        // Если пришел объект Date, создаем новый, чтобы не мутировать исходный
        date = new Date(dateInput.getTime());
    } else {
        console.error('Invalid date input:', dateInput);
        return null;
    }
    
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateInput);
        return null;
    }
    
    // Отладочная информация
    console.log('UTC to Local conversion:', {
        input: dateInput,
        localISO: date.toISOString(),
        localString: date.toString(),
        localHours: date.getHours(),
        localMinutes: date.getMinutes(),
        timezoneOffset: date.getTimezoneOffset() / -60 // В часах
    });
    
    return date;
}

/**
 * Форматирует дату в формате "HH:MM" (часы:минуты)
 * @param {string|Date} date - Дата в формате ISO строки или объект Date
 * @returns {string} Отформатированная строка времени
 */
export function formatTime(date) {
    const d = utcToLocal(date);
    if (!d) return '';
    
    // Форматируем часы и минуты с ведущими нулями
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
}

/**
 * Форматирует дату в зависимости от давности
 * @param {string|Date} date - Дата в формате ISO строки или объект Date
 * @returns {string} Отформатированная строка даты
 */
export function formatMessageDate(date) {
    const d = utcToLocal(date);
    if (!d) return '';
    
    const now = new Date();
    // Приводим обе даты к началу дня для корректного сравнения
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const diffDays = Math.floor((today - messageDate) / (1000 * 60 * 60 * 24));
    
    // Сегодня - только время
    if (diffDays === 0) {
        return formatTime(d);
    }
    
    // Вчера - "Вчера, HH:MM"
    if (diffDays === 1) {
        return `Вчера, ${formatTime(d)}`;
    }
    
    // На этой неделе - день недели и время
    if (diffDays < 7) {
        const days = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота'];
        const dayName = days[d.getDay()];
        return `${dayName}, ${formatTime(d)}`;
    }
    
    // Более недели назад - полная дата и время
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}.${month}.${year}, ${formatTime(d)}`;
}

/**
 * Форматирует полную дату и время для атрибута title
 * @param {string|Date} date - Дата в формате ISO строки или объект Date
 * @returns {string} Отформатированная строка даты и времени
 */
export function formatFullDateTime(date) {
    const d = utcToLocal(date);
    if (!d) return '';
    
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
}
