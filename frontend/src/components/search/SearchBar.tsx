import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import useSearchForm from "@/hooks/useSearchForm";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  CaretSortIcon,
  CheckIcon,
  ResetIcon,
} from "@radix-ui/react-icons";
import { format } from "date-fns";
import { SearchIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Calendar } from "../ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import AdvancedFiltersDialog from "./AdvancedFiltersDialog";

type Props = {
  searchParams?: URLSearchParams;
};
/**
 * SearchBar component displays the search bar at the top of the application.
 * It includes the search fields for postal code, city, time period, price limit, and size.
 * Here, the user can search for properties based on the search criteria.
 * @component
 * @param {URLSearchParams} [searchParams] - The search parameters.
 * @returns {JSX.Element} The JSX element representing the search bar.
 */
const SearchBar = ({ searchParams }: Props) => {
  const { form, date, setDate, onSubmit, handleReset } =
    useSearchForm(searchParams);

  const { pathname } = useLocation();
  const isHomePage = pathname === "/";

  useEffect(() => {
    form.setValue("availableFrom", date?.from);
    form.setValue("availableTo", date?.to);
  }, [date, form]);

  return (
    <div className="w-full flex flex-col md:items-center">
      <div className="flex flex-col space-y-2">
        <Card className="py-10 w-fit mb-2 shadow-md">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-x-4 h-8 flex flex-row"
              >
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel className="pl-2.5">Postal Code</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Postal code"
                          className="border-none rounded-s rounded-e"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="grid gap-2 w-44">
                      <FormLabel htmlFor="city" className="pl-4">
                        City
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="ghost"
                              role="combobox"
                              className={cn(
                                "w-fit justify-between",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value
                                ? cities.find(
                                    (city) => city.value === field.value
                                  )?.label
                                : "Select a city"}
                              <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search for locations..."
                              className="h-10"
                            />
                            <CommandList>
                              <CommandEmpty>City not found.</CommandEmpty>
                              <CommandGroup>
                                <CommandItem
                                  value={""}
                                  key={"all"}
                                  onSelect={() => {
                                    form.setValue("city", "");
                                  }}
                                >
                                  {"All cities"}
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto h-4 w-4",
                                      field.value === ""
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                                {cities.map((city) => (
                                  <CommandItem
                                    value={city.label}
                                    key={city.value}
                                    onSelect={() => {
                                      form.setValue("city", city.value);
                                    }}
                                  >
                                    {city.label}
                                    <CheckIcon
                                      className={cn(
                                        "ml-auto h-4 w-4",
                                        city.value === field.value
                                          ? "opacity-100"
                                          : "opacity-0"
                                      )}
                                    />
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Separator orientation="vertical" className="h-16" />
                <div className="grid gap-2">
                  <FormLabel htmlFor="date" className="pl-4">
                    Time period
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"ghost"}
                        className={cn(
                          "w-[250px] justify-between text-left font-normal mt-2",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Check in - Check out</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <FormField
                  control={form.control}
                  name="maxPrice"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel className="pl-2.5">Price limit (€)</FormLabel>
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
                <Separator orientation="vertical" className="h-16" />
                <FormField
                  control={form.control}
                  name="minSize"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel className="pl-2.5">
                        Size (m<sup>2</sup>)
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
                <Separator orientation="vertical" className="h-16" />
                {isHomePage && (
                  <Button
                    type="submit"
                    className="py-6 mt-2 hover:scale-105 transition-all duration-300"
                  >
                    Browse Listings
                  </Button>
                )}
                {!isHomePage && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          type="button"
                          size="sm"
                          className="py-6 mt-2"
                          onClick={() => handleReset()}
                        >
                          <ResetIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reset filters</TooltipContent>
                    </Tooltip>
                    <AdvancedFiltersDialog
                      searchParams={searchParams}
                      form={form}
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="submit"
                          className="py-6 mt-2 transition-all duration-300 hover:scale-105"
                        >
                          <SearchIcon className="h-5 w-5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Search</TooltipContent>
                    </Tooltip>
                  </>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
        {isHomePage && (
          <p className="text-lg">
            Looking to sublet?{" "}
            <Link
              to="/sublet/overview"
              className="font-medium text-indigo-500 hover:text-indigo-400 transition-colors duration-300"
            >
              Become a subletter
            </Link>
            !
          </p>
        )}
      </div>
    </div>
  );
};

const cities = [
  { label: "Berlin", value: "berlin" },
  { label: "Munich", value: "munich" },
  { label: "Hamburg", value: "hamburg" },
  { label: "Frankfurt", value: "frankfurt" },
  { label: "Cologne", value: "cologne" },
  { label: "Stuttgart", value: "stuttgart" },
  { label: "Dusseldorf", value: "dusseldorf" },
  { label: "Dresden", value: "dresden" },
  { label: "Leipzig", value: "leipzig" },
] as const;

export default SearchBar;
