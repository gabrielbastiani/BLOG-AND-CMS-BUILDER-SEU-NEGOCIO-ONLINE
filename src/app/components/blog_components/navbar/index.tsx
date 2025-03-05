"use client"

import Link from "next/link";
import Image from "next/image";
import { FiLogIn, FiMenu, FiSearch, FiUpload, FiUser, FiX } from "react-icons/fi";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { AuthContextBlog } from "@/contexts/AuthContextBlog";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../../input";
import { setupAPIClientBlog } from "@/services/api_blog";
import noImage from '../../../../assets/no-image-icon-6.png';
import { ModalLogin } from "../popups/modalLogin";
import { ModalEditUser } from "../popups/modalEditUser";

const schema = z.object({
    name: z.string().optional(),
    email: z.string().email("Insira um email válido").optional(),
    password: z.string().optional(),
});

type FormData = z.infer<typeof schema>

type Post = {
    id: string
    title: string;
    slug_title_post: string;
    image_post: string | null;
    custom_url?: string;
};

export function Navbar() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
        throw new Error("A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida.");
    }

    const { isAuthenticated, loadingAuth, user, configs } = useContext(AuthContextBlog);


    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Post[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [showSearch, setShowSearch] = useState(false);

    const [modalLogin, setModalLogin] = useState(false);
    const [modalEditUser, setModalEditUser] = useState(false);

    const handleSearch = async (e: ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);

        if (term.length >= 2) {
            setIsSearching(true);
            try {
                const apiClientBlog = setupAPIClientBlog();
                const response = await apiClientBlog.get(`/post/blog/search_nav_bar`, {
                    params: { search: term },
                });
                setSearchResults(response.data || []);
            } catch (error) {
                console.error("Erro ao buscar posts:", error);
                toast.error("Erro ao buscar posts.");
            } finally {
                setIsSearching(false);
            }
        } else {
            setSearchResults([]);
        }
    };

    
    return (
        <header className="bg-black shadow-md sticky top-0 z-50">
            <nav className="container mx-auto flex justify-between items-center py-2 px-2 md:px-8">
                {/* Logo */}
                <Link href="/">
                    <Image
                        src={configs?.logo ? `${API_URL}files/${configs?.logo}` : noImage}
                        width={120}
                        height={120}
                        alt="logo"
                        className="w-20 h-20 md:w-28 md:h-28 object-contain mr-14"
                    />
                </Link>

                {/* Campo de Busca */}
                <div className="relative flex items-center justify-center">
                    {showSearch ? (
                        <div id="search-container" className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder="Buscar artigos..."
                                className="w-60 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-orange-500 text-black"
                            />
                            <button
                                onClick={() => setShowSearch(false)}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-black"
                            >
                                <FiX size={20} />
                            </button>
                            {isSearching && (
                                <div className="absolute top-full left-0 w-full bg-white text-black p-2">Buscando...</div>
                            )}
                            {searchResults.length > 0 && (
                                <ul className="absolute top-full left-0 w-full bg-white shadow-lg z-10">
                                    {searchResults.map((post) => (
                                        <li key={post.id} className="flex items-center gap-2 p-2 border-b hover:bg-gray-100">
                                            <Image
                                                src={post.image_post ? `${API_URL}files/${post.image_post}` : noImage}
                                                alt={post.title}
                                                width={50}
                                                height={50}
                                                className="w-12 h-12 object-cover"
                                            />
                                            <Link
                                                href={`/article/${post.custom_url || post.title}`}
                                                className="text-sm font-medium text-black"
                                            >
                                                {post.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => setShowSearch(true)}
                            className="text-white hover:text-orange-500"
                        >
                            <FiSearch size={24} />
                        </button>
                    )}
                </div>

                {/* Menu para dispositivos móveis */}
                <div className="md:hidden flex items-center">
                    <button
                        onClick={toggleMobileMenu}
                        className="text-var(--foreground) focus:outline-none"
                    >
                        <FiMenu size={28} />
                    </button>
                </div>

                {/* Lista de links */}
                <ul
                    className={`absolute top-full left-0 w-full bg-black shadow-md p-4 flex flex-col gap-4 items-center md:static md:flex md:flex-row md:gap-6 md:shadow-none md:bg-transparent ${isMobileMenuOpen ? "block" : "hidden"
                        }`}
                >
                    <li>
                        <Link href="/posts_blog" className="hover:text-hoverButtonBackground">
                            Artigos
                        </Link>
                    </li>
                    <li>
                        <Link href="/posts_categories" className="hover:text-hoverButtonBackground">
                            Categorias
                        </Link>
                    </li>
                    <li>
                        <Link href="/contact" className="hover:text-hoverButtonBackground">
                            Contato
                        </Link>
                    </li>
                    <li>
                        <Link href="/about" className="hover:text-hoverButtonBackground">
                            Sobre
                        </Link>
                    </li>
                </ul>

                {!loadingAuth && isAuthenticated ? (
                    <button onClick={() => setModalEditUser(true)}>
                        <div className="border-2 rounded-full p-1 border-var(--foreground) overflow-hidden w-[50px] h-[50px] flex items-center justify-center">
                            {user?.image_user ? (
                                <Image
                                    src={`${API_URL}files/${user.image_user}`}
                                    alt="user"
                                    width={50}
                                    height={50}
                                    className="object-cover w-full h-full rounded-full"
                                />
                            ) : (
                                <FiUser cursor="pointer" size={24} color="var(--foreground)" />
                            )}
                        </div>
                    </button>
                ) : (
                    <button onClick={() => setModalLogin(true)}>
                        <div className="border-2 rounded-full p-1 border-var(--foreground)">
                            <FiLogIn size={22} color="var(--foreground)" />
                        </div>
                    </button>
                )}
            </nav>
            
            <div>
                {modalLogin && <ModalLogin onClose={() => setModalLogin(false)} />}
                                {modalEditUser && <ModalEditUser onClose={() => setModalEditUser(false)} />}
            </div>
        </header>
    )
}