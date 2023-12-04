// from https://gist.github.com/DiegoSalazar/4075533/

// This takes only 10 digits
export function validNationalIDNumber(value: string) {
  // Accept only digits, dashes or spaces
  if (/[^0-9-\s]+/.test(value)) {
    return false;
  }

  // The Luhn Algorithm. It's so pretty.
  let nCheck = 0,
    bEven = false;
  value = value.replace(/\D/g, "");

  for (var n = value.length - 1; n >= 0; n--) {
    var cDigit = value.charAt(n),
      nDigit = parseInt(cDigit, 10);

    if (bEven && (nDigit *= 2) > 9) nDigit -= 9;

    nCheck += nDigit;
    bEven = !bEven;
  }

  return nCheck % 10 == 0;
}
