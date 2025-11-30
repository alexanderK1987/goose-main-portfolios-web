export function toCurrency(number) {
  if (Number.isNaN(parseFloat(number))) {
    number = 0;
  }

  return (number || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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
