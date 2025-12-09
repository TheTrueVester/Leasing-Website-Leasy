import {ChatData} from "@/model/chat.ts";
import {User} from "@/model/user.ts";

/**
 * Reformats the chat object by setting its "user" attribute to the chat partner
 * @param chat - selected chat
 * @param user - the user, on whose side the chatwindow is opened
 */
export function setPartner(chat: ChatData, user: User) {
  if (chat?.applicant?.id === user?.id) {
    delete chat?.applicant;
    chat.user = chat.host;
    delete chat?.host;
  } else if (chat?.host?.id === user?.id) {
    delete chat?.host;
    chat.user = chat?.applicant;
    delete chat?.applicant;
  }
}