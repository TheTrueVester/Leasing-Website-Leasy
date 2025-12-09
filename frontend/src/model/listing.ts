import { Application } from "./application";

export interface ListingCreationFormData {
  title: string;
  size: number;
  price: number;
  dormType: string;
  street: string;
  streetNumber: string;
  postalCode: number;
  city: string;
  country: string;
  availableFrom: Date;
  availableTo: Date;
  listingAttributes: string[];
  description: string;
  createdBy: string;
  attachments: File[];
}

export interface Listing extends ListingCreationFormData {
  id: string;
}

export interface ListingEditingFormData {
  title: string;
  size: number;
  price: number;
  dormType: string;
  street: string;
  streetNumber: string;
  postalCode: number;
  city: string;
  country: string;
  availableFrom: Date;
  availableTo: Date;
  listingAttributes: string[];
  description: string;
  attachments: File[];
  removed: string[];
}

type Address = {
  street?: string;
  streetNumber?: string;
  postalCode?: string;
  city?: string;
  country?: string;
};

export type ListingDisplay = Omit<
  Listing,
  "attachments" | "street" | "streetNumber" | "postalCode" | "city"
> & {
  attachments: string[];
  createdAt: Date; // Date in ISO format
  lastUpdated: Date; // Date in ISO format
  status: "ACTIVE" | "PENDING" | "INACTIVE" | "RENTED" | "CANCELED";
  address: Address;
};

export interface ListingQuery {
  minSize?: number;
  maxSize?: number;
  minPrice?: number;
  maxPrice?: number;
  dormType?: string;
  street?: string;
  streetNumber?: string;
  postalCode?: number;
  city?: string;
  availableFrom?: Date;
  availableTo?: Date;
  listingAttributes?: string;
}

export type ListingSearchForm = {
  listingAttributes?: string[];
  city?: string | undefined;
  postalCode?: string | undefined;
  availableFrom?: Date | undefined;
  availableTo?: Date | undefined;
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
  minSize?: string | undefined;
  maxSize?: string | undefined;
  dormType?: string | undefined;
};

export type ListingWithApplication =
  | ListingDisplay & {
      application: Application;
    };

export const listingStatusList = [
  "all",
  "pending",
  "active",
  "rented",
  "inactive",
];

export const paymentStatusList = [
  "accepted",
  "requested",
  "settled",
  "pending",
];

export const dormTypes = [
  { label: "Single Apartment", value: "SINGLE_APARTMENT" },
  { label: "Shared Apartment", value: "SHARED_APARTMENT" },
  { label: "Student Dormitory", value: "STUDENT_DORMITORY" },
] as const;

export const listingProperties = [
  { id: "separate_bathroom", label: "Separate Bathroom" },
  { id: "separate_kitchen", label: "Separate Kitchen" },
  { id: "microwave", label: "Microwave" },
  { id: "oven", label: "Oven" },
  { id: "hair_dryer", label: "Hair Dryer" },
  { id: "air_conditioner", label: "Air Conditioner" },
  { id: "bus", label: "Bus" },
  { id: "u-Bahn", label: "U-Bahn" },
  { id: "s-Bahn", label: "S-Bahn" },
  { id: "gym", label: "Gym" },
  { id: "supermarket", label: "Supermarket" },
  { id: "bakery", label: "Bakery" },
] as const;
