import { useGetApplicationsByUserId } from "@/api/application.ts";
import { useGetBookingsbyTenantId } from "@/api/bookings";
import { useGetUserFavorites } from "@/api/user";
import { tenantBookingColumns } from "@/components/bookings/columns/booking-columns";
import { DetailedListingForApplicationCard } from "@/components/listing/DetailedListingForApplicationCard";
import {
  ListingCard,
  SkeletonCard,
} from "@/components/listing/ListingCard.tsx";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Input } from "@/components/ui/input.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAuth } from "@/hooks/useAuth";
import { ListingDisplay, ListingWithApplication } from "@/model/listing";
import { capitalize } from "@/utils/stringUtils";
import { CardStackIcon, HeartIcon, PersonIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import useProfile from "@/hooks/useProfile";
import { applicationStatusList } from "@/model/application";
import { Link, useNavigate } from "react-router-dom";

/**
 * TenantOverviewPage displays the overview page for the tenant.
 * It includes the tenant's applications, bookings, and favorite listings.
 */
const TenantOverviewPage = () => {
  const { user } = useAuth();
  const { isRenter } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [filteredResults, setFilteredResults] = useState<
    ListingWithApplication[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  const userId = user?.id;
  const {
    listingWithApplications,
    error,
    isLoading: isLoadingApplications,
  } = useListingsBasedOnApplications(userId ?? "");
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: bookingsError,
  } = useGetBookingsbyTenantId(userId ?? "");
  const { favorites, isLoading: favoritesLoading } = useGetUserFavorites(
    !!user,
    "full"
  );

  useEffect(() => {
    if (listingWithApplications) setFilteredResults(listingWithApplications);
  }, [listingWithApplications]);

  // Show a toast if the user has not completed their profile yet
  useEffect(() => {
    if (
      !!user &&
      !isRenter &&
      (user?.documents?.length === 0 ||
        !user?.profilePicture ||
        !user?.userBioAttributes)
    ) {
      toast({
        title: "Easily apply for listings!",
        description:
          "To make it easier to apply for listings, please complete your profile. This way, the next time you apply for a listing, your information will be autofilled!",
        variant: "default",
        action: (
          <Button
            variant="link"
            size="sm"
            className="p-0"
            onClick={() => navigate("/me")}
          >
            Complete Profile
          </Button>
        ),
        duration: 5000,
      });
    }
  }, [isRenter, navigate, toast, user]);

  const onFilterChange = (filter: string) => {
    const searchRegex = new RegExp(filter, "i");
    const filteredListings =
      listingWithApplications?.filter((listing: ListingWithApplication) => {
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
        setFilteredResults(listingWithApplications);
      } else
        setFilteredResults(
          listingWithApplications.filter(
            (listing) => listing.application.status?.toLowerCase() === status
          )
        );
      setStatus(status);
    }
  };

  if (error) {
    return (
      <section>
        <h1 className="flex gap-2 text-4xl font-medium">An Error Occured.</h1>
        <p className="text-xl text-red-500">{error.message}</p>
      </section>
    );
  }

  return (
    <div>
      <section className="flex flex-col space-y-2">
        <h1 className="flex gap-2 text-4xl font-semibold">
          Welcome back, {user?.firstname}{" "}
          <p className="animate-wave w-fit">👋</p>
        </h1>
        <p className="text-secondary-foreground">
          Find and manage all your applications, bookings and favorite listings
          here.
        </p>
      </section>
      <Separator className="mt-8 mb-4" />
      {/* Tabs */}
      <Tabs defaultValue="applications" className="w-full">
        <div className="flex flex-col items-center">
          <TabsList className="grid w-fit grid-cols-3 h-fit mt-4 mb-2">
            <TabsTrigger value="applications" className="text-lg font-semibold">
              <PersonIcon className="h-5 w-5 mr-2" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-lg font-semibold">
              <CardStackIcon className="h-5 w-5 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-lg font-semibold">
              <HeartIcon className="h-5 w-5 mr-2" />
              Favorites
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Applications tab */}
        <TabsContent value="applications">
          <div className="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 py-2">
            <div className="col-span-full flex justify-between">
              <Input
                placeholder="Search for listings you've applied for"
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
                onValueChange={(val) => handleStatusChange(val)}
              >
                {statusList.map((status) => {
                  return (
                    <ToggleGroupItem
                      key={status}
                      value={status}
                      aria-label={`Toggle application ${status}`}
                      defaultChecked={status === "all"}
                    >
                      {capitalize(status)}
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>
            {isLoadingApplications ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <>
                {filteredResults.length === 0 && (
                  <div className="col-span-full">
                    <div className="flex flex-col w-full justify-center align-middle text-center">
                      <h1 className="text-3xl font-bold">
                        No listings found :/
                      </h1>
                      <p className="text-lg">
                        Please adjust the applied filters or go browse through
                        the listings and potentially apply for one!
                      </p>
                    </div>
                  </div>
                )}
                {filteredResults.map((listing: ListingWithApplication) => (
                  <Link
                    key={listing.id}
                    to={`/overview/application/${listing.application?.id}`}
                    target="_blank"
                  >
                    <DetailedListingForApplicationCard
                      key={listing.id}
                      listing={listing}
                    />
                  </Link>
                ))}
              </>
            )}
          </div>
        </TabsContent>

        {/* Bookings tab */}
        <TabsContent value="bookings">
          <div className="col-span-full py-2">
            {!isLoadingBookings && bookings && (
              <DataTable columns={tenantBookingColumns} data={bookings} />
            )}
            {!bookings && (
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

        {/* Favorites tab */}
        <TabsContent value="favorites">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-2">
            {favoritesLoading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : favorites && favorites.length === 0 ? (
              <div className="col-span-full py-4">
                <div className="flex flex-col w-full py-32 justify-center align-middle text-center">
                  <h1 className="text-3xl font-bold">
                    It's a bit empty here...
                  </h1>
                  <p className="text-lg">
                    Start searching for listings by clicking on "Search for
                    Listings". When you add a listing to your favorites, it will
                    be here waiting for you!
                  </p>
                </div>
              </div>
            ) : (
              (favorites as ListingDisplay[])?.map(
                (listing: ListingDisplay, i) => (
                  <Link
                    key={`${listing.id}${i}`}
                    to={`/listings/${listing.id}`}
                    className="w-full"
                  >
                    <ListingCard
                      listing={listing}
                      isLiked={!!user}
                      userFavorites={(favorites as ListingDisplay[]).map(
                        (fav) => fav.id
                      )}
                    />
                  </Link>
                )
              )
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// List of application statuses
const statusList = ["all", ...(applicationStatusList as string[])];

// Custom hook to get listings based on applications
const useListingsBasedOnApplications = (userId: string) => {
  const {
    data: applications,
    isLoading,
    isError,
    error,
  } = useGetApplicationsByUserId(userId);
  const [listApps, setListApps] = useState<ListingWithApplication[]>([]);

  useEffect(() => {
    const listings =
      (applications?.reverse().map((application) => {
        const { listing } = application;
        return {
          ...listing,
          application,
        };
      }) as ListingWithApplication[]) ?? [];
    setListApps(listings);
  }, [applications]);

  return {
    listingWithApplications: listApps,
    isLoading,
    isError,
    error,
  };
};

export default TenantOverviewPage;
