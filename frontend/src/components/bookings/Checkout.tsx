import { baseUrl } from "@/api/base";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

/**
 * CheckoutForm component for handling the Stripe Checkout session.
 *
 * @component
 */
const CheckoutForm = () => {
  const fetchClientSecret = useCallback(() => {
    return fetch(`${baseUrl}/bookings/create-checkout-session`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, []);

  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

import { useAuth } from "@/hooks/useAuth";
import { stripe } from "@/utils/stripe";
import { Button } from "../ui/button";

/**
 * Return component for handling the return from the Stripe Checkout session.
 * It processes the payment and updates the booking status.
 */
const Return = () => {
  const [status, setStatus] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    async function getSession(sessionId: string) {
      const session = await stripe.checkout.sessions.retrieve(sessionId!);
      return session;
    }
    const searchParams = new URLSearchParams(window.location.search);
    const sessionId = searchParams.get("session_id");
    const bookingId = searchParams.get("booking_id");

    getSession(sessionId ?? "")
      .then((data) => {
        const { customer_details, status } = data;
        const { name, email } = customer_details ?? {};

        setStatus(status ?? "");
        setCustomerEmail(email ?? "");
        return data;
      })
      .then((data) => {
        const { payment_method_options } = data;
        let method;
        if (payment_method_options?.card) {
          method = "CREDIT_CARD";
        } else if (payment_method_options?.paypal) {
          method = "PAYPAL";
        } else {
          method = "DEBIT_CARD";
        }
        if (status === "complete") {
          fetch(
            `${baseUrl}/bookings/process/${bookingId}/?payment_type=${method}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentEmail: customerEmail,
              }),
            }
          );
        }
      });
  }, [status, token]);

  if (status === "open") {
    return <Navigate to="/checkout" />;
  }

  if (status === "complete") {
    return (
      <section className="flex flex-col h-[70vh] w-full justify-center items-center space-y-4">
        <h1 className="text-4xl font-semibold">Your Payment was Successful!</h1>
        <p className="text-lg text-center max-w-[60vw]">
          Your booking is now finalized, and the host will be notified. <br />
          Additionally, an email will be sent to you at{" "}
          <span className="font-medium">{customerEmail}</span> for further
          details.
        </p>
        <Link to={`/overview`}>
          <Button variant="link">Return to your overview page</Button>
        </Link>
      </section>
    );
  }

  return null;
};

export { CheckoutForm, Return };
