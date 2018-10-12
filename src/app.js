const express = require("express");
const fetch = require("node-fetch");

const config = require("../config.js");

const app = express();
const PORT = config.port;
const SUCCESS = config.statusSuccess;
const FAIL = config.statusUserError;

const CURRENT_DAY_URL = "https://api.coindesk.com/v1/bpi/currentprice/USD.json";
const PREV_DAY_URL =
  "https://api.coindesk.com/v1/bpi/historical/close.json?currency=USD&for=yesterday";

let currentPrice = null;
let prevPrice = null;

function getURL(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.status(SUCCESS))
      .then(data => resolve(data))
      .catch(err => reject(err));
  });
}

app.get("/compare", (req, res) => {
  Promise.all([getURL(CURRENT_DAY_URL), getURL(PREV_DAY_URL)])
    .then(([current, prev]) => {
      currentPrice = current.bpi.USD.rate_float;
      prevPrice = Object.values(prev.bpi)[0];
      const difference = currentPrice - prevPrice;
      res.send({
        Today: currentPrice,
        Prior: prevPrice,
        Difference: difference
      });
    })
    .catch(err => {
      res.status(FAIL);
      res.send({ err: err });
    });
});

app.listen(PORT, err => {
  if (err) {
    console.error(`Error starting server: ${err}`);
  } else {
    console.log(`App listening on port ${PORT}`);
  }
});
