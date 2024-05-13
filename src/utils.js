export function verifyDate(date, type = "From") {
  verifyEmptyOrNull(date);
  // Verify date format DD/MM/YYYY
  if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(date)) {
    throw new Error(`Invalid ${type} date format`);
  }
  // Verify that the day in DD/MM/YYYY is a valid date
  const dateInfo = date.split("/");
  if (isNaN(new Date(dateInfo[2], dateInfo[1] - 1, dateInfo[0]).getTime())) {
    throw new Error(`Invalid ${type} date`);
  }
}

export function verifyDates(date_from, date_to) {
  verifyDate(date_from, "From");
  verifyDate(date_to, "To");
  if (new Date(date_from) > new Date(date_to)) {
    throw new Error("From date is greater than to date");
  }
}

export function verifyIndicator(indicator) {
  verifyEmptyOrNull(indicator);
  // Verify that is a positive integer number
  if (!/^\d+$/.test(indicator)) {
    throw new Error("Invalid indicator. Must be a positive integer number");
  }
}

export function verifyEmptyOrNull(value) {
  if (value === "" || value === null || value === undefined) {
    throw new Error("Empty or null value");
  }
}

export function getTodayDate() {
  let today = new Date();
  // Verify if it is sunday and change to friday
  if (today.getDay() === 0) {
    today.setDate(today.getDate() - 2);
  }

  return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
}