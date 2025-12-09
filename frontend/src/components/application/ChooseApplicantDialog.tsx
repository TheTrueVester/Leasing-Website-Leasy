import {useCreateBooking} from "@/api/bookings";
import {useGetUserById} from "@/api/user";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {Application} from "@/model/application";
import {Listing} from "@/model/listing";
import {useState} from "react";
import {Button} from "../ui/button";
import {Input} from "../ui/input";
import {Label} from "../ui/label";

type Props = {
  listing: Listing;
  application: Application;
};

const ChooseApplicantDialog = ({listing, application}: Props) => {
  const {mutateAsync: createBooking, isPending} = useCreateBooking();
  const {user: host} = useGetUserById(listing.createdBy, !!listing);
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);

  const handleOnConfirm = () => {
    createBooking({
      hostEmail: host?.email ?? "",
      tenantEmail: application.applicant?.email ?? "",
      applicationID: application?.id ?? "",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Choose</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Choose Tenant</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <p>
          You are about to choose{" "}
          <span className="font-semibold">
            {application.applicant?.firstname} {application.applicant?.lastname}
          </span>{" "}
          as your tenant.
          <br/>
          They will be notified of your decision.
        </p>
        <div className="space-y-2">
          <Label>Enter the tenant's name to confirm.</Label>
          <Input
            type="text"
            placeholder={`${application.applicant?.firstname} ${application.applicant?.lastname}`}
            onChange={(e) =>
              setIsButtonEnabled(
                e.target.value ===
                `${application.applicant?.firstname} ${application.applicant?.lastname}`
              )
            }
          />
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={() => handleOnConfirm()}
            disabled={!isButtonEnabled || isPending}
          >
            {isPending ? "Loading..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChooseApplicantDialog;
