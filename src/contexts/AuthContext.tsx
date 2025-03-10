"use client"

import { createContext, ReactNode, useState, useEffect } from 'react';
import { api } from '../services/apiClient';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';
import axios from 'axios';

type AuthContextData = {
    user?: UserProps;
    isAuthenticated: boolean;
    loadingAuth?: boolean;
    signIn: (credentials: SignInProps) => Promise<boolean>;
    signOut: () => void;
    updateUser: (newUserData: Partial<UserProps>) => void;
    configs?: ConfigProps;
}

type UserProps = {
    id: string;
    name: string;
    email: string;
    image_user?: string;
    role?: string;
}

type SignInProps = {
    email: string;
    password: string;
}

type AuthProviderProps = {
    children: ReactNode;
}

interface ConfigProps {
    name_blog?: string;
    logo?: string;
    email_blog?: string;
    phone?: string;
    favicon?: string;
    description_blog?: string;
    author_blog?: string;
    privacy_policies?: string;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {

    const router = useRouter();

    const [configs, setConfigs] = useState<ConfigProps>({
        name_blog: "",
        logo: "",
        email_blog: "",
        phone: "",
        favicon: "",
        description_blog: "",
        author_blog: "",
        privacy_policies: "",
    });
    const [cookies, setCookie, removeCookie] = useCookies(['@cmsblog.token']);
    const [cookiesId, setCookieId, removeCookieId] = useCookies(['@idUser']);
    const [user, setUser] = useState<UserProps>();
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
    const isAuthenticated = !!user;

    useEffect(() => {
        async function loadConfigs() {
            try {
                const response = await api.get(`/configuration_blog/get_configs`);

                if (response.status === 200) {
                    const defaultConfigs: ConfigProps = {
                        name_blog: "Blog Padrão",
                        logo: "../assets/no-image-icon-6.png",
                        email_blog: "contato@blog.com",
                        phone: "(00) 0000-0000",
                        favicon: "../../src/app/favicon.ico",
                        description_blog: "Sem descrição",
                        author_blog: "Seu nome",
                        privacy_policies: "Sua politica"
                    };

                    setConfigs(response.data || defaultConfigs);
                }
            } catch (error) {
                // Tratamento de tipo seguro
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 404) {
                        console.warn("Endpoint não encontrado. Usando configurações padrão.");
                        setConfigs({
                            name_blog: "Blog Padrão",
                            logo: "../assets/no-image-icon-6.png",
                            email_blog: "contato@blog.com",
                            phone: "(00) 0000-0000",
                            favicon: "../../src/app/favicon.ico",
                            description_blog: "Sem descrição",
                            author_blog: "Seu nome",
                            privacy_policies: "Sua politica"
                        });
                    } else {
                        console.error("Erro na requisição:", error.message);
                    }
                } else {
                    console.error("Erro desconhecido:", error);
                }
            }
        }
        loadConfigs();
    }, []);

    async function signIn({ email, password }: SignInProps): Promise<boolean> {
        setLoadingAuth(true);
        try {
            const response = await api.post('/user/session', {
                email,
                password
            });

            const { id, token } = response.data;

            setCookie('@cmsblog.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/"
            });

            setCookieId('@idUser', id, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/"
            });

            api.defaults.headers['Authorization'] = `Bearer ${token}`;

            toast.success('Logado com sucesso!');

            setUser({ id, name: response.data.name, email });

            return true;

        } catch (err) {
            toast.error("Erro ao acessar");
            /* @ts-ignore */
            toast.error(`${err.response.data.error}`);
            console.log("Erro ao acessar", err);
            return false;
        } finally {
            setLoadingAuth(false);
        }
    }

    const updateUser = (newUserData: Partial<UserProps>) => {
        if (user) {
            setUser({
                ...user,
                ...newUserData,
            });
        }
    };

    useEffect(() => {
        let token = cookies['@cmsblog.token'];
        let userid = cookiesId['@idUser'];

        async function loadUserData() {
            if (token) {
                try {
                    const response = await api.get(`/user/me?user_id=${userid}`);

                    const { id, name, email, image_user, role } = response.data;

                    setUser({
                        id,
                        name,
                        email,
                        image_user,
                        role
                    });

                } catch (error) {
                    console.error("Erro ao carregar dados do usuário: ", error);
                }
            }

            setLoadingAuth(false);
        }

        loadUserData();
    }, [cookies, cookiesId]);

    function signOut() {
        try {
            removeCookie('@cmsblog.token', { path: '/' });
            removeCookieId('@idUser', { path: '/' });
            setUser(undefined);
            toast.success('Usuário deslogado com sucesso!');
            router.push("/login");
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            toast.error("OPS... Erro ao deslogar");
        }
    }

    return (
        <AuthContext.Provider value={{ configs, user, isAuthenticated, loadingAuth, signIn, signOut, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}