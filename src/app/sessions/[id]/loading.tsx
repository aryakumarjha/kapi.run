import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SessionLoading() {
  return (
    <main className="flex-1 container mx-auto">
      {/* Restaurant Header Skeleton */}
      <div className="border-b sticky top-0 z-10">
        <div className="container py-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>

            <Skeleton className="h-10 w-full mt-2" />
          </div>
        </div>
      </div>

      {/* Session Content Skeleton */}
      <div className="container py-4 pb-16 md:pb-4">
        <div className="md:flex md:gap-6">
          <div className="md:w-2/3">
            <Card className="">
              <CardContent className="p-4">
                {/* Search Bar Skeleton */}
                <Skeleton className="h-10 w-full mb-6" />

                {/* Category Tabs Skeleton */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-9 w-24 flex-shrink-0" />
                  ))}
                </div>

                {/* Menu Items Skeleton */}
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="overflow-hidden ">
                      <CardContent className="p-0">
                        <div className="flex items-center p-0 px-4">
                          <Skeleton className="w-24 h-24 sm:w-28 sm:h-28" />
                          <div className="flex-1 min-w-0 p-3 pr-0">
                            <div className="flex justify-between items-start">
                              <div className="truncate pr-2 w-full">
                                <Skeleton className="h-5 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-full mb-1" />
                                <Skeleton className="h-3 w-2/3" />
                              </div>
                              <div className="flex flex-col items-end">
                                <Skeleton className="h-6 w-16 mb-2" />
                                <Skeleton className="h-7 w-12" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:w-1/3 mt-4 md:mt-0 hidden md:block">
            <div className="sticky top-[5.5rem]">
              <Card className="">
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-32 mb-6" />

                  {/* Empty Cart Skeleton */}
                  <div className="text-center py-8">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-5 w-40 mx-auto mb-2" />
                    <Skeleton className="h-4 w-56 mx-auto" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
