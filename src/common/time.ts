export default function currentDateTimeToString(): string {
  const currentDate = new Date();
  const currentDateTime =
    currentDate.getFullYear() +
    ("0" + (currentDate.getMonth() + 1)).slice(-2) +
    ("0" + currentDate.getDate()).slice(-2) +
    "-" +
    ("0" + currentDate.getHours()).slice(-2) +
    ("0" + currentDate.getMinutes()).slice(-2) +
    ("0" + currentDate.getSeconds()).slice(-2);
  return currentDateTime;
}
