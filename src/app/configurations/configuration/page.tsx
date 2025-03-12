"use client";

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Config_media_social from "@/app/components/config_media_social";
import { Editor } from "@tinymce/tinymce-react";
import dynamic from "next/dynamic";

const schema = z.object({
    name_blog: z.string().nonempty("O título é obrigatório"),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    email_blog: z.string().email("Insira um email válido").nonempty("O campo email é obrigatório"),
    phone: z
        .string()
        .regex(
            /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/,
            "Insira um número de telefone/celular válido. Ex: (11) 91234-5678 ou 11912345678"
        )
        .optional(),
    description_blog: z.string().optional(),
    author_blog: z.string().optional(),
    about_author_blog: z.string().optional(),
    privacy_policies: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function Configuration() {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const TOKEN_TINY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

    const editorRef = useRef<any>(null);
    const [id, setId] = useState<string>();
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [logo, setLogo] = useState<File | null>(null);
    const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
    const [favicon, setFavicon] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [phoneValue, setPhoneValue] = useState("");
    const [isMounted, setIsMounted] = useState(false);
    const [privacyPoliciesContent, setPrivacyPoliciesContent] = useState("");

    useEffect(() => {
        const formatPhone = (value: string) => {
            const numbers = value.replace(/\D/g, '');
            const match = numbers.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);

            if (!match) return '';

            return [
                match[1] ? `(${match[1]}` : '',
                match[2] ? `) ${match[2]}` : '',
                match[3] ? `-${match[3]}` : ''
            ].join('');
        };

        setPhoneValue(prev => {
            const newValue = formatPhone(prev);
            if (newValue !== prev) return newValue;
            return prev;
        });
    }, [phoneValue]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setLogo(image);
            setLogoUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    function handleFileFavicon(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/x-icon" || image.type === "image/vnd.microsoft.icon") {
            setFavicon(image);
            setFaviconUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem ICO.");
        }
    }

    async function fetchData() {
        try {
            const apiClient = setupAPIClient();
            const { data } = await apiClient.get("/configuration_blog/get_configs");
            if (data.phone) {
                setPhoneValue(data.phone);
            }
            setId(data?.id || "");

            setLogoUrl(data.logo || null);
            setFaviconUrl(data.favicon || null);

            reset({
                name_blog: data.name_blog,
                email_blog: data.email_blog,
                phone: data.phone,
                description_blog: data.description_blog,
                author_blog: data.author_blog,
                about_author_blog: data.about_author_blog
            });

            setPrivacyPoliciesContent(data.privacy_policies || "");

        } catch (error) {
            toast.error("Erro ao carregar os dados do post.");
        }
    }

    useEffect(() => {
        fetchData();
    }, [reset]);

    const onSubmit = async (data: FormData) => {
        setLoading(true);

        const content = editorRef.current?.getContent();
        if (!content || content.trim() === "") {
            toast.error("O conteúdo do post não pode estar vazio!");
            setLoading(false);
            return;
        }

        try {

            const formData = new FormData();
            formData.append("configurationBlog_id", id || "");
            formData.append("name_blog", data.name_blog || "");
            formData.append("phone", phoneValue.replace(/\D/g, '') || "");
            formData.append("email_blog", data.email_blog || "");
            formData.append("description_blog", data.description_blog || "");
            formData.append("author_blog", data.author_blog || "");
            formData.append("about_author_blog", data.about_author_blog || "");
            formData.append("privacy_policies", content);

            if (logo) {
                formData.append("logo", logo);
            }

            if (favicon) {
                formData.append("favicon", favicon);
            }

            const apiClient = setupAPIClient();
            await apiClient.put("/configuration_blog/update", formData);

            toast.success("Configuração atualizada com sucesso");
        } catch (error) {
            toast.error("Erro ao atualizar a configuração.");
        } finally {
            setLoading(false);
        }
    };

    async function delete_files() {
        try {
            const apiClient = setupAPIClient();
            await apiClient.get("/configuration_blog/delete_all_files");
            toast.success("Arquivos deletados com sucesso");
        } catch (error) {
            toast.error("Erro ao deletar os arquivos.");
            console.log(error);
        }
    }

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="CONFIGURAÇÕES DO BLOG" />

                <button
                    className="bg-red-500 text-white p-5 rounded-md mb-7"
                    onClick={delete_files}
                >
                    Deletar arquivos absoletos no sistema
                </button>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    <p>Logomarca:</p>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="relative w-[380px] h-[280px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                            <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="hidden" />
                            {logoUrl ? (
                                <Image
                                    src={logo ? logoUrl : `${API_URL}/files/${logoUrl}`}
                                    alt="Preview da imagem"
                                    width={450}
                                    height={300}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                    <FiUpload size={30} color="#ff6700" />
                                </div>
                            )}
                        </label>
                    </div>

                    <p>Favicon:</p>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="relative w-[300px] h-[200px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                            <input type="file" accept=".ico, image/x-icon, image/vnd.microsoft.icon" onChange={handleFileFavicon} className="hidden" />
                            {faviconUrl ? (
                                <Image
                                    src={favicon ? faviconUrl : `${API_URL}/files/${faviconUrl}`}
                                    alt="Preview da imagem"
                                    width={300}
                                    height={200}
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                    <FiUpload size={30} color="#ff6700" />
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Nome do blog:
                            <input
                                type="text"
                                placeholder="Digite um título..."
                                {...register("name_blog")}
                                className="w-full border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Nome do(a) dono(a) do blog:
                            <input
                                type="text"
                                placeholder="Digite um nome..."
                                {...register("author_blog")}
                                className="w-full border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Sobre o autor do blog:
                            <textarea
                                placeholder="Sobre o autor..."
                                {...register("about_author_blog")}
                                className="w-full h-96 border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Email do blog:
                            <input
                                type="email"
                                placeholder="Email do blog..."
                                {...register("email_blog")}
                                className="w-full border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Telefone:
                            <input
                                type="tel"
                                placeholder="(11) 91234-5678"
                                value={phoneValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setPhoneValue(value);
                                    setValue("phone", value.replace(/\D/g, ''));
                                }}
                                className={`w-full border-2 rounded-md px-3 py-2 text-black ${errors.phone ? "border-red-500" : ""
                                    }`}
                                maxLength={15}
                            />
                            {errors.phone && (
                                <span className="text-red-500">{errors.phone.message}</span>
                            )}
                        </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            Descrição sobre o blog:
                            <textarea
                                placeholder="Descrição do blog..."
                                {...register("description_blog")}
                                className="w-full h-96 border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    {isMounted && (
                        <label>Políticas de privacidade
                            <Editor
                                apiKey={TOKEN_TINY}
                                onInit={(evt, editor) => {
                                    editorRef.current = editor;
                                    editor.setContent(privacyPoliciesContent);
                                }}
                                initialValue={privacyPoliciesContent}
                                id="privacy_policies_editor"
                                init={{
                                    height: 800,
                                    menubar: true,
                                    toolbar: "undo redo | formatselect | bold italic | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image emoticons | table codesample | preview help",
                                    external_plugins: {
                                        insertdatetime: "https://cdn.jsdelivr.net/npm/tinymce/plugins/insertdatetime/plugin.min.js",
                                        media: "https://cdn.jsdelivr.net/npm/tinymce/plugins/media/plugin.min.js",
                                        table: "https://cdn.jsdelivr.net/npm/tinymce/plugins/table/plugin.min.js",
                                        paste: "https://cdn.jsdelivr.net/npm/tinymce/plugins/paste/plugin.min.js",
                                        code: "https://cdn.jsdelivr.net/npm/tinymce/plugins/code/plugin.min.js",
                                        help: "https://cdn.jsdelivr.net/npm/tinymce/plugins/help/plugin.min.js",
                                        wordcount: "https://cdn.jsdelivr.net/npm/tinymce/plugins/wordcount/plugin.min.js",
                                    },
                                    codesample_languages: [
                                        { text: "HTML/XML", value: "markup" },
                                        { text: "JavaScript", value: "javascript" },
                                        { text: "CSS", value: "css" },
                                        { text: "PHP", value: "php" },
                                        { text: "Ruby", value: "ruby" },
                                        { text: "Python", value: "python" },
                                    ],
                                    content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                                }}
                            />
                        </label>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-52 py-3 text-white ${loading ? "bg-gray-500" : "bg-red-600 hover:bg-orange-600"} rounded-md`}
                    >
                        {loading ? "Atualizando..." : "Atualizar Cadastro"}
                    </button>
                </form>

                <hr className="mt-7 mb-7" />

                <Config_media_social />

            </Section>
        </SidebarAndHeader>
    )
}