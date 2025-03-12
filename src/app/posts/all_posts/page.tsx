"use client"

import { Suspense } from 'react';
import DataTable from "@/app/components/dataTable"
import { Section } from "@/app/components/section"
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader"
import { TitlePage } from "@/app/components/titlePage"
import { setupAPIClient } from "@/services/api"
import { Key, useState } from "react"
import Image from "next/image";
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"
import moment from "moment"
import { PostsProps } from "../../../../Types/types"

const statusOptions = ["Disponivel", "Indisponivel", "Programado"];

export default function All_posts() {

    const router = useRouter();
    const apiClient = setupAPIClient();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [all_posts, setAll_posts] = useState<PostsProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [editingPost, setEditingPost] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    async function fetchPosts({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/post/cms`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAll_posts(response.data.posts);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error(error);
        }
    }

    const handleImageClick = (imageUrl: string) => {
        setModalImage(imageUrl);
    };

    const handleCloseModal = () => {
        setModalImage(null);
    };

    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditingPost({ id, field });
        setEditedValue(currentValue);
    };

    const handleSave = async (id: string) => {
        try {

            const data = {
                post_id: id,
                status: editedValue
            }

            await apiClient.put(`/post/update`, data);

            setAll_posts((prevPosts) =>
                prevPosts.map((posts) => (posts.id === id ? { ...posts, status: editedValue } : posts))
            );

            setEditingPost(null);
            toast.success("Dado atualizado com sucesso");
        } catch (error) {
            console.log("Erro ao atualizar a categoria:", error);
            toast.error("Erro ao atualizar o dado!!!");
        }
    };

    // ---- COLUNAS PARA EXPORTAÇÂO DE DADOS ---- //

    const availableColumns = [
        "id",
        "author",
        "title",
        "post_like",
        "post_dislike",
        "status",
        "publish_at",
        "tags",
        "categories",
        "created_at"
    ];

    const customNames: any = {
        id: "ID do Artigo",
        author: "Autor do post",
        title: "Titulo do Artigo",
        post_like: "Likes",
        post_dislike: "Dislikes",
        status: "Status",
        publish_at: "Publicação programada",
        tags: "Tags do post",
        categories: "Categorias do post",
        created_at: "Data de criação"
    };

    // ---- SELECT PARA ORDENAÇÂO DOS ---- //

    const columnsOrder: any = [
        { key: "title", label: "Titulo do Artigo" },
        { key: "created_at", label: "Data de Criação" },
        { key: "status", label: "Status" }
    ];

    const availableColumnsOrder: any = [
        "title",
        "created_at",
        "status"
    ];

    const customNamesOrder: any = {
        title: "Titulo do Artigo",
        created_at: "Data de criação",
        status: "Status"
    };


    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="TODOS POSTS" />

                <Suspense fallback={<div>Carregando...</div>}>
                    <DataTable
                        timeFilterButton={true}
                        checkbox_delete={true}
                        active_buttons_searchInput_comments={false}
                        generate_excel_delete="/post/download_excel_delete_post?user_id"
                        delete_bulk_data="/post/bulk_delete_posts?user_id"
                        name_file_export="Artigos"
                        modal_delete_bulk={true}
                        active_buttons_searchInput_notification={false}
                        active_export_data={true}
                        customNamesOrder={customNamesOrder}
                        availableColumnsOrder={availableColumnsOrder}
                        columnsOrder={columnsOrder}
                        availableColumns={availableColumns}
                        customNames={customNames}
                        table_data="post"
                        url_delete_data="/post/delete_post"
                        data={all_posts}
                        totalPages={totalPages}
                        onFetchData={fetchPosts}
                        columns={[
                            {
                                key: 'image_post',
                                label: 'Banner Artigo',
                                render: (item) => (
                                    <>
                                        <Image
                                            src={`${API_URL}/files/${item.image_post}`}
                                            alt={item.title}
                                            width={100}
                                            height={100}
                                            className="w-8 h-8 rounded-full object-cover cursor-pointer"
                                            onClick={() => handleImageClick(`${API_URL}/files/${item.image_post}`)}
                                        />
                                        {modalImage && (
                                            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
                                                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                                                    <button onClick={handleCloseModal} className="absolute top-2 right-2 text-black hover:text-red-600 text-lg">
                                                        X
                                                    </button>
                                                    <div className="flex justify-center mb-4 w-96 h-96">
                                                        <Image
                                                            src={modalImage}
                                                            alt="Imagem da Categoria"
                                                            width={400}
                                                            height={400}
                                                            className="object-cover rounded-md"
                                                            style={{ maxWidth: '100%', maxHeight: '100%' }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ),
                            },
                            {
                                key: "title",
                                label: "Titulo"
                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (item) => (
                                    <span>
                                        {editingPost?.id === item.id && editingPost?.field === "status" ? (
                                            <select
                                                value={editedValue || item.status}
                                                onChange={(e) => setEditedValue(e.target.value)}
                                                onBlur={() => handleSave(item.id)}
                                                className="appearance-auto text-black border-gray-300 rounded-md p-1"
                                            >
                                                {statusOptions.map((status) => (
                                                    <option key={status} value={status}>
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span onClick={() => handleEdit(item.id, "status", item.status)}
                                                className="cursor-pointer text-red-500 hover:underline">
                                                {item.status}
                                            </span>
                                        )}
                                    </span>
                                ),
                            },
                            {
                                key: "categories",
                                label: "Categorias",
                                render: (item: PostsProps) => (
                                    <span className="flex flex-wrap space-x-2 max-w-xs">
                                        {item.categories?.length ? (
                                            item.categories.map((categ, index: Key) => (
                                                <span
                                                    key={index}
                                                    className="p-1 bg-gray-200 rounded-full text-xs whitespace-nowrap text-black"
                                                >
                                                    {categ.category?.name_category || "Sem nome"}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">Sem categoria</span>
                                        )}
                                    </span>
                                ),
                            },
                            {
                                key: "post_like",
                                label: "Likes"
                            },
                            {
                                key: "post_dislike",
                                label: "Deslikes",

                            },
                            {
                                key: "comment",
                                label: "Comentarios",
                                render: (item) => (
                                    <span>{item.comment?.length}</span>
                                ),
                            },
                            {
                                key: "publish_at",
                                label: "Artigo programado?",
                                render: (item) => (
                                    <>
                                        {item.publish_at ?
                                            <span>{moment(item.publish_at).format('DD/MM/YYYY HH:mm')}</span>
                                            :
                                            <span>Não</span>
                                        }
                                    </>
                                ),
                            },
                            {
                                key: "created_at",
                                label: "Data de Criação",
                                render: (item) => (
                                    <span>{moment(item.created_at).format('DD/MM/YYYY HH:mm')}</span>
                                ),
                            },
                            {
                                key: 'edit',
                                label: 'Editar Artigo',
                                render: (item) => (
                                    <button
                                        className='p-1 bg-red-600 text-white text-xs rounded hover:bg-hoverButtonBackground transition duration-300'
                                        onClick={() => router.push(`/posts/all_posts/post/${item.id}`)}
                                    >
                                        Editar post
                                    </button>
                                ),
                            },
                        ]}
                    />
                </Suspense>
            </Section>
        </SidebarAndHeader>
    )
}