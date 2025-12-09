import { useGetApplicationById } from "@/api/application.ts";
import { baseUrl } from "@/api/base.ts";
import { useGetBookingsbyTenantId } from "@/api/bookings.ts";
import { DetailedApplicationCard } from "@/components/application/DetailedApplicationCard.tsx";
import { DetailedListingForApplicationCard } from "@/components/listing/DetailedListingForApplicationCard.tsx";
import ApplicationStatusBadge from "@/components/ui/application-status-badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog.tsx";
import { useToast } from "@/components/ui/use-toast.ts";
import { Application } from "@/model/application";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

/**
 * ApplicationsOverviewPage displays the details of a specific application.
 * It includes the listing the user applied for and the application details.
 * Here, the user can delete the application.
 */
const ApplicationsOverviewPage = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    data: application,
    error: applicationError,
    isLoading: isApplicationLoading,
  } = useGetApplicationById(applicationId ?? "");
  const listing = { ...application?.listing, application: application };
  const { data: bookings, isLoading: isLoadingBookings } =
    useGetBookingsbyTenantId(application?.applicant?.id ?? "");
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (bookings?.map((b) => b.listingId).includes(listing?.id)) {
      setAccepted(true);
    }
  }, [bookings, listing]);

  if (applicationError) {
    return <h1>Application error: {applicationError.message}</h1>;
  }
  if (isApplicationLoading) {
    return (
      <div className="flex items-center justify-center h-[85vh]">
        <h1 className="text-2xl">Loading...</h1>
      </div>
    );
  }

  async function deleteApplication(applicationId: string) {
    await fetch(`${baseUrl}/applications/${applicationId}`, {
      method: "DELETE",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 400) {
          throw new Error("no app ID");
        }
        if (res.status === 404) {
          throw new Error("Application not found");
        }
        return res.json();
      })
      .then((data) => {
        toast({
          title: "The application was successfully deleted.",
        });
        navigate("/overview");
        return data;
      })
      .catch((err) => console.log(err));
  }

  return (
    <div className="flex flex-row h-[80vh] space-x-6 align-middle items-center">
      <div className="flex flex-col basis-1/3 h-fit">
        <Card className="h-fit w-full bg-indigo-50 flex flex-col justify-center">
          <CardTitle className="pl-4 pt-4">You applied for...</CardTitle>
          <CardContent className="flex flex-col justify-center p-4">
            <div className="w-full">
              <Link
                to={`/listings/${listing?.id}`}
                key={listing?.id}
                target="_blank"
              >
                {listing && (
                  <DetailedListingForApplicationCard listing={listing} />
                )}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="basis-2/3 h-full flex flex-col space-y-4 align-top">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex flex-row justify-between">
              <label>Your application</label>
              <ApplicationStatusBadge
                status={application?.status ?? "PENDING"}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[80%]">
            <DetailedApplicationCard application={application as Application} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="destructive" disabled={accepted}>
                  Delete application
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    Are you sure that you want to delete this application?
                  </DialogTitle>
                  <DialogDescription>
                    This action can not be reverted!
                  </DialogDescription>
                  <Button
                    variant="destructive"
                    onClick={() => deleteApplication(applicationId ?? "")}
                  >
                    Delete this application forever.
                  </Button>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default ApplicationsOverviewPage;
