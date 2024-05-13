import BCCRWS from "../src/index.js";

const bccr = new BCCRWS("<token>", "<mail>", "<user>");

//const data = await bccr.getExchangeRate(BCCRWS.indicators.EUR_USD_RATE, "01/01/2024", "08/01/2024");
const data = await bccr.getCurrencyExchangeRate("EUR", "01/01/2024", "08/01/2024");
console.log(data);