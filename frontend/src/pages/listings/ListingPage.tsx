import { useGetListingById } from "@/api/listing";
import {
  useCheckUserAlreadyAppliedForListing,
  useGetUserById,
  useGetUserFavorites,
} from "@/api/user";
import CreateApplicationDialog from "@/components/application/CreateApplicationDialog";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { LikeButton } from "@/components/ui/like-button";
import { ShareButton } from "@/components/ui/share-button";

import { useAuth } from "@/hooks/useAuth";
import { Listing } from "@/model/listing";
import { prettyDate } from "@/utils/dateUtils";
import { attributeToBadge } from "@/utils/listingAttribute";
import { capitalize, getUserInitials } from "@/utils/stringUtils";
import {
  CalendarIcon,
  EuroIcon,
  MapPinnedIcon,
  MoveDiagonalIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {MdImageNotSupported} from "react-icons/md";

type ListingDisplay = Omit<Listing, "attachments"> & { attachments: string[] };

/**
 * ListingPage displays the details of a listing.
 * It includes the title, description, images, attributes, and the contact information of the renter.
 * Here, the user can apply for the listing, like it, or share it.
 */
const ListingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { listingId } = useParams();

  const {
    data: listing,
    error,
    isLoading,
  } = useGetListingById(listingId ?? "");
  const { favorites, isLoading: isLoadingFavorites } = useGetUserFavorites(
    !!listingId && !!listing,
    "ids"
  );
  const { applied, isLoading: isCheckingApplication } =
    useCheckUserAlreadyAppliedForListing({
      listingId: listingId ?? "",
      applicantId: user?.id ?? "",
    });

  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>();

  useEffect(() => {
    if (!isLoading && listing) {
      const { attachments }: ListingDisplay = listing;
      const extractImages = attachments.filter((attachment) =>
        attachment
          .split(".")
          .pop()
          ?.match(/(jpg|jpeg|png)/)
      );
      setImages(extractImages);
      setSelectedImage(extractImages[0] ?? "");
    }
  }, [listing, isLoading]);

  const { user: renter } = useGetUserById(listing?.createdBy, !!listing);
  const address = listing?.address || "";

  if (error) {
    return (
      <section className="flex w-full justify-center">
        <h1 className="text-xl">An Error Occured.</h1>
        <p className="text-red-500">{error.message}</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="flex w-full justify-center">
        <h1 className="text-lg">Loading...</h1>;
      </section>
    );
  }

  return (
    <div className="grid grid-cols-2 h-[90vh] min-h-[85vh]">
      <Card className="h-fit mb-8 bg-indigo-50">
        <CardContent className="p-4 space-y-2 justify-center">
          {images.length > 0 ? (
            <img
              className="w-full max-h-[45vh] object-cover aspect-auto rounded-md"
              src={selectedImage}
              alt="Listing cover image"
            />
          ) : (
            <div className="flex w-full h-[45vh] bg-secondary items-center justify-center">
              <MdImageNotSupported className="size-20 fill-gray-300" />
            </div>
          )}
          {images && images.length > 1 && (
            <div className="px-12 py-2">
              <Carousel className="h-full">
                <CarouselContent className="-ml-1">
                  {images.map((imageURL, index) => (
                    <CarouselItem
                      key={index}
                      className="pl-1 md:basis-1/2 lg:basis-1/3"
                    >
                      <Card
                        className={`cursor-pointer hover:bg-slate-100 transition-all duration-300 ${
                          selectedImage === imageURL && "bg-slate-200"
                        }`}
                        onClick={() => {
                          setSelectedImage(imageURL);
                        }}
                      >
                        <CardContent className="flex aspect-auto items-center justify-center p-1">
                          <img
                            className="rounded-md object-fill max-h-16"
                            src={imageURL}
                            alt="Listing image"
                          />
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            </div>
          )}
          <div className="grid grid-cols-2 w-full">
            <Card className="col-span-1 flex flex-row my-1 mr-1">
              <CardHeader>
                <MoveDiagonalIcon className="stroke-primary" />
              </CardHeader>
              <CardContent className="p-3.5">
                <CardTitle>
                  {`${listing.size} `}m<sup>2</sup>
                </CardTitle>
                <CardDescription>Overall Size</CardDescription>
              </CardContent>
            </Card>
            <Card className="col-span-1 flex flex-row my-1 ml-1">
              <CardHeader>
                <EuroIcon className="stroke-primary" />
              </CardHeader>
              <CardContent className="p-3.5">
                <CardTitle>{`${listing.price} `}€</CardTitle>
                <CardDescription>Total price</CardDescription>
              </CardContent>
            </Card>
            <Card className="col-span-2 flex flex-row my-1">
              <CardHeader>
                <CalendarIcon className="stroke-primary" />
              </CardHeader>
              <CardContent className="p-3.5">
                <CardTitle>{`${prettyDate(
                  new Date(listing.availableFrom)
                )} - ${prettyDate(new Date(listing.availableTo))}`}</CardTitle>
                <CardDescription>Available time period</CardDescription>
              </CardContent>
            </Card>
            <Card className="col-span-2 flex flex-row my-1">
              <CardHeader>
                <MapPinnedIcon className="stroke-primary" />
              </CardHeader>
              <CardContent className="p-3.5">
                <CardTitle>
                  {`${address.street}, ${address.postalCode} ${address.city}`}
                </CardTitle>
                <CardDescription>Location</CardDescription>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col space-y-4 p-4 pt-0 h-full overflow-hidden">
        <h1 className="text-5xl font-bold">{listing.title}</h1>
        <div className="flex gap-x-2 flex-wrap">
          {listing.listingAttributes &&
            listing.listingAttributes
              .sort()
              .map((attr: string) => attributeToBadge(attr))}
        </div>
        <p className="text-lg text-gray-500 h-fit min-h-96 overflow-y-auto ">
          {listing.description}
        </p>
        <div className="flex justify-between">
          <span className="flex space-x-2">
            {!!renter && (
              <>
                <Avatar>
                  <AvatarImage
                    src={renter?.profilePicture}
                    alt={`${renter?.firstname} ${renter?.lastname}`}
                  />
                  <AvatarFallback>
                    {renter && getUserInitials(renter)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-500 py-2">
                  {capitalize(`${renter?.firstname} ${renter?.lastname}`)}
                </span>
              </>
            )}
          </span>
          <div className="flex align-middle space-x-2">
            {!!favorites && !isLoadingFavorites && (
              <LikeButton
                listingId={listingId as string}
                userFavorites={favorites as string[]}
                liked={
                  favorites && (favorites as string[]).includes(listingId ?? "")
                }
              />
            )}
            <ShareButton />

            {!isCheckingApplication && applied ? (
              <Badge variant="secondary" className="text-base">
                Applied
              </Badge>
            ) : (
              <CreateApplicationDialog
                isAuthenticated={isAuthenticated}
                disabled={user?.id === listing.createdBy}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingPage;
