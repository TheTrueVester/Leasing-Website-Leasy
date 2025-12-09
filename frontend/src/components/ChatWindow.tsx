import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar.tsx";
import {
  getFileNameFromS3Link,
  getUserInitials,
} from "@/utils/stringUtils.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { cn } from "@/lib/utils.ts";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { FilePlusIcon, PaperPlaneIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth.ts";
import { ChatData, MessageDisplay } from "@/model/chat.ts";
import { useCreateMessage } from "@/api/chat.ts";
import { Link } from "react-router-dom";
import { useAddUnreadMessage } from "@/api/user.ts";
import { FileIcon } from "lucide-react";
import {toast} from "@/components/ui/use-toast.ts";

type Props = { chat: ChatData } & { origin: string } & { className: string };

/**
 * A chat window component that enables sending and receiving of messages between two participants.
 * @param {Chat} chat - the chat object between the participants
 * @param {stirng} origin - location where the chatwindow is used, for synchronous chatting connections
 * @param {string} className - extra classNames for styling
 * @constructor
 */
const ChatWindow = ({ chat, origin, className }: Props) => {
  const { user: me } = useAuth();
  const [myId, setMyId] = useState("");
  const { mutateAsync: createMessage } = useCreateMessage();
  const { mutateAsync: addUnreadMessage } = useAddUnreadMessage();
  const [ws, setWs] = useState<WebSocket>();
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState<MessageDisplay[]>(chat.messages);
  const [partner, setPartner] = useState(chat.user);
  const inputLength = newMessageText.trim().length;
  const divUnderMessages = useRef<HTMLDivElement>(null);
  const [cookie, setCookie] = useState("");
  const [lastMessage, setLastMessage] = useState();

  useEffect(() => {
    setMessages(chat.messages);
    setPartner(chat.user);
  }, [chat]);

  useEffect(() => {
    setMyId(me?.id ?? "");
    // Stores necessary information in the cookie for identifying a chat connection in the web socket server
    const newCookie = `leasyChat=sender:${me?.id}=recipient:${partner?.id}=origin:${origin}; path=/`;
    if (cookie !== newCookie) {
      setCookie(newCookie);
    }
  }, [me, partner]);

  useEffect(() => {
    // new cookie means new connection -> set cookie and connect
    document.cookie = cookie;
    connectToWs();
  }, [cookie]);

  useEffect(() => {
    // scrolls to always keep the last message visible
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [messages]);

  function connectToWs() {
    // Create websocket that connects to the server for this specific connection
    const ws = new WebSocket("ws://localhost:8080");
    setWs(ws);
    // on receive of a new message
    ws.addEventListener("message", (event)=>{
      if (event.data !== lastMessage) {
        handleMessage(event);
      }
      setLastMessage(event.data);
    });
    //try to reconnect if disconnected
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 5000);
    });
  }

  function handleMessage(ev) {
    // add received message to be displayed
    const messageData = JSON.parse(ev.data);
    if (messageData.sender === partner?.id) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  function sendMessage(ev, file = null) {
    // don't refresh
    if (ev) ev.preventDefault();
    // block email addresses: could be more refined
    if (!newMessageText.includes("@")){
      // Create message then send it to the web socket server through this connection
      // clear input field, append message sent to be displayed
      // add unread message for recipient for notification
      createMessage({
        senderId: myId,
        recipientId: partner?.id ?? "",
        text: newMessageText,
        file: file,
      })
        .then((res) => {
          ws?.send(JSON.stringify(res.newMessage));
          setNewMessageText("");
          setMessages((prev) => [...prev, res.newMessage]);
          addUnreadMessage({ senderId: myId, recipientId: partner?.id ?? "" });
        })
        .catch((e) => console.log(e));
    } else {
      setNewMessageText("");
      toast({
        variant: "destructive",
        title: "This message can not be sent.",
        description: "For your safety, please do not share your email address with others."
      })
    }
  }

  function sendFile(ev) {
    sendMessage(null, ev.target.files[0]);
  }

  return (
    <Card className={cn(className, "flex flex-col w-full h-full")}>
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src={partner?.profilePicture} alt="Profile Pic" />
            <AvatarFallback>{getUserInitials(partner ?? {})}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-medium leading-none">
              {partner?.firstname} {partner?.lastname}
            </p>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="flex-grow mt-auto min-h-fit max-h-[65vh] overflow-y-auto">
        <div className="space-y-4 py-2">
          {messages &&
            messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "flex w-fit max-w-[75%] flex-col gap-2 rounded-lg px-3 py-2 text-sm",
                  message.sender === myId
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {!!message.text && message.text}
                {!!message.file &&
                  (message.file.endsWith(".pdf") ? (
                    <Link
                      to={message.file}
                      className="flex flex-row items-center cursor-pointer p-2"
                    >
                      <FileIcon className="size-12 pr-2" />
                      <div className="flex flex-col max-w-56 min-h-12 justify-between p-1">
                        {message.sender !== myId &&
                          <label className="font-bold">{`${partner?.firstname} sent you a file`}</label>
                        }
                        {message.sender === myId &&
                          <label className="font-bold">{"You sent a file"}</label>
                        }
                        <p className="text-wrap truncate text-gray-400">
                          {getFileNameFromS3Link(message.file)}
                        </p>
                      </div>
                    </Link>
                  ) : (
                    <Link to={message.file}>
                      <img
                        src={message.file}
                        alt={message.file}
                        className="rounded-sm"
                      />
                    </Link>
                  ))}
              </div>
            ))}
          <div ref={divUnderMessages}></div>
        </div>
      </CardContent>
      <CardFooter className="">
        <form
          onSubmit={sendMessage}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            className="flex-1"
            autoComplete="off"
            value={newMessageText}
            onChange={(event) => setNewMessageText(event.target.value)}
          />
          <label className="h-10 w-10 rounded-sm border flex justify-center items-center cursor-pointer">
            <FilePlusIcon className="h-4 w-4" />
            <input type="file" className="hidden" onChange={sendFile} />
          </label>

          <Button type="submit" size="icon" disabled={inputLength === 0}>
            <PaperPlaneIcon className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};
export default ChatWindow;
