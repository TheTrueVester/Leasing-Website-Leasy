import { User } from "@/model/user";

const capitalize = (str?: string) => {
  return (
    str &&
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
};

const getUserInitials = (user: User) => {
  const { firstname, lastname } = user;
  if (!firstname || !lastname) return "";

  const initials = firstname.charAt(0) + lastname.charAt(0);
  return initials.toUpperCase();
};

const getFileNameFromS3Link = (S3Link: string) => {
  return decodeURI(S3Link.split('/').slice(-1)[0].split('-').slice(1)[0]);
}

export { capitalize, getUserInitials, getFileNameFromS3Link };
