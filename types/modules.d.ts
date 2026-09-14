declare module "react-select-country-list" {
  interface CountryItem {
    label: string;
    value: string;
  }
  interface CountryListInstance {
    getData: () => CountryItem[];
    getValues: () => string[];
    getLabels: () => string[];
    getLabel: (value: string) => string;
    getValue: (label: string) => string;
  }
  function countryList(): CountryListInstance;
  export default countryList;
}
