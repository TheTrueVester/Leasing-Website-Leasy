export interface User {
  id?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  profilePicture?: string;
  userBioAttributes?: {
    [key: string]: string;
  };
  phoneNumber?: string;
  documents?: string[];
  unreadMessages?: string[];
}
