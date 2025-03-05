"use client"

import { useRouter } from 'next/navigation'
import { Container } from '../components/container'
import { Input } from '../components/input'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthContext } from '../../contexts/AuthContext'
import { useContext, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LoadingRequest } from '../components/loadingRequest'
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from 'react-toastify'
import noImage from '../../assets/no-image-icon-6.png'

const schema = z.object({
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    password: z.string().nonempty("O campo senha é obrigatório")
})

type FormData = z.infer<typeof schema>

export default function Login() {

    const router = useRouter();
    const { signIn, configs } = useContext(AuthContext);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
        throw new Error("A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida.");
    }

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
        const password = data?.password;

        try {
            let dataUser = {
                email,
                password
            };

            const success = await signIn(dataUser);

            if (success) {
                router.push('/dashboard');
            }

            setLoading(false);

        } catch (error) {
            console.error(error);
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
                                    alt='logo-do-blog'
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
                                Acessar
                            </button>
                        </form>

                        <Link href="/email_recovery_password">
                            Recupere sua senha!
                        </Link>

                    </div>
                </Container>
            }
        </>
    )
}