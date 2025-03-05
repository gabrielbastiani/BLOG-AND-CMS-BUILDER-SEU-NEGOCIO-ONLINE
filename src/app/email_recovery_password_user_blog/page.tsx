"use client"

import { useRouter } from 'next/navigation'
import { Container } from '../components/container'
import { Input } from '../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingRequest } from '../components/loadingRequest'
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from 'react-toastify'
import { setupAPIClient } from '@/services/api'
import { AuthContext } from '@/contexts/AuthContext'
import noImage from '../../assets/no-image-icon-6.png'

const schema = z.object({
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
})

type FormData = z.infer<typeof schema>

export default function Emailrecoverypassworduserblog() {

    const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || "";
    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const { configs } = useContext(AuthContext);
    const router = useRouter()

    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const onChangeCaptcha = (token: string | null) => {
        setCaptchaToken(token);
    };

    async function onSubmit(data: FormData) {

        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            return;
        }

        setLoading(true);

        const email = data?.email;

        try {
            const apiClient = setupAPIClient();
            await apiClient.post(`/user/user_blog/email_recovery_password`, { email: email });

            toast.success(`Email enviado para o endereço "${email}`);

            setLoading(false);

            router.push('/');

        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops erro ao enviar email ao usuario.');
            } else {
                console.error(error);
                toast.error('Erro desconhecido.');
            }
        } finally {
            setLoading(false);
        }
    }


    return (
        <>
            {loading ?
                <LoadingRequest />
                :
                <Container>
                    <div className='w-full min-h-screen flex justify-center items-center flex-col gap-4'>
                        <div className='mb-6 max-w-sm w-full'>
                            {configs?.logo ?
                                <Image
                                    src={configs?.logo ? `${API_URL}files/${configs?.logo}` : noImage}
                                    alt='logo-do-site'
                                    width={500}
                                    height={500}
                                />
                                :
                                null
                            }
                        </div>

                        <form
                            className='bg-white max-w-xl w-full rounded-lg p-4'
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className='mb-3 w-full'>
                                <Input
                                    styles='w-full p-2'
                                    type="email"
                                    placeholder="Digite seu email..."
                                    name="email"
                                    error={errors.email?.message}
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
                                Enviar
                            </button>
                        </form>

                        <Link href="/">
                            Voltar para o blog
                        </Link>

                    </div>
                </Container>
            }
        </>
    )
}