import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Application } from "@/model/application.ts";
import { getUserInitials } from "@/utils/stringUtils.tsx";
import { Card, CardContent } from "../ui/card.tsx";

type Props = {
  application: Application;
};

/**
 * A card used to show the renter the bare mininum of an application: the applicant avatar and the application message.
 * Mainly used in renter's ApplicationOverview for a specific listing.
 * @param {Application} application - The application object.
 * @returns {JSX.Element} The JSX element of the card.
 */
const ApplicationCard = ({ application }: Props) => {
  const { message, applicant } = application;

  return (
    <Card className="overflow-hidden h-fit w-full hover:shadow-md hover:shadow-indigo-100 hover:scale-[101%] hover:transform transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex flex-row h-full w-full">
          <div className="flex flex-col justify-center pr-4">
            <Avatar className="mr-2">
              <AvatarImage src={applicant?.profilePicture} alt="avatar" />
              <AvatarFallback>
                {applicant && getUserInitials(applicant)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex flex-col justify-center w-full">
            <p className="font-bold">{`${applicant?.firstname} ${applicant?.lastname}`}</p>
            <p className="truncate w-96">{`"${message}"`}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ApplicationCard };
