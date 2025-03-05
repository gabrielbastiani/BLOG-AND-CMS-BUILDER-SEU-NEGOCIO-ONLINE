"use client";

import { FaFacebook, FaInstagram, FaWhatsapp, FaTwitter } from "react-icons/fa";
import Link from "next/link";

export default function SocialShare({ articleUrl }: { articleUrl: string }) {

    const URL_BLOG = process.env.NEXT_PUBLIC_URL_BLOG;

    const shareUrl = `${URL_BLOG}article/${articleUrl}`;

    return (
        <>
            {/* Social Share Section Below Article */}
            <div className="mt-10 mb-10">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Compartilhe este artigo:</h2>
                <div className="flex gap-4">
                    <Link
                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                    >
                        <FaFacebook />
                    </Link>
                    <Link
                        href={`https://www.instagram.com/?url=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-10 h-10 bg-pink-500 text-white rounded-full hover:bg-pink-600"
                    >
                        <FaInstagram />
                    </Link>
                    <Link
                        href={`https://api.whatsapp.com/send?text=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-10 h-10 bg-green-500 text-white rounded-full hover:bg-green-600"
                    >
                        <FaWhatsapp />
                    </Link>
                    <Link
                        href={`https://twitter.com/intent/tweet?url=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-600"
                    >
                        <FaTwitter />
                    </Link>
                </div>
            </div>

            {/* Floating Social Share Box */}
            <div className="fixed left-4 top-1/3 z-50 hidden md:block">
                <div className="flex flex-col gap-4">
                    <Link
                        href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md"
                    >
                        <FaFacebook />
                    </Link>
                    <Link
                        href={`https://www.instagram.com/?url=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-12 h-12 bg-pink-500 text-white rounded-full hover:bg-pink-600 shadow-md"
                    >
                        <FaInstagram />
                    </Link>
                    <Link
                        href={`https://api.whatsapp.com/send?text=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-full hover:bg-green-600 shadow-md"
                    >
                        <FaWhatsapp />
                    </Link>
                    <Link
                        href={`https://twitter.com/intent/tweet?url=${shareUrl}`}
                        target="_blank"
                        className="flex items-center justify-center w-12 h-12 bg-blue-500 text-white rounded-full hover:bg-blue-600 shadow-md"
                    >
                        <FaTwitter />
                    </Link>
                </div>
            </div>
        </>
    );
}