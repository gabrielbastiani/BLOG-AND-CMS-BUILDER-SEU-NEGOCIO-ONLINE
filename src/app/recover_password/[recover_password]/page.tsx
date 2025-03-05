"use client"

import { useRouter } from 'next/navigation'
import { Container } from '../../components/container'
import { Input } from '../../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useContext, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingRequest } from '../../components/loadingRequest'
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from 'react-toastify'
import { setupAPIClient } from '@/services/api'
import { AuthContext } from '@/contexts/AuthContext'
import noImage from '../../../assets/no-image-icon-6.png'

const passwordSchema = z.object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function Recoverpassworduserblog({ params }: { params: { recover_password: string } }) {

    const router = useRouter();
    const { configs } = useContext(AuthContext);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY || "";

    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const onChangeCaptcha = (token: string | null) => {
        setCaptchaToken(token);
    };

    async function onSubmit(data: PasswordFormValues) {

        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            return;
        }

        setLoading(true);

        try {
            const apiClient = setupAPIClient();
            await apiClient.put(`/user/recover_password_user_blog?passwordRecoveryUser_id=${params?.recover_password}`, { password: data?.confirmPassword });

            toast.success('Senha atualizada com sucesso!');

            setLoading(false);

            router.push('/login');

        } catch (error) {/* @ts-ignore */
            console.log(error.response.data);
            toast.error('Erro ao cadastrar!');
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
                            <div className='mb-3'>
                                <Input
                                    styles='w-full p-2'
                                    type="password"
                                    placeholder="Digite a nova senha..."
                                    name="confirmPassword"
                                    error={errors.password?.message}
                                    register={register}
                                />
                            </div>

                            <div className='mb-3'>
                                <Input
                                    styles='w-full p-2'
                                    type="password"
                                    placeholder="Digite novamente a senha..."
                                    name="password"
                                    error={errors.confirmPassword?.message}
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
                                Solicitar
                            </button>
                        </form>

                        <Link href="/register">
                            Ainda não possui uma conta? Cadastre-se
                        </Link>

                        <Link href="/login">
                            Já possui uma conta? Faça o login!
                        </Link>

                    </div>
                </Container>
            }
        </>
    )
}