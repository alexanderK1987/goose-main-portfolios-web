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

export function toAbbreviatedCurrency(number, digits = 2) {
  if (Number.isNaN(parseFloat(number)) || number === null || number === undefined) {
    number = 0;
  }

  const num = parseFloat(number);
  const tiers = [
    { value: 1e15, symbol: 'Q' }, // Quadrillion
    { value: 1e12, symbol: 'T' }, // Trillion
    { value: 1e9, symbol: 'B' }, // Billion
    { value: 1e6, symbol: 'M' }, // Million
    { value: 1e3, symbol: 'K' }, // Thousand
  ];

  const tier = tiers.find(t => Math.abs(num) >= t.value);

  if (tier) {
    const abbreviation = (num / tier.value).toFixed(digits);
    const suffix = tier.symbol;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0, // We handle digits ourselves in 'abbreviation'
      maximumFractionDigits: 0,
    });

    // Format a placeholder (like 1 or -1) to extract the currency symbol and sign.
    const parts = formatter.formatToParts(num >= 0 ? 1 : -1);
    const symbol = parts.find(p => p.type === 'currency')?.value || '$';

    // Construct the final string: Symbol + Abbreviation + Suffix
    return `${symbol}${abbreviation}${suffix}`;
  }

  // If the number is too small (less than 1,000) or zero, use your original function's logic
  return (num).toLocaleString('en-US', {
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

  return (Number.isNaN(date.getDate())) ? 'no-data' : date.toLocaleDateString();
}

export function toAgeString(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getDate())) return 'no-data';

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
  return diffPercentages > 0
    ? 'success'
    : diffPercentages < 0
      ? 'error' : 'secondary';
}
