// A task's reminder as a calendar event (an alert at the reminder time; length: the task's duration, 15 min by default).
// Not "<baby name>-…": that prefix is how the appointments import recognizes appointments.
export function taskEvent({ id, title, note, remindAt, duration = 15 }, babyName) {
  const [date, time] = remindAt.split('T');
  return { id, title: `${title}${babyName ? ` (${babyName})` : ''}`, date, time: time.slice(0, 5), durationMinutes: duration || 15, description: note || '', alarms: [0] };
}
