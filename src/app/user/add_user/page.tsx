"use client";

import BulkDatas from "@/app/components/bulkDatas";
import { Input } from "@/app/components/input";
import { LoadingRequest } from "@/app/components/loadingRequest";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
    name: z.string().nonempty("O campo nome é obrigatório"),
    email: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres").nonempty("O campo senha é obrigatório")
});

type FormData = z.infer<typeof schema>;

export default function Add_user() {

    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
        throw new Error("A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida.");
    }
    
    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [generatedPassword, setGeneratedPassword] = useState<string>("");
    const [isChecked, setIsChecked] = useState(false);
    const [role, setRole] = useState<string>("EMPLOYEE");

    const captchaRef = useRef<ReCAPTCHA | null>(null);

    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    function generateComplexPassword(length: number): string {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        const numberChars = '0123456789';
        const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
        const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;

        let password = '';
        password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
        password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
        password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
        password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));

        for (let i = password.length; i < length; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    const handleGeneratePassword = () => {
        const newPassword = generateComplexPassword(22);
        setGeneratedPassword(newPassword);
        setValue("password", newPassword); // Preenche o campo de senha com a senha gerada
    };

    const onChangeCaptcha = (token: string | null) => {
        setCaptchaToken(token);
    };

    const onChangeCheckbox = () => {
        setIsChecked((prev) => !prev); // Altera o estado booleano
    };

    async function onSubmit(data: FormData) {
        setLoading(true);

        if (!captchaToken) {
            toast.error("Por favor, verifique o reCAPTCHA.");
            setLoading(false);
            return;
        }

        if (role === "") {
            toast.error("Escolha uma função para esse usuário!!!");
            setLoading(false);
            return
        }

        try {
            const apiClient = setupAPIClient();
            await apiClient.post('/user/create', {
                name: data?.name,
                email: data?.email,
                password: data?.password,
                send_email: isChecked,
                role: role
            });

            toast.success('Cadastro feito com sucesso!');
            reset();
            setGeneratedPassword("");
            setIsChecked(false);
        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops, erro ao cadastrar o usuário.');
            } else {
                console.error(error);
                toast.error('Erro ao cadastrar.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            {loading ? (
                <LoadingRequest />
            ) : (
                <SidebarAndHeader>
                    <Section>
                        <TitlePage title="ADICIONAR USUÁRIO" />

                        <div className="flex flex-col space-y-6 w-full max-w-md md:max-w-none">

                            <Input
                                styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                                type="text"
                                placeholder="Digite seu nome completo..."
                                name="name"
                                error={errors.name?.message}
                                register={register}
                            />

                            <Input
                                styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                                type="email"
                                placeholder="Digite seu email..."
                                name="email"
                                error={errors.email?.message}
                                register={register}
                            />

                            <div className="relative w-full max-w-sm">
                                <Input
                                    styles="border-2 rounded-md h-12 px-3 w-full"
                                    type="text"
                                    placeholder="Digite sua senha..."
                                    name="password"
                                    error={errors.password?.message}
                                    register={register}
                                />
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="absolute right-2 top-2 bg-backgroundButton text-white rounded px-3 py-1 hover:bg-hoverButtonBackground transition duration-300"
                                >
                                    Gerar Senha
                                </button>
                            </div>

                            {generatedPassword && (
                                <p className="text-sm text-gray-500">
                                    Senha gerada: {generatedPassword}
                                </p>
                            )}

                            <label className="flex items-center">
                                Função:&nbsp;
                                <select
                                    onChange={(e) => setRole(e.target.value)}
                                    className="appearance-auto text-black border-gray-300 rounded-md p-1"
                                >
                                    {user?.role === "SUPER_ADMIN" ? <option value="SUPER_ADMIN">Super administrador</option> : null}
                                    <option value="ADMIN">Administrador</option>
                                    <option value="EMPLOYEE">Empregado</option>
                                </select>
                            </label>

                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={onChangeCheckbox}
                                    className="mr-2 min-h-8 min-w-7"
                                />
                                Enviar para o novo usuário um e-mail com informações sobre a conta
                            </label>

                            <ReCAPTCHA
                                ref={captchaRef}
                                sitekey={RECAPTCHA_SITE_KEY}
                                onChange={onChangeCaptcha}
                            />

                            <button
                                onClick={handleSubmit(onSubmit)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleSubmit(onSubmit);
                                    }
                                }}
                                className="w-full md:w-80 px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                            >
                                Cadastrar
                            </button>

                            {user?.role === "SUPER_ADMIN" ?
                                <>
                                    <hr />

                                    <BulkDatas
                                        link_donwload="/user/download_excel?user_id"
                                        name_file="modelo_usuarios.xlsx"
                                        link_register_data="/user/bulk_users?user_id"
                                    />
                                </>
                                :
                                null
                            }
                        </div>
                    </Section>
                </SidebarAndHeader>
            )}
        </>
    );
}