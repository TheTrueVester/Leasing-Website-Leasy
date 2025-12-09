import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { TenantBookingColumns } from "@/model/booking";
import {ChatBubbleIcon, CrossCircledIcon} from "@radix-ui/react-icons";
import { ColumnDef } from "@tanstack/react-table";
import {
  BookUserIcon,
  FileSearch2Icon,
  ImageIcon,
  MailIcon,
  MoreHorizontal,
  PhoneIcon,
} from "lucide-react";
import { Link } from "react-router-dom";
import BookingStatusBadge from "../../ui/booking-status-badge";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import CheckoutDialog from "./../CheckoutDialog";
import {useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {baseUrl} from "@/api/base.ts";
import {useAuth} from "@/hooks/useAuth.ts";
import {useToast} from "@/components/ui/use-toast.ts";

/**
 * Represents the column definitions for the bookings table in the tenant overview page.
 */
export const tenantBookingColumns: ColumnDef<TenantBookingColumns>[] = [
  {
    accessorKey: "listingPictureUrl",
    header: "Listing",
    cell: ({ row }) => {
      const { listingPictureUrl } = row.original;
      if (!listingPictureUrl)
        return (
          <Card className="bg-slate-100 rounded-sm aspect-video">
            <div className="flex h-full">
              <ImageIcon className="m-auto" />
            </div>
          </Card>
        );

      return <img src={listingPictureUrl} className="max-w-32" />;
    },
  },
  {
    accessorKey: "listingName",
    header: "Title",
  },
  {
    accessorKey: "paymentStatus",
    header: "Payment Status",
    cell: ({ row }) => {
      const { paymentStatus } = row.original;
      return <BookingStatusBadge status={paymentStatus} />;
    },
  },
  {
    accessorKey: "paymentAmount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("paymentAmount"));
      const formatted = new Intl.NumberFormat("de-DE", {
        style: "currency",
        currency: "EUR",
      }).format(amount);

      return <div className="text-start font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "hostName",
    header: "Host",
    cell: ({ row }) => {
      const { hostName, hostEmail, hostPhoneNumber } = row.original;
      return (
        <HoverCard>
          <HoverCardTrigger asChild>
            <span className="font-medium hover:cursor-pointer hover:text-indigo-400 transition-all duration-300">
              {hostName}
            </span>
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold">{hostName}</h4>
              <div className="flex items-center pt-2">
                <MailIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs">{hostEmail}</span>
              </div>
              <div className="flex items-center pt-2">
                <PhoneIcon className="mr-2 h-4 w-4 opacity-70" />{" "}
                <span className="text-xs">
                  {hostPhoneNumber ?? "Not available"}
                </span>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
      );
    },
  },
  {
    accessorKey: "from",
    header: "From",
  },
  {
    accessorKey: "to",
    header: "To",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const { applicationId, bookingId, listingId, paymentStatus } =
        row.original;
      const {token} = useAuth();
      const {toast} = useToast();

      async function handleCancellation() {
        let isApplicationStatusChanged = false;
        let isBookingDeleted = false;
        // set application status back to pending
        await fetch(`${baseUrl}/applications/${applicationId}`, {
          method: "PUT",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            applicationId: applicationId,
            status: "PENDING",
          }),
        })
          .then((res) => {
            if (res.status === 200) {
              isApplicationStatusChanged = true;
            } else {
              toast({
                title: "Something went wrong while trying to change application status",
                content: "Please try again later.",
                variant: "destructive",
              })
            }
          })
          .catch((errors) => {
            console.log(errors)
          })

        // delete this booking
        await fetch(`${baseUrl}/bookings/${bookingId}`, {
          method: "DELETE",
          mode: "cors",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            bookingId: bookingId,
          }),
        })
          .then((res) => {
            if (res.status === 200) {
              isBookingDeleted = true;
            } else {
              toast({
                title: "Something went wrong while trying to delete the booking",
                content: "Please try again later.",
                variant: "destructive",
              })
            }
          })
          .catch((errors) => {
            console.log(errors)
          })

        if (isBookingDeleted && isApplicationStatusChanged){
          setIsDeleteDialogOpen(false);
          return toast({
              title: "Booking canceled successfully."
            }
          )
        }
      }

      return (
        <div className="flex flex-row space-x-2 items-center">
          {paymentStatus !== "SETTLED" && (
            <CheckoutDialog
              listingId={listingId ?? ""}
              bookingId={bookingId ?? ""}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <Link key="chat" to={`/chat`} target="_blank">
                <DropdownMenuItem className="cursor-pointer">
                  <ChatBubbleIcon className="mr-2 h-4 w-4" />
                  Chat with host
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <Link
                key={listingId}
                to={`/listings/${listingId}`}
                target="_blank"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <FileSearch2Icon className="mr-2 h-4 w-4" />
                  View Listing
                </DropdownMenuItem>
              </Link>
              <Link
                key={applicationId}
                to={`/overview/application/${applicationId}`}
                target="_blank"
              >
                <DropdownMenuItem className="cursor-pointer">
                  <BookUserIcon className="mr-2 h-4 w-4" />
                  View Application
                </DropdownMenuItem>
              </Link>
              {paymentStatus !== "SETTLED" &&
                <div className="flex flex-col">
                  <DropdownMenuSeparator/>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setIsDeleteDialogOpen(true)}}
                  >
                    <CrossCircledIcon className="mr-2 h-4 w-4 stroke-red-600"/>
                    <text className="text-red-600">Cancel booking</text>
                  </DropdownMenuItem>
                </div>
              }
            </DropdownMenuContent>

            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={isDeleteDialogOpen ? setIsDeleteDialogOpen : false}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure that you want to cancel this booking?
                  </DialogTitle>
                  <DialogDescription>
                    This action can not be reverted!
                  </DialogDescription>
                  <Button
                    variant="destructive"
                    onClick={handleCancellation}
                  >
                    Cancel this booking.
                  </Button>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </DropdownMenu>
        </div>
      );
    },
  },
  // hidden columns, used for functionality. Visibility configured in data-table.tsx
  {
    accessorKey: "bookingId",
    header: "Booking ID",
  },
  {
    accessorKey: "listingId",
    header: "Listing ID",
  },
  {
    accessorKey: "applicationId",
    header: "Application ID",
  },
];
