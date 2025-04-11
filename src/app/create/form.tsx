"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
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
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createSession } from "@/lib/actions/session";
import { createUser, joinSession, getCurrentUser } from "@/lib/actions/user";
import { getCachedApproxLocation } from "@/lib/position";
import { cn } from "@/lib/utils";
import { Restaurant } from "@/types/restaurants";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { addHours } from "date-fns/addHours";
import { ArrowRight, CalendarIcon, ClockIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { nanoid } from "nanoid";

interface SessionCreateFormProps {
  restaurants: Restaurant[];
}

const FormSchema = z.object({
  cutoffTime: z.date({
    required_error: "A date and time is required.",
  }),
  "creator-name": z.string().min(1, {
    message: "Name is required.",
  }),
  "restaurant-id": z.string().min(1, {
    message: "Restaurant is required.",
  }),
  "use-precise-location": z.boolean(),
});

export default function SessionCreateForm({
  restaurants,
}: SessionCreateFormProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [hasExistingUser, setHasExistingUser] = useState(false);
  const [existingUserName, setExistingUserName] = useState("");

  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      cutoffTime: addHours(new Date(), 1),
      "creator-name": "",
      "restaurant-id": restaurants[0]?.id.toString() || "",
      "use-precise-location": false,
    },
  });

  useEffect(() => {
    const getLocation = async () => {
      const { lat, lng } = await getCachedApproxLocation();
      setLocation({ lat, lng });
    };
    getLocation();
  }, []);

  useEffect(() => {
    const checkExistingUser = async () => {
      const user = await getCurrentUser();
      if (user) {
        setHasExistingUser(true);
        setExistingUserName(user.name);
        form.setValue("creator-name", user.name);
      }
    };
    checkExistingUser();
  }, [form]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const formData = new FormData();
    const user = await getCurrentUser();
    const userId = user?.id || nanoid();

    formData.append("creator-name", data["creator-name"]);
    formData.append("restaurant-id", data["restaurant-id"]);
    formData.append("cut-off-time", data.cutoffTime.toISOString());
    formData.append(
      "restaurant-name",
      restaurants.find(
        (restaurant) => restaurant.id.toString() === data["restaurant-id"]
      )?.name || ""
    );
    formData.append("lat", location?.lat?.toString() || "");
    formData.append("lng", location?.lng?.toString() || "");
    formData.append("user-id", userId);

    const session = await createSession(formData);

    // Create user if they don't exist
    if (!user) {
      await createUser({
        id: userId,
        name: data["creator-name"],
      });
    }

    // Join the session
    await joinSession(userId, session.id);
    router.replace(`/${session.id}`);
  };

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      // When changing just the date, preserve the existing time
      const currentDate = form.getValues("cutoffTime");
      date.setHours(currentDate.getHours());
      date.setMinutes(currentDate.getMinutes());
      form.setValue("cutoffTime", date);
    }
  }

  function handleTimeChange(type: "hour" | "minute" | "ampm", value: string) {
    const currentDate = form.getValues("cutoffTime");
    const newDate = new Date(currentDate);

    if (type === "hour") {
      const hour = parseInt(value, 10);
      newDate.setHours(newDate.getHours() >= 12 ? hour + 12 : hour);
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value, 10));
    } else if (type === "ampm") {
      const hours = newDate.getHours();
      if (value === "AM" && hours >= 12) {
        newDate.setHours(hours - 12);
      } else if (value === "PM" && hours < 12) {
        newDate.setHours(hours + 12);
      }
    }

    form.setValue("cutoffTime", newDate);
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setLocationStatus("loading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationStatus("success");
        toast.success("Location permission granted.");
        form.setValue("use-precise-location", true);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              "Location permission was denied. Please enable location services."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("The request to get location timed out.");
            break;
          default:
            toast.error("An unknown error occurred.");
            break;
        }
        setLocationStatus("error");
        form.setValue("use-precise-location", false);
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {!hasExistingUser && (
          <FormField
            control={form.control}
            name="creator-name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {hasExistingUser && (
          <FormItem>
            <FormLabel>Your Name</FormLabel>
            <FormControl>
              <Input value={existingUserName} disabled />
            </FormControl>
            <FormDescription>
              {`You'll join this session as ${existingUserName}`}
            </FormDescription>
          </FormItem>
        )}

        <FormField
          control={form.control}
          name="restaurant-id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Restaurant</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a restaurant" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {restaurants.map((restaurant) => (
                    <SelectItem
                      key={restaurant.id}
                      value={restaurant.id.toString()}
                    >
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cutoffTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Cut-off Time</FormLabel>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal flex-1",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MMM d, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                      disabled={(date) =>
                        date < new Date() || date > addHours(new Date(), 24)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal flex-1",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "hh:mm a")
                        ) : (
                          <span>Pick a time</span>
                        )}
                        <ClockIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 flex flex-col sm:flex-row"
                    align="start"
                  >
                    <div className="border-r">
                      <ScrollArea className="h-48 sm:h-72">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  field.value &&
                                  (field.value.getHours() % 12 || 12) === hour
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("hour", hour.toString())
                                }
                              >
                                {hour.toString().padStart(2, "0")}
                              </Button>
                            )
                          )}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                    </div>
                    <div className="border-r">
                      <ScrollArea className="h-48 sm:h-72">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 60 }, (_, i) => i).map(
                            (minute) => (
                              <Button
                                key={minute}
                                size="icon"
                                variant={
                                  field.value &&
                                  field.value.getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("minute", minute.toString())
                                }
                              >
                                {minute.toString().padStart(2, "0")}
                              </Button>
                            )
                          )}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                    </div>
                    <ScrollArea className="">
                      <div className="flex sm:flex-col p-2">
                        {["AM", "PM"].map((ampm) => (
                          <Button
                            key={ampm}
                            size="icon"
                            variant={
                              field.value &&
                              ((ampm === "AM" && field.value.getHours() < 12) ||
                                (ampm === "PM" && field.value.getHours() >= 12))
                                ? "default"
                                : "ghost"
                            }
                            className="sm:w-full shrink-0 aspect-square"
                            onClick={() => handleTimeChange("ampm", ampm)}
                          >
                            {ampm}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>
              <FormDescription>
                The time by which all orders must be placed.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="use-precise-location"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Use Precise Location</FormLabel>
                <FormDescription>
                  Allow access to your precise location for more accurate
                  results.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    if (checked && locationStatus === "idle") {
                      requestLocation();
                    }
                  }}
                  disabled={locationStatus === "loading"}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {locationStatus === "loading" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Getting location...
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
