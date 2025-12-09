import { ListingSearchForm } from "@/model/listing";
import { convertToDate, dateFormatter } from "@/utils/dateUtils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "./useAuth";

/**
 * useSearchForm is a custom hook that handles the search form for listings.
 * It includes the form schema, form state, and functions to update the search parameters.
 * This hook is used in the ListingsPage component to filter listings based on user input.
 * @param {URLSearchParams} searchParams - The search parameters from the URL.
 * @returns {Object} An object containing the form state and functions to update the search parameters.
 * @returns {Object} form - The form state containing the search parameters.
 * @returns {Function} onSubmit - A function that updates the search parameters and navigates to the listings page.
 * @returns {Function} handleReset - A function that resets the search parameters and navigates to the listings page.
 */
const useSearchForm = (searchParams?: URLSearchParams) => {
  const [date, setDate] = useState<DateRange | undefined>();

  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const queryClient = useQueryClient();

  const formSchema = z.object({
    city: z.string().optional(),
    postalCode: z.string().optional(),
    availableFrom: z.date().optional(),
    availableTo: z.date().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),
    minSize: z.string().optional(),
    maxSize: z.string().optional(),
    listingAttributes: z.array(z.string()),
    dormType: z.string().optional(),
    userID: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      city: searchParams?.get("city") ?? "",
      postalCode: searchParams?.get("postalCode") ?? "",
      availableFrom: convertToDate(searchParams?.get("start")),
      availableTo: convertToDate(searchParams?.get("end")),
      maxPrice: searchParams?.get("maxPrice") ?? "",
      minSize: searchParams?.get("minSize") ?? "",
      listingAttributes: [],
      dormType: searchParams?.get("dormType") ?? "",
      userID: user?.id ?? "",
    },
  });

  function updateSearchParams(values: z.infer<typeof formSchema>) {
    const {
      city,
      postalCode,
      availableFrom,
      availableTo,
      minPrice,
      maxPrice,
      minSize,
      maxSize,
      listingAttributes,
      dormType,
    }: ListingSearchForm = values;
    const params = searchParams ?? new URLSearchParams();

    queryClient.invalidateQueries({
      queryKey: ["getListings", searchParams],
    });

    params.set("city", city ?? "");
    params.set("postalCode", postalCode ?? "");
    params.set("start", dateFormatter(availableFrom));
    params.set("end", dateFormatter(availableTo));
    params.set("minPrice", minPrice ?? "");
    params.set("maxPrice", maxPrice ?? "");
    params.set("minSize", minSize ?? "");
    params.set("maxSize", maxSize ?? "");
    params.set("dormType", dormType ?? "");
    params.set("listingAttributes", listingAttributes.join(","));
    if (user?.id) params.set("userID", user?.id ?? "");

    // remove empty params of all types
    Object.keys(Object.fromEntries(params)).forEach((key) => {
      if (!params.get(key)) {
        params.delete(key);
      }
    });

    return params;
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const params = updateSearchParams(values);
    navigate({
      pathname: "/listings",
      search: params.toString(),
    });
  }

  function handleReset() {
    setDate(undefined);
    navigate({
      pathname: pathname,
      search: "",
    });
    queryClient.invalidateQueries({
      queryKey: ["getListings", searchParams],
    });
    form.reset({
      city: "",
      postalCode: "",
      availableFrom: undefined,
      availableTo: undefined,
      minPrice: "",
      maxPrice: "",
      minSize: "",
      maxSize: "",
      listingAttributes: [],
    });
  }

  return { form, date, setDate, onSubmit, handleReset };
};

export default useSearchForm;
