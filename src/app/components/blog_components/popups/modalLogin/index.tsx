import React, { useContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import Link from "next/link";
import { toast } from "react-toastify";
import { z } from "zod";
import { Input } from "@/app/components/input";
import { AuthContextBlog } from "@/contexts/AuthContextBlog";

const schema = z.object({
    email: z.string().email("Insira um email válido").optional(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo senha é obrigatório")
});

type FormData = z.infer<typeof schema>;

interface ModalLoginProps {
    onClose: () => void;
}

export const ModalLogin: React.FC<ModalLoginProps> = ({ onClose }) => {

    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
    const { signIn } = useContext(AuthContextBlog);

    if (!RECAPTCHA_SITE_KEY) {
        throw new Error("A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida.");
    }

    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const captchaRef = useRef<ReCAPTCHA | null>(null);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const onChangeCaptcha = (token: string | null) => setCaptchaToken(token);

    async function onSubmit(data: FormData) {
        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            return;
        }

        const email = data?.email;
        const password = data?.password;

        try {
            let dataUser: any = {
                email,
                password
            };

            await signIn(dataUser);

            onClose();

        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-5 rounded shadow-lg w-96">
                <h2 className="text-lg font-semibold mb-3 text-black">Login</h2>
                <div className="flex justify-end mt-4 space-x-2">
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

                        <div>
                            <button
                                type='submit'
                                className='bg-green-600 w-full rounded-md text-white h-10 font-medium mb-5'
                            >
                                Acessar
                            </button>

                            <Link
                                href="/email_recovery_password_user_blog"
                                className="text-black"
                            >
                                Recupere sua senha!
                            </Link>
                        </div>

                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-md mt-5"
                        >
                            Cancelar
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
};