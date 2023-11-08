function getNextUtcDayAtTime(targetDay, targetHour, targetMinute) {
    const now = new Date();

    const targetDate = new Date(now);
    // Calculate the days until the next target Day
    const daysUntilTargetDay = (targetDay - now.getUTCDay() + 7) % 7;
    targetDate.setDate(daysUntilTargetDay + now.getUTCDate());

    // Set the target time
    targetDate.setUTCHours(targetHour, targetMinute, 0, 0);

    // Calculate the time difference in milliseconds
    let timeTill = targetDate - now;

    // If the difference is negative the event has passed today already, so we add a week
    if (timeTill <= 0) {
        // If the target time for today has already passed, schedule it for next week
        targetDate.setUTCDate(targetDate.getUTCDate() + 7);
        timeTill = targetDate - now;
    }

    const days = Math.floor(timeTill / (24 * 60 * 60 * 1000));
    const hours = Math.floor(
        (timeTill % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
    );
    const minutes = Math.floor((timeTill % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((timeTill % (60 * 1000)) / 1000);

    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: seconds,
    };
}

// Example: Get the next UTC Sunday at 20:30 (8:30 PM)
const targetDay = 0;
const targetHour = 20;
const targetMinute = 30;
let nextUtcSunday = getNextUtcDayAtTime(targetDay, targetHour, targetMinute);

setInterval(() => {
    (nextUtcSunday = getNextUtcDayAtTime(targetDay, targetHour, targetMinute)),
        setCountdown();
}, 1000);

function setCountdown() {
    let domCountdownUnits = document.querySelectorAll(
        ".nextShow__countdown-unit > div:first-of-type"
    );
    domCountdownUnits[0].textContent = lessThanTen(nextUtcSunday.days);
    domCountdownUnits[1].textContent = lessThanTen(nextUtcSunday.hours);
    domCountdownUnits[2].textContent = lessThanTen(nextUtcSunday.minutes);
    domCountdownUnits[3].textContent = lessThanTen(nextUtcSunday.seconds);
}

function lessThanTen(value) {
    if (Number(value) < 10) {
        value = "0" + value;
    }
    return value;
}
