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
