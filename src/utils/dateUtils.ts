/**
 * Date manipulation utilities designed to prevent timezone offsets
 * by working consistently with local date strings in "YYYY-MM-DD" format.
 */

export function formatDateKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0); // Noon prevents any daylight savings boundary jumps
}

export function getTodayKey(): string {
  return formatDateKey(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const d = parseDateKey(dateStr);
  d.setDate(d.getDate() + days);
  return formatDateKey(d);
}

export function differenceInCalendarDays(startStr: string, endStr: string): number {
  const d1 = parseDateKey(startStr);
  const d2 = parseDateKey(endStr);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDisplayDate(
  dateStr: string,
  style: 'full' | 'short' | 'dayOnly' | 'monthDay' | 'relative' | 'weekday' = 'full'
): string {
  if (!dateStr) return '';
  const d = parseDateKey(dateStr);
  const today = getTodayKey();

  if (style === 'relative') {
    if (dateStr === today) return 'Today';
    const tomorrow = addDays(today, 1);
    if (dateStr === tomorrow) return 'Tomorrow';
    const yesterday = addDays(today, -1);
    if (dateStr === yesterday) return 'Yesterday';
    const diff = differenceInCalendarDays(today, dateStr);
    if (diff < 0) {
      return `${Math.abs(diff)}d overdue`;
    }
    if (diff > 1 && diff <= 7) {
      return `In ${diff} days`;
    }
  }

  if (style === 'dayOnly' || style === 'weekday') {
    return d.toLocaleDateString(undefined, { weekday: 'short' });
  }

  if (style === 'monthDay') {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  if (style === 'short') {
    return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  }

  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getDayOfWeekIndex(dateStrOrDate: string | Date): number {
  const d = typeof dateStrOrDate === 'string' ? parseDateKey(dateStrOrDate) : dateStrOrDate;
  return d.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
}

export function isScheduledDay(scheduledDays: number[], dateStrOrDate: string | Date): boolean {
  const dayIndex = getDayOfWeekIndex(dateStrOrDate);
  return scheduledDays.includes(dayIndex);
}

export interface WeekDayInfo {
  date: Date;
  dateStr: string;
  dayIndex: number;
  dayName: string;
  dayShort: string;
  dayNumber: number;
  isToday: boolean;
}

export function getWeekDates(baseDateStr: string, weekStartsOn: 0 | 1 = 1): WeekDayInfo[] {
  const baseDate = parseDateKey(baseDateStr);
  const currentDay = baseDate.getDay(); // 0 = Sunday
  
  // Calculate distance to start of week
  let distanceToStart = currentDay - weekStartsOn;
  if (distanceToStart < 0) {
    distanceToStart += 7;
  }

  const startDate = new Date(baseDate);
  startDate.setDate(baseDate.getDate() - distanceToStart);

  const todayStr = getTodayKey();
  const weekDays: WeekDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const dateStr = formatDateKey(d);
    weekDays.push({
      date: d,
      dateStr,
      dayIndex: d.getDay(),
      dayName: d.toLocaleDateString(undefined, { weekday: 'long' }),
      dayShort: d.toLocaleDateString(undefined, { weekday: 'short' }),
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    });
  }

  return weekDays;
}

export interface CalendarDayInfo {
  date: Date;
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  dayOfWeek: number;
}

export function getMonthCalendarGrid(year: number, month: number, weekStartsOn: 0 | 1 = 1): CalendarDayInfo[][] {
  const firstDayOfMonth = new Date(year, month, 1, 12);
  const lastDayOfMonth = new Date(year, month + 1, 0, 12);
  const todayStr = getTodayKey();

  const days: CalendarDayInfo[] = [];

  // Previous month padding
  let startDayOfWeek = firstDayOfMonth.getDay();
  let leadingDays = startDayOfWeek - weekStartsOn;
  if (leadingDays < 0) leadingDays += 7;

  for (let i = leadingDays; i > 0; i--) {
    const d = new Date(year, month, 1 - i, 12);
    const dateStr = formatDateKey(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      dayOfWeek: d.getDay(),
    });
  }

  // Current month
  const totalDaysInMonth = lastDayOfMonth.getDate();
  for (let i = 1; i <= totalDaysInMonth; i++) {
    const d = new Date(year, month, i, 12);
    const dateStr = formatDateKey(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      dayOfWeek: d.getDay(),
    });
  }

  // Next month padding to fill complete weeks (multiples of 7)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i, 12);
    const dateStr = formatDateKey(d);
    days.push({
      date: d,
      dateStr,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
      isPast: dateStr < todayStr,
      dayOfWeek: d.getDay(),
    });
  }

  // Group into weeks of 7
  const weeks: CalendarDayInfo[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return weeks;
}

export function getMonthDays(year: number, month: number, weekStartsOn: 0 | 1 = 1): CalendarDayInfo[] {
  return getMonthCalendarGrid(year, month, weekStartsOn).flat();
}

export function getWeekDays(baseDateStr: string, weekStartsOn: 0 | 1 = 1): string[] {
  return getWeekDates(baseDateStr, weekStartsOn).map((w) => w.dateStr);
}
