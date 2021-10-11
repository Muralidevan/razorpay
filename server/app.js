const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
//bad practice to use cors never use in production
const cors = require('cors');
const { nanoid } = require('nanoid')
const Razorpay = require('razorpay')
const app = express();

dotenv.config();


app.use(cors())
app.use(express.json())

const env = process.env.NODE_ENV || 'dev';

const key = env === 'dev' ? process.env.RAZOR_PAY_KEY_DEV_ID : process.env.RAZOR_PAY_KEY_PROD_ID;

const secret_key = env === 'dev' ? process.env.RAZOR_PAY_KEY_DEV_SECRET : process.env.RAZOR_PAY_KEY_PROD_SECRET;


const razorpay = new Razorpay({
  key_id: key,
  key_secret: secret_key,
});

app.get('/logo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'logo.svg'))
})

// app.post('/callback_url', (req, res) => {
//   console.log(req, 'request')
//   // console.log(`hello`, res)
//   // res.redirect()
// })

app.post('/verification', (req, res) => {

  const secret = 'g8ehQmt7kXpUtF@test'
  //do validation
  const crypto = require('crypto')

  const shasum = crypto.createHmac('sha256', secret)
  shasum.update(JSON.stringify(req.body))
  const digest = shasum.digest('hex')

  // console.log(digest, req.headers['x-razorpay-signature'])

  if (digest === req.headers['x-razorpay-signature']) {
    console.log('Transaction verified')
    //send mail here and save to db
    require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
  } else {
    console.log('Transaction malformed')
  }
  // console.log(req.body, 'req.body')
  res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
  const amount = 500
  const currency = 'INR'
  const payment_capture = 1;
  const receipt_id = nanoid();

  const options = {
    amount: amount * 100,
    currency,
    receipt: receipt_id,
    payment_capture
  }
  try {
    const response = await razorpay.orders.create(options);
    // console.log(response, 'response')
    if (response.status === 'created') {
      res.json({
        order_id: response.id,
        amount: response.amount,
        currency: response.currency,
        receipt_id: response.receipt
      })
    }
    else {
      res.status(500).send('razor pay order api error')
    }
  }
  catch (err) {
    console.log(err, 'er')
  }


})

app.listen(5000, () => {
  console.log('server listening on 5000')
})