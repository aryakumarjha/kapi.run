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
import { getCachedApproxLocation } from "@/lib/position";
import { cn } from "@/lib/utils";
import { Restaurant } from "@/types/restaurants";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { addHours } from "date-fns/addHours";
import { ArrowRight, CalendarIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    const formData = new FormData();
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

    const session = await createSession(formData);
    router.replace(`/${session.id}`);
  };

  function handleDateSelect(date: Date | undefined) {
    if (date) {
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
            toast.error(
              "Location information is unavailable. Please try again."
            );
            break;
          case error.TIMEOUT:
            toast.error(
              "The request to get location timed out. Please try again."
            );
            break;
          default:
            toast.error("An unknown error occurred. Please try again later.");
            break;
        }
        form.setValue("use-precise-location", false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  return (
    <Form {...form}>
      <form className="space-y-4 w-full" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="creator-name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter your name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="restaurant-id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select a restaurant</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} {...field}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Please select an item" />
                  </SelectTrigger>
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cutoffTime"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Select Cutoff Time</FormLabel>
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
                        format(field.value, "MM/dd/yyyy hh:mm aa")
                      ) : (
                        <span>MM/DD/YYYY hh:mm aa</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <div className="sm:flex">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={handleDateSelect}
                    />
                    <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i + 1)
                            .reverse()
                            .map((hour) => (
                              <Button
                                key={hour}
                                size="icon"
                                variant={
                                  field.value &&
                                  field.value.getHours() % 12 === hour % 12
                                    ? "default"
                                    : "ghost"
                                }
                                className="sm:w-full shrink-0 aspect-square"
                                onClick={() =>
                                  handleTimeChange("hour", hour.toString())
                                }
                              >
                                {hour}
                              </Button>
                            ))}
                        </div>
                        <ScrollBar
                          orientation="horizontal"
                          className="sm:hidden"
                        />
                      </ScrollArea>
                      <ScrollArea className="w-64 sm:w-auto">
                        <div className="flex sm:flex-col p-2">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map(
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
                      <ScrollArea className="">
                        <div className="flex sm:flex-col p-2">
                          {["AM", "PM"].map((ampm) => (
                            <Button
                              key={ampm}
                              size="icon"
                              variant={
                                field.value &&
                                ((ampm === "AM" &&
                                  field.value.getHours() < 12) ||
                                  (ampm === "PM" &&
                                    field.value.getHours() >= 12))
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
                    </div>
                  </div>
                </PopoverContent>
                <FormMessage />
              </Popover>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="use-precise-location"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-1">
                <FormLabel>Use precise location (Optional)</FormLabel>
                <FormDescription className="text-xs">
                  Sharing your location helps us show the correct menu items and
                  pricing for your area. Some restaurants offer different menus
                  based on location.
                </FormDescription>
              </div>
              <FormControl>
                {locationStatus === "loading" ? (
                  <Loader2 className="size-12 animate-spin" />
                ) : (
                  <Switch
                    checked={field.value}
                    onCheckedChange={(val) => {
                      if (val) {
                        requestLocation();
                      } else {
                        setLocationStatus("idle");
                        form.setValue("use-precise-location", false);
                      }
                    }}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          Create <ArrowRight />
        </Button>
      </form>
    </Form>
  );
}
