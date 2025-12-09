/**
 * Renders a detailed listing card for an application.
 * @component
 */
import { useGetApplicationById } from "@/api/application.ts";
import { useGetUserById } from "@/api/user.ts";
import { dormTypes, ListingWithApplication } from "@/model/listing.ts";
import { getTimeAgo, prettyDate } from "@/utils/dateUtils.tsx";
import { capitalize } from "@/utils/stringUtils.tsx";
import { CalendarIcon, PersonIcon } from "@radix-ui/react-icons";
import { BuildingIcon, Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge.tsx";
import { Card, CardContent } from "../ui/card.tsx";
import { Separator } from "../ui/separator.tsx";
import ListingStatusBadge from "@/components/ui/listing-status-badge.tsx";
import ApplicationStatusBadge from "../ui/application-status-badge.tsx";
import { MdImageNotSupported } from "react-icons/md";

type Props = {
  listing: ListingWithApplication;
};

/**
 * Renders a detailed listing card for an application.
 * @param {ListingWithApplication} listing - The listing with application data.
 * @returns {JSX.Element} The JSX element representing the detailed listing card.
 */
const DetailedListingForApplicationCard = ({ listing }: Props) => {
  const {
    title,
    price,
    availableFrom,
    availableTo,
    attachments,
    dormType,
    application: app,
    address,
    status,
  } = listing;
  const { street, streetNumber, postalCode, city } = address;
  const [images, setImages] = useState<string[]>([]);
  const { data: application, isLoading } = useGetApplicationById(app?.id ?? "");
  const { user: renter } = useGetUserById(listing?.createdBy, !!listing);

  useEffect(() => {
    if (!attachments) return;
    const images = attachments.filter((attachment) =>
      attachment
        .split(".")
        .pop()
        ?.match(/(jpg|jpeg|png)/)
    );
    setImages(images);
  }, [attachments]);

  return (
    <>
      {!isLoading && (
        <Card className="overflow-hidden min-w-fit h-full hover:shadow-lg hover:shadow-indigo-100 hover:scale-[102%] hover:transform transition-all duration-300">
          <CardContent className="p-0">
            <div className="relative flex justify-center overflow-hidden h-48 rounded-md rounded-b-none ">
              {images.length > 0 ? (
                <img
                  alt="Product image"
                  className="aspect-auto object-cover w-full"
                  src={images[0]}
                />
              ) : (
                <div className="flex w-full h-full bg-secondary items-center justify-center">
                  <MdImageNotSupported className="size-20 fill-gray-300" />
                </div>
              )}
              <ListingStatusBadge
                status={status}
                className="absolute top-10 right-2"
              />
              <ApplicationStatusBadge
                status={
                  app?.status === "ACCEPTED" || app?.status === "REJECTED"
                    ? app.status
                    : "PENDING"
                }
                className="absolute top-2 right-2"
              />
            </div>
            <div className="flex flex-col justify-start align-top px-4 py-4 space-y-4">
              <div className="flex justify-between space-y-4">
                <div className="space-y-1 w-full">
                  <span className="flex justify-between">
                    <span className="flex space-x-2">
                      <p className="text-xl font-extrabold text-indigo-500">
                        €{price}
                      </p>
                      <p className="text-sm font-extrabold pt-1.5 text-gray-500">
                        {`${listing.size} `}m<sup>2</sup>
                      </p>
                    </span>
                    <Badge className="text-sm" variant="secondary">
                      {dormTypes.find((type) => type.value === dormType)?.label}
                    </Badge>
                  </span>
                  <h1 className="text-2xl max-w-80 truncate font-bold">
                    {title}
                  </h1>
                  <div className="flex flex-col pt-2 space-y-2 text-gray-600">
                    <span className="flex space-x-4">
                      <BuildingIcon className="w-5 h-5 text-indigo-500" />
                      <p className="text-base truncate max-w-72 text-gray-500">
                        {street} {streetNumber}, {postalCode} {city}
                      </p>
                    </span>
                    <span className="flex space-x-4">
                      <CalendarIcon className="w-5 h-5 text-indigo-500" />
                      <p>
                        {prettyDate(availableFrom)}
                        {" - "}
                        {prettyDate(availableTo)}
                      </p>
                    </span>
                    <div className="flex space-x-4">
                      <PersonIcon className="w-5 h-5 text-indigo-500" />
                      <span>
                        {renter &&
                          capitalize(`${renter.firstname} ${renter.lastname}`)}
                      </span>
                    </div>
                    <Separator />
                    <span className="flex space-x-4">
                      <Timer className="w-5 h-6 text-indigo-500" />
                      <p className="font-medium">
                        Application sent{" "}
                        {application &&
                          application.createdAt &&
                          getTimeAgo(new Date(application.createdAt))}
                      </p>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export { DetailedListingForApplicationCard };
