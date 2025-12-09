export interface ChatCreation {
  hostId: string;
  applicantId: string;
}

export interface Chat {
  applicant: {
    id: string,
    firstname: string,
    lastname: string,
    profilePicture: string,
    email: string,
  },
  host: {
    id: string,
    firstname: string,
    lastname: string,
    profilePicture: string,
    email: string,
  },
  messages: {
    sender: string,
    recipient: string,
    text: string,
    file: string
  }[]
}

export interface ChatData {
  applicant?: {
    id: string,
    firstname: string,
    lastname: string,
    profilePicture: string,
    email: string,
  },
  host?: {
    id: string,
    firstname: string,
    lastname: string,
    profilePicture: string,
    email: string,
  },
  user: {
    id: string,
    firstname: string,
    lastname: string,
    profilePicture: string,
    email: string,
  } | undefined,
  messages: {
    sender: string,
    recipient: string,
    text: string,
    file: string
  }[]
}

export interface MessageCreation {
  senderId: string;
  recipientId: string;
  text: string;
  file: File | null;
}

export interface MessageDisplay {
  sender: string;
  recipient: string;
  text: string;
  file: string;
}