import { User } from "@/model/user.ts";
import { ListingDisplay } from "./listing";

export interface ApplicationFormData {
  message: string;
  applicantEmail: User;
  listingId: string;
  attachments: File[];
  bio: string;
  hobbies: string;
  languages: string;
  major: string;
  university: string;
}
export interface ApplicationId extends ApplicationFormData {
  id: string;
}
export type Application = {
  id?: string;
  applicant?: User;
  listing?: ListingDisplay;
  message?: string;
  status?: "ACCEPTED" | "PENDING" | "REJECTED";
  attachments: string[];
  createdAt?: Date;
};

export const applicationStatusList = ["accepted", "pending", "rejected"];
