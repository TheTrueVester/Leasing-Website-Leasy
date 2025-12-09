import { useCreateApplication } from "@/api/application";
import { baseUrl } from "@/api/base";
import Dropzone from "@/components/Dropzone.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { ApplicationFormData } from "@/model/application";
import { getUserInitials } from "@/utils/stringUtils.tsx";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Textarea } from "../ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useToast } from "../ui/use-toast";

interface CreateApplicationDialogProps {
  isAuthenticated: boolean;
  disabled?: boolean;
}

const CreateApplicationDialog: React.FC<CreateApplicationDialogProps> = ({
  isAuthenticated,
  disabled,
}) => {
  const { listingId } = useParams();
  const [docs, setDocs] = useState<(File & { preview: string })[]>([]);
  const { user, token, storeUser } = useAuth();
  const [newBio, setNewBio] = useState<string>("");
  const [newLanguages, setNewLanguages] = useState<string>("");
  const [newHobbies, setNewHobbies] = useState<string>("");
  const [newMajor, setNewMajor] = useState<string>("");
  const [newUniversity, setNewUniversity] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const createApplication = useCreateApplication();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const fetchUserBioAttributes = async () => {
      const url = `${baseUrl}/users/${user.id}`;
      try {
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        const userBioAttributes = data.user.userBioAttributes;

        setNewBio(userBioAttributes?.bio || "");
        setNewLanguages(userBioAttributes?.languages || "");
        setNewHobbies(userBioAttributes?.hobbies || "");
        setNewMajor(userBioAttributes?.major || "");
        setNewUniversity(userBioAttributes?.university || "");
      } catch (error) {
        console.error("Error fetching user bio attributes:", error);
      }
    };

    fetchUserBioAttributes();
  }, [user, token]);

  const handleBioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewBio(event.target.value);
  };

  const handleLanguagesChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewLanguages(event.target.value);
  };

  const handleHobbiesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewHobbies(event.target.value);
  };

  const handleMessageChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setMessage(event.target.value);
  };

  const updateUserBioAttributes = async () => {
    const formData = {
      newBio,
      newLanguages,
      newHobbies,
      newMajor,
      newUniversity,
    };

    try {
      const response = await fetch(`${baseUrl}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        // Update user info in the global state
        storeUser(data.user);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating user bio attributes:", error);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !listingId) return;

    if (!message.trim()) {
      toast({
        title: "Message is required.",
        description:
          "Please write a message before submitting your application.",
        variant: "destructive",
      });
      return;
    }

    // Update user bio attributes before submitting the application
    await updateUserBioAttributes();
    if (!message.trim()) {
      toast({
        title: "Message is required.",
        description:
          "Please write a message before submitting your application.",
        variant: "destructive",
      });
      return;
    }

    const applicationData: ApplicationFormData = {
      message,
      applicantEmail: user,
      listingId,
      attachments: [],
      bio: newBio,
      hobbies: newHobbies,
      languages: newLanguages,
      major: newMajor,
      university: newUniversity,
    };
    // Upload documents
    if (docs.length > 0) {
      const formData = new FormData();
      docs.forEach((doc) => formData.append("documents", doc));
      try {
        const response = await fetch(
          `${baseUrl}/applications/upload/documents`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );
        const data = await response.json();

        if (response.ok) {
          applicationData.attachments = data;
        } else {
          console.error(data.message);
          toast({
            title: "Document upload failed.",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error uploading documents:", error);
        toast({
          title: "Document upload failed.",
          variant: "destructive",
        });
        return;
      }
    }
    console.log(applicationData);
    createApplication.mutate(applicationData);
  };

  const handleNotAuthorized = () => {
    toast({
      title: "You need to be logged in to apply for a listing.",
      description: "You will be redirected to the login page.",
      variant: "destructive",
    });
    navigate("/login", { state: { from: location }, replace: true });
    return;
  };
  return (
    <>
      {isAuthenticated ? (
        <div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="ml-2" disabled={disabled}>
                Apply for Listing
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-xl">
              <DialogHeader>
                <DialogTitle className="flex text-3xl font-bold">
                  Your application
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <InfoIcon className="h-6 w-6 cursor-help mt-[0.45rem] ml-2 hover:text-gray-700 transition-all duration-300" />
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-xl font-medium text-secondary-foreground"
                    >
                      Fill out the form below to apply for this listing. Some
                      fields are pre-filled with your information, but you can
                      edit them if you want. Changes here will be saved for
                      future applications, you can view and edit them in your
                      profile page anytime!
                    </TooltipContent>
                  </Tooltip>
                </DialogTitle>
                <DialogDescription>
                  <form
                    id="applicationForm"
                    onSubmit={handleSubmit}
                    className="grid grid-cols-[1.15fr_1.95fr] gap-4 py-4"
                  >
                    <div className="border-r pr-4 space-y-4">
                      <div className="flex flex-row">
                        <Avatar className="size-20">
                          <AvatarImage
                            src={user.profilePicture}
                            alt={`${user.firstname} ${user.lastname}`}
                          />
                          <AvatarFallback className="text-2xl">
                            {getUserInitials(user)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col justify-center ml-4">
                          <h2 className="text-xl font-semibold">
                            {user?.firstname} {user?.lastname}
                          </h2>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="major">Major</Label>
                        <Input
                          id="major"
                          value={newMajor}
                          onChange={(e) => setNewMajor(e.target.value)}
                          placeholder="What is your major?"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="university">University</Label>
                        <Input
                          id="university"
                          value={newUniversity}
                          onChange={(e) => setNewUniversity(e.target.value)}
                          placeholder="What university do you attend?"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Label className="flex gap-x-1 cursor-help hover:text-gray-700 transition-all duration-300">
                              Documents
                              <InfoIcon className="h-4 w-4" />
                            </Label>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-lg">
                            Upload any documents that you think will help your
                            application. If you have a resume, a cover letter,
                            or any other document that you think will help your
                            application, upload it here.
                          </TooltipContent>
                        </Tooltip>
                        <Dropzone
                          files={docs}
                          setFiles={setDocs}
                          fileType="document"
                          className="py-2 border border-neutral-200 rounded-xl w-full"
                        />
                      </div>
                    </div>
                    <div className="grid gap-4">
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Input
                          id="bio"
                          value={newBio}
                          onChange={handleBioChange}
                          placeholder="Write a short bio about yourself. What are you like as a person? What are you looking for in a place to live?"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          value={message}
                          onChange={handleMessageChange}
                          placeholder="Write something here to your future renter. Why do you want to rent this place? Keep it short and sweet, but descriptive!"
                          className="h-40 w-full outline-none resize-none"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="languages">Languages</Label>
                        <Input
                          id="languages"
                          value={newLanguages}
                          onChange={handleLanguagesChange}
                          placeholder="List the languages you speak, separated by commas."
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <Label htmlFor="hobbies">Hobbies</Label>
                        <Input
                          id="hobbies"
                          value={newHobbies}
                          onChange={handleHobbiesChange}
                          placeholder="List your hobbies or interests, separated by commas."
                        />
                      </div>
                    </div>
                  </form>
                </DialogDescription>
                <DialogFooter>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        type="submit"
                        form="applicationForm"
                        className="ml-auto"
                        size="lg"
                        disabled={
                          !newBio || !newLanguages || !newHobbies || !message
                        }
                      >
                        Submit application
                      </Button>
                    </TooltipTrigger>
                    {newBio && newLanguages && newHobbies && message ? (
                      <></>
                    ) : (
                      <TooltipContent className="max-w-md">
                        Please fill out all the fields to submit your
                        application.
                      </TooltipContent>
                    )}
                  </Tooltip>
                </DialogFooter>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <Button onClick={() => handleNotAuthorized()}>Apply for Listing</Button>
      )}
    </>
  );
};

export default CreateApplicationDialog;
