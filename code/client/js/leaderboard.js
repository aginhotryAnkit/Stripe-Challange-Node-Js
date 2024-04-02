import { setProcessing, getPriceDollars } from "./common.js";

/**
 * Generates a row for the leaderboard table displaying the fan's name
 * and total amount sold.
 * @param {string} name - the sellers name
 * @param {string} amount - the total amount sold through their Payment Link
 * @returns A div generated from the template element within the leaderboard.html.
 */
const showLeaderBoardRow = function ({ name, amount }) {
  //use template to create a div for the given
  const price = getPriceDollars(amount, true);
  const rowTemplate = document.querySelector("#seller-summary");
  const rowDiv = rowTemplate.content.firstElementChild.cloneNode(true);
  let nameDiv = rowDiv.getElementsByClassName("summary-name")[0];
  nameDiv.textContent = name;
  let priceDiv = rowDiv.getElementsByClassName("summary-sale")[0];
  priceDiv.textContent = price;
  return rowDiv;
};

/**
 * Builds the leaderboard table, generating a row for each seller.
 * @param {} sellers
 */
const showSellers = function (sellers) {
  let sellerTable = document.getElementById("summary-table");
  sellers.forEach((seller) => {
    let row = showLeaderBoardRow({
      name: seller.name,
      email: seller.email,
      amount: seller.amount,
    });
    sellerTable.append(row);
  });
};

/**
 * Shows the leaderboard.html page by
 */
const showPage = async function () {
  /**
   * TODO: Integrate Stripe
   * Milestone 2: Complete this function to display the leaderboard of sellers.
   */

  //get the leaderboard data from the API endpoint /leader 
  let leaderboardData = await getLeaderboard();
  console.log(leaderboardData);

  //show the seller data to the seller table
  showSellers(leaderboardData)
};

/**
 * Make call to server to get sorted leaderboard
 * @returns {Array} sellers - Returns Seller array with name, email, and total amount that is sorted desc by total amount
 */
const getLeaderboard = async () => {
  /**
   * TODO: Integrate Stripe
   * Milestone 2: complete this function to fetch the fans to display on the
   * leaderboard.
   */

  let response = fetch("http://localhost:4242/leaders")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error:", error.message);
    });

  return response;
};

window.addEventListener("DOMContentLoaded", (event) => {
  showPage();
});
