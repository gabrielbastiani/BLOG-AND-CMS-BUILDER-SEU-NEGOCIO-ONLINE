"use client"

import Image from "next/image";
import noImage from '../../../../assets/no-image-icon-6.png';
import { useEffect, useState } from "react";
import Link from "next/link";
import { setupAPIClient } from "@/services/api";
import { PostsProps } from "../../../../../Types/types";

export default function Last_post() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [last_posts, setLast_posts] = useState<PostsProps[]>([]);

    useEffect(() => {
        const apiClient = setupAPIClient();
        async function lastposts() {
            try {
                const { data } = await apiClient.get(`/post/articles/blog`);
                setLast_posts(data.last_post);
            } catch (error) {
                console.log(error);
            }
        }
        lastposts();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Últimos Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {last_posts.slice(0, 6).map((post) => (
                    <div
                        key={post.id}
                        className="bg-white rounded shadow p-4 hover:shadow-lg transition"
                    >
                        <Link href={`/article/${post.custom_url ? post.custom_url : post.slug_title_post}`}>
                            <Image
                                src={post.image_post ? `${API_URL}files/${post.image_post}` : noImage}
                                alt={post.title}
                                width={280}
                                height={80}
                                quality={100}
                                className="w-full h-40 object-cover rounded mb-2"
                            />
                            <h3 className="text-lg font-semibold text-black">{post.title}</h3>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}