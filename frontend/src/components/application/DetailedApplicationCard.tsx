import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Application } from "@/model/application.ts";
import { User } from "@/model/user.ts";
import {
  getFileNameFromS3Link,
  getUserInitials,
} from "@/utils/stringUtils.tsx";
import { FileIcon } from "@radix-ui/react-icons";
import { Label } from "@radix-ui/react-label";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.tsx";

type Props = {
  application: Application;
};

/**
 * The DetailedApplicationCard shows everything about the applicant and their application in a single card.
 * It contains the applicant's avatar, university, major, bio, languages, hobbies and their application message, as well as all the files they have uploaded.
 * This components is mainly used for both renters and applicants to view an application in detail.
 * @param {Applicatioin} application - The application object
 * @return {JSX.Element} - The detailed application card
 */
const DetailedApplicationCard = ({ application }: Props) => {
  const { message, applicant } = application;
  const { userBioAttributes: att } = applicant ?? {};
  const userBioAttributes = new Map<string, string | string[]>(
    Object.entries(att ?? {})
  );
  const ppLink = applicant?.profilePicture;
  const uni = userBioAttributes?.get("university") ?? "Not specified";
  const major = userBioAttributes?.get("major") ?? "Not specified";
  const bio = userBioAttributes?.get("bio") ?? "Not specified";
  const languages = userBioAttributes?.get("languages") ?? "Not specified";
  const hobbies = userBioAttributes?.get("hobbies") ?? "Not specified";
  // Files uploaded in user profile
  const files = applicant?.documents ?? [];
  // Files upload in application, specific for this application
  const applicationFiles = application.attachments ?? [];
  const combinedFiles = [...files, ...applicationFiles];

  return (
    <Card className="max-h-screen h-full w-full">
      <CardHeader>
        <CardTitle className="flex flex-row justify-between">
          <label>
            {applicant?.firstname} {applicant?.lastname}
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col h-[85%]">
        <div className="flex flex-row w-full h-full space-x-6">
          <div className="flex flex-col basis-1/3">
            <div className="flex flex-col items-center">
              <Avatar className="size-32">
                <AvatarImage
                  src={ppLink}
                  alt={`${applicant?.firstname} ${applicant?.lastname}`}
                />
                <AvatarFallback className="text-4xl">
                  {getUserInitials(applicant as User)}
                </AvatarFallback>
              </Avatar>
              <label className="pt-2">
                studies <Badge variant="secondary">{major}</Badge> at{" "}
                <Badge variant="secondary">{uni}</Badge>
              </label>
            </div>
            <Separator className="my-4"></Separator>
            <div className="flex flex-col">
              <label className="text-gray-400">Files and Docs</label>
              {(!combinedFiles ||
                (combinedFiles && combinedFiles.length === 0)) && (
                <div className="col-span-full">
                  <div className="flex flex-col w-full justify-center align-middle text-center">
                    <label className="text-gray-400">
                      No documents uploaded yet.
                    </label>
                  </div>
                </div>
              )}
              {combinedFiles && combinedFiles.length > 0 && (
                <div className="grid grid-cols-3 pt-4">
                  {combinedFiles.map((file) => (
                    <Link to={file} className="flex flex-col items-center">
                      <FileIcon className="size-16 text-gray-500" />
                      <label className="text-xs max-w-20 truncate">
                        {getFileNameFromS3Link(file)}
                      </label>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col basis-2/3 space-y-4 overflow-y-auto">
            <div className="flex flex-col space-y-2">
              <Label className="font-semibold text-secondary-foreground">
                Bio
              </Label>
              {bio}
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="font-semibold text-secondary-foreground">
                Message
              </Label>
              {`"${message}"`}
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="font-semibold text-secondary-foreground">
                Languages
              </Label>
              {languages}
            </div>
            <div className="flex flex-col space-y-2">
              <Label className="font-semibold text-secondary-foreground">
                Hobbies
              </Label>
              {hobbies}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { DetailedApplicationCard };
