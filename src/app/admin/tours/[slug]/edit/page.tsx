

"use client"

import { TourForm } from "@/components/admin/tour-form";
import { getTourById } from "@/lib/tours";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";
import type { Tour } from "@/types";

export default function EditTourPage() {
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const tour = useMemo(() => getTourById(slug), [slug]);

    const handleSubmit = (values: any) => {
        // In a real app, you would send this data to your backend/database to update the tour.
        console.log("Updated Tour Data:", values);
        alert(`Tour "${values.name}" updated! Check the console for the data.`);
        router.push("/admin/tours");
    }

    if (!tour) {
        return <div>Tour not found.</div>
    }

    return (
       <TourForm 
            initialData={tour as Tour}
            onSubmit={handleSubmit}
            formType="edit"
       />
    );
}
