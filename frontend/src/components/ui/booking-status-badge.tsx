import { cn } from "@/lib/utils";
import { PaymentStatus } from "@/model/payment";
import { cva, type VariantProps } from "class-variance-authority";

interface BookingStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof bookingBadgeVariants> {
  status?: PaymentStatus;
}

/**
 * Badge component to display a booking's status.
 * @component
 * @param {string} status - The status of the booking.
 * @param {string} [className] - Additional CSS class for the component.
 * @returns {JSX.Element} The rendered BookingStatusBadge component.
 */
const BookingStatusBadge: React.FC<BookingStatusBadgeProps> = ({
  status,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(bookingBadgeVariants({ variant: status }), className)}
      {...props}
    >
      {status}
    </div>
  );
};

const bookingBadgeVariants = cva(
  "inline-flex items-center w-fit rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        SETTLED:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        REQUESTED:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        PENDING:
          "border-transparent bg-gray-400 text-primary-foreground hover:bg-gray-400/80",
        REFUSED:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
    },
    defaultVariants: {
      variant: "REQUESTED",
    },
  }
);

export default BookingStatusBadge;
