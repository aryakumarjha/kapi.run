import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRestaurants } from "@/lib/actions/restaurants";
import { Coffee } from "lucide-react";
import SessionCreateForm from "./form";

export default async function CreatePage() {
  const restaurants = await fetchRestaurants();
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="space-y-4">
            <Coffee className="size-8" />
            <span>Create a new order session</span>
          </CardTitle>
          <CardDescription>
            Simplify group food ordering with Kapi.run.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SessionCreateForm restaurants={restaurants} />
        </CardContent>
      </Card>
    </main>
  );
}
