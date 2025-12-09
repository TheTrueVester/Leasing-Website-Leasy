import { useGetApplicationsByListingId } from "@/api/application.ts";
import { dormTypes, ListingDisplay } from "@/model/listing.ts";
import { getTimeAgo, prettyDate } from "@/utils/dateUtils.tsx";
import { CalendarIcon, PersonIcon } from "@radix-ui/react-icons";
import { Timer } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/badge.tsx";
import { Card, CardContent } from "../ui/card.tsx";
import ListingStatusBadge from "../ui/listing-status-badge.tsx";
import { Separator } from "../ui/separator.tsx";
import {MdImageNotSupported} from "react-icons/md";

type Props = {
  listing: ListingDisplay;
};

/**
 * Renders a detailed listing card.
 * @param {ListingDisplay} listing - The listing to display.
 * @returns {JSX.Element} The JSX element representing the detailed listing card.
 */
const DetailedListingCard = ({ listing }: Props) => {
  const {
    id: listingId,
    title,
    description,
    price,
    availableFrom,
    availableTo,
    status,
    attachments,
    lastUpdated,
    dormType,
  } = listing;
  const [images, setImages] = useState<string[]>([]);
  const { data: applications, isLoading } =
    useGetApplicationsByListingId(listingId);

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
        <Card className="overflow-hidden w-full h-full hover:shadow-lg hover:shadow-indigo-100 hover:scale-[102%] hover:transform transition-all duration-300">
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
                className="absolute top-2 right-4"
              />
            </div>
            <div className="flex flex-col justify-start align-top px-4 py-4 space-y-4">
              <div className="flex justify-between space-y-4">
                <div className="space-y-1 w-full">
                  <div className="flex space-x-2 justify-between w-full">
                    <p className="text-xl font-extrabold text-indigo-500">
                      €{price}
                    </p>
                    <Badge className="text-sm" variant="secondary">
                      {dormTypes.find((type) => type.value === dormType)?.label}
                    </Badge>
                  </div>
                  <h1 className="text-2xl truncate max-w-96 font-bold">
                    {title}
                  </h1>
                  <p className="text-base truncate max-w-96 text-gray-500">
                    {description}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-col space-y-2 text-gray-600">
                <span className="flex space-x-4 font-medium">
                  <PersonIcon className="w-5 h-5 text-indigo-500" />
                  <p>{applications?.length} Applicants</p>
                </span>
                <span className="flex space-x-4">
                  <Timer className="w-5 h-5 text-indigo-500" />
                  <p>Last updated {getTimeAgo(new Date(lastUpdated))}</p>
                </span>
                <span className="flex space-x-4">
                  <CalendarIcon className="w-5 h-5 text-indigo-500" />
                  <p>
                    {prettyDate(availableFrom)}
                    {" - "}
                    {prettyDate(availableTo)}
                  </p>
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export { DetailedListingCard };
