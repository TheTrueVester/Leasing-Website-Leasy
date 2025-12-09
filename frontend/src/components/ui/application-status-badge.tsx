import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ApplicationStatusBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof applicationBadgeVariants> {
  status: "ACCEPTED" | "REJECTED" | "PENDING";
}
/**
 * Badge component to display an application's status.
 * @component
 * @param {string} status - The status of the application.
 * @param {string} [className] - Additional CSS class for the component.
 * @returns {JSX.Element} The rendered ApplicationStatusBadge component.
 */
const ApplicationStatusBadge: React.FC<ApplicationStatusBadgeProps> = ({
  status,
  className,
  ...props
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild className="cursor-help">
        <div
          className={cn(
            applicationBadgeVariants({ variant: status }),
            className
          )}
          {...props}
        >
          {status}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left">
        <p className="text-sm text-secondary-foreground max-w-48">
          The status of your application.
        </p>
      </TooltipContent>
    </Tooltip>
  );
};

const applicationBadgeVariants = cva(
  "inline-flex items-center w-fit rounded-full border px-2.5 py-0.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        ACCEPTED:
          "border-transparent bg-emerald-500 text-white hover:bg-emerald-500/80",
        PENDING:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        REJECTED:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      },
    },
    defaultVariants: {
      variant: "PENDING",
    },
  }
);

export default ApplicationStatusBadge;
