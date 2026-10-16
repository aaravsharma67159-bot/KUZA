/**
 * Converts a numeric TND amount into French legal text for invoices.
 * Example: 87.000 -> "Quatre-vingt-sept Dinars Tunisiens et Zéro Millimes"
 */
export function numberToFrenchWords(n: number): string {
  const units = [
    '',
    'un',
    'deux',
    'trois',
    'quatre',
    'cinq',
    'six',
    'sept',
    'huit',
    'neuf',
    'dix',
    'onze',
    'douze',
    'treize',
    'quatorze',
    'quinze',
    'seize',
    'dix-sept',
    'dix-huit',
    'dix-neuf',
  ];

  const tens = [
    '',
    'dix',
    'vingt',
    'trente',
    'quarante',
    'cinquante',
    'soixante',
    'soixante-dix',
    'quatre-vingts',
    'quatre-vingt-dix',
  ];

  function convertUnder100(num: number): string {
    if (num === 0) return '';
    if (num < 20) return units[num];

    const tenIndex = Math.floor(num / 10);
    const unitRemainder = num % 10;

    if (tenIndex === 7) {
      if (unitRemainder === 1) return 'soixante-et-onze';
      return `soixante-${units[10 + unitRemainder]}`;
    }
    if (tenIndex === 8) {
      if (unitRemainder === 0) return 'quatre-vingts';
      return `quatre-vingt-${units[unitRemainder]}`;
    }
    if (tenIndex === 9) {
      return `quatre-vingt-${units[10 + unitRemainder]}`;
    }

    if (unitRemainder === 0) return tens[tenIndex];
    if (unitRemainder === 1) return `${tens[tenIndex]}-et-un`;
    return `${tens[tenIndex]}-${units[unitRemainder]}`;
  }

  function convertUnder1000(num: number): string {
    if (num === 0) return '';
    const hundred = Math.floor(num / 100);
    const rest = num % 100;

    let prefix = '';
    if (hundred === 1) {
      prefix = 'cent';
    } else if (hundred > 1) {
      prefix = `${units[hundred]} cent${rest === 0 ? 's' : ''}`;
    }

    const restWord = convertUnder100(rest);
    if (!prefix) return restWord;
    if (!restWord) return prefix;
    return `${prefix} ${restWord}`;
  }

  function convertNumber(num: number): string {
    if (num === 0) return 'zéro';
    const thousand = Math.floor(num / 1000);
    const rest = num % 1000;

    let res = '';
    if (thousand === 1) {
      res = 'mille';
    } else if (thousand > 1) {
      res = `${convertUnder1000(thousand)} mille`;
    }

    const restWord = convertUnder1000(rest);
    if (res && restWord) {
      return `${res} ${restWord}`;
    }
    return res || restWord || 'zéro';
  }

  const dinars = Math.floor(n);
  const millimes = Math.round((n - dinars) * 1000);

  const dinarText = convertNumber(dinars);
  const capitalDinarText = dinarText.charAt(0).toUpperCase() + dinarText.slice(1);

  if (millimes > 0) {
    const millimeText = convertNumber(millimes);
    return `${capitalDinarText} Dinars Tunisiens et ${millimeText} Millimes`;
  }

  return `${capitalDinarText} Dinars Tunisiens et Zéro Millimes`;
}
