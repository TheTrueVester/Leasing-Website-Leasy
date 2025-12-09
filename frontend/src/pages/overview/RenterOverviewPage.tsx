import { useGetBookingsbyHostId } from "@/api/bookings";
import { useGetListingsByUserId } from "@/api/listing.ts";
import { hostBookingColumns } from "@/components/bookings/columns/booking-columns";

import { DetailedListingCard } from "@/components/listing/DetailedListingCard.tsx";
import { SkeletonCard } from "@/components/listing/ListingCard.tsx";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/useAuth.ts";
import { ListingDisplay, listingStatusList } from "@/model/listing.ts";
import { capitalize } from "@/utils/stringUtils";
import { CardStackIcon, IdCardIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/**
 * RenterOverviewPage displays the overview page for the renter.
 * It includes the renter's listings and bookings.
 */
const RenterOverviewPage = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    data: listings,
    error,
    isLoading: isLoadingListings,
    isFetching: isFetchingListings,
  } = useGetListingsByUserId(userId ?? "");
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: bookingsError,
  } = useGetBookingsbyHostId(userId ?? "");
  const [filteredResults, setFilteredResults] = useState<ListingDisplay[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  useEffect(() => {
    if (listings) setFilteredResults(listings);
  }, [listings]);

  if (error) {
    return <h1>Error: {error.message}</h1>;
  }

  const onFilterChange = (filter: string) => {
    const searchRegex = new RegExp(filter, "i");
    const filteredListings =
      (listings as ListingDisplay[])?.filter((listing: ListingDisplay) => {
        return (
          searchRegex.test(listing.title) ||
          searchRegex.test(listing.description) ||
          searchRegex.test(listing.dormType) ||
          searchRegex.test(listing.status)
        );
      }) ?? [];
    setFilteredResults(filteredListings);
  };

  const handleStatusChange = (status: string) => {
    if (status) {
      if (status === "all") {
        setFilteredResults((listings as ListingDisplay[]) ?? []);
      } else
        setFilteredResults(
          ((listings as ListingDisplay[]) ?? []).filter(
            (listing) => listing.status.toLowerCase() === status
          )
        );
      setStatus(status);
    }
  };

  return (
    <div>
      <section className="flex flex-col space-y-2">
        <h1 className="flex gap-2 text-4xl font-semibold">
          Welcome back, {user?.firstname}{" "}
          <p className="animate-wave w-fit">👋</p>
        </h1>
        <p className="text-secondary-foreground">
          Manage your created listings and its associated bookings here.
        </p>
      </section>
      <Separator className="mt-8 mb-4" />
      {/* Tabs */}
      <Tabs defaultValue="listings" className="w-full">
        <div className="flex flex-col items-center">
          <TabsList className="grid w-fit grid-cols-2 h-fit mt-4 mb-2">
            <TabsTrigger value="listings" className="text-lg font-semibold">
              <IdCardIcon className="h-5 w-5 mr-2" />
              Your listings
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-lg font-semibold">
              <CardStackIcon className="h-5 w-5 mr-2" />
              Bookings
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Listings tab */}
        <TabsContent value="listings">
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-6">
            <div className="col-span-full flex justify-between">
              <Input
                placeholder="Search listings"
                className="w-96"
                value={searchTerm}
                onChange={(e) => {
                  onFilterChange(e.target.value);
                  setSearchTerm(e.target.value);
                }}
              />
              <ToggleGroup
                type="single"
                value={status}
                onValueChange={handleStatusChange}
              >
                {listingStatusList.map((status) => (
                  <ToggleGroupItem
                    key={status}
                    value={status}
                    aria-label={`Toggle ${status} listings`}
                    defaultChecked={status === "active"}
                  >
                    {capitalize(status)}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            {isLoadingListings || isFetchingListings ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {filteredResults && filteredResults.length === 0 && (
                  <div className="col-span-full">
                    <div className="flex flex-col w-full justify-center align-middle text-center">
                      <h1 className="text-3xl font-bold">
                        No listings found :/
                      </h1>
                      <p className="text-lg">
                        Create a listing to get started!
                      </p>
                    </div>
                  </div>
                )}
                {filteredResults.map((listing: ListingDisplay) => (
                  <Link
                    key={listing.id}
                    to={`/sublet/applications/${listing.id}`}
                    target="_blank"
                  >
                    <DetailedListingCard listing={listing} />
                  </Link>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Bookings tab */}
        <TabsContent value="bookings">
          <div className="col-span-full py-2">
            {!isLoadingBookings && !bookingsError && bookings ? (
              <DataTable columns={hostBookingColumns} data={bookings} />
            ) : (
              <div className="flex flex-col w-full justify-center align-middle text-center">
                <h1 className="text-3xl font-bold">No bookings found :/</h1>
                <p className="text-lg"></p>
              </div>
            )}
            {bookingsError && (
              <div className="flex flex-col w-full py-32 justify-center align-middle text-center">
                <h1 className="text-3xl font-bold">An Error Occured.</h1>
                <p className="text-lg">
                  An error occured while fetching your bookings. Please try
                  again later.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RenterOverviewPage;
