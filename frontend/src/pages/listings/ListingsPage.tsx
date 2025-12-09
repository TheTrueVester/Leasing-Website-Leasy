import { useGetAds } from "@/api/ads";
import { useSearchListings } from "@/api/listing";
import { useGetUserFavorites } from "@/api/user";
import {
  ListingCard,
  SkeletonCard,
} from "@/components/listing/ListingCard.tsx";
import SearchBar from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { AD_INTERVAL, Advertisement } from "@/model/ads";
import { ListingDisplay } from "@/model/listing";
import { TextAlignBottomIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

type SearchResult = {
  type: "listing" | "advertisement";
  data: ListingDisplay | Advertisement;
};

/**
 * This page displays all available listings in a grid.
 * This would be the page that users see when they are browsing the offered listings.
 * One could limit the displayed listings by setting filters.
 */
const SearchListingsPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    data: listings,
    error,
    isLoading,
    isFetching,
  } = useSearchListings(Object.fromEntries(searchParams));
  const { favorites, isLoading: isLoadingFavorites } = useGetUserFavorites(
    !!listings && !!user,
    "ids"
  );
  const { data: advertisements } = useGetAds();
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>({
    // default sort option
    type: "price",
    order: "asc",
  });

  // Interweave listings with advertisements
  useEffect(() => {
    const mixedItems = [];

    if (listings && advertisements && advertisements.length > 0) {
      let adIndex = 0;
      for (let i = 0; i < listings.length; i++) {
        mixedItems.push({ type: "listing", data: listings[i] });
        //ad interval determines frequency of ads
        if ((i + 1) % AD_INTERVAL === 0 && adIndex < advertisements.length) {
          mixedItems.push({
            type: "advertisement",
            data: advertisements[adIndex],
          });
          adIndex++;
        }
      }
      // Add remaining ads if any
      while (adIndex < advertisements.length) {
        mixedItems.push({
          type: "advertisement",
          data: advertisements[adIndex],
        });
        adIndex++;
      }
    } else if (listings) {
      listings.forEach((listing) =>
        mixedItems.push({ type: "listing", data: listing })
      );
    }
    setFilteredResults(mixedItems);
  }, [listings, advertisements, user, favorites]);

  // Set default search parameters
  useEffect(() => {
    searchParams.set("status", "ACTIVE");
    if (user?.id) {
      searchParams.set("userID", user.id);
    }
  }, [searchParams, user]);

  // Sort the listings based on the selected option
  const onSortChange = (sort: "price" | "size", order: "asc" | "desc") => {
    const sortedResults = [...filteredResults].sort((a, b) => {
      if (a.type === "listing" && b.type === "listing") {
        const listingA = a.data as ListingDisplay;
        const listingB = b.data as ListingDisplay;
        if (sort === "price") {
          return order === "asc"
            ? listingA.price - listingB.price
            : listingB.price - listingA.price;
        } else {
          return order === "asc"
            ? listingA.size - listingB.size
            : listingB.size - listingA.size;
        }
      }
      return 0;
    });
    setSortOption({ type: sort, order });
    setFilteredResults(sortedResults);
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
    <div className="flex flex-col space-y-4 justify-start">
      <SearchBar searchParams={searchParams} />
      <div className="flex justify-end">
        <SortingDropdown option={sortOption} onSortChange={onSortChange} />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
        {isLoading || isFetching ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {listings && listings.length === 0 && (
              <div className="col-span-full">
                <div className="flex flex-col w-full justify-center align-middle text-center">
                  <h1 className="text-3xl font-bold">No listings found :/</h1>
                  <p className="text-gray-500">
                    Please try changing your search criteria.
                  </p>
                </div>
              </div>
            )}
            {!isLoadingFavorites &&
              filteredResults.map((item) =>
                item.type === "listing" ? (
                  <Link
                    to={`/listings/${(item.data as ListingDisplay).id}`}
                    key={(item.data as ListingDisplay).id}
                    target="_blank"
                  >
                    <ListingCard
                      listing={item.data as ListingDisplay}
                      isLiked={
                        user &&
                        favorites &&
                        ((favorites as string[]) ?? [""]).includes(
                          (item.data as ListingDisplay).id.toString()
                        )
                      }
                      userFavorites={favorites as string[]}
                    />
                  </Link>
                ) : (
                  // Advertisement
                  <a
                    key={(item.data as Advertisement)._id}
                    href={(item.data as Advertisement).link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Card className="overflow-hidden h-full max-w-80 hover:shadow-lg hover:shadow-indigo-100 hover:scale-[102%] hover:transform transition-all duration-300">
                      <CardContent className="p-0 h-full">
                        <div className="relative flex items-center overflow-hidden h-48 rounded-md rounded-b-none ">
                          <img
                            alt="Ad image"
                            className="aspect-auto object-cover w-full h-full"
                            src={(item.data as Advertisement).imageUrl}
                          />
                        </div>
                        <div className="flex flex-col justify-start align-top px-4 pb-4 space-y-4">
                          <div className="space-y-1">
                            <h1 className="text-xl max-w-[14rem] py-4 text-foreground-muted text-center text-gray-500 inline-block">
                              {item.data.title}
                            </h1>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                )
              )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchListingsPage;

type SortOption = {
  type: "price" | "size";
  order: "asc" | "desc";
};

const sortingOptions = [
  { type: "price", order: "asc", label: "Price (lowest first)" },
  { type: "price", order: "desc", label: "Price (highest first)" },
  { type: "size", order: "asc", label: "Size (lowest first)" },
  { type: "size", order: "desc", label: "Size (highest first)" },
];

type SortingDropdownProps = {
  option?: SortOption;
  onSortChange: (sort: "price" | "size", order: "asc" | "desc") => void;
};

const SortingDropdown = ({
  option: sortOption,
  onSortChange,
}: SortingDropdownProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger>
      <Button variant="outline">
        <TextAlignBottomIcon className="mr-2 h-5 w-5" />
        Sorting options
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      {sortingOptions.map((option) => (
        <DropdownMenuItem
          key={option.label}
          onClick={() =>
            onSortChange(
              option.type as "size" | "price",
              option.order as "asc" | "desc"
            )
          }
          className={`${
            sortOption.type === option.type && sortOption.order === option.order
              ? "font-semibold bg-secondary"
              : ""
          }`}
        >
          {option.label}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  </DropdownMenu>
);
