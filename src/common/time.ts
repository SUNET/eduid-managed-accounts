export default function currentDateTimeToString(): string {
  const currentdate = new Date();
  const currentDateTime =
    currentdate.getFullYear() +
    ("0" + (currentdate.getMonth() + 1)).slice(-2) +
    ("0" + currentdate.getDate()).slice(-2) +
    "-" +
    ("0" + currentdate.getHours()).slice(-2) +
    ("0" + currentdate.getMinutes()).slice(-2) +
    ("0" + currentdate.getSeconds()).slice(-2);
  return currentDateTime;
}
