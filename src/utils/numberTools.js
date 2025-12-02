export function toCurrency(number, digits) {
  if (Number.isNaN(parseFloat(number))) {
    number = 0;
  }

  return (number || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}

export function toPercentage(number, withSign = true, fractionDigits = 2) {
  // Convert to number safely
  const parsedNumber = parseFloat(number);
  const signString = (withSign && parsedNumber >= 0) ? '+' : '';
  if (!Number.isFinite(parsedNumber)) {
    return `${signString}∞`;
  }
  if (Number.isNaN(parsedNumber)) {
    number = 0;
  }

  return signString + parsedNumber.toLocaleString('en-US', {
    style: 'percent',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function toUDPercentage(number, fractionDigits = 2) {
  const pctString = toPercentage(number, true, fractionDigits);
  const upSign = '▲ ';
  const downSign = '▼ ';

  return pctString.replace('+', upSign).replace('-', downSign);
}

export function toLocaleDateString(dateInput) {
  const date = new Date(dateInput);

  return (Number.isNaN(date)) ? '----' : date.toLocaleDateString();
}

export function toAgeString(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date)) return '--';

  const now = new Date();

  let years = now.getFullYear() - date.getFullYear();
  let months = now.getMonth() - date.getMonth();
  let days = now.getDate() - date.getDate();

  // Adjust days
  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate(); // number of days in previous month
  }

  // Adjust months
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return `${years}y ${months}m ${days}d`;
}

export function getTrendColor(diffPercentages) {
  return diffPercentages > 0.1e-2
    ? 'success'
    : diffPercentages < -0.1e-2
      ? 'error' : 'secondary';
}
