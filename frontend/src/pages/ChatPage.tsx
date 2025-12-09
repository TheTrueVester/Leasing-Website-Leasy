import { useGetChatsByUserId } from "@/api/chat.ts";
import { useRemoveUnreadMessages } from "@/api/user.ts";
import ChatWindow from "@/components/ChatWindow.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth.ts";
import { ChatData } from "@/model/chat.ts";
import { setPartner } from "@/utils/chatUtils.ts";
import { getUserInitials } from "@/utils/stringUtils.tsx";
import { CircleIcon } from "lucide-react";
import { useEffect, useState } from "react";
import Lottie from "lottie-react";
import chatAnimation from "../../public/lotties/chat.json";

/**
 * ChatPage displays the chat page where the user can see their chats and chat with other users.
 */
const ChatPage = () => {
  const { user, storeUser } = useAuth();
  const { data: chats, isLoading, error } = useGetChatsByUserId(user?.id ?? "");
  for (const chatsKey in chats) {
    const chat = chats[chatsKey];
    if (user) {
      setPartner(chat, user);
    }
  }
  const [selectedChat, setSelectedChat] = useState<ChatData>();
  const [chatsUnreadStatus, setChatsUnreadStatus] = useState(
    new Array<string>()
  );
  const { mutateAsync: removeUnreadMessages } = useRemoveUnreadMessages();

  useEffect(() => {
    setChatsUnreadStatus(user?.unreadMessages ?? []);
  }, [user]);

  function showChatWindow() {
    // Displays the selected chat in a chatWindow on the right side
    if (!selectedChat) {
      return (
        !selectedChat && (
          <div className="flex h-full flex-grow items-center justify-center">
            <div className="">
              <Lottie
                animationData={chatAnimation}
                className="w-[35vw] 2xl:w-[25vw] opacity-70"
              />
              <div className="text-lg text-gray-400 text-center font-medium">
                Select a chat to start messaging
              </div>
            </div>
          </div>
        )
      );
    } else {
      return (
        !!selectedChat && (
          <div className="w-full py-2">
            <ChatWindow chat={selectedChat} origin="ChatPage" className="" />
          </div>
        )
      );
    }
  }

  function removeUnread(chat: ChatData) {
    // updates the unread status once the user opens an unread chat
    const updated = chatsUnreadStatus.filter((c) => {
      return c !== chat.user?.id;
    });
    setChatsUnreadStatus(updated);
    void removeUnreadMessages({
      senderId: chat.user?.id ?? "",
      recipientId: user?.id ?? "",
    });
    storeUser({
      ...user,
      unreadMessages: updated,
    });
  }

  if (error) {
    return <h1>Error: {error.message}</h1>;
  }
  if (isLoading) {
    return <h1>Loading...</h1>;
  }
  return (
    <div className="flex flex-row h-[72.5vh] space-x-4">
      <div className="flex flex-col basis-1/4">
        <div className="flex items-center p-4">
          <h1 className="text-2xl font-bold">Chats</h1>
        </div>
        <div className="space-y-2">
          {chats &&
            chats.map((chat: ChatData) => (
              <div
                className="flex flex-col"
                onClick={() => {
                  removeUnread(chat);
                  setSelectedChat(chat);
                }}
              >
                <div className="flex items-center p-4 rounded-md hover:shadow-lg hover:bg-indigo-100 hover:transform transition-all duration-300">
                  <Avatar>
                    <AvatarImage
                      src={chat?.user?.profilePicture}
                      alt="Profile Pic"
                    />
                    <AvatarFallback>
                      {getUserInitials(chat?.user ?? {})}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pl-4">
                    <p className="text-lg font-medium leading-none">
                      {chat?.user?.firstname} {chat?.user?.lastname}
                    </p>
                    {/*<p className="text-sm text-muted-foreground">*/}
                    {/*  {chat?.user?.email}*/}
                    {/*</p>*/}
                  </div>
                  {chatsUnreadStatus.includes(chat?.user?.id ?? "") && (
                    <div className="flex items-center ml-auto">
                      <CircleIcon className="fill-amber-400 stroke-0 size-3" />
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      <Separator orientation="vertical" />
      <div className="flex basis-3/4">{showChatWindow()}</div>
    </div>
  );
};

export default ChatPage;
