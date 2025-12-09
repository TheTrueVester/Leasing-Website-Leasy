import { useGetApplicationsByListingId } from "@/api/application.ts";
import { baseUrl } from "@/api/base.ts";
import { useGetListingById } from "@/api/listing.ts";
import { ApplicationCard } from "@/components/application/ApplicationCard.tsx";
import ChooseApplicantDialog from "@/components/application/ChooseApplicantDialog";
import { DetailedApplicationCard } from "@/components/application/DetailedApplicationCard.tsx";
import ChatWindow from "@/components/ChatWindow.tsx";
import { DetailedListingCard } from "@/components/listing/DetailedListingCard.tsx";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardFooter,
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
import { Separator } from "@/components/ui/separator.tsx";
import { useAuth } from "@/hooks/useAuth.ts";
import { Application } from "@/model/application.ts";
import { setPartner } from "@/utils/chatUtils.ts";
import { ChatBubbleIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ListingEditor from "@/components/listing/ListingEditor.tsx";
import { toast } from "@/components/ui/use-toast.ts";

/**
 * The ApplicationsOverviewPage is where the renter can inspect all the applications related to one listing.
 * It includes a card for the listing, as well as overview cards for each application.
 * The renter can coose to inspect one application in more detail, choose the applicant, chat with the applicant, edit or deactivate the listing.
 */
const ApplicationsOverviewPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { listingId } = useParams();
  const [selectedApplication, setSelectedApplication] = useState<Application>(
    {}
  );
  const [acceptedApplication, setAcceptedApplication] = useState<Application>();
  const [chat, setChat] = useState({});

  const {
    data: listing,
    error: listingError,
    isLoading: isListingLoading,
  } = useGetListingById(listingId ?? "");

  const {
    data: applications,
    error: applicationsError,
    isLoading: isApplicationsLoading,
  } = useGetApplicationsByListingId(listingId ?? "");

  useEffect(() => {
    if (applications && applications.length > 0) {
      applications.forEach((application: Application) => {
        if (application.status === "ACCEPTED") {
          setAcceptedApplication(application);
        }
      });
    }
  }, [applications]);

  if (listingError) {
    return <h1>Listing error: {listingError.message}</h1>;
  }
  if (applicationsError) {
    return <h1>Applications error: {applicationsError.message}</h1>;
  }
  if (isListingLoading || isApplicationsLoading) {
    return <h1>Loading...</h1>;
  }

  async function startChat(applicantId: string) {
    // Fetch chat from backend
    const chats = await fetch(`${baseUrl}/chat/get/u/${user?.id}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404 || res.status === 400) {
          return "Input was wrong";
        }
        return res.json();
      })
      .then((data) => {
        return data.chats;
      })
      .catch((err) => console.log("An Error:" + err));

    // Find the chat between the participants
    let chat;
    for (const i in chats) {
      // only one single chat can exist between the same pair of people, no matter who is the host
      if (
        (chats[i].host.id === user?.id &&
          chats[i].applicant.id === applicantId) ||
        (chats[i].applicant.id === user?.id && chats[i].host.id === applicantId)
      ) {
        chat = chats[i];
        break;
      }
    }
    // Create new chat if no chat exists between the specified participants
    if (!chat) {
      const newChat = await fetch(`${baseUrl}/chat/create`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          hostId: user?.id,
          applicantId: applicantId,
        }),
      })
        .then((res) => {
          if (res.status === 404 || res.status === 400) {
            throw new Error("Bad request");
          }
          return res.json();
        })
        .catch((err) => console.log(err));
      chat = newChat.chat;
    }
    // Start chat if chat exists
    if (chat) {
      if (user) {
        setPartner(chat, user);
      }
      setChat(chat);
    }
  }

  async function deleteApplication(applicationId: string) {
    // deletes an application specified with application ID
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
        return data;
      })
      .catch((err) => console.log(err));
  }

  async function deactivateListingAndDeleteApplications() {
    // deactivates the current listing
    await fetch(`${baseUrl}/listings/${listingId}`, {
      method: "DELETE",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 400) {
          throw new Error("no listing ID");
        }
        if (res.status === 500) {
          throw new Error("Something went wrong");
        }
        return res.json();
      })
      .then((data) => {
        toast({
          title: "The listing was successfully deactivated.",
        });
        navigate("/sublet/overview");
        return data;
      })
      .catch((err) => console.log(err));

    // deletes all related applications
    for (const application of applications ?? []) {
      deleteApplication(application.id ?? "");
    }
  }

  function renderApplication() {
    // Renders the right side of the page: either message for no application / disabled listing, application overview or detailed application view
    if (
      !isApplicationsLoading &&
      Object.keys(selectedApplication).length === 0 &&
      selectedApplication.constructor === Object
    ) {
      return (
        <div className="h-full">
          {listing.status === "INACTIVE" && (
            <div className="col-span-full">
              <div className="flex flex-col w-full h-[70vh] justify-center align-middle items-center space-y-2">
                <h1 className="text-3xl font-bold">
                  This listing has been permanently disabled.
                </h1>
              </div>
            </div>
          )}
          {applications && applications.length === 0 && (
            <div className="col-span-full">
              <div className="flex flex-col w-full h-[70vh] justify-center align-middle items-center space-y-2">
                <h1 className="text-3xl font-bold">No Applications Found :/</h1>
                <p className="text-secondary-foreground max-w-[80%] text-lg">
                  There are no applications for this listing yet. You can view
                  all applications for this listing once they start rolling in.
                </p>
              </div>
            </div>
          )}
          {applications && applications.length > 0 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">
                Applications for{" "}
                <label className="italic">{listing.title}</label>
              </h1>
              <p className="text-secondary-foreground">
                This listing has {applications.length} application(s)
              </p>
              <Separator />
              <div className="overflow-y-auto min-h-full">
                {applications.map((application: Application) => (
                  <div className="space-y-4 mt-2">
                    <div className="flex flex-row space-x-4 justify-center">
                      <div
                        className="w-full"
                        onClick={() => setSelectedApplication(application)}
                      >
                        <ApplicationCard
                          key={listing.id}
                          application={application}
                        />
                      </div>
                      <div className="flex flex-col justify-center ml-auto">
                        <Dialog>
                          <DialogTrigger
                            asChild
                            onClick={() =>
                              startChat(application.applicant?.id ?? "")
                            }
                          >
                            <Button
                              variant="secondary"
                              className="mb-1"
                              size="sm"
                            >
                              <ChatBubbleIcon className="mr-2 h-4 w-4" />
                              Chat
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="">
                            <DialogHeader>
                              <DialogTitle>
                                Chat with {application.applicant?.firstname}
                              </DialogTitle>
                              <DialogDescription>
                                You can access this chat in the future either
                                from here or by clicking your profile picture in
                                the top right corner -{">"} chat.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="w-full min-h-72">
                              {chat && <ChatWindow chat={chat} origin="ApplicationsOverview" className="" />}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <ChooseApplicantDialog
                          application={application}
                          listing={listing}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div className="flex flex-col h-[80vh] space-y-4 py-4">
          <DetailedApplicationCard application={selectedApplication} />
          <div className="flex justify-between space-x-4 align-middle">
            <Button
              variant="outline"
              onClick={() => setSelectedApplication({})}
            >
              Back
            </Button>
            <div className="space-x-4 align-middle">
              <Dialog>
                <DialogTrigger
                  asChild
                  onClick={() =>
                    startChat(selectedApplication.applicant?.id ?? "")
                  }
                >
                  <Button variant="secondary" className="py-2" size="lg">
                    <span className="flex py-4">
                      <ChatBubbleIcon className="mr-2 h-4 w-4" />
                      Chat
                    </span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="">
                  <DialogHeader>
                    <DialogTitle>
                      Chat with {selectedApplication.applicant?.firstname}
                    </DialogTitle>
                    <DialogDescription>
                      You can access this chat in the future either from here or
                      by clicking your profile picture in the top right corner -
                      {">"} chat.
                    </DialogDescription>
                  </DialogHeader>
                  {chat && <ChatWindow chat={chat} origin="DetailedApplication" className="" />}
                </DialogContent>
              </Dialog>
              <ChooseApplicantDialog
                application={selectedApplication}
                listing={listing}
              />
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="flex flex-row space-x-6 items-center justify-center align-middle h-[80vh]">
      <div className="flex flex-col basis-1/3">
        <Card className="h-fit w-full bg-indigo-50 flex flex-col justify-center">
          <CardTitle className="pl-4 pt-4">Selected Listing</CardTitle>
          <CardContent className="flex flex-col justify-center p-4">
            <div className="w-full">
              <Link
                to={`/listings/${listing._id}`}
                key={listing._id}
                target="_blank"
              >
                <DetailedListingCard listing={listing} />
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex w-full justify-between">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    disabled={listing.status === "INACTIVE"}
                  >
                    Deactivate
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Are you sure that you want to deactivate this listing?
                    </DialogTitle>
                    <DialogDescription>
                      This action can not be reverted!
                    </DialogDescription>
                    <Button
                      variant="destructive"
                      onClick={() => deactivateListingAndDeleteApplications()}
                    >
                      Deactivate this listing forever.
                    </Button>
                  </DialogHeader>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={listing.status === "INACTIVE"}
                  >
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="min-w-[90vw]">
                  <ListingEditor listingId={listing._id} />
                </DialogContent>
              </Dialog>
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="basis-2/3 flex flex-col h-full">
        {(!isApplicationsLoading &&
          listing &&
          !isListingLoading &&
          listing.status === "ACTIVE") ||
        !acceptedApplication ? (
          renderApplication()
        ) : (
          <div className="flex flex-col h-full w-full justify-center align-middle items-center space-y-2">
            <h1 className="text-3xl font-bold">This listing is not active</h1>
            <p className="text-secondary-foreground max-w-[90%] text-lg text-center">
              You can't accept any more applications for this listing as you
              have accepted an application from{" "}
              <span className="font-semibold text-xl">
                {acceptedApplication.applicant?.firstname}{" "}
                {acceptedApplication.applicant?.lastname}.
              </span>
              <br />
              Head over to the "Bookings" tab in the{" "}
              <Link to="/sublet/overview">
                <Button variant="link" className="p-0 text-lg">
                  overview page
                </Button>
              </Link>{" "}
              to check for updates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsOverviewPage;
