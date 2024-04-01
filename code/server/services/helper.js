const Product = require('./product'),
  Price = require('./price'),
  cache = require('./cache'),
  stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

console.log("in helper");


const helper = async (email, displayName) => {
    let product = cache.get("product");
    let priceID = product.price.id;

    // paymentLink = findPaymentLink(email, displayName);
    let paymentLink = cache.get(email);
    if(paymentLink!=undefined){
        return {
            success: true,
            message: 'Payment Link Found',
            data: paymentLink
        };
    }else {
        let response = createPaymentLink(email, displayName, priceID);
        return response.then((data)=>{
            if(data.success==true){
                cache.set(email, data.data.url);
                return {
                    success: true,
                    message: 'Payment Link Created',
                    data: data.data.url
                }
            }else{
                return {
                    success: false,
                    message: data.message
                };
            }
        })
        
    }
  
}

const createPaymentLink = async (email, displayName, priceId) => {

  // Validate email
  if (!email || typeof email !== 'string' || !email.trim()) {
    throw new Error('Invalid email provided');
  }

  // Validate displayName
  if (!displayName || typeof displayName !== 'string' || !displayName.trim()) {
    throw new Error('Invalid displayName provided');
  }

  // Validate priceId
  if (!priceId || typeof priceId !== 'string' || !priceId.trim()) {
    throw new Error('Invalid priceId provided');
  }

  try {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        fan_name: displayName,
        fan_email: email
      }
    });
    
    if(paymentLink.url!=undefined){
        return {
            success: true,
            message: 'Payment Link Created',
            data: paymentLink
        }
    } else{
        return {
            success: false,
            message: 'Payment Link Not Created',
            data: paymentLink
        }
    }
  

  } catch (error) {
    return {
      success: true,
      message: error.raw
    }
  }
}


const findPaymentLink = async (email, displayName) => {

}


module.exports = helper;
