

"use client"

import { TourForm } from "@/components/admin/tour-form";
import { useRouter } from "next/navigation";

export default function NewTourPage() {
    const router = useRouter();

    const handleSubmit = (values: any) => {
        // In a real app, you would send this data to your backend/database.
        console.log("New Tour Data:", values);
        alert("New tour created! Check the console for the data. Note: image upload is frontend only for now.");
        router.push("/admin/tours");
    }

    return (
       <TourForm 
            onSubmit={handleSubmit}
            formType="new"
       />
    );
}
