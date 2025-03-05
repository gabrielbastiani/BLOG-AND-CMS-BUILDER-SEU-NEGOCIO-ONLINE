"use client"

import { createContext, ReactNode, useState, useEffect } from 'react';
import { api_blog } from '../services/apiClientBlog';
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';
import { useRouter } from 'next/navigation';

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
    name_blog: string;
    logo: string;
    email_blog: string;
    phone: string;
    description_blog: string;
    about_author_blog: string;
}

export const AuthContextBlog = createContext({} as AuthContextData);

export function AuthProviderBlog({ children }: AuthProviderProps) {

    const router = useRouter();

    const [configs, setConfigs] = useState<ConfigProps>({
        name_blog: "",
        logo: "",
        email_blog: "",
        phone: "",
        description_blog: "",
        about_author_blog: ""
    });    
    const [cookies, setCookie, removeCookie] = useCookies(['@blog.token']);
    const [cookiesId, setCookieId, removeCookieId] = useCookies(['@idUserBlog']);
    const [user, setUser] = useState<UserProps>();
    const [loadingAuth, setLoadingAuth] = useState<boolean>(true);
    const isAuthenticated = !!user;

    useEffect(() => {
        async function loadConfigs() {
            try {
                const { data } = await api_blog.get(`/configuration_blog/get_configs`);
                
                if (data) {
                    setConfigs(data);
                } else {
                    console.warn("Nenhuma configuração foi retornada pela API.");                    
                }
            } catch (error) {
                console.error("Erro ao carregar configurações:", error);
            }
        }
        loadConfigs();
    }, []);    

    async function signIn({ email, password }: SignInProps): Promise<boolean> {
        setLoadingAuth(true);
        try {
            const response = await api_blog.post('/user/user_blog/session', {
                email,
                password
            });

            const { id, token } = response.data;

            setCookie('@blog.token', token, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/"
            });

            setCookieId('@idUserBlog', id, {
                maxAge: 60 * 60 * 24 * 30,
                path: "/"
            });

            api_blog.defaults.headers['Authorization'] = `Bearer ${token}`;

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
        let token = cookies['@blog.token'];
        let userid = cookiesId['@idUserBlog'];

        async function loadUserData() {
            if (token) {
                try {
                    const response = await api_blog.get(`/user/user_blog/me?user_id=${userid}`);

                    const { id, name, email, image_user } = response.data;

                    setUser({
                        id,
                        name,
                        email,
                        image_user
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
            removeCookie('@blog.token', { path: '/' });
            removeCookieId('@idUserBlog', { path: '/' });
            setUser(undefined);
            toast.success('Usuário deslogado com sucesso!');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            toast.error("OPS... Erro ao deslogar");
        }
    }

    return (
        <AuthContextBlog.Provider value={{ configs, user, isAuthenticated, loadingAuth, signIn, signOut, updateUser }}>
            {children}
        </AuthContextBlog.Provider>
    )
}