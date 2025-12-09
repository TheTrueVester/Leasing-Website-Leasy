import { useAuth } from "@/hooks/useAuth";
import {
  Booking,
  HostBookingColumns,
  TenantBookingColumns,
} from "@/model/booking";
import { PaymentStatus } from "@/model/payment";
import { prettyDate } from "@/utils/dateUtils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { baseUrl } from "./base";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

export const useGetBookingbyId = (bookingId: string) => {
  const { token } = useAuth();

  const getBookingById = async () => {
    return fetch(`${baseUrl}/bookings/${bookingId}`, {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => data.booking) as Promise<Booking>;
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getBookingById", bookingId],
    queryFn: () => getBookingById(),
    enabled: !!bookingId,
  });

  return { data, error, isLoading, isError };
};

export const useGetBookingsbyTenantId = (tenantId: string) => {
  const { token } = useAuth();

  const getBookingByTenantId = async () => {
    return fetch(`${baseUrl}/bookings/tenant/${tenantId}`, {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const bookings: Booking[] = data.bookings;
        const formattedBookings = bookings.map((booking) => {
          const { email, firstname, lastname, phoneNumber } =
            booking.host ?? {};
          const { listing } = booking.application ?? {};
          const { availableFrom, availableTo, address } = listing ?? {};
          const { street, streetNumber, postalCode, city } = address ?? {};
          return {
            bookingId: booking.id,
            paymentStatus:
              booking.paymentFromTenant?.status ?? PaymentStatus.Requested,
            paymentAmount: booking.paymentFromTenant?.total ?? 0,
            hostEmail: email,
            hostName: `${firstname} ${lastname}`,
            hostPhoneNumber: phoneNumber,
            from: prettyDate(new Date(availableFrom ?? "")),
            to: prettyDate(new Date(availableTo ?? "")),
            address: `${street} ${streetNumber}, ${postalCode} ${city}`,
            applicationId: booking.application?.id,
            listingId: listing?.id,
            listingName: listing?.title,
            listingPictureUrl: listing?.attachments[0],
          } as TenantBookingColumns;
        });
        return formattedBookings;
      });
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getBookingByTenantId", tenantId],
    queryFn: () => getBookingByTenantId(),
    enabled: !!tenantId,
  });

  return { data, error, isLoading, isError };
};

export const useGetBookingsbyHostId = (hostId: string) => {
  const { token } = useAuth();

  const getBookingByHostId = async () => {
    return fetch(`${baseUrl}/bookings/host/${hostId}`, {
      method: "GET",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const bookings: Booking[] = data.bookings;
        const formattedBookings = bookings.map((booking) => {
          const { email, firstname, lastname, phoneNumber } =
            booking.tenant ?? {};
          const { listing } = booking.application ?? {};
          const { availableFrom, availableTo, address } = listing ?? {};
          const { street, streetNumber, postalCode, city } = address ?? {};
          return {
            bookingId: booking.id,
            paymentStatus:
              booking.paymentFromTenant?.status ?? PaymentStatus.Requested,
            paymentAmount: booking.paymentFromTenant?.total ?? 0,
            paymentAmountToHost: booking.paymentToHost?.total ?? 0,
            paymentStatusToHost:
              booking.paymentToHost?.status ?? PaymentStatus.Pending,
            tenantEmail: email,
            tenantName: `${firstname} ${lastname}`,
            tenantPhoneNumber: phoneNumber,
            from: prettyDate(new Date(availableFrom ?? "")),
            to: prettyDate(new Date(availableTo ?? "")),
            address: `${street} ${streetNumber}, ${postalCode} ${city}`,
            applicationId: booking.application?.id,
            listingId: listing?.id,
            listingName: listing?.title,
            listingPictureUrl: listing?.attachments[0],
          } as HostBookingColumns;
        });
        return formattedBookings;
      });
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getBookingByHostId", hostId],
    queryFn: () => getBookingByHostId(),
    enabled: !!hostId,
  });

  return { data, error, isLoading, isError };
};

type CreateBookingProps = {
  hostEmail: string;
  tenantEmail: string;
  applicationID: string;
};

export const useCreateBooking = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const createBooking = async (data: CreateBookingProps) => {
    return fetch(`${baseUrl}/bookings/create`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...data,
      }),
    })
      .then((res) => {
        if (res.status === 201) {
          toast({
            title: "Booking created successfully!",
            content:
              'Click on "bookings" in the overview page to view your bookings.',
            variant: "success",
          });
          navigate("/sublet/overview");
        } else {
          toast({
            title: "Booking creation failed",
            content: "Please try again later.",
            variant: "destructive",
          });
        }
        return res.json();
      })
      .catch((e) => console.log(e));
  };
  return useMutation({
    mutationFn: (data: CreateBookingProps) => createBooking(data),
  });
};
