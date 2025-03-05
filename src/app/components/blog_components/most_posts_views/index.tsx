"use client";

import { setupAPIClient } from "@/services/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { FaRegEye } from "react-icons/fa";
import { PostsProps } from "../../../../../Types/types";

export default function Most_posts_views() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const [most_view, setMost_view] = useState<PostsProps[]>([]);

    useEffect(() => {
        const apiClient = setupAPIClient();
        async function fetchPosts() {
            try {
                const { data } = await apiClient.get(`/post/articles/blog`);
                setMost_view(data.most_views_post);
            } catch (error) {
                console.log(error);
            }
        }
        fetchPosts();
    }, []);

    const formatViews = (views: number): string => {
        if (views >= 1_000_000) {
            return (views / 1_000_000).toFixed(1).replace(".0", "") + " Mi";
        }
        if (views >= 1_000) {
            return (views / 1_000).toFixed(1).replace(".0", "") + " Mil";
        }
        return views.toString();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4 text-black">Posts Mais Visualizados</h2>
            <Swiper
                spaceBetween={16}
                slidesPerView={1}
                navigation
                breakpoints={{
                    640: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 4 },
                }}
                modules={[Navigation]}
                className="swiper-container"
            >
                {most_view.map((post) => (
                    <SwiperSlide key={post.id}>
                        <div className="bg-white rounded shadow p-4 hover:shadow-lg transition">
                        <Link href={`/article/${post.custom_url ? post.custom_url : post.slug_title_post}`}>
                            <Image
                                src={`${API_URL}files/${post.image_post}`}
                                alt={post.title}
                                width={280}
                                height={80}
                                quality={100}
                                className="w-full h-40 object-cover rounded mb-2"
                            />
                            <h3 className="text-lg font-semibold text-black">{post.title}</h3>
                            <span className="mt-4 flex text-black"><FaRegEye className="text-lg mr-3" /> {formatViews(post?.views || 0)}</span>
                        </Link>
                    </div>
                    </SwiperSlide>
                ))}
        </Swiper>
        </div >
    );
}