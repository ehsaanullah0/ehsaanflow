import { Priority } from '../types';
import { addDays, getTodayKey } from './dateUtils';

export interface ParsedTaskInput {
  cleanTitle: string;
  dueDate?: string;
  dueDateLabel?: string;
  dueTime?: string;
  priority?: Priority;
  tags: string[];
  categoryName?: string;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAYS_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function parseNaturalLanguageTask(
  rawInput: string,
  referenceDateStr: string = getTodayKey()
): ParsedTaskInput {
  let text = rawInput;
  let dueDate: string | undefined;
  let dueDateLabel: string | undefined;
  let dueTime: string | undefined;
  let priority: Priority | undefined;
  const tags: string[] = [];
  let categoryName: string | undefined;

  // 1. Parse Priority: !urgent, !high, !medium, !low, !1, !2, !3, !4, !u, !h, !m, !l
  const priorityRegex = /(?:^|\s)!([a-zA-Z0-9]+)\b/i;
  const priorityMatch = text.match(priorityRegex);
  if (priorityMatch) {
    const val = priorityMatch[1].toLowerCase();
    if (val === 'urgent' || val === 'u' || val === '4' || val === 'critical') {
      priority = 'urgent';
    } else if (val === 'high' || val === 'h' || val === '3' || val === 'important') {
      priority = 'high';
    } else if (val === 'medium' || val === 'med' || val === 'm' || val === '2') {
      priority = 'medium';
    } else if (val === 'low' || val === 'l' || val === '1') {
      priority = 'low';
    }
    if (priority) {
      text = text.replace(priorityMatch[0], ' ');
    }
  }

  // 2. Parse Tags: #tag or #multi-word
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-]+)\b/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(rawInput)) !== null) {
    const tag = tagMatch[1].toLowerCase();
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }
  text = text.replace(tagRegex, ' ');

  // 3. Parse Category: ~CategoryName or @CategoryName
  const categoryRegex = /(?:^|\s)[~@]([a-zA-Z0-9_\-]+)\b/;
  const catMatch = text.match(categoryRegex);
  if (catMatch) {
    categoryName = catMatch[1];
    text = text.replace(catMatch[0], ' ');
  }

  // 4. Parse Time: e.g. "at 5pm", "5:30pm", "14:00", "9am", "10:15 am"
  const timeRegex = /(?:^|\s)(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i;
  const timeMatch = text.match(timeRegex);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3].toLowerCase();

    if (ampm === 'pm' && hours < 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    dueTime = `${hh}:${mm}`;
    text = text.replace(timeMatch[0], ' ');
  } else {
    // 24h format like 14:30
    const time24Regex = /(?:^|\s)(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/;
    const time24Match = text.match(time24Regex);
    if (time24Match) {
      dueTime = `${String(time24Match[1]).padStart(2, '0')}:${time24Match[2]}`;
      text = text.replace(time24Match[0], ' ');
    }
  }

  // 5. Parse Relative Date Keywords
  const lower = text.toLowerCase();

  // "today", "tdy", "tonight"
  const todayRegex = /\b(today|tdy|tonight)\b/i;
  const todayMatch = text.match(todayRegex);
  if (todayMatch) {
    dueDate = referenceDateStr;
    dueDateLabel = todayMatch[1].toLowerCase() === 'tonight' ? 'Tonight' : 'Today';
    text = text.replace(todayMatch[0], ' ');
  }

  // "tomorrow", "tmrw", "tmw"
  if (!dueDate) {
    const tomorrowRegex = /\b(tomorrow|tmrw|tmw)\b/i;
    const tomorrowMatch = text.match(tomorrowRegex);
    if (tomorrowMatch) {
      dueDate = addDays(referenceDateStr, 1);
      dueDateLabel = 'Tomorrow';
      text = text.replace(tomorrowMatch[0], ' ');
    }
  }

  // "next week"
  if (!dueDate) {
    const nextWeekRegex = /\bnext\s+week\b/i;
    const nextWeekMatch = text.match(nextWeekRegex);
    if (nextWeekMatch) {
      dueDate = addDays(referenceDateStr, 7);
      dueDateLabel = 'Next Week';
      text = text.replace(nextWeekMatch[0], ' ');
    }
  }

  // Days of week: e.g. "on friday", "this friday", "next monday", "monday"
  if (!dueDate) {
    for (let i = 0; i < WEEKDAYS.length; i++) {
      const fullDay = WEEKDAYS[i];
      const shortDay = WEEKDAYS_SHORT[i];
      const dayRegex = new RegExp(`\\b(?:on\\s+|this\\s+|next\\s+)?(${fullDay}|${shortDay})\\b`, 'i');
      const dayMatch = text.match(dayRegex);
      if (dayMatch) {
        // Calculate days to next occurrence of target weekday
        const [y, m, d] = referenceDateStr.split('-').map(Number);
        const refDate = new Date(y, m - 1, d);
        const currentDayIndex = refDate.getDay();
        let daysAhead = i - currentDayIndex;
        if (daysAhead <= 0) {
          daysAhead += 7;
        }
        dueDate = addDays(referenceDateStr, daysAhead);
        dueDateLabel = fullDay.charAt(0).toUpperCase() + fullDay.slice(1);
        text = text.replace(dayMatch[0], ' ');
        break;
      }
    }
  }

  // Clean remaining text
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    cleanTitle: cleanTitle || rawInput.trim(),
    dueDate,
    dueDateLabel,
    dueTime,
    priority,
    tags,
    categoryName,
  };
}
