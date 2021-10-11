import './App.css';

function App() {

  //used to decide domain locally
  // const __DEV__ = document.domain === 'localhost'

  const key = process.env.NODE_ENV === 'development' ?
    process.env.REACT_APP_SECRET_RAZORPAY_TEST_KEY : process.env.REACT_APP_SECRET_RAZORPAY_PROD_KEY


  async function displayRazorpay() {

    const res = await loadRazorpay('https://checkout.razorpay.com/v1/checkout.js')

    if (!res) {
      alert('razorpay sdk failed to load')
      return
    }
    const response = await fetch('http://localhost:5000/razorpay', { method: 'POST' })
    const data = await response.json();
    console.log(data, 'data')

    const options = {
      "key": key,
      "amount": data.amount,
      "currency": data.currency,
      "name": "Acme Corp",
      "description": "Test Transaction",
      // "callback_url": 'http://localhost:5000/callback_url',
      "image": "https://example.com/your_logo",
      "order_id": data.order_id,
      handler: function (response) {
        alert(response.razorpay_payment_id)
        alert(response.razorpay_order_id)
        alert(response.razorpay_signature)
      },
      "prefill": {
        "name": "Murali",
        "email": "Murali@example.com",
        "contact": "9999999999"
      },
      // "notes": {
      //   "address": "Razorpay Corporate Office"
      // },
      // "theme": {
      //   "color": "#3399cc"
      // }
    };

    //for typescript
    // const _window = window as any;
    const paymentObject = new window.Razorpay(options)
    paymentObject.open()
  }

  function loadRazorpay(src) {
    return new Promise(resolve => {
      //create a new script element
      const script = document.createElement('script');
      //<script src="https://checkout.razorpay.com/v1/checkout.js">
      script.src = src;
      script.onload = () => {
        resolve(true);
      }
      script.onerr = () => {
        resolve(false);
      }
      document.body.appendChild(script);
    })

  }

  return (
    <div className="App">
      <header className="App-header">

        <button
          className="App-link"
          onClick={displayRazorpay}
        >
          Pay
        </button>
      </header>
    </div>
  );
}

export default App;
