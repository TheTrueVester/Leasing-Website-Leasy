import { useAuth } from "@/hooks/useAuth";
import { User } from "@/model/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "./base";
import { ListingDisplay } from "@/model/listing";
import {
  useGetApplicationsByListingId,
  useGetApplicationsByUserId,
} from "./application";

export const useGetUserById = (userId: string, enabled: boolean) => {
  const getUser = async () => {
    return fetch(`${baseUrl}/users/${userId}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404) {
          throw new Error("User not found");
        }
        return res.json();
      })
      .then((data) => data.user as User)
      .catch((err) => console.log(err));
  };

  const {
    data: user,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getUser", userId],
    queryFn: () => getUser(),
    enabled,
  });

  return { user, error, isLoading, isError };
};

export const useGetUserFavorites = (
  isEnabled: boolean,
  format: "full" | "ids" = "ids"
) => {
  const { user, token } = useAuth();

  const searchParams = new URLSearchParams();
  searchParams.append("format", format);

  const getUserFavorites = async () => {
    return fetch(
      `${baseUrl}/users/${user?.id}/favorites?${searchParams.toString()}`,
      {
        method: "GET",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        return format === "ids"
          ? (data.listings as string[])
          : (data.listings as ListingDisplay[]);
      })
      .catch((err) => console.log(err));
  };

  const {
    data: favorites,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getUserFavorites", user?.id, format],
    queryFn: () => getUserFavorites(),
    enabled: isEnabled,
  });

  return { favorites, error, isLoading, isError };
};

export const useAddListingToFavorites = (
  listingId: string,
  userFavorites: string[]
) => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const addListingToFavorites = async (isLiked: boolean) => {
    return fetch(`${baseUrl}/users/edit`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: user?.email,
        favorites: isLiked
          ? [
              ...userFavorites.filter((id: string) => id !== listingId),
              listingId,
            ]
          : userFavorites?.filter((id: string) => id !== listingId),
      }),
    })
      .then((res) => {
        if (res.status === 400) {
          throw new Error("Bad request");
        }
        return res.json();
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["getUserFavorites", user?.id],
        });
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (isLiked: boolean) => addListingToFavorites(isLiked),
  });
};

type RemoveUnreadMessagesProps = {
  senderId: string;
  recipientId: string;
};
export const useRemoveUnreadMessages = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const removeUnread = async (data: RemoveUnreadMessagesProps) => {
    return fetch(`${baseUrl}/users/removeUnread`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderId: data.senderId,
        recipientId: data.recipientId,
      }),
    })
      .then((res) => {
        if (res.status === 400) {
          throw new Error("Bad request");
        }
        return res.json();
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["getChats", user?.id],
        });
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: RemoveUnreadMessagesProps) => removeUnread(data),
  });
};

type AddUnreadMessagesProps = RemoveUnreadMessagesProps;
export const useAddUnreadMessage = () => {
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const addUnread = async (data: RemoveUnreadMessagesProps) => {
    console.log(data);
    return fetch(`${baseUrl}/users/addUnread`, {
      method: "PUT",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        senderId: data.senderId,
        recipientId: data.recipientId,
      }),
    })
      .then((res) => {
        if (res.status === 400) {
          throw new Error("Bad request");
        }
        return res.json();
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["removeUnread", user?.id],
        });
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: AddUnreadMessagesProps) => addUnread(data),
  });
};

type CheckApplicationProps = {
  listingId: string;
  applicantId: string;
};

export const useCheckUserAlreadyAppliedForListing = ({
  listingId,
  applicantId,
}: CheckApplicationProps) => {
  const { data: listingApplications } =
    useGetApplicationsByListingId(listingId);
  const { data: userApplications } = useGetApplicationsByUserId(applicantId);

  const checkUserAlreadyApplied = async () => {
    if (!listingApplications || !userApplications) {
      return false;
    }

    return userApplications.some((application) =>
      listingApplications.some(
        (listingApplication) => application.id === listingApplication.id
      )
    );
  };

  const {
    data: applied,
    error,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["checkUserAlreadyApplied", listingId],
    queryFn: () => checkUserAlreadyApplied(),
    enabled: !!listingApplications && !!userApplications,
  });

  return { applied, error, isLoading, isError };
};
