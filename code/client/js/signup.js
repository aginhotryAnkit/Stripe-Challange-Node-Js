import { emailPattern, setProcessing } from "./common.js";

/**
 * Handle the user completing the registration form. 
 */
const handleClick = async function (event) {
  event.preventDefault();
  /** 
   * TODO: Integrate Stripe
   * Milestone 1: Complete this function to return a payment for the fan 
   * once they have filled out the registration form. Their email and display name 
   * are both required.  
   * 
   * You can use the setProcessing() in common.js
   * to help control the UX during calls to the server, and setError() to display
   * any errors. 
   * 
   * After you've received the Payment Link from the server 
   * call showSignupComplete to display the seller's Payment Link.  
   */


  // Get the value from the email input box
  const emailInput = document.getElementById('email');
  const email = emailInput.value;

  // Get the value from the username input box
  const usernameInput = document.getElementById('username');
  const username = usernameInput.value;

  // check whether the username and email are valid or not.
  (!isValidEmail(email) || (username == "")) ? setError("Please Enter valid username and email") : hideError();

  let response = fetch('http://localhost:4242/create-payment-link ', {
    method: 'POST', // or 'GET' if it's a GET request
    headers: {
      'Content-Type': 'application/json'
      // You can add more headers if needed
    },
    body: JSON.stringify({
      "seller_email":email,
      "display_name":username
    })
  }).then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }

    return response.json();   
  }).then((data)=>{
    if(data.success==true){
      setPaymentLink(data.data);
      showSignupComplete(getPaymentLink());
      // hideError();
    } else{
      setError(data.message);
    }

    console.log(data);

  }).catch(error => {
      console.error('Error:', error.message);
  });

}

/**
 * @param {email}
 * check whether the email is valid or not
 */
function isValidEmail(email) {
  // Regular expression for validating email addresses
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/** 
 * Helper function to show an error message on the page. 
 * @param {string} errorMsg - msg to be displayed
 */
const setError = function (errorMsg) {
  const errDiv = document.getElementById('paymentlink-error');
  const messageElement = errDiv.getElementsByTagName("p")[0];
  messageElement.textContent = errorMsg;
  errDiv.style.display = 'block';
}

/** 
 * hide the error message element 
 * @param {string} errorMsg - msg to be displayed
 */
let hideError = () => {
  const errDiv = document.getElementById('paymentlink-error');
  errDiv.style.display = 'none';
}

/**
 * @returns the Payment Link displayed on the page. 
 */
const getPaymentLink = function () {
  let paymentLinkDisplay = document.getElementById("payment-link");
  return paymentLinkDisplay.textContent;
}

/**
 * Displays the provided Payment Link 
 * @param {string} paymentLinkUrl
 */
const setPaymentLink = function (paymentLinkUrl) {
  let paymentLinkDisplay = document.getElementById("payment-link");
  paymentLinkDisplay.textContent = paymentLinkUrl;
}

/**
 * Replaces the registration form with a sign up complete message
 * and the seller's Payment Link. 
 * @param {string} paymentLinkUrl 
 */
const showSignupComplete = function (paymentLinkUrl) {
  setPaymentLink(paymentLinkUrl);
  togglePaymentLinkDiv(true);
  let formWrapper = document.getElementById("form-div");
  formWrapper.style.display = "none";
}

/**
 * Toggles the div showing a Payment Link either showing or hidding it. 
 * @param {boolean} display 
 */
const togglePaymentLinkDiv = function (display) {
  let paymentLinkWrapper = document.getElementById("paymentlink-wrapper");
  if (display) {
    paymentLinkWrapper.style.display = "block";
    paymentLinkWrapper.scrollIntoView();
  } else {
    paymentLinkWrapper.style.display = "none";
  }
}

/**
 * Copy the Payment Link to the clipboard. 
 */
const copyToClipboard = async () => {
  const paymentLink = getPaymentLink();
  navigator.clipboard.writeText(paymentLink);
};

window.addEventListener('DOMContentLoaded', (event) => {
  togglePaymentLinkDiv(false);
  const submitBtn = document.getElementById('submit');
  submitBtn.addEventListener('click', handleClick);
  const emailInput = document.getElementById('email');
  emailInput.setAttribute('pattern', emailPattern);
  const clipboardBtn = document.getElementById('copy-button');
  clipboardBtn.addEventListener('click', copyToClipboard);
  const errorDivs = document.getElementById('paymentlink-error');
  errorDivs.style.display = 'none';
});



