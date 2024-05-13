import axios from "axios";
import JSDOM from "jsdom";
// Custom modules
import * as utils from "./utils.js";
import indicators from "./constants.js";

// Create class to export
class BCCRWS {
  constructor(token, mail, user_name, ignoreWarnings = true) {
    this.token = token;
    this.mail = mail;
    this.user_name = user_name;
    this.bccr_endpoint =
      "https://gee.bccr.fi.cr/Indicadores/Suscripciones/WS/wsindicadoreseconomicos.asmx/ObtenerIndicadoresEconomicos";
    this.ignoreWarnings = ignoreWarnings;
  }
  /**
   * Get the available indicators to use in the BCCR Web Service
   */
  static get indicators() {
    return indicators;
  }

  /**
   *
   * @param {Number} indicator Positive integer number that represents the indicator to search
   * @param {String} date_from Date in format DD/MM/YYYY to search from
   * @param {String} date_to Date in format DD/MM/YYYY to search to
   * @param {String} sublevels (Optional) "S" to include sublevels, "N" to exclude sublevels
   * @returns Array of objects with the exchange rate
   */
  async getExchangeRate(indicator, date_from, date_to, sublevels = "N") {
    // Verify that date_from and date_to are valid dates
    utils.verifyDates(date_from, date_to);
    // Verify that indicator is a valid number
    utils.verifyIndicator(indicator);
    // Verify that token, mail and user_name are not empty or null
    utils.verifyEmptyOrNull(this.token);
    utils.verifyEmptyOrNull(this.mail);
    utils.verifyEmptyOrNull(this.user_name);

    const exchangeRate = [];
    try {
      const response = await axios.get(this.bccr_endpoint, {
        params: {
          Indicador: indicator,
          FechaInicio: date_from,
          FechaFinal: date_to,
          Nombre: this.user_name,
          SubNiveles: sublevels,
          CorreoElectronico: this.mail,
          Token: this.token,
        },
        responseType: "text",
      });
      const xmlDoc = new JSDOM.JSDOM(response.data, {
        contentType: "text/xml",
      }).window.document;

      const ratesData = xmlDoc.getElementsByTagName(
        "INGC011_CAT_INDICADORECONOMIC"
      );

      for (let i = 0; i < ratesData.length; i++) {
        const date =
          ratesData[i].getElementsByTagName("DES_FECHA")[0]?.childNodes[0]
            ?.nodeValue;
        const rate =
          ratesData[i].getElementsByTagName("NUM_VALOR")[0]?.childNodes[0]
            ?.nodeValue;
        if (date && rate) {
          exchangeRate.push({ date, rate, indicator });
        } else if (!this.ignoreWarnings) {
          console.warn(
            `Invalid ${date ? "rate" : "date"} for ${date ? "date" : "rate"}: ${
              date ? date : rate
            }`
          );
        }
      }
    } catch (error) {
      console.error(error);
    }
    return exchangeRate;
  }

  /**
   * Get the USD sell exchange rate from the BCCR for the given dates
   * @param {String} date_from Date in format DD/MM/YYYY to search from
   * @param {String} date_to Date in format DD/MM/YYYY to search to
   * @returns Array of objects with the exchange rate
   */
  async getUSDSellExchangeRate(date_from, date_to) {
    return await this.getExchangeRate(
      indicators.SELL_CRC_USD_RATE,
      date_from,
      date_to
    );
  }

  /**
   * Get the USD purchase exchange rate from the BCCR for the given dates
   * @param {String} date_from Date in format DD/MM/YYYY to search from
   * @param {String} date_to Date in format DD/MM/YYYY to search to
   * @returns Array of objects with the exchange rate
   */
  async getUSDPurchaseExchangeRate(date_from, date_to) {
    return await this.getExchangeRate(
      indicators.PURCHASE_CRC_USD_RATE,
      date_from,
      date_to
    );
  }

  /**
   *  Get the USD sell exchange rate for today
   *  @returns Object with the exchange rate
   */
  async getTodayUSDSellExchangeRate() {
    const date_from = getTodayDate();
    return await this.getUSDSellExchangeRate(date_from, date_from)[0];
  }

  /**
   *  Get the USD purchase exchange rate for today
   *  @returns Object with the exchange rate
   */
  async getTodayUSDPurchaseExchangeRate() {
    const date_from = getTodayDate();
    return await this.getUSDPurchaseExchangeRate(date_from, date_from)[0];
  }

  /** Get currency exchange rate to an specific currency for the given dates
   * @param {String} currency Currency to search using the format ISO 4217
   * @param {String} date_from Date in format DD/MM/YYYY to search from
   * @param {String} date_to Date in format DD/MM/YYYY to search to
   * @returns Array of objects with the exchange rate
   */
  async getCurrencyExchangeRate(currency, date_from, date_to) {
    const currency_indicator = indicators[`${currency}_USD_RATE`];
    if (!currency_indicator)
      throw new Error("Invalid currency. Verify the ISO 4217 code.");
    // Get the value of 1 USD in the currency selected
    const currency_rates = await this.getExchangeRate(
      currency_indicator,
      date_from,
      date_to
    );
    // Get the value of 1 USD in CRC
    const dollar_rates = await this.getUSDPurchaseExchangeRate(
      date_from,
      date_to
    );

    // Order the arrays by date
    currency_rates.sort((a, b) => new Date(a.date) - new Date(b.date));
    dollar_rates.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (currency_rates.length !== dollar_rates.length && !this.ignoreWarnings) {
      console.warn(
        `The number of currency (${currency}) rates and dollar rates are different`
      );
    }

    const exchange_rates = [];
    for (let i = 0; i < currency_rates.length; i++) {
      // The exchange rate for currencies other than USD is not
      // available for the weekends (Sat. and Sun.) so we need to prevent any problem
      if (currency_rates[i].date === dollar_rates[i].date) {
        const date = currency_rates[i].date;
        const currency_value =
          currency === "EUR"
            ? currency_rates[i].rate //For some reason it brings the value of 1 EUR in USD
            : 1 / currency_rates[i].rate;
        const rate = currency_value * dollar_rates[i].rate;
        exchange_rates.push({ date, rate, currency });
      }
    }

    return exchange_rates;
  }
}

export default BCCRWS;
