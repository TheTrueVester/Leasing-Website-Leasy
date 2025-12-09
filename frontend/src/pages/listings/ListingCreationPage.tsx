import { useCreateListing } from "@/api/listing.ts";
import Dropzone from "@/components/Dropzone.tsx";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils.ts";
import { dormTypes, listingProperties } from "@/model/listing";
import { zodResolver } from "@hookform/resolvers/zod";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const InformationFormSchema = z
  .object({
    title: z.coerce.string().min(1, {
      message: "Please enter a title.",
    }),
    size: z.coerce
      .number()
      .int({
        message: "Size should be an integer.",
      })
      .gt(0, {
        message: "Size should be larger than 0.",
      }),
    price: z.coerce
      .number()
      .int({
        message: "Price should be an integer.",
      })
      .gt(0, {
        message: "Price should be larger than 0.",
      }),
    dormType: z.string().min(1, {
      message: "Please choose a valid dorm type",
    }),
    street: z.coerce.string().min(5, {
      message: "Please enter a valid street name.",
    }),
    streetNumber: z.coerce.string().min(1, {
      message: "Please enter a valid street number.",
    }),
    postalCode: z.coerce
      .number()
      .int()
      .min(0, {
        message: "Please enter a valid German postal code.",
      })
      .max(99999, {
        message: "Please enter a valid German postal code.",
      }),
    city: z.coerce.string().min(2, {
      message: "Please enter a valid city name.",
    }),
    country: z.coerce.string().min(2, {
      message: "Please enter a valid country.",
    }),
    availableFrom: z.coerce.date().min(new Date(), {
      message: "The starting date should not be in the past.",
    }),
    availableTo: z.coerce.date().min(new Date(), {
      message: "The ending date should not be in the past.",
    }),
    listingAttributes: z.array(z.string()),
    description: z.coerce
      .string()
      .min(1, {
        message: "Write a short description.",
      })
      .max(8000, {
        message: "The description is too long.",
      }),
    createdBy: z.coerce.string(),
    attachments: z.array(z.instanceof(File)),
  })
  .refine((data) => data.postalCode.toString().length == 5, {
    message: "Postal codes need to contain exactly five digits.",
    path: ["postalCode"],
  });

/**
 * A page where a renter can create a listing by entering related information as well as upload pictures and documents.
 */
const ListingCreationPage = () => {
  const { mutateAsync: createListing, isPending } = useCreateListing();
  const { user } = useAuth();
  const [pics, setPics] = useState<(File & { preview: string })[]>([]);
  const [docs, setDocs] = useState<(File & { preview: string })[]>([]);

  const informationForm = useForm<z.infer<typeof InformationFormSchema>>({
    resolver: zodResolver(InformationFormSchema),
    defaultValues: {
      title: "",
      size: undefined,
      price: undefined,
      dormType: "",
      street: "",
      streetNumber: "",
      postalCode: undefined,
      city: "Munich",
      country: "Germany",
      availableFrom: undefined,
      availableTo: undefined,
      listingAttributes: [],
      description: "",
      createdBy: user?.id,
      attachments: [],
    },
  });

  function onSubmit(data: z.infer<typeof InformationFormSchema>) {
    data.attachments = [...pics, ...docs];
    void createListing(data);
  }

  if (!user) {
    return <div>Unauthorized</div>;
  }

  if (isPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-[90vh] flex flex-col">
      <div className="flex flex-row justify-between py-2">
        <h1 className="text-5xl font-bold">Create Listing</h1>
        <Button form="informationForm" type="submit" className="py-6 mt-2">
          Create!
        </Button>
      </div>
      <div className="py-4">
        <Card className="py-6">
          <CardContent>
            <Form {...informationForm}>
              <form
                onSubmit={informationForm.handleSubmit(onSubmit)}
                id="informationForm"
                className="grid grid-cols-[1fr,2fr] gap-4 gap-x-8"
              >
                <div className="space-y-4">
                  <div className="w-full space-y-4">
                    <h3 className="text-2xl font-semibold">Pictures</h3>
                    <Dropzone
                      files={pics}
                      setFiles={setPics}
                      fileType="image"
                      className="py-2 border border-neutral-200 rounded-xl w-full"
                    />
                  </div>
                  <div className="w-full space-y-4">
                    <h3 className="text-2xl font-semibold">Documents</h3>
                    <Dropzone
                      files={docs}
                      setFiles={setDocs}
                      fileType="document"
                      className="py-2 border border-neutral-200 rounded-xl w-full"
                    />
                  </div>
                </div>

                <div className="space-y-4 grid grid-cols-4 gap-x-4">
                  <h3 className="text-2xl font-semibold">Details</h3>
                  <FormField
                    control={informationForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="col-span-4">
                        <FormControl>
                          <Input placeholder="Title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Size (square meters)"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Price (€)"
                            {...field}
                          ></Input>
                        </FormControl>
                        {informationForm.getValues("price") > 0 && (
                          <FormMessage className="text-amber-600 text-xs">
                            You will be receiving{" "}
                            {Math.floor((informationForm.getValues("price") * 0.95)* 100) / 100}€
                          </FormMessage>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="dormType"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? dormTypes.find(
                                      (dormType) =>
                                        dormType.value === field.value
                                    )?.label
                                  : "Accommodation type"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput
                                placeholder="Search for a dorm type..."
                                className="h-10"
                              />
                              <CommandList>
                                <CommandEmpty>No such dorm type.</CommandEmpty>
                                <CommandGroup>
                                  {dormTypes.map((type) => (
                                    <CommandItem
                                      value={type.label}
                                      key={type.value}
                                      onSelect={() => {
                                        informationForm.setValue(
                                          "dormType",
                                          type.value
                                        );
                                      }}
                                    >
                                      {type.label}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>{" "}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem className="col-span-4">
                        <FormControl>
                          <Input placeholder="Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="streetNumber"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormControl>
                          <Input placeholder="Number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Postal code"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="availableFrom"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "LLL dd, y")
                                ) : (
                                  <span>Available from</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(e) => {
                                informationForm.setValue(
                                  "availableFrom",
                                  field.value
                                );
                                field.onChange(e);
                              }}
                              disabled={(date) =>
                                date < new Date() ||
                                date > informationForm.getValues("availableTo")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="availableTo"
                    render={({ field }) => (
                      <FormItem className="col-span-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "LLL dd, y")
                                ) : (
                                  <span>Available until</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(e) => {
                                informationForm.setValue(
                                  "availableTo",
                                  field.value
                                );
                                field.onChange(e);
                              }}
                              disabled={(date) =>
                                date <
                                  informationForm.getValues("availableFrom") ||
                                date < new Date()
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="listingAttributes"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  field.value?.length == 0 &&
                                    "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? field.value.length !== 0
                                    ? `${field.value?.length} properties selected`
                                    : "Click to select further properties of your room"
                                  : "Click to select further properties of your room"}
                                <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-1">
                            {listingProperties.map((property) => (
                              <FormField
                                key={property.id}
                                control={informationForm.control}
                                name="listingAttributes"
                                render={({ field }) => {
                                  return (
                                    <FormItem key={property.id} className="">
                                      <div className="flex items-center p-1">
                                        <FormControl>
                                          <Checkbox
                                            className="h-5 w-5"
                                            checked={field.value?.includes(
                                              property.label
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    property.label,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== property.label
                                                    )
                                                  );
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal pl-1.5">
                                          {property.label}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  );
                                }}
                              />
                            ))}
                          </PopoverContent>
                        </Popover>{" "}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={informationForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-4">
                        <FormControl>
                          <Textarea
                            placeholder="Write something to introduce your place"
                            className="min-h-52"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ListingCreationPage;
