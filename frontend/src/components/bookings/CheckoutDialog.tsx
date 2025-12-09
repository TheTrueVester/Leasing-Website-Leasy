import { baseUrl } from "@/api/base";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useCallback } from "react";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? "");

type Props = {
  listingId: string;
  bookingId: string;
};

/**
 * CheckoutDialog component for confirming a booking and completing the payment.
 *
 * @component
 * @param {string} listingId - The ID of the listing.
 * @param {string} bookingId - The ID of the booking.
 * @returns {JSX.Element} The CheckoutDialog component.
 */
const CheckoutDialog = ({ listingId, bookingId }: Props) => {
  const fetchClientSecret = useCallback(() => {
    return fetch(`${baseUrl}/bookings/create-checkout-session`, {
      method: "POST",
      mode: "cors",
      headers: {
        // Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        listingId: listingId,
        bookingId: bookingId,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret)
      .catch((e) => {
        toast({
          content: e.message,
        });
      });
  }, [listingId, bookingId]);

  const options = { fetchClientSecret };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" className="">
          Confirm Booking
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-full 2xl:min-w-fit overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
          <DialogDescription>
            Finalize your booking by completing the payment.
          </DialogDescription>
        </DialogHeader>
        <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
          <div id="checkout">
            <EmbeddedCheckout className="max-h-[80dvh] w-full" />
          </div>
        </EmbeddedCheckoutProvider>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
