
import { countryCodes } from './countryCodes';

export const extractCountryAndNumber = (fullNumber) => {
  if (!fullNumber) return { countrycode: "+91", mobile: "" };

  const cleaned = fullNumber.replace(/\s+/g, "");

  // Sort country codes by length in descending order to match longest codes first
  const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

  for (const country of sortedCountryCodes) {
    if (cleaned.startsWith(country.code)) {
      return {
        countrycode: country.code,
        mobile: cleaned.substring(country.code.length),
      };
    }
  }

  // fallback if number doesn't match any country code
  return { countrycode: "+91", mobile: cleaned };
};

export const extractCountryCode = (fullNumber) => {
  if (!fullNumber) return "+91"; // Default country code

  const cleaned = fullNumber.replace(/\s+/g, "");

  const sortedCountryCodes = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

  for (const country of sortedCountryCodes) {
    if (cleaned.startsWith(country.code)) {
      return country.code;
    }
  }

  return "+91"; // Default if no matching country code found
};
