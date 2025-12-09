import { Skeleton } from "@/components/ui/skeleton.tsx";
import { ListingDisplay } from "@/model/listing.ts";
import { prettyDate } from "@/utils/dateUtils.tsx";
import { CalendarIcon, RulerSquareIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card.tsx";

import { MdImageNotSupported } from "react-icons/md";
import { LikeButton } from "../ui/like-button.tsx";
import { Separator } from "../ui/separator.tsx";

type Props = {
  listing: ListingDisplay;
  isLiked?: boolean;
  userFavorites: string[];
};

/**
 * ListingCard displays a card with the listing details.
 * It includes the title, description, price, available dates, size, and images of the listing.
 * The user can like the listing by clicking the heart icon.
 * @param {ListingDisplay} listing - The listing to display.
 * @param {boolean} [isLiked] - Whether the listing is liked by the user.
 * @param {string[]} [userFavorites] - The list of user's favorite listings.
 * @returns {JSX.Element} The JSX element representing the listing card.
 */
const ListingCard = ({ listing, isLiked: liked, userFavorites }: Props) => {
  const {
    id: listingId,
    title,
    description,
    price,
    availableFrom,
    availableTo,
    size,
    attachments,
  } = listing;
  const [images, setImages] = useState<string[]>([]);

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
    <Card className="overflow-hidden h-fit max-w-80 hover:shadow-lg hover:shadow-indigo-100 hover:scale-[102%] hover:transform transition-all duration-300">
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
        </div>
        <div className="relative w-full flex justify-end align-center bottom-12 px-2 -mb-6 z-20">
          <LikeButton
            liked={liked}
            listingId={listingId}
            userFavorites={userFavorites}
          />
        </div>
        <div className="flex flex-col justify-start align-top px-4 pb-4 space-y-4">
          <div className="flex justify-between space-y-4">
            <div className="space-y-1">
              <p className="text-lg font-extrabold text-indigo-500">€{price}</p>
              <h1 className="text-xl truncate max-w-[14rem] font-bold">
                {title}
              </h1>
              <p className="text-base truncate max-w-52 text-gray-500">
                {description}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between text-gray-600 text-sm">
            <span className="flex space-x-1">
              <CalendarIcon className="w-4 h-4 text-indigo-500" />
              <p>
                {prettyDate(availableFrom)}
                {" - "}
                {prettyDate(availableTo)}
              </p>
            </span>
            <div className="flex space-x-1">
              <RulerSquareIcon className="w-4 h-4 pt-0.5 text-indigo-500" />
              <span className="">{size}m²</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function SkeletonCard() {
  return (
    <div className="flex flex-col h-fit w-full space-y-3">
      <Skeleton className="h-[200px] w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
}

export { ListingCard, SkeletonCard };
