export interface StreakData {
  currentStreak: number;
  bestStreak: number;
  activityDays: string[];
  lastActivityDate: string | null;
}

export function parseStreakData(rawData: unknown): StreakData {
  if (!rawData || typeof rawData !== 'object') {
    return { currentStreak: 0, bestStreak: 0, activityDays: [], lastActivityDate: null };
  }

  const data = rawData as any;
  return {
    currentStreak: typeof data.currentStreak === 'number' ? data.currentStreak : 0,
    bestStreak: typeof data.bestStreak === 'number' ? data.bestStreak : 0,
    activityDays: Array.isArray(data.activityDays) ? data.activityDays : [],
    lastActivityDate: typeof data.lastActivityDate === 'string' ? data.lastActivityDate : null,
  };
}

export function updateStreakData(streakData: StreakData, dateObj: Date = new Date()): StreakData {
  const todayStr = dateObj.toISOString().split('T')[0];

  let { currentStreak, bestStreak, activityDays, lastActivityDate } = streakData;

  if (lastActivityDate === todayStr) {
    return streakData;
  }

  const yesterdayObj = new Date(dateObj);
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = yesterdayObj.toISOString().split('T')[0];

  if (lastActivityDate === yesterdayStr) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  activityDays.push(todayStr);
  if (activityDays.length > 14) {
    activityDays = activityDays.slice(activityDays.length - 14);
  }

  return {
    currentStreak,
    bestStreak,
    activityDays,
    lastActivityDate: todayStr,
  };
}

export function getLast7DaysActivity(
  activityDays: string[],
  referenceDate: Date = new Date(),
): boolean[] {
  const result: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    result.push(activityDays.includes(dateStr));
  }
  return result;
}

export function getDaysOfWeek(referenceDate: Date = new Date()): string[] {
  const result: string[] = [];
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(referenceDate);
    d.setDate(d.getDate() - i);
    result.push(days[d.getDay()]);
  }
  return result;
}
