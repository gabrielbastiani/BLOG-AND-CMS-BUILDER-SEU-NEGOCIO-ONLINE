"use client";

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import { toast } from "react-toastify";
import { z } from "zod";
import Image from "next/image";
import Select from "react-select";
import { Editor } from "@tinymce/tinymce-react";
import CreatableSelect from "react-select/creatable";

interface FormDataProps {
    categories?: {
        category: { id: string; name_category: string };
    }[];
    tags?: {
        tag: { id: string; tag_name: string }
    }[];
    author?: string;
    title?: string;
    image_post?: string;
    text_post?: string;
    status?: string;
    publish_at?: string;
    created_at?: string;
    seo_description?: string;
    seo_keywords?: string[];
    [key: string]: any;
    custom_url?: string;
}

interface Author {
    id: string;
    name: string;
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

export default function Post({ params }: { params: { post_id: string } }) {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const TOKEN_TINY = process.env.NEXT_PUBLIC_TINYMCE_API_KEY;

    const editorRef = useRef<any>(null);
    const [allAuthors, setAllAuthors] = useState<Author[]>([]);
    const [dataPost, setDataPost] = useState<FormDataProps | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [seoKeywords, setSeoKeywords] = useState<{ label: string; value: string }[]>([]);
    const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [imagePost, setImagePost] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
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
                const [authorsResponse, postResponse, categoriesResponse, tagsResponse] =
                    await Promise.all([
                        apiClient.get("/user/all_users"),
                        apiClient.get(`/post/cms?post_id=${params.post_id}`),
                        apiClient.get("/category/cms"),
                        apiClient.get("/tag/all_tags"),
                    ]);

                setAllAuthors(authorsResponse.data.all_autor);

                const postData = postResponse.data.unique_post;
                setDataPost(postData);

                setSelectedCategories(
                    postData.categories?.map((cat: { category: { id: any } }) => cat.category.id) || []
                );

                setSelectedTags(
                    postData.tags?.map((tag: { tag: { id: any } }) => tag.tag.id) || []
                );

                const keywords = (postData.seo_keywords || []).map((kw: string) => ({
                    label: kw,
                    value: kw,
                }));
                setSeoKeywords(keywords);

                setCategories(categoriesResponse.data.all_categories_disponivel);
                setTags(tagsResponse.data.tags_all);

                setAvatarUrl(postData.image_post || null);
                setSelectedAuthor(postData.author || null);

                reset({
                    title: postData.title,
                    status: postData.status,
                    seo_description: postData.seo_description,
                    custom_url: postData.custom_url,
                    seo_keywords: postData.seo_keywords,
                    publish_at: postData.publish_at
                        ? new Date(postData.publish_at).toISOString().slice(0, 16)
                        : "",
                });

                if (editorRef.current) {
                    editorRef.current.setContent(postData.text_post || "");
                }
            } catch (error) {
                toast.error("Erro ao carregar os dados do post.");
            }
        }

        fetchData();
    }, [params.post_id, reset]);

    function handleFile(e: ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;

        const image = e.target.files[0];
        if (!image) return;

        if (image.type === "image/jpeg" || image.type === "image/png") {
            setImagePost(image);
            setAvatarUrl(URL.createObjectURL(image));
        } else {
            toast.error("Formato de imagem inválido. Selecione uma imagem JPEG ou PNG.");
        }
    }

    const handleSeoKeywordsChange = (newValue: any) => {
        setSeoKeywords(newValue || []);
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const content = editorRef.current?.getContent();
            if (!content || content.trim() === "") {
                toast.error("O conteúdo do post não pode estar vazio!");
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append("post_id", params.post_id);
            formData.append("author", selectedAuthor ?? "");
            formData.append("title", data.title);
            formData.append("text_post", content);
            formData.append("status", data.status || "");
            formData.append("publish_at", data.publish_at ? new Date(data.publish_at).toISOString() : "");
            formData.append("categories", JSON.stringify(selectedCategories));
            formData.append("tags", JSON.stringify(selectedTags));
            formData.append("seo_description", data.seo_description || "");
            formData.append("seo_keywords", JSON.stringify(seoKeywords.map((kw) => kw.value)));
            formData.append("custom_url", data.custom_url || "");

            if (imagePost) {
                formData.append("file", imagePost);
            }

            const apiClient = setupAPIClient();
            await apiClient.put("/post/update", formData);

            toast.success("Artigo atualizado com sucesso!");
        } catch (error) {
            toast.error("Erro ao atualizar o post.");
        } finally {
            setLoading(false);
        }
    };



    return (
        <SidebarAndHeader>
            <Section>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <label className="relative w-full h-[450px] rounded-lg cursor-pointer flex justify-center bg-gray-200 overflow-hidden">
                        <input type="file" accept="image/png, image/jpeg" onChange={handleFile} className="hidden" />
                        {avatarUrl ? (
                            <Image
                                src={imagePost ? avatarUrl : `${API_URL}files/${avatarUrl}`}
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

                    <label>
                        Autor:
                        <Select
                            options={allAuthors.map((author) => ({
                                value: author.name,
                                label: author.name,
                            }))}
                            placeholder="Selecione um autor"
                            value={selectedAuthor ? { value: selectedAuthor, label: selectedAuthor } : null}
                            onChange={(selected) => setSelectedAuthor(selected?.value || null)}
                            className="w-full rounded-md px-3 py-2 text-black placeholder-black z-50"
                        />
                    </label>

                    <label>
                        Titulo:
                        <input
                            type="text"
                            placeholder="Digite um título..."
                            {...register("title")}
                            className="w-full border-2 rounded-md px-3 py-2 text-black"
                        />
                    </label>

                    <div className="grid grid-cols-2 gap-4">

                        <label>
                            Categorias:
                            <Select
                                key={key}
                                instanceId="meu-select-categorias"
                                className="text-black z-40"
                                options={categories.map((cat) => ({
                                    value: cat.id,
                                    label: cat.name_category,
                                }))}
                                isMulti
                                placeholder="Selecione categorias"
                                value={
                                    dataPost?.categories
                                        ? dataPost.categories.map((cat) => ({
                                            value: cat.category.id,
                                            label: cat.category.name_category,
                                        }))
                                        : []
                                }
                                onChange={(selected) => {
                                    const updatedCategories = selected.map((item) => ({
                                        category: { id: item.value, name_category: item.label },
                                    }));
                                    const categoryIds = updatedCategories.map(item => item.category.id);
                                    setSelectedCategories(categoryIds)
                                    setDataPost((prev) =>
                                        prev
                                            ? {
                                                ...prev,
                                                categories: updatedCategories,
                                            }
                                            : null
                                    );
                                }}
                            />
                        </label>

                        <label>
                            Tags:
                            <Select
                                key={key_b}
                                instanceId="meu-select-tags"
                                className="text-black z-40"
                                options={tags.map((tag) => ({
                                    value: tag.id,
                                    label: tag.tag_name,
                                }))}
                                isMulti
                                placeholder="Selecione tags"
                                value={
                                    dataPost?.tags
                                        ? dataPost.tags.map((ta) => ({
                                            value: ta.tag.id,
                                            label: ta.tag.tag_name,
                                        }))
                                        : []
                                }
                                onChange={(selected) => {
                                    const updatedTags = selected.map((item) => ({
                                        tag: { id: item.value, tag_name: item.label },
                                    }));
                                    const tagIds = updatedTags.map(item => item.tag.id);
                                    setSelectedTags(tagIds)
                                    setDataPost((prev) =>
                                        prev
                                            ? {
                                                ...prev,
                                                tags: updatedTags,
                                            }
                                            : null
                                    );
                                }}
                            />
                        </label>
                    </div>

                    <div className="mt-8">
                        <label>
                            Status:&nbsp;&nbsp;
                            <select {...register("status")} className="border-2 rounded-md px-3 py-2 text-black">
                                <option value="">Selecione o status</option>
                                <option value="Programado">Programado</option>
                                <option value="Disponivel">Disponível</option>
                                <option value="Indisponivel">Indisponível</option>
                            </select>
                        </label>
                    </div>

                    <label className="block">
                        Agende sua postagem:
                        <input
                            type="datetime-local"
                            {...register("publish_at")}
                            className="w-full border-2 rounded-md px-3 py-2 text-black"
                        />

                    </label>

                    <h1 className="text-xl">SEO</h1>

                    <div className="grid grid-cols-2 gap-4">
                        <label>
                            URL de SEO:
                            <input
                                type="text"
                                placeholder="Digite uma url para SEO..."
                                {...register("custom_url")}
                                className="w-full border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>

                        <label>
                            Palavras-chave para SEO:
                            <CreatableSelect
                                isMulti
                                value={seoKeywords}
                                onChange={handleSeoKeywordsChange}
                                placeholder="Adicione palavras-chave..."
                                className="text-black z-10"
                                classNamePrefix="select"
                            />
                        </label>
                    </div>

                    <div>
                        <label>
                            Descrição de SEO:
                            <textarea
                                placeholder="Digite uma breve descrição para o SEO..."
                                {...register("seo_description")}
                                className="h-60 w-full border-2 rounded-md px-3 py-2 text-black"
                            />
                        </label>
                    </div>

                    <h1 className="text-xl">Texto do post</h1>

                    <Editor
                        apiKey={TOKEN_TINY}
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        initialValue={dataPost?.text_post || "<p>Digite seu conteúdo aqui...</p>"}
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

                    <button
                        type="submit"
                        disabled={loading}
                        className={`fixed right-10 bottom-10 w-36 z-50 py-3 text-white ${loading ? "bg-gray-500" : "bg-red-600 hover:bg-orange-600"} rounded-md`}
                    >
                        {loading ? "Atualizando..." : "Atualizar Artigo"}
                    </button>
                </form>
            </Section>
        </SidebarAndHeader>
    );
}