import type { MarketStatus, MarketStatusInfo } from './types.ts';

// Standard NSE Trading Holidays (YYYY-MM-DD) for 2025 & 2026
const NSE_HOLIDAYS_SET = new Set<string>([
  // 2025
  '2025-01-26', // Republic Day
  '2025-02-26', // Maha Shivratri
  '2025-03-14', // Holi
  '2025-03-31', // Id-Ul-Fitr
  '2025-04-10', // Mahavir Jayanti
  '2025-04-14', // Dr. Baba Saheb Ambedkar Jayanti
  '2025-04-18', // Good Friday
  '2025-05-01', // Maharashtra Day
  '2025-08-15', // Independence Day
  '2025-08-27', // Ganesh Chaturthi
  '2025-10-02', // Mahatma Gandhi Jayanti
  '2025-10-21', // Diwali Laxmi Pujan (Muhurat trading evening only)
  '2025-10-22', // Diwali Balipratipada
  '2025-11-05', // Gurunanak Jayanti
  '2025-12-25', // Christmas
  // 2026
  '2026-01-26', // Republic Day
  '2026-02-15', // Maha Shivratri
  '2026-03-03', // Holi
  '2026-03-20', // Eid-ul-Fitr
  '2026-04-03', // Good Friday
  '2026-04-14', // Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-08-15', // Independence Day
  '2026-09-15', // Ganesh Chaturthi
  '2026-10-02', // Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-08', // Diwali
  '2026-11-24', // Guru Nanak Jayanti
  '2026-12-25', // Christmas
]);

/**
 * Converts any Date or timestamp to IST (Asia/Kolkata, UTC+5:30) components
 */
export function getISTDate(dateInput: Date | number = new Date()) {
  const date = typeof dateInput === 'number' ? new Date(dateInput) : dateInput;
  // Offset by 5h 30m
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const istTime = new Date(utc + 5.5 * 3600000);

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, '0');
  const day = String(istTime.getDate()).padStart(2, '0');
  const hours = istTime.getHours();
  const minutes = istTime.getMinutes();
  const seconds = istTime.getSeconds();
  const dayOfWeek = istTime.getDay(); // 0 = Sun, 6 = Sat

  const dateStr = `${year}-${month}-${day}`;
  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    dateStr,
    timeStr,
    hours,
    minutes,
    seconds,
    dayOfWeek,
    istDate: istTime,
  };
}

/**
 * Formats a timestamp into human-readable IST format: e.g. "12 Sep 2026, 03:30 PM IST"
 */
export function formatISTDateTime(timestamp?: number | string | Date): string {
  if (!timestamp) return 'N/A';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return String(timestamp);

  const ist = getISTDate(d);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[ist.istDate.getMonth()];
  const day = ist.istDate.getDate();
  const year = ist.istDate.getFullYear();

  let h = ist.hours;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  const hStr = String(h).padStart(2, '0');
  const mStr = String(ist.minutes).padStart(2, '0');

  return `${day} ${monthName} ${year}, ${hStr}:${mStr} ${ampm} IST`;
}

/**
 * Checks current NSE market status based on IST clock
 */
export function getMarketStatus(dateInput: Date | number = new Date()): MarketStatusInfo {
  const ist = getISTDate(dateInput);
  const { dateStr, hours, minutes, dayOfWeek } = ist;
  const timeInMinutes = hours * 60 + minutes;

  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isHoliday = NSE_HOLIDAYS_SET.has(dateStr);

  let status: MarketStatus = 'CLOSED';
  let message = 'Market is closed';
  let isOpen = false;

  if (isWeekend) {
    status = 'WEEKEND';
    message = 'Weekend — NSE Market Closed';
  } else if (isHoliday) {
    status = 'HOLIDAY';
    message = 'NSE Holiday — Market Closed';
  } else {
    // Normal weekday
    const preMarketStart = 9 * 60; // 09:00 AM IST
    const marketOpen = 9 * 60 + 15; // 09:15 AM IST
    const marketClose = 15 * 60 + 30; // 03:30 PM IST

    if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
      status = 'PRE_MARKET';
      message = 'NSE Pre-Market Session (09:00 - 09:15 IST)';
      isOpen = false;
    } else if (timeInMinutes >= marketOpen && timeInMinutes <= marketClose) {
      status = 'OPEN';
      message = 'NSE Live Trading Session (09:15 - 15:30 IST)';
      isOpen = true;
    } else {
      status = 'CLOSED';
      message = timeInMinutes < preMarketStart
        ? 'NSE Market Opens at 09:15 AM IST'
        : 'NSE Session Closed at 03:30 PM IST';
      isOpen = false;
    }
  }

  return {
    marketStatus: status,
    isOpen,
    currentIstTime: formatISTDateTime(dateInput),
    tradingDate: dateStr,
    lastSessionClose: '15:30:00 IST',
    isDelayed: !isOpen,
    message,
  };
}
