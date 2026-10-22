// A task's reminder as a calendar event (an alert at the reminder time).
// Not "<baby name>-…": that prefix is how the appointments import recognizes appointments.
export function taskEvent({ id, title, note, remindAt }, babyName) {
  const [date, time] = remindAt.split('T');
  return { id, title: `${title}${babyName ? ` (${babyName})` : ''}`, date, time: time.slice(0, 5), durationMinutes: 15, description: note || '', alarms: [0] };
}
