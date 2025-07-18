// Razorpay integration utility
// Uses the public key from Vite environment variables (VITE_RAZORPAY_KEY_ID)
// Replace 'your_razorpay_key_here' in your .env file with your actual Razorpay key for production

// TypeScript: declare Razorpay on window
declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function openRazorpayModal({ amount, name, description, order_id, onSuccess, onFailure }) {
  const key = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!key || key === 'your_razorpay_key_here') {
    alert('Razorpay key is not set. Please set VITE_RAZORPAY_KEY_ID in your environment variables.');
    return;
  }

  // Dynamically load Razorpay script if not already loaded
  if (!window.Razorpay) {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => openRazorpayModal({ amount, name, description, order_id, onSuccess, onFailure });
    document.body.appendChild(script);
    return;
  }

  const options = {
    key,
    amount, // Amount in paise (e.g., 50000 for Rs. 500)
    currency: 'INR',
    name,
    description,
    order_id, // Optional: Razorpay order ID from backend
    handler: function (response) {
      // Call onSuccess with payment details
      onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        if (onFailure) onFailure('dismissed');
      }
    },
    theme: {
      color: '#6366f1',
    },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
} 