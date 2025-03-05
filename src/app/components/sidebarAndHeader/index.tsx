import * as Collapsible from "@radix-ui/react-collapsible";
import { ReactNode, useContext, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowBendDoubleUpLeft, CaretRight } from "phosphor-react";
import Image from "next/image";
import { AuthContext } from "@/contexts/AuthContext";
import Link from "next/link";
import { FiLogIn, FiUser, FiBell } from "react-icons/fi";
import { setupAPIClient } from "@/services/api";
import { MdCategory, MdConnectWithoutContact, MdNotifications, MdPostAdd } from "react-icons/md";
import { FaFileExport, FaRegCommentDots, FaRegNewspaper, FaTags, FaUser } from "react-icons/fa";
import moment from 'moment';
import noImage from '../../../assets/no-image-icon-6.png';

interface Content {
    children: ReactNode;
}

interface Notification {
    id: string;
    message: string;
    created_at: string;
    href?: string;
    read: boolean;
    type: string;
}

export function SidebarAndHeader({ children }: Content) {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const { isAuthenticated, loadingAuth, user, configs } = useContext(AuthContext);
    const [isSideBarOpen, setIsSideBarOpen] = useState(true);
    const [currentRoute, setCurrentRoute] = useState<string | null>(null);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    const notificationRef = useRef<HTMLDivElement>(null);
    const apiClient = setupAPIClient();
    const idUser = user?.id;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await apiClient.get(`/user/notifications?user_id=${idUser}`);
            const fetchedNotifications = response.data.slice(0, 20);
            setNotifications(fetchedNotifications);
            setHasUnreadNotifications(fetchedNotifications.some((notification: { read: any; }) => !notification.read));
        } catch (error) {
            console.error("Erro ao buscar notificações:", error);
        }
    };

    const checkForNewNotifications = async () => {
        try {
            const response = await apiClient.get(`/user/notifications?user_id=${idUser}`);
            const newNotifications = response.data.slice(0, 20);
            setNotifications(newNotifications);
        } catch (error) {
            console.error("Erro ao verificar novas notificações:", error);
        }
    };

    const NotificationIcon = ({ type }: any) => {
        switch (type) {
            case "contact_form":
                return <MdConnectWithoutContact size={30} color="white" />;
            case "user":
                return <FaUser size={30} color="white" />;
            case "post":
                return <MdPostAdd size={30} color="white" />;
            case "newsletter":
                return <FaRegNewspaper size={30} color="white" />;
            case "export_data":
                return <FaFileExport size={30} color="white" />;
            case "comment":
                return <FaRegCommentDots size={30} color="white" />;
            case "category":
                return <MdCategory size={30} color="white" />;
            case "tag":
                return <FaTags size={30} color="white" />;
            default:
                return <MdNotifications size={30} color="white" />;
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await apiClient.put(`/notifications/mark-read?notificationUser_id=${id}`);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === id ? { ...notification, read: true } : notification
                )
            );
            const hasUnread = notifications.some(notification => notification.id !== id && !notification.read);
            setHasUnreadNotifications(hasUnread);
        } catch (error) {
            console.error("Erro ao marcar notificação como lida:", error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.put(`/notifications/mark-all-read?user_id=${idUser}`);
            setNotifications((prev) =>
                prev.map((notification) => ({ ...notification, read: true }))
            );
            setHasUnreadNotifications(false);
        } catch (error) {
            console.error("Erro ao marcar todas as notificações como lidas:", error);
        }
    };

    useEffect(() => {
        if (typeof window !== "undefined") {
            const { pathname } = window.location;
            setCurrentRoute(pathname);
        }
    }, []);

    const handleMenuToggle = (menuName: string) => {
        setOpenMenu((prevMenu) => (prevMenu === menuName ? null : menuName));
    };

    useEffect(() => {
        fetchNotifications();

        const interval = setInterval(() => {
            checkForNewNotifications();
        }, 20000);

        return () => clearInterval(interval);
    }, [idUser]);

    useEffect(() => {
        setHasUnreadNotifications(notifications.some(notification => !notification.read));
    }, [notifications]);



    return (
        <Collapsible.Root
            defaultOpen
            className="h-screen w-screen bg-gray-950 text-slate-100 flex overflow-hidden"
            onOpenChange={setIsSideBarOpen}
        >
            <Collapsible.Content className="bg-gray-950 flex-shrink-0 border-r border-slate-600 h-full relative group overflow-y-auto">
                <Collapsible.Trigger className="absolute h-7 right-4 z-[99] text-white hover:scale-105 duration-200 inline-flex items-center justify-center">
                    <ArrowBendDoubleUpLeft className="h-7 w-7 mt-8" />
                </Collapsible.Trigger>

                <div className="flex-1 flex flex-col h-full gap-8 w-[220px]">
                    <nav className="flex mx-2 flex-col gap-8 text-slate-100">
                        <div className="flex flex-col gap-2 ml-2">
                            <div className="text-white font-semibold uppercase mb-2 ml-2 mt-3">
                                <Link href="/dashboard">
                                    <Image
                                        src={configs?.logo ? `${API_URL}files/${configs?.logo}` : noImage}
                                        width={120}
                                        height={120}
                                        alt="logo"
                                    />
                                </Link>
                            </div>
                        </div>
                        <section className="flex flex-col gap-px">
                            <Link href="/dashboard" className={clsx({
                                'bg-activeLink rounded p-2 mb-2': currentRoute === "/dashboard",
                                'text-white p-2 mb-2': currentRoute !== "/dashboard"
                            })}>
                                Dashboard
                            </Link>

                            {user?.role === 'SUPER_ADMIN' ?
                                <>
                                    <div>
                                        <button
                                            onClick={() => handleMenuToggle('users')}
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'users' || currentRoute?.includes("/user"),
                                                'text-white': openMenu !== 'users' && !currentRoute?.includes("/user")
                                            })}
                                        >
                                            Usuários
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': openMenu === 'users',
                                                'rotate-0': openMenu !== 'users'
                                            })} />
                                        </button>
                                        {openMenu === 'users' && (
                                            <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                <Link href="/user/all_users" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/all_users",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/user/all_users"
                                                })}>
                                                    Usuários CMS
                                                </Link>
                                                <Link href="/user/users_blog" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/users_blog",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/user/users_blog"
                                                })}>
                                                    Usuários Blog
                                                </Link>
                                                <Link href="/user/add_user" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/add_user",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/user/add_user"
                                                })}>
                                                    Adicionar Novo Usuário
                                                </Link>
                                                <Link href="/user/profile" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/profile",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/user/profile"
                                                })}>
                                                    Editar perfil
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <Link
                                            href="/contacts_form/all_contacts"
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === '/contacts_form/all_contacts' || currentRoute?.includes("/contacts_form/all_contacts"),
                                                'text-white': openMenu !== '/contacts_form/all_contacts' && !currentRoute?.includes("/contacts_form/all_contacts")
                                            })}
                                        >
                                            Contatos
                                        </Link>
                                    </div>

                                    <div>
                                        <Link
                                            href="/newsletter"
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'newsletter' || currentRoute?.includes("/newsletter"),
                                                'text-white': openMenu !== 'newsletter' && !currentRoute?.includes("/newsletter")
                                            })}
                                        >
                                            Newsletter
                                        </Link>
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleMenuToggle('categories')}
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'categories' || currentRoute?.includes("/categories"),
                                                'text-white': openMenu !== 'categories' && !currentRoute?.includes("/categories")
                                            })}
                                        >
                                            Categorias
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': openMenu === 'categories',
                                                'rotate-0': openMenu !== 'categories'
                                            })} />
                                        </button>
                                        {openMenu === 'categories' && (
                                            <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                <Link href="/categories/all_categories" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/categories/all_categories",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/categories/all_categories"
                                                })}>
                                                    Todos as categorias
                                                </Link>
                                                <Link href="/categories/add_category" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/categories/add_category",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/categories/add_category"
                                                })}>
                                                    Adicionar nova categoria
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleMenuToggle('tags')}
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'tags' || currentRoute?.includes("/tags"),
                                                'text-white': openMenu !== 'tags' && !currentRoute?.includes("/tags")
                                            })}
                                        >
                                            Tags
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': openMenu === 'tags',
                                                'rotate-0': openMenu !== 'tags'
                                            })} />
                                        </button>
                                        {openMenu === 'tags' && (
                                            <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                <Link href="/tags/all_tags" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/tags/all_tags",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/tags/all_tags"
                                                })}>
                                                    Todas as tags
                                                </Link>
                                                <Link href="/tags/add_tag" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/tags/add_tag",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/tags/add_tag"
                                                })}>
                                                    Adicionar nova tag
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleMenuToggle('posts')}
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'posts' || currentRoute?.includes("/posts"),
                                                'text-white': openMenu !== 'posts' && !currentRoute?.includes("/posts")
                                            })}
                                        >
                                            Artigos
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': openMenu === 'posts',
                                                'rotate-0': openMenu !== 'posts'
                                            })} />
                                        </button>
                                        {openMenu === 'posts' && (
                                            <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                <Link href="/posts/all_posts" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/all_posts",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/all_posts"
                                                })}>
                                                    Todos os posts
                                                </Link>
                                                <Link href="/posts/add_post" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/add_post",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/add_post"
                                                })}>
                                                    Adicionar novo post
                                                </Link>
                                                <Link href="/posts/comments" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/comments",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/comments"
                                                })}>
                                                    Comentarios
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleMenuToggle('marketing_publication')}
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'marketing_publication' || currentRoute?.includes("/marketing_publication"),
                                                'text-white': openMenu !== 'marketing_publication' && !currentRoute?.includes("/marketing_publication")
                                            })}
                                        >
                                            Marketing
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': openMenu === 'marketing_publication',
                                                'rotate-0': openMenu !== 'marketing_publication'
                                            })} />
                                        </button>
                                        {openMenu === 'marketing_publication' && (
                                            <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                <Link href="/marketing_publication/all_marketing_publication" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/marketing_publication/all_marketing_publication",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/marketing_publication/all_marketing_publication"
                                                })}>
                                                    Todas publicidades de marketing
                                                </Link>
                                                <Link href="/marketing_publication/add_marketing_publication" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/marketing_publication/add_marketing_publication",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/marketing_publication/add_marketing_publication"
                                                })}>
                                                    Adicionar publicidade de marketing
                                                </Link>
                                                <Link href="/marketing_publication/config_interval_banner" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/marketing_publication/config_interval_banner",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/marketing_publication/config_interval_banner"
                                                })}>
                                                    Configurar intervalo de banners
                                                </Link>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => handleMenuToggle('configurations')}
                                            className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                'bg-activeLink rounded': openMenu === 'configurations' || currentRoute?.includes("/configurations"),
                                                'text-white': openMenu !== 'configurations' && !currentRoute?.includes("/configurations")
                                            })}
                                        >
                                            Configurações do blog
                                            <CaretRight className={clsx('transition-transform duration-200', {
                                                'rotate-90': openMenu === 'configurations',
                                                'rotate-0': openMenu !== 'configurations'
                                            })} />
                                        </button>
                                        {openMenu === 'configurations' && (
                                            <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                <Link href="/configurations/configuration" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/configurations/configuration",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/configurations/configuration"
                                                })}>
                                                    Configurações
                                                </Link>
                                                <Link href="/configurations/seo_pages" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/configurations/seo_pages",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/configurations/seo_pages"
                                                })}>
                                                    SEO
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </>
                                : user?.role === 'ADMIN' ?
                                    <>
                                        <div>
                                            <button
                                                onClick={() => handleMenuToggle('users')}
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === 'users' || currentRoute?.includes("/user"),
                                                    'text-white': openMenu !== 'users' && !currentRoute?.includes("/user")
                                                })}
                                            >
                                                Usuários
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': openMenu === 'users',
                                                    'rotate-0': openMenu !== 'users'
                                                })} />
                                            </button>
                                            {openMenu === 'users' && (
                                                <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                    <Link href="/user/all_users" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/all_users",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/user/all_users"
                                                    })}>
                                                        Usuários CMS
                                                    </Link>
                                                    <Link href="/user/users_blog" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/users_blog",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/user/users_blog"
                                                    })}>
                                                        Usuários Blog
                                                    </Link>
                                                    <Link href="/user/add_user" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/add_user",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/user/add_user"
                                                    })}>
                                                        Adicionar Novo Usuário
                                                    </Link>
                                                    <Link href="/user/profile" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/profile",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/user/profile"
                                                    })}>
                                                        Editar perfil
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Link
                                                href="/contacts_form/all_contacts"
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === '/contacts_form/all_contacts' || currentRoute?.includes("/contacts_form/all_contacts"),
                                                    'text-white': openMenu !== '/contacts_form/all_contacts' && !currentRoute?.includes("/contacts_form/all_contacts")
                                                })}
                                            >
                                                Contatos
                                            </Link>
                                        </div>

                                        <div>
                                            <Link
                                                href="/newsletter"
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === 'newsletter' || currentRoute?.includes("/newsletter"),
                                                    'text-white': openMenu !== 'newsletter' && !currentRoute?.includes("/newsletter")
                                                })}
                                            >
                                                Newsletter
                                            </Link>
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => handleMenuToggle('categories')}
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === 'categories' || currentRoute?.includes("/categories"),
                                                    'text-white': openMenu !== 'categories' && !currentRoute?.includes("/categories")
                                                })}
                                            >
                                                Categorias
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': openMenu === 'categories',
                                                    'rotate-0': openMenu !== 'categories'
                                                })} />
                                            </button>
                                            {openMenu === 'categories' && (
                                                <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                    <Link href="/categories/all_categories" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/categories/all_categories",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/categories/all_categories"
                                                    })}>
                                                        Todos as categorias
                                                    </Link>
                                                    <Link href="/categories/add_category" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/categories/add_category",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/categories/add_category"
                                                    })}>
                                                        Adicionar nova categoria
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => handleMenuToggle('posts')}
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === 'posts' || currentRoute?.includes("/posts"),
                                                    'text-white': openMenu !== 'posts' && !currentRoute?.includes("/posts")
                                                })}
                                            >
                                                Artigos
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': openMenu === 'posts',
                                                    'rotate-0': openMenu !== 'posts'
                                                })} />
                                            </button>
                                            {openMenu === 'posts' && (
                                                <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                    <Link href="/posts/all_posts" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/all_posts",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/all_posts"
                                                    })}>
                                                        Todos os posts
                                                    </Link>
                                                    <Link href="/posts/add_post" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/add_post",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/add_post"
                                                    })}>
                                                        Adicionar novo post
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => handleMenuToggle('tags')}
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === 'tags' || currentRoute?.includes("/tags"),
                                                    'text-white': openMenu !== 'tags' && !currentRoute?.includes("/tags")
                                                })}
                                            >
                                                Tags
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': openMenu === 'tags',
                                                    'rotate-0': openMenu !== 'tags'
                                                })} />
                                            </button>
                                            {openMenu === 'tags' && (
                                                <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                    <Link href="/tags/all_tags" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/tags/all_tags",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/tags/all_tags"
                                                    })}>
                                                        Todas as tags
                                                    </Link>
                                                    <Link href="/tags/add_tag" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/tags/add_tag",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/tags/add_tag"
                                                    })}>
                                                        Adicionar nova tag
                                                    </Link>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <button
                                                onClick={() => handleMenuToggle('marketing_publication')}
                                                className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                    'bg-activeLink rounded': openMenu === 'marketing_publication' || currentRoute?.includes("/marketing_publication"),
                                                    'text-white': openMenu !== 'marketing_publication' && !currentRoute?.includes("/marketing_publication")
                                                })}
                                            >
                                                Marketing
                                                <CaretRight className={clsx('transition-transform duration-200', {
                                                    'rotate-90': openMenu === 'marketing_publication',
                                                    'rotate-0': openMenu !== 'marketing_publication'
                                                })} />
                                            </button>
                                            {openMenu === 'marketing_publication' && (
                                                <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                    <Link href="/marketing_publication/all_marketing_publication" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/marketing_publication/all_marketing_publication",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/marketing_publication/all_marketing_publication"
                                                    })}>
                                                        Todas publicidades de marketing
                                                    </Link>
                                                    <Link href="/marketing_publication/add_marketing_publication" className={clsx({
                                                        'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/marketing_publication/add_marketing_publication",
                                                        'text-white p-2 mb-2 text-sm': currentRoute !== "/marketing_publication/add_marketing_publication"
                                                    })}>
                                                        Adicionar publicidade de marketing
                                                    </Link>
                                                    <Link href="/marketing_publication/config_interval_banner" className={clsx({
                                                    'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/marketing_publication/config_interval_banner",
                                                    'text-white p-2 mb-2 text-sm': currentRoute !== "/marketing_publication/config_interval_banner"
                                                })}>
                                                    Configurar intervalo de banners
                                                </Link>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                    : user?.role === 'EMPLOYEE' ?
                                        <>
                                            <div>
                                                <button
                                                    onClick={() => handleMenuToggle('user')}
                                                    className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                        'bg-activeLink rounded': openMenu === 'user' || currentRoute?.includes("/user"),
                                                        'text-white': openMenu !== 'user' && !currentRoute?.includes("/user")
                                                    })}
                                                >
                                                    Usuário
                                                    <CaretRight className={clsx('transition-transform duration-200', {
                                                        'rotate-90': openMenu === 'user',
                                                        'rotate-0': openMenu !== 'user'
                                                    })} />
                                                </button>
                                                {openMenu === 'user' && (
                                                    <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                        <Link href="/user/profile" className={clsx({
                                                            'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/user/profile",
                                                            'text-white p-2 mb-2 text-sm': currentRoute !== "/user/profile"
                                                        })}>
                                                            Editar perfil
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <button
                                                    onClick={() => handleMenuToggle('categories')}
                                                    className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                        'bg-activeLink rounded': openMenu === 'categories' || currentRoute?.includes("/categories"),
                                                        'text-white': openMenu !== 'categories' && !currentRoute?.includes("/categories")
                                                    })}
                                                >
                                                    Categorias
                                                    <CaretRight className={clsx('transition-transform duration-200', {
                                                        'rotate-90': openMenu === 'categories',
                                                        'rotate-0': openMenu !== 'categories'
                                                    })} />
                                                </button>
                                                {openMenu === 'categories' && (
                                                    <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                        <Link href="/categories/all_categories" className={clsx({
                                                            'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/categories/all_categories",
                                                            'text-white p-2 mb-2 text-sm': currentRoute !== "/categories/all_categories"
                                                        })}>
                                                            Todos as categorias
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <button
                                                    onClick={() => handleMenuToggle('posts')}
                                                    className={clsx('p-2 text-left mb-2 flex justify-between items-center w-full', {
                                                        'bg-activeLink rounded': openMenu === 'posts' || currentRoute?.includes("/posts"),
                                                        'text-white': openMenu !== 'posts' && !currentRoute?.includes("/posts")
                                                    })}
                                                >
                                                    Artigos
                                                    <CaretRight className={clsx('transition-transform duration-200', {
                                                        'rotate-90': openMenu === 'posts',
                                                        'rotate-0': openMenu !== 'posts'
                                                    })} />
                                                </button>
                                                {openMenu === 'posts' && (
                                                    <div className="ml-4 overflow-hidden transition-all duration-300 ease-in-out flex flex-col">
                                                        <Link href="/posts/all_posts" className={clsx({
                                                            'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/all_posts",
                                                            'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/all_posts"
                                                        })}>
                                                            Todos os posts
                                                        </Link>
                                                        <Link href="/posts/add_post" className={clsx({
                                                            'bg-activeLink rounded p-2 mb-2 text-sm': currentRoute === "/posts/add_post",
                                                            'text-white p-2 mb-2 text-sm': currentRoute !== "/posts/add_post"
                                                        })}>
                                                            Adicionar novo post
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                        :
                                        null
                            }
                        </section>
                    </nav>
                </div>
            </Collapsible.Content>

            <div className="flex-1 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-200">
                <div
                    id="header"
                    className="flex items-center gap-4 leading-tight relative border-b border-slate-600 transition-all duration-200 py-[1.125rem] px-6 justify-between"
                >
                    <Collapsible.Trigger
                        className={clsx('h-7 w-7 text-gray-800 bg-gray-100 p-1 rounded-full relative z-[99] top-9 left-0', {
                            hidden: isSideBarOpen,
                            block: !isSideBarOpen
                        })}
                    >
                        <CaretRight className="w-5 h-5" />
                    </Collapsible.Trigger>

                    <h1 className="text-white font-bold">CMS Blog - {configs?.name_blog}</h1>

                    <div>
                        <Link
                            href="/"
                            target="_blank"
                            className="text-sm"
                        >
                            Ir para o blog
                        </Link>
                    </div>

                    {/* Novo container para o sino e o avatar */}
                    <div className="flex items-center gap-4">
                        <span>{user?.name}</span>
                        <div className="relative">
                            <FiBell
                                size={24}
                                className="text-white cursor-pointer"
                                onClick={() => setShowNotifications(!showNotifications)}
                            />
                            {hasUnreadNotifications && (
                                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
                            )}
                        </div>
                        {showNotifications && (
                            <div
                                ref={notificationRef}
                                className="absolute top-14 right-6 bg-gray-800 text-white rounded-md w-80 shadow-lg p-4 z-10"
                            >
                                <div className="flex justify-between mb-2">
                                    <h2 className="font-semibold">Notificações</h2>
                                    <button
                                        className="text-sm text-red-500 hover:underline"
                                        onClick={markAllAsRead}
                                    >
                                        Marcar todas como lidas
                                    </button>
                                </div>
                                <ul className="max-h-64 overflow-y-auto">
                                    {notifications.map((notification, index) => (
                                        <li
                                            key={notification.id}
                                            className={`p-3 flex items-center justify-between rounded ${notification.read ? "text-gray-500" : "text-white"}
                            ${index !== notifications.length - 1 ? "border-b border-gray-700" : ""} 
                            hover:bg-gray-700`}
                                        >
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="w-full flex justify-between items-center"
                                            >
                                                <span className="flex items-center space-x-2">
                                                    <NotificationIcon type={notification.type} />
                                                    <span>{notification.message}</span>
                                                </span>
                                                <span className="text-xs text-gray-400">{moment(notification.created_at).format('DD-MM-YYYY HH:mm')}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-4 text-center">
                                    <Link href="/central_notifications" passHref>
                                        <button className="bg-backgroundButton text-white hover:underline text-sm p-3 rounded">
                                            Ver todas as notificações
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        )}
                        {/* Avatar do usuário */}
                        {!loadingAuth && isAuthenticated ? (
                            <Link href="/user/profile" >
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
                            </Link>
                        ) : (
                            <Link href="/login">
                                <div className="border-2 rounded-full p-1 border-var(--foreground)">
                                    <FiLogIn size={22} color="var(--foreground)" />
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar">
                    {children}
                </div>
            </div>
        </Collapsible.Root>
    );
}