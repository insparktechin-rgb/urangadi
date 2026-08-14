import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TPaLtagTgXunnc',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'S7kZiR5MEZ5FFByCkN7NUQs7',
});

async function testConnection() {
  try {
    console.log('Connecting to Razorpay API with Key ID:', process.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TPaLtagTgXunnc');
    const order = await razorpay.orders.create({
      amount: 100, // Rs. 1 in paise
      currency: 'INR',
      receipt: 'test_receipt_101',
      notes: { store: 'URANGADI' }
    });
    console.log('✅ SUCCESS! Razorpay Order Created:', order);
  } catch (err) {
    console.error('❌ Razorpay API Response:', err);
  }
}

testConnection();
