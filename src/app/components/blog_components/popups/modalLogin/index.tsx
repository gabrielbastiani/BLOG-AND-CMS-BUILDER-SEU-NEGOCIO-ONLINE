import dynamic from 'next/dynamic';
import React, { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "react-toastify";
import { z } from "zod";
import { Input } from "@/app/components/input";
import { AuthContextBlog } from "@/contexts/AuthContextBlog";
const CognitiveChallenge = dynamic(
    () => import('../../../cognitiveChallenge/index').then(mod => mod.CognitiveChallenge),
    {
        ssr: false,
        loading: () => (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                Carregando desafio de segurança...
            </div>
        )
    }
);

const schema = z.object({
    email: z.string().email("Insira um email válido").optional(),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo senha é obrigatório")
});

type FormData = z.infer<typeof schema>;

interface ModalLoginProps {
    onClose: () => void;
}

export const ModalLogin: React.FC<ModalLoginProps> = ({ onClose }) => {

    const [cognitiveValid, setCognitiveValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const { signIn } = useContext(AuthContextBlog);
    const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    async function onSubmit(data: FormData) {
        if (!cognitiveValid) {
            toast.error('Complete o desafio de segurança antes de enviar');
            return;
        }

        setLoading(true);

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
        } finally {
            setLoading(false);
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

                        <div className="mb-4">
                            <CognitiveChallenge
                                onValidate={(isValid) => setCognitiveValid(isValid)}
                            />
                        </div>

                        <div>
                            <button
                                type='submit'
                                className={`bg-red-600 w-full rounded-md text-white h-10 font-medium ${!cognitiveValid ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                disabled={!cognitiveValid || loading}
                            >
                                {loading ? 'Acessando...' : 'Acessar'}
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