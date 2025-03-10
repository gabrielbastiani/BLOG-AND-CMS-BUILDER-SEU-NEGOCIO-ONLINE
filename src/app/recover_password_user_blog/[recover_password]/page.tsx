"use client"

export const dynamic = 'force-dynamic';
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
import { toast } from 'react-toastify'
import { setupAPIClient } from '@/services/api'
import { AuthContext } from '@/contexts/AuthContext'
import noImage from '../../../../public/no-image.png'
import ReCAPTCHA from 'react-google-recaptcha';

const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const passwordSchema = z.object({
    password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirmação de senha deve ter pelo menos 6 caracteres'),
}).refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function RecoverPassword({ params }: { params: { recover_password: string } }) {

    const router = useRouter();
    const { configs } = useContext(AuthContext);

    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
    });

    const onReCAPTCHAChange = (token: string | null) => {
        setRecaptchaToken(token);
    };

    async function onSubmit(data: PasswordFormValues) {

        setLoading(true);

        if (!recaptchaToken) {
            toast.error("Por favor, complete a verificação reCAPTCHA");
            setLoading(false);
            return;
        }

        try {
            const apiClient = setupAPIClient();
            await apiClient.put(`/user/user_blog/recovery_password_user_blog?passwordRecoveryUser_id=${params?.recover_password}`, { password: data?.confirmPassword });

            toast.success('Senha atualizada com sucesso!');

            setLoading(false);

            router.push('/');

        } catch (error) {/* @ts-ignore */
            console.log(error.response.data);
            toast.error('Erro ao cadastrar!');
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
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

                            <div className="mb-4">
                                <ReCAPTCHA
                                    ref={recaptchaRef}
                                    sitekey={RECAPTCHA_KEY!}
                                    onChange={onReCAPTCHAChange}
                                    theme="light"
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