import worldCountries from "world-countries"

export interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

export const COUNTRIES: Country[] = worldCountries
  .filter((c) => c.idd?.root)
  .map((c) => ({
    code: c.cca2,
    name: c.translations.fra?.common ?? c.name.common,
    dialCode: `${c.idd.root}${c.idd.suffixes?.[0] ?? ""}`,
    flag: c.flag,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "fr"))

export const DEFAULT_COUNTRY_CODE = "CM"

export function getCountryByCode(code: string): Country | undefined {
  return COUNTRIES.find((c) => c.code === code)
}
