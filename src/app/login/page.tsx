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
import noImage from '../../../public/no-image.png'
import ReCAPTCHA from 'react-google-recaptcha'
import { toast } from 'react-toastify'

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const RECAPTCHA_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

const schema = z.object({
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    password: z.string().nonempty("O campo senha é obrigatório")
})

type FormData = z.infer<typeof schema>

export default function Login() {

    const router = useRouter();
    const { signIn, configs } = useContext(AuthContext);
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange"
    });

    const onReCAPTCHAChange = (token: string | null) => {
        setRecaptchaToken(token);
    };

    async function onSubmit(data: FormData) {

        setLoading(true);

        if (!recaptchaToken) {
            toast.error("Por favor, complete a verificação reCAPTCHA");
            setLoading(false);
            return;
        }

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
            recaptchaRef.current?.reset();
            setRecaptchaToken(null);
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
                                    src={configs?.logo ? `${API_URL}files/${configs.logo}` : noImage}
                                    alt='logo-do-blog'
                                    width={500}
                                    height={300}
                                    priority
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