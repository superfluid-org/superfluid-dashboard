import { add } from "date-fns";

export function getDatesBetween(startDate: Date, endDate: Date) {
  const datesBetween = [];
  let currentDate = startDate;

  while (currentDate < endDate) {
    datesBetween.push(currentDate);
    currentDate = add(new Date(currentDate), { days: 1 });
  }

  datesBetween.push(endDate);

  return datesBetween;
}

export const getTimeInSeconds = (date: Date) => Math.floor(date.getTime() / 1000);

export const dateNowSeconds = () => Math.floor(Date.now() / 1000);
