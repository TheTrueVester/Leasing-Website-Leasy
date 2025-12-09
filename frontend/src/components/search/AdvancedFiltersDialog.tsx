import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import useSearchForm from "@/hooks/useSearchForm";
import { cn } from "@/lib/utils.ts";
import {
  dormTypes,
  listingProperties,
  ListingSearchForm,
} from "@/model/listing.ts";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { FilterIcon } from "lucide-react";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { attributeIcon, attributeToBadge } from "@/utils/listingAttribute";

type Props = {
  searchParams?: URLSearchParams;
  form: UseFormReturn<
    ListingSearchForm,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    undefined
  >;
};

/**
 * AdvancedFiltersDialog is a component that displays advanced filters for the search form.
 * It includes filters for listing attributes, dorm type, size, and price.
 * @component
 * @param {URLSearchParams} searchParams - The search parameters from the URL.
 * @param {UseFormReturn<ListingSearchForm, any, undefined>} form - The form state containing the search parameters.
 * @returns {JSX.Element} The JSX element representing the advanced filters dialog.
 */
const AdvancedFiltersDialog = ({ searchParams, form }: Props) => {
  const { onSubmit } = useSearchForm(searchParams);
  const [isOpen, setIsOpen] = useState(false);

  const submit = () => {
    setIsOpen(false);
    form.handleSubmit(onSubmit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button variant="secondary" type="button" className="py-6 mt-2">
              <FilterIcon className="h-5 w-5 mr-2" />
              Filters
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          Apply even more filters to further refine your search
        </TooltipContent>
      </Tooltip>

      <DialogContent className="min-w-max ">
        <DialogHeader>
          <DialogTitle className="text-3xl">Filters</DialogTitle>
          <DialogDescription className="text-base">
            Refine your search by selecting the filters below.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              submit();
              e.preventDefault();
              setIsOpen(false);
            }}
            className="flex flex-col space-y-6"
          >
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label>Listing Attributes</Label>
                <div className="grid grid-cols-2 gap-2">
                  {listingProperties.map((property) => (
                    <FormField
                      key={property.id}
                      control={form.control}
                      name="listingAttributes"
                      render={({ field }) => {
                        return (
                          <FormItem key={property.id} className="">
                            <div className="flex items-center p-1 rounded-sm hover:shadow-sm hover:scale-[101%] shadow-indigo-300 transition-all duration-300">
                              <FormControl>
                                <Checkbox
                                  className="h-5 w-5"
                                  checked={field.value?.includes(property.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          property.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value: string) =>
                                              value !== property.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal pl-1.5 flex gap-x-2 items-center">
                                {attributeIcon(property.label, "h-5 w-5")}
                                {property.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="dormType"
                  render={({ field }) => (
                    <FormItem>
                      <Popover>
                        <Label>Accommodation type</Label>
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
                                    (dormType) => dormType.value === field.value
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
                                      form.setValue("dormType", type.value);
                                      form.getValues();
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
                {/* Size */}
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="minSize"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="pl-2.5">
                          Minimum Size (m<sup>2</sup>)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lower limit"
                            className="border-none rounded-s rounded-e"
                            type="number"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxSize"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="pl-2.5">
                          Maximum Size (m<sup>2</sup>)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Upper limit"
                            className="border-none rounded-s rounded-e"
                            type="number"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* Price */}
                <div className="flex space-x-2">
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="pl-2.5">
                          Price floor (€)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Lower limit"
                            className="border-none rounded-s rounded-e"
                            type="number"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel className="pl-2.5">
                          Price limit (€)
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Upper limit"
                            className="border-none rounded-s rounded-e"
                            type="number"
                            min={0}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
            <Button type="submit" className="py-6 mt-2">
              Apply Filters
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedFiltersDialog;
