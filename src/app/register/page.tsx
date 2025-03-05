"use client"

import { useRouter } from 'next/navigation'
import { Container } from '../components/container'
import { Input } from '../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { setupAPIClient } from '../../services/api'
import { toast } from 'react-toastify'
import Link from 'next/link'
import Image from 'next/image'
import ReCAPTCHA from "react-google-recaptcha";
import { ChangeEvent, useEffect, useRef, useState } from 'react'
import { LoadingRequest } from '../components/loadingRequest'
import Login from '../login/page'
import { FiUpload } from 'react-icons/fi'

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo senha é obrigatório"),
    logo: z.string().optional(),
    name_blog: z.string().optional(),
    email_blog: z.string().optional()
});

type FormData = z.infer<typeof schema>

export default function Register() {

    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
        throw new Error("A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida.");
    }

    const router = useRouter();

    const [superAdmin, setSuperAdmin] = useState([]);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [logo, setLogo] = useState<File | null>(null);

    useEffect(() => {
        const apiClient = setupAPIClient();
        async function fetch_super_user() {
            try {
                setLoading(true);
                const response = await apiClient.get(`/user/publicSuper_user`);
                setSuperAdmin(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        fetch_super_user();
    }, []);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const onChangeCaptcha = (token: string | null) => {
        setCaptchaToken(token);
    };

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setLogo(image);
            setAvatarUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    async function onSubmit(data: FormData) {
        setLoading(true);
        const apiClient = setupAPIClient();
        try {
            if (logo === null) {
                toast.error("A imagem da logo do seu blog é obrigatória para o cadastro");
                return;
            }

            if (data.name_blog === null) {
                toast.error("O nome do seu blog é obrigatório para o cadastro");
                return;
            }

            if (data.email_blog === null) {
                toast.error("O email do seu blog é obrigatório para o cadastro");
                return;
            }

            const formData = new FormData();

            formData.append("name_blog", data.name_blog || "");
            formData.append("email_blog", data.email_blog || "");

            if (logo) {
                formData.append("file", logo);
            }
            
            await apiClient.post('/configuration_blog/create', formData);

            toast.success('Cadastro do blog feito com sucesso!');

        } catch (error) {
            toast.error("Erro ao cadstrar dados do blog.");
        }

        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            return;
        }

        try {
            const apiClient = setupAPIClient();

            setTimeout(async () => {
                await apiClient.post('/user/create', { name: data?.name, email: data?.email, password: data?.password });
            }, 3000);

            toast.success('Cadastro feito com sucesso!');

            setLoading(false);

            router.push('/login');

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops erro ao deletar o usuario.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        }
    }

    return (
        <>
            {loading ?
                <LoadingRequest />
                :
                <>
                    {superAdmin.length >= 1 ?
                        <Login />
                        :
                        <Container>
                            <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                                <form
                                    className='bg-white max-w-xl w-full rounded-lg p-4'
                                    onSubmit={handleSubmit(onSubmit)}
                                >
                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="text"
                                            placeholder="Digite o nome do blog..."
                                            name="name_blog"
                                            error={errors.name_blog?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="email"
                                            placeholder="Digite o email do blog..."
                                            name="email_blog"
                                            error={errors.email_blog?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        {/* Input para Imagem */}
                                        <label className="relative w-full h-[250px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                                            <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="hidden" />
                                            {avatarUrl ? (
                                                <Image src={avatarUrl} alt="Preview da imagem" width={250} height={200} className="w-full h-full" />
                                            ) : (
                                                <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                                    <FiUpload size={30} color="#ff6700" />
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="text"
                                            placeholder="Digite seu nome completo..."
                                            name="name"
                                            error={errors.name?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="email"
                                            placeholder="Digite seu email..."
                                            name="email"
                                            error={errors.email?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <Input
                                            styles='w-full border-2 rounded-md h-11 px-2'
                                            type="password"
                                            placeholder="Digite sua senha..."
                                            name="password"
                                            error={errors.password?.message}
                                            register={register}
                                        />
                                    </div>

                                    <div className='mb-3'>
                                        <ReCAPTCHA
                                            ref={captchaRef}
                                            sitekey={RECAPTCHA_SITE_KEY}
                                            onChange={onChangeCaptcha}
                                        />
                                    </div>

                                    <button
                                        type='submit'
                                        className='bg-red-600 w-full rounded-md text-white h-10 font-medium'
                                    >
                                        Cadastrar
                                    </button>
                                </form>

                                <Link href="/login">
                                    Já possui uma conta? Faça o login!
                                </Link>

                            </div>
                        </Container>
                    }
                </>
            }
        </>
    )
}