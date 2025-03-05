"use client";

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Image from "next/image";
import { Editor } from "@tinymce/tinymce-react";
import BulkDatas from "@/app/components/bulkDatas";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

interface FormDataProps {
    title: string;
    image_post?: string;
    description?: string;
    status?: string;
    publish_at?: string;
    categories?: string[];
    tags?: string[];
    seo_description?: string;
    seo_keywords?: string[];
    custom_url?: string;
}

interface Category {
    id: string;
    name_category: string;
}

interface Tag {
    id: string;
    tag_name: string;
}

const schema = z.object({
    title: z.string().nonempty("O título é obrigatório"),
    image_post: z.string().optional(),
    text_post: z.string().optional(),
    status: z.enum(["Disponivel", "Indisponivel", "Programado"], {
        errorMap: () => ({ message: "Selecione um status válido" }),
    }),
    publish_at: z.string().optional(),
    categories: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    seo_description: z.string().optional(),
    seo_keywords: z.array(z.string()).optional(),
    custom_url: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function AddPost() {

    const TOKEN_TINY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

    const editorRef = useRef<any>(null);
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [image_post, setImage_post] = useState<File | null>(null);
    const [seoKeywords, setSeoKeywords] = useState<{ label: string; value: string }[]>([]);
    const [key, setKey] = useState(0);
    const [key_b, setKey_b] = useState(1);

    useEffect(() => {
        setKey(1);
        setKey_b(2)
    }, []);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const apiClient = setupAPIClient();
                const categoriesResponse = await apiClient.get("/category/cms");
                const tagsResponse = await apiClient.get("/tag/all_tags");
                setCategories(categoriesResponse.data.all_categories_disponivel);
                setTags(tagsResponse.data.tags_all);
            } catch (error) {
                toast.error("Erro ao carregar categorias e tags.");
            }
        }
        fetchData();
    }, []);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setImage_post(image);
            setAvatarUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    const handleSeoKeywordsChange = (newValue: any) => {
        setSeoKeywords(newValue || []);
    };

    const onSubmit = async (data: FormDataProps) => {
        setLoading(true);
        try {
            const content = editorRef.current?.getContent();
            if (!content || content.trim() === "") {
                toast.error("O conteúdo do post não pode estar vazio!");
                setLoading(false);
                return;
            }

            if (data.status === "") {
                toast.error("Escolha um status para o seu post!!!");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("author", user?.name || "");
            formData.append("title", data.title);
            formData.append("text_post", content);
            formData.append("status", data.status || "");
            formData.append("publish_at", data.publish_at || "");
            formData.append("categories", JSON.stringify(selectedCategories));
            formData.append("tags", JSON.stringify(selectedTags));
            formData.append("seo_description", data.seo_description || "");
            formData.append("seo_keywords", JSON.stringify(seoKeywords.map((kw) => kw.value)));
            formData.append("custom_url", data.custom_url || "");

            if (image_post) {
                formData.append("file", image_post);
            }

            const apiClient = setupAPIClient();
            await apiClient.post("/post/create_post", formData);

            toast.success("Artigo cadastrado com sucesso!");
            setSelectedCategories([]);
            setSelectedTags([]);
            setSeoKeywords([]);
            reset();
            setAvatarUrl(null);
            setImage_post(null);
            editorRef.current?.setContent("");

        } catch (error) {
            console.log(error)
            toast.error("Erro ao cadastrar o post.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="CADASTRAR POST" />
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Input para Imagem */}
                    <label className="relative w-full h-[450px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                        <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="hidden" />
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt="Preview da imagem" width={250} height={200} className="w-full h-full" />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-300">
                                <FiUpload size={30} color="#ff6700" />
                            </div>
                        )}
                    </label>

                    {/* Input para Título */}
                    <input
                        type="text"
                        placeholder="Digite um título..."
                        {...register("title")}
                        className="w-full border-2 rounded-md px-3 py-2 text-black"
                    />

                    {/* Seletores em linha */}
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            key={key}
                            instanceId="meu-select-categorias"
                            options={categories.map((cat, index) => ({ key: index, value: cat.id, label: cat.name_category }))}
                            isMulti
                            placeholder="Selecione categorias"
                            className="basic-multi-select text-black z-10"
                            classNamePrefix="select"
                            onChange={(selected) =>
                                setSelectedCategories(selected.map((item: any) => item.value))
                            }
                        />
                        <Select
                            key={key_b}
                            instanceId="meu-select-tags"
                            options={tags.map((tag, index) => ({ key: index, value: tag.id, label: tag.tag_name }))}
                            isMulti
                            placeholder="Selecione tags"
                            className="basic-multi-select text-black z-15"
                            classNamePrefix="select"
                            onChange={(selected) =>
                                setSelectedTags(selected.map((item: any) => item.value))
                            }
                        />
                        <select {...register("status")} className="border-2 rounded-md px-3 py-2 text-black">
                            <option value="">Selecione o status</option>
                            <option value="Programado">Programado</option>
                            <option value="Disponivel">Disponível</option>
                            <option value="Indisponivel">Indisponível</option>
                        </select>

                        <label>
                            Agende sua postagem: &nbsp;&nbsp;
                            <input
                                type="datetime-local"
                                {...register("publish_at")}
                                className="border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>

                    </div>

                    <h1 className="text-xl">SEO</h1>

                    {/* SEO */}
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Digite uma url para SEO..."
                            {...register("custom_url")}
                            className="w-full border-2 rounded-md px-3 py-2 text-black"
                        />

                        <label>
                            Palavras-chave para SEO:
                            <CreatableSelect
                                isMulti
                                value={seoKeywords}
                                onChange={handleSeoKeywordsChange}
                                placeholder="Adicione palavras-chave..."
                                className="text-black"
                                classNamePrefix="select"
                            />
                        </label>
                    </div>

                    <div>
                        <textarea
                            placeholder="Digite uma breve descrição para o SEO..."
                            {...register("seo_description")}
                            className="w-full border-2 rounded-md px-3 py-2 text-black"
                        />
                    </div>

                    <h1 className="text-xl">Texto do post</h1>

                    <Editor
                        apiKey={TOKEN_TINY}
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        initialValue="<p>Digite seu conteúdo aqui...</p>"
                        init={{
                            height: 500,
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

                    {/* Botão de cadastro */}
                    <button
                        type="submit"
                        disabled={loading}
                        className={`fixed right-10 bottom-10 px-6 py-3 z-10 rounded bg-backgroundButton text-white ${loading ? "opacity-50" : "hover:bg-hoverButtonBackground z-10"
                            }`}
                    >
                        {loading ? "Cadastrando..." : "Cadastrar Artigo"}
                    </button>
                </form>

                <hr className="mt-6 mb-6" />

                <BulkDatas
                    link_donwload="/post/donwload_excel_posts?user_id"
                    name_file="posts.xlsx"
                    link_register_data="/post/bulk_posts?user_id"
                />
            </Section>
        </SidebarAndHeader>
    );
}