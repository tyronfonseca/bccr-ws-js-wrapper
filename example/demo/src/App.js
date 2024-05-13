import "./App.css";
import { useEffect, useState, useRef } from "react";
import BCCRWS from "bccr-ws-js-wrapper";
import { Grid } from "@mui/material";
import TableExchange from "./components/TableExchange";

function App() {
  const [purchase, setPurchase] = useState(null);
  const [sell, setSell] = useState(null);
  const [exchangeEuro, setExchangeEuro] = useState([]);
  const [exchangeYen, setExchangeYen] = useState([]);

  const bccr = useRef(
    new BCCRWS("<token>", "<mail>", "<user>")
  );

  const mockData = [
    {
      date: "01/01/2024",
      value: 1,
      currency: "CRC",
    },
    {
      date: "02/01/2024",
      value: 2,
      currency: "CRC",
    },
    {
      date: "03/01/2024",
      value: 3,
      currency: "CRC",
    },
    {
      date: "04/01/2024",
      value: 4,
      currency: "CRC",
    },
  ];

  useEffect(() => {
    bccr.current
      .getCurrencyExchangeRate(
        BCCRWS.indicators.EUR_USD_RATE,
        "01/01/2024",
        "13/02/2024"
      )
      .then((data) => {
        setExchangeEuro(data);
      });
    bccr.current
      .getCurrencyExchangeRate(
        BCCRWS.indicators.JPY_USD_RATE,
        "01/01/2024",
        "13/02/2024"
      )
      .then((data) => {
        setExchangeYen(data);
      });
    bccr.current.getTodayUSDPurchaseExchangeRate().then((data) => {
      setPurchase(data[0]);
    });
    bccr.current.getTodayUSDSellExchangeRate().then((data) => {
      setSell(data[0]);
    });
    // setExchangeEuro(mockData);
    // setExchangeYen(mockData);
    // setPurchase(mockData[0]);
    // setSell(mockData[0]);
  }, []);

  return (
    <div className="App">
      <h1>
        Demo <code>bccr-ws-js-wrapper</code> on ReactJS
      </h1>
      <Grid container spacing={2}>
        <Grid item xs={2}>
          <h3>USD today's exchange rate</h3>
          <p>Purchase: ₡{purchase ? purchase.value : "0"}</p>
          <p>Sell: ₡{sell ? sell.value : "0"}</p>
        </Grid>
        <Grid item xs={5}>
          <TableExchange title="1 EUR to CRC" data={exchangeEuro} />
        </Grid>
        <Grid item xs={5}>
          <TableExchange title="1 JPY to CRC" data={exchangeYen} />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
