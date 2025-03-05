import axios from 'axios';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';

function signOut() {
    try {
        let remove_cookie_user = new Cookies();
        remove_cookie_user.remove('@cmsblog.token', { path: '/' });
        toast.success('Usuario deslogado com sucesso!');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        toast.error("OPS... Erro ao deslogar");
    }
}

export function setupAPIClient() {

    let cookie_user = new Cookies();
    let cookies = cookie_user.get('@cmsblog.token');

    const api = axios.create({
        baseURL: 'https://apiblog.builderseunegocioonline.com.br',
        headers: {
            Authorization: `Bearer ${cookies}`
        }
    });

    api.interceptors.response.use(
        /* @ts-ignore */
        (response) => response,
        /* @ts-ignore */
        (error) => {
            if (error.response?.status === 401) {
                signOut();
                window.location.href = '/login';
            }
            return Promise.reject(error);
        }
    );

    return api;

}