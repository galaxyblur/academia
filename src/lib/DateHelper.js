export function getNowRoundedToHour() {
  const rightNow = new Date();
  rightNow.setMinutes(0);
  rightNow.setSeconds(0);
  rightNow.setMilliseconds(0);
  return rightNow;
}

export function getTodayAtMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getSecondsSinceMidnight(d = new Date()) {
  const today = getTodayAtMidnight();

  const diff = parseInt(d.getTime() - today.getTime(), 10);
  return parseInt(diff / 1000, 10);
}
