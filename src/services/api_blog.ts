import axios from 'axios';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function signOut() {
    try {
        let remove_cookie_user = new Cookies();
        remove_cookie_user.remove('@blog.token', { path: '/' });
        toast.success('Usuario deslogado com sucesso!');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        toast.error("OPS... Erro ao deslogar");
    }
}

export function setupAPIClientBlog() {

    let cookie_user = new Cookies();
    let cookies = cookie_user.get('@blog.token');

    const api_blog = axios.create({
        baseURL: API_URL,
        headers: {
            Authorization: `Bearer ${cookies}`
        }
    });

    api_blog.interceptors.response.use(
        /* @ts-ignore */
        (response) => response,
        /* @ts-ignore */
        (error) => {
            if (error.response?.status === 401) {
                signOut();
                window.location.href = '/';
            }
            return Promise.reject(error);
        }
    );

    return api_blog;

}