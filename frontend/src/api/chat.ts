import { baseUrl } from "@/api/base.ts";
import { useAuth } from "@/hooks/useAuth.ts";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { MessageCreation } from "@/model/chat.ts";
import { toast } from "@/components/ui/use-toast.ts";

export const useCreateChat = (hostId: string, applicantId: string) => {
  const { user, token } = useAuth();
  return fetch(`${baseUrl}/chat/create`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      hostId: hostId,
      applicantId: applicantId,
    }),
  })
    .then((res) => {
      if (res.status === 404 || res.status === 400) {
        throw new Error("Bad request");
      }
      return res.json();
    })
    .catch((err) => console.log(err));
};

export const useGetChatByChatId = (chatId: string) => {
  const getChat = async () => {
    return fetch(`${baseUrl}/chat/get/c/${chatId}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404) {
          return "Input was wrong";
        }
        return res.json();
      })
      .then((data) => data.chat)
      .catch((err) => console.log("An Error:" + err));
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getChat", chatId],
    queryFn: () => getChat(),
  });

  return { data, error, isLoading, isError };
};

export const useGetChatsByUserId = (userId: string) => {
  const getChats = async () => {
    return fetch(`${baseUrl}/chat/get/u/${userId}`, {
      method: "GET",
      mode: "cors",
    })
      .then((res) => {
        if (res.status === 404 || res.status === 400) {
          throw new Error("Bad request or user not found");
        }
        return res.json();
      })
      .then((data) => {
        console.log(data);
        return data.chats;
      })
      .catch((err) => console.log("An Error:" + err));
  };

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ["getChats", userId],
    queryFn: () => getChats(),
  });

  return { data, error, isLoading, isError };
};

export const useCreateMessage = () => {
  const { user, token } = useAuth();
  const createMessage = async (data: MessageCreation) => {
    const { senderId, recipientId, text, file } = data;
    const info = {
      senderId,
      recipientId,
      text,
    };

    const d = new FormData();
    d.append("info", JSON.stringify(info));
    if (file) {
      d.append("file", file, file.name);
    }
    return fetch(`${baseUrl}/chat/send`, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: d,
    })
      .then((res) => {
        if (res.status === 404) {
          toast({
            title: "Something went wrong.",
            description: "Failed to send this message. Please try again.",
            variant: "destructive",
          });
          return res;
        }
        if ((res as Response).ok) {
          console.log("message sent successfully");
          return res.json();
        }
      })
      .catch((err) => console.log(err));
  };

  return useMutation({
    mutationFn: (data: MessageCreation) => createMessage(data),
  });
};
