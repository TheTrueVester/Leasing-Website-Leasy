// api/useCreateApplication.ts
import { baseUrl } from "./base";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Application, ApplicationFormData } from "@/model/application";

export const useCreateApplication = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, token } = useAuth();

  const createApplication = async (data: ApplicationFormData) => {
    const { message, listingId, attachments } = data;

    const json = {
      message,
      applicantEmail: user?.email,
      listingId: listingId,
      status: "PENDING",
      attachments,
    };

    try {
      const response = await fetch(`${baseUrl}/applications`, {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to create application.");
      }

      const responseData = await response.json();

      toast({
        title: "Application created successfully!",
        description: "Now sit back and wait for the renter to contact you :)",
        variant: "success",
      });

      navigate("/overview");

      return responseData;
    } catch (error) {
      console.error("Error creating application:", error);
      toast({
        title: "Failed to create application.",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw error; 
    }
  };

  return useMutation({
    mutationFn: (data: ApplicationFormData) => createApplication(data),
  });
};

export const useGetApplicationById = (applicationId: string) => {
  const getApplicationById = async () => {
    const searchParams = new URLSearchParams([
      ["applicationId", applicationId],
    ]);

    return fetch(`${baseUrl}/applications/?${searchParams.toString()}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404) {
          return null;
        }
        return res.json();
      })
      .then((data) => data.application as Application)
      .catch((err) => console.log(err));
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getApplicationById", applicationId],
    queryFn: () => getApplicationById(),
    enabled: !!applicationId,
  });

  return { data, error, isLoading, isError };
};

export const useGetApplicationsByListingId = (listingId: string) => {
  const getApplicationsByListingId = async () => {
    const searchParams = new URLSearchParams([["listingId", listingId]]);

    return fetch(`${baseUrl}/applications/?${searchParams}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status !== 200) {
          return [];
        }
        return res.json();
      })
      .then((data) => data.applications) as Promise<Application[]>;
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getApplicationsByListingId", listingId],
    queryFn: () => getApplicationsByListingId(),
    enabled: !!listingId,
    refetchOnMount: false,
  });

  return { data, error, isLoading, isError };
};

export const useGetApplicationsByUserId = (userId: string) => {
  const getApplicationsByUserId = async () => {
    const searchParams = new URLSearchParams([["userId", userId]]);

    return fetch(`${baseUrl}/applications/?${searchParams}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404) {
          return null;
        }
        return res.json();
      })
      .then((data) => data.applications) as Promise<Application[]>;
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getApplicationsByUserId", userId],
    queryFn: () => getApplicationsByUserId(),
    enabled: !!userId,
  });
  return { data, error, isLoading, isError };
};

export const useDeleteApplicationById = (applicationId: string) => {
  const { toast } = useToast();
  const deleteApplicationById = async () => {
    const searchParams = new URLSearchParams([
      ["applicationId", applicationId],
    ]);

    return fetch(`${baseUrl}/applications/?${searchParams.toString()}`, {
      method: "DELETE",
      mode: "cors",
    })
      .then((res) => {
        if (res.status !== 200) {
          toast({
            title: "Failed to delete application.",
            description: "Please try again later.",
            variant: "destructive",
          });
          throw new Error("Failed to delete application.");
        }
        return res.json();
      })
      .then((data) => data)
      .catch((err) => console.log(err));
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["deleteApplicationById", applicationId],
    queryFn: () => deleteApplicationById(),
    enabled: !!applicationId,
  });

  return { data, error, isLoading, isError };
};
