/* eslint-disable no-console */

// Replace if using a different env file or config
const { resolve } = require("path");
const envpath = resolve("./.env");
const fs = require("fs");
if (!fs.existsSync(envpath)) {
  console.log(
    "Please make sure valid .env file exist in code/server directory."
  );
  process.exit(100);
}

require("dotenv").config({ path: "./.env" });
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const express = require("express");

const Product = require("./services/product");
const Seller = require("./services/seller");
const Helper = require("./services/helper");

const app = express();

const cors = require("cors");

const allitems = {};

app.use(express.static(process.env.STATIC_DIR));

app.use(express.json());

app.use(cors({ origin: true }));

// Provision
const provision = require("./services/provision");

// Routes
app.get("/", (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/index.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve("./public/static-file-error.html");
    res.sendFile(path);
  }
});

app.get("/leaderboard", (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/leaderboard.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve("./public/static-file-error.html");
    res.sendFile(path);
  }
});

app.get("/signup", (req, res) => {
  try {
    const path = resolve(`${process.env.STATIC_DIR}/signup.html`);
    if (!fs.existsSync(path)) throw Error();
    res.sendFile(path);
  } catch (error) {
    const path = resolve("./public/static-file-error.html");
    res.sendFile(path);
  }
});

/**
 * Get the Price Id of the Product
 * @returns Price Id of the Product that was setup for challenge
 */
const getPriceIdFromCache = async () => {
  // TODO: Integrate Stripe
};

/**
 * Validate Email address is valid String format.
 * Use this function to ensure that only one payment link is created per email.
 * @param {string} inputEmail
 * @returns {boolean}
 */
const validateEmail = async (inputEmail) => {
  var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (inputEmail.match(mailformat)) {
    return true;
  } else {
    return false;
  }
};

/**
 * Milestone 1: Creating Payment Links
 * Validate the Email Address is valid String format.
 * After email address validation, create a new Payment Link for the fan, if one does not exists.
 */
app.post("/create-payment-link", async (req, res) => {
  // TODO: Integrate Stripe
  console.log("Request Data");
  let email = req.body.seller_email;

  let isEmailValid = validateEmail(email);
  if (!isEmailValid) {
    res.status(400).send({ error: { message: "Invalid Email Address" } });
    return;
  }
  let username = req.body.display_name;
  let response = Helper(email, username);

  response.then((paymentLinkData)=>{
    res.json(paymentLinkData);
  })
});

/**
 * Milestone 2: Leaderboard
 * Get the Leaderboard data leveraging manual pagination of the Checkout sessions to total amount by fan email address
 * Returns Seller array with name, email, and total amount that is sorted desc by total amount
 */
app.get("/leaders", async (req, res) => {
  // TODO: Integrate Stripe

  const sessions = await stripe.checkout.sessions.list({
    limit: 500,
  });

  let checkoutList = sessions.data;
  let data = [];
  checkoutList.forEach((ele)=>{
    var tempEmail = ele.metadata.fan_email;
    data.push({ 
      email : tempEmail??"",
      name : ele.metadata.fan_name??"",
      amount : ele.amount_total,
    });
  });

  //return the response
  let prepareSellerData = data;
  console.log(data);
  res.json(prepareSellerData);

});

function errorHandler(err, req, res, next) {
  res.status(500).send({ error: { message: err.message } });
}

app.use(errorHandler);

app.listen(4242, async () => {
  console.log("Server Start\n");
  // On server startup, create product and plan and store in-memory
  await provision();
  console.log("Node server listening on port http://localhost:4242");
});
