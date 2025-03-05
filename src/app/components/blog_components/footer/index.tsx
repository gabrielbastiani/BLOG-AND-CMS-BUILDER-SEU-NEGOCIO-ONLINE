"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContextBlog } from "@/contexts/AuthContextBlog";
import { setupAPIClient } from "@/services/api";
import Link from "next/link";
import Image from "next/image";
import noImage from '../../../../assets/no-image-icon-6.png';

interface MediasProps {
    id: string;
    name_media: string;
    link: string;
    logo_media: string;
}

export function Footer() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const { configs } = useContext(AuthContextBlog);
    const [dataMedias, setDataMedias] = useState<MediasProps[]>([]);

    useEffect(() => {
        async function fetchData() {
            try {
                const apiClient = setupAPIClient();
                const { data } = await apiClient.get("/get/media_social");
                setDataMedias(data || []);
            } catch (error) {
                console.log(error);
            }
        }

        fetchData();
    }, []);

    return (
        <footer className="bg-gray-800 text-white py-6 mt-14 z-50">
            <div className="container mx-auto text-center">
                <div className="flex justify-center space-x-6 mb-5">
                    {dataMedias.map((media) => (
                        <div key={media.id}>
                            {media.logo_media ? (
                                <Link
                                    href={media.link ? media.link : ""}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-gray-300 hover:text-white"
                                >
                                    <Image
                                        src={media.logo_media ? `${API_URL}files/${media.logo_media}` : noImage}
                                        alt={media.name_media ? media.name_media : ""}
                                        width={50}
                                        height={50}
                                        className="w-6 h-6"
                                    />
                                </Link>
                            ) :
                                <Link
                                    href={media.link ? media.link : ""}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 text-white hover:text-gray-300"
                                >
                                    {media.name_media}
                                </Link>
                            }
                        </div>
                    ))}
                </div>
                <p className="mb-4">
                    &copy; {new Date().getFullYear()}{" "}
                    {configs?.name_blog ? configs?.name_blog : "Blog"}. Todos os direitos
                    reservados.
                </p>
            </div>
        </footer>
    );
}