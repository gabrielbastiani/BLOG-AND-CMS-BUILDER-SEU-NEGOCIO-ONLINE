"use client"

import { setupAPIClient } from "@/services/api";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CategoriesProps {
    id: string;
    name_category: string;
    slug_name_category: string;
    image_category: string;
}

export default function Categories_grid() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [categories, setCategories] = useState<CategoriesProps[]>([]);

    useEffect(() => {
        const apiClient = setupAPIClient();
        async function lastposts() {
            try {
                const categories = await apiClient.get(`/categories/blog/posts`);
                setCategories(categories.data);
            } catch (error) {
                console.log(error);
            }
        }
        lastposts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="relative rounded overflow-hidden h-40 shadow hover:shadow-lg transition"
                    >
                        <Link href={`/posts_categories/${category.slug_name_category}`}>
                            {category.image_category ? (
                                <Image
                                    src={`${API_URL}files/${category.image_category}`}
                                    alt={category.name_category}
                                    width={80}
                                    height={80}
                                    className="absolute top-0 left-0 w-full h-full object-cover opacity-70"
                                />
                            ) : (
                                <div className="bg-black"></div>
                            )}

                            <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                                <h3 className="text-white text-lg font-bold">{category.name_category}</h3>
                            </div>
                        </Link>
                    </div>

                ))}
            </div>
        </div>
    )
}