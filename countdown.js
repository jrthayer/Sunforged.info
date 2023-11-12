function getNextUtcDayAtTime(dateNow, targetDay, targetHour, targetMinute) {
    const targetDate = new Date(dateNow);

    // Calculate the days until the next target Day
    const daysUntilTargetDay = (targetDay - dateNow.getUTCDay() + 7) % 7;
    targetDate.setUTCDate(daysUntilTargetDay + dateNow.getUTCDate());

    targetDate.setUTCHours(targetHour, targetMinute, 0, 0);

    // Calculate the time difference in milliseconds
    let timeTill = targetDate - dateNow;

    // If the difference is negative the event has passed today already, so we add a week
    if (timeTill <= 0) {
        // If the target time for today has already passed, schedule it for next week
        targetDate.setUTCDate(targetDate.getUTCDate() + 7);
        timeTill = targetDate - dateNow;
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
        date: targetDate,
    };
}

function setCountdown(timeTill) {
    let domCountdownUnits = document.querySelectorAll(
        ".nextShow__countdown-unit > div:first-of-type"
    );
    domCountdownUnits[0].textContent = lessThanTen(timeTill.days);
    domCountdownUnits[1].textContent = lessThanTen(timeTill.hours);
    domCountdownUnits[2].textContent = lessThanTen(timeTill.minutes);
    domCountdownUnits[3].textContent = lessThanTen(timeTill.seconds);
}

function lessThanTen(value) {
    if (Number(value) < 10) {
        value = "0" + value;
    }
    return value;
}

function setLocalSchedule(utcShowDate) {
    const time = utcShowDate.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    const day = utcShowDate.toLocaleDateString(undefined, {
        weekday: "long",
    });

    let domFooter = document.querySelector(".nextShow__footer");
    domFooter.innerHTML = `Sunforged sessions are run every <br \/\>${day} @ ${time}`;
}

//Get the next UTC Sunday at 20:30 (8:30 PM)
const utcShowDay = 0;
const utcShowHour = 20;
const utcShowMinutes = 30;
let dateNow = new Date();
let nextUtcSunday = getNextUtcDayAtTime(
    dateNow,
    utcShowDay,
    utcShowHour,
    utcShowMinutes
);
setLocalSchedule(nextUtcSunday.date);

setInterval(() => {
    dateNow = new Date();
    nextUtcSunday = getNextUtcDayAtTime(
        dateNow,
        utcShowDay,
        utcShowHour,
        utcShowMinutes
    );
    setCountdown(nextUtcSunday);
}, 1000);
