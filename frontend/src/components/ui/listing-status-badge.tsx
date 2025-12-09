import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ListingStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof listingBadgeVariants> {
  status: "ACTIVE" | "INACTIVE" | "RENTED" | "CANCELED" | "PENDING";
}

/**
 * Badge component to display a listing's status.
 * @component
 * @param {string} status - The status of the listing.
 * @param {string} [className] - Additional CSS class for the component.
 * @returns {JSX.Element} The rendered ListingStatusBadge component.
 */
const ListingStatusBadge: React.FC<ListingStatusBadgeProps> = ({
  status,
  className,
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="cursor-help">
        <div
          className={cn(listingBadgeVariants({ variant: status }), className)}
          {...props}
        >
          {status}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="text-sm text-secondary-foreground max-w-48">
          The status of the listing.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

const listingBadgeVariants = cva(
  "inline-flex items-center w-fit rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        ACTIVE:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        INACTIVE:
          "border-transparent bg-gray-400 text-primary-foreground hover:bg-gray-400/80",
        PENDING:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        RENTED:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        CANCELED:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
    },
    defaultVariants: {
      variant: "PENDING",
    },
  }
);

export default ListingStatusBadge;
