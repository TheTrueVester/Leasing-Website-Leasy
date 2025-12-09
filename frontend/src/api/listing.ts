import { useToast } from "@/components/ui/use-toast.ts";
import type {
  ListingCreationFormData,
  ListingDisplay,
  ListingEditingFormData,
  ListingQuery,
} from "@/model/listing";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "./base";
import { useAuth } from "@/hooks/useAuth.ts";

export const useCreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();
  const createListing = async (data: ListingCreationFormData) => {
    const {
      title,
      size,
      price,
      dormType,
      street,
      streetNumber,
      postalCode,
      city,
      country,
      availableFrom,
      availableTo,
      listingAttributes,
      description,
      attachments,
    } = data;

    const json = {
      title,
      description,
      availableFrom,
      availableTo,
      size,
      price,
      address: {
        street,
        streetNumber,
        postalCode,
        city,
        country,
      },
      dormType,
      listingAttributes,
      userID: user?.id, // Add null check for 'user' object
    };
    const d = new FormData();
    d.append("listing", JSON.stringify(json));
    attachments.forEach((file) => {
      d.append("attachments", file, file.name);
    });

    return fetch(`${baseUrl}/listings/create`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: d,
    })
      .then((res) => {
        if (res.status === 400) {
          toast({
            title: "Failed to create listing.",
            variant: "destructive",
          });
          return;
        }
        if (res.status === 404) {
          toast({
            title: "Something went wrong.",
            description: "Failed to create listing. Please try again.",
            variant: "destructive",
          });
          return;
        }
        if ((res as Response).ok) {
          // TODO navigate to correct account mode
          toast({
            title: "Listing created successfully!",
            description:
              "Now sit back and wait for potential tenants to contact you :)",
            variant: "success",
          });
          navigate("/sublet/overview");
          console.log("Listing created successfully");
        }
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: ListingCreationFormData) => createListing(data),
  });
};

export const useSearchListings = (query: ListingQuery) => {
  const searchListing = async (query: ListingQuery) => {
    return fetch(
      `${baseUrl}/listings?` +
        new URLSearchParams([...Object.entries(query)]).toString(),
      {
        method: "GET",
        mode: "cors",
      }
    )
      .then((res) => {
        if (res.status === 404) {
          return { listings: [] };
        }
        return res.json();
      })
      .then((data) => (data ? (data.listings as ListingDisplay[]) : []))
      .catch((err) => console.log(err));
  };

  const { data, error, isLoading, isFetching, isError } = useQuery({
    queryKey: ["getListings", query],
    queryFn: () => searchListing(query),
  });
  return { data, error, isLoading, isFetching, isError };
};

export const useGetListingById = (listingId: string) => {
  const getListing = async () => {
    return fetch(`${baseUrl}/listings/${listingId}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404) {
          return null;
        }
        return res.json();
      })
      .then((data) => data.listing)
      .catch((err) => console.log(err));
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getListing", listingId],
    queryFn: () => getListing(),
  });

  return { data, error, isLoading, isError };
};

export const useGetListingsByUserId = (userId: string) => {
  const getListings = async () => {
    return fetch(`${baseUrl}/listings/my-listings/${userId}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404) {
          return [];
        }
        return res.json();
      })
      .then((data) =>
        data.listings ? (data.listings as ListingDisplay[]) : []
      )
      .catch((err) => console.log(err));
  };

  const { data, error, isLoading, isError, isFetching } = useQuery({
    queryKey: ["getListings", userId],
    queryFn: () => getListings(),
    enabled: !!userId,
  });

  return { data, error, isLoading, isError, isFetching };
};

export const useEditListing = (listingId: string) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = useAuth();
  const editListing = async (data: ListingEditingFormData) => {
    const {
      title,
      size,
      price,
      dormType,
      street,
      streetNumber,
      postalCode,
      city,
      country,
      availableFrom,
      availableTo,
      listingAttributes,
      description,
      attachments,
      removed,
    } = data;

    const json = {
      title,
      description,
      availableFrom,
      availableTo,
      size,
      price,
      address: {
        street,
        streetNumber,
        postalCode,
        city,
        country,
      },
      dormType,
      listingAttributes,
      removed,
    };
    const d = new FormData();
    d.append("listing", JSON.stringify(json));
    attachments.forEach((file) => {
      d.append("attachments", file, file.name);
    });
    return fetch(`${baseUrl}/listings/edit/${listingId}`, {
      method: "PUT",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: d,
    })
      .then((res) => {
        if (res.status === 400) {
          toast({
            title: "Failed to edit listing.",
            variant: "destructive",
          });
          return;
        }
        if (res.status === 404) {
          toast({
            title: "Something went wrong.",
            description: "Failed to edit listing. Please try again.",
            variant: "destructive",
          });
          return;
        }
        if ((res as Response).ok) {
          // TODO navigate to correct account mode
          toast({
            title: "Listing updated successfully!",
            variant: "default",
          });
          navigate("/sublet/overview");
          console.log("Listing updated successfully");
        }
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: ListingEditingFormData) => editListing(data),
  });
};
