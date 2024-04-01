const Product = require('./product'),
  Price = require('./price'),
  cache = require('./cache'),
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const T_SHIRT_PRODUCT_NAME = 'The Afrobeatles T-Shirt',
  T_SHIRT_PRODUCT_DESC = 'Afrobeatles Tour',
  T_SHIRT_LOOKUP_KEY = process.env.CHALLENGE_ID,
  T_SHIRT_URL = process.env.CHALLENGE_ID,
  T_SHIRT_COST = 2500;

// Milestone 1
const provision = async () => {
  try {
    // Clear in-memory cache
    cache.flushAll();

    // Check if Product exists with correct shape in Stripe Account
    let product = await findProduct(T_SHIRT_URL);

    if (product) {
      // Lookup Associate Challenge price
      price = await findPrice(product.id, [T_SHIRT_LOOKUP_KEY]);
      // Throw error if either Price doesn't exist
      if (!price) {
        price = await createPrice(product.id, T_SHIRT_COST, T_SHIRT_PRODUCT_NAME, T_SHIRT_LOOKUP_KEY);
      }

    } else {
      // Product does not exist in Stripe, create it and its Prices
      product = await createProduct(T_SHIRT_PRODUCT_NAME, T_SHIRT_PRODUCT_DESC, T_SHIRT_URL);
      price = await createPrice(product.id, T_SHIRT_COST, T_SHIRT_PRODUCT_NAME, T_SHIRT_LOOKUP_KEY);
      console.log("price created");
    }

    if (!product || !price) {
      console.error('TODO: Implement provisioning service to create a Product & Price');
    } else {
      product.price = price;
      cache.set('product', product);
    }
  } catch (error) {
    throw new Error(`Provisioning error: ${error}`);
  }
};

/**
 * Milestone 1
 * Find Stripe Product based on URL. Returns Stripe Product if found else null.
 * @returns {Product}
 */
const findProduct = async (url) => {
  console.log("Finding Product...");
  let product = T_SHIRT_PRODUCT_NAME;
  
  try {
    const products = await stripe.products.search({
      query: 'name:\'' + product + '\' AND active:\'true\' AND metadata[\'CHALLENGE_ID\']:\'' + url + '\'',
    });
  
    if (products.data.length == 0) {
      return null;
    }

    // TODO: Return Product
    console.log("Product fined ....");
    return products.data[0];

  } catch (error) {
    return error.raw.message;
  }
  
};
/**
 * Milestone 1
 * Find Stripe Price for the Product Id
 * @param {string} productId 
 * @param {string} lookupKey 
 * @returns {Price} price
 */
const findPrice = async (productId, lookupKey) => {
  console.log("Finding Pricing ....");
  let price;
  try {
    price = await stripe.prices.search({
      query: 'active:\'true\' AND lookup_key:\'' + lookupKey + '\'',
    });

    if (price.data.length == 0) {
      return null;
    }

    console.log("Price fined ....");
    return price.data[0];


  } catch (error) {
    return error.raw.message;
  }
};

/**
 * Milestone 1
 * Create Stripe Product
 * @param {string} name 
 * @param {string} description 
 * @param {string} url
 * @returns {Product} product
 */
const createProduct = async (name, description, url) => {
  console.log("Creating Product........");
  let product = await stripe.products.create({
    name: name,
    description: description,
    metadata: {
      "CHALLENGE_ID": url
    }
  });

  console.log("Product Created........");

  // TODO: Return Product
  return product;
};

/**
 * Milestone 1
 * Create Price in Stripe associated to the Product. 
 * We may want to adjust the details of this price over time, without having to change how we refer to it, so use the transfer_lookup_key parameter.
 * @param {string} product 
 * @param {integer} unit_amount 
 * @param {string} nickname 
 * @param {string} lookup_key 
 * @returns {Price} price
 */
const createPrice = async (product, unit_amount, nickname, lookup_key) => {
  console.log("Creating Price ........");
  let price;
  try {
    price = await stripe.prices.create({
      currency: 'usd',
      unit_amount: unit_amount,
      product: product,
      lookup_key: lookup_key
    });
    console.log("Price Created........");

    return price
  } catch (error) {
    let message = error.raw.message;
    console.log(message);
    return message;
  }

};


module.exports = provision;