import { getTours } from "@/lib/supabase/tours";
import { ToursClient } from "./tours-client";

export default async function AllToursPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams?.q === "string" ? resolvedSearchParams.q : "";
  const destination =
    typeof resolvedSearchParams?.destination === "string" ? resolvedSearchParams.destination : "";
  const type = typeof resolvedSearchParams?.type === "string" ? resolvedSearchParams.type : "";

  const tours = await getTours({ q, destination, type });

  const uniqueDestinations = Array.from(
    new Set(tours.map((t) => t.destination).filter(Boolean)),
  );
  const uniqueTypes = Array.from(
    new Set(
      tours
        .map((t) => t.tourType || (Array.isArray(t.type) ? t.type.join(", ") : ""))
        .filter((v) => v && v.length > 0),
    ),
  );

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold font-headline mb-8 text-center">
        Explore All Tours
      </h1>

      <form
        method="get"
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        aria-label="Filter tours"
      >
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Search by name..."
          className="border rounded-md px-3 py-2"
        />
        <select
          name="destination"
          defaultValue={destination}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Destinations</option>
          {uniqueDestinations.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select name="type" defaultValue={type} className="border rounded-md px-3 py-2">
          <option value="">All Types</option>
          {uniqueTypes.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button type="submit" className="border rounded-md px-3 py-2">
          Apply Filters
        </button>
      </form>

      <div className="mb-4 text-sm text-muted-foreground">
        Showing {tours.length} tour{tours.length === 1 ? "" : "s"}
        {q || destination || type ? " matching your filters" : ""}
      </div>

      {tours.length > 0 ? (
        <ToursClient tours={tours} />
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">No Tours Found</h2>
          <p className="text-muted-foreground">
            Try adjusting your filters or clearing the search.
          </p>
        </div>
      )}
    </div>
  );
}
