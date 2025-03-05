"use client"

import { Suspense } from 'react';
import DataTable from "@/app/components/dataTable";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useState } from "react";
import Image from "next/image";
import { MdNotInterested } from "react-icons/md";
import moment from "moment";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

interface CommentProps {
    id: string;
    post_id: string;
    userBlog: {
        image_user: string;
        name: string;
    },
    userBlogImage: string;
    post: {
        id: string;
        title: string;
        slug_title_post: string;
        custon_url: string;
    },
    replyCount: number;
    comment: string;
    nivel?: number;
    parentId: string;
    status: string;
    created_at: string | number | Date;
    replies: string[];
    comment_like: number;
    comment_dislike: number;
    commentLikes?: {
        isLike: boolean;
    };
    post_title: string;
    post_link: string;
}

const statusOptions = ["Pendente", "Aprovado", "Recusado"];

export default function Comments() {

    const router = useRouter();
    const apiClient = setupAPIClient();

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const [all_comments, setAll_comments] = useState<CommentProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [editedValue, setEditedValue] = useState<string>("");
    const [editStatus, setEditStatus] = useState<{ id: string, field: string } | null>(null);
    const [showCommentPopup, setShowCommentPopup] = useState<string | null>(null);

    async function fetchComments({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/comment/cms/get_comments`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAll_comments(response.data.comments);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    }

    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditStatus({ id, field });
        setEditedValue(currentValue);
    };

    const handleSave = async (id: string) => {
        try {

            const data = {
                comment_id: id,
                status: editedValue
            }

            await apiClient.put(`/comment/update_status`, data);

            setAll_comments((prevComm) =>
                prevComm.map((comm) => (comm.id === id ? { ...comm, status: editedValue } : comm))
            );

            setEditStatus(null);
            toast.success("Dado atualizado com sucesso");

        } catch (error) {
            console.log("Erro ao atualizar a status:", error);
            toast.error("Erro ao atualizar o dado!!!");
        }
    };

    const handleDescriptionClick = (id: string, comment: string) => {
        setShowCommentPopup(id);
        setEditedValue(comment || "");
    };

    // ---- COLUNAS PARA EXPORTAÇÂO DE DADOS ---- //

    const availableColumns = [
        "id",
        "post",
        "userBlog",
        "comment",
        "parent",
        "replies",
        "comment_like",
        'comment_dislike',
        "status",
        "created_at"
    ];

    const customNames: any = {
        id: "ID do comentario",
        post: "Titulo do post",
        userBlog: "Autor do post",
        comment: "Comentario",
        parent: "Número de likes",
        replies: "Respostas",
        status: "Status",
        comment_like: "Likes",
        comment_dislike: "Dislikes",
        created_at: "Data de criação"
    };

    // ---- SELECT PARA ORDENAÇÂO DOS ---- //

    const columnsOrder: any = [
        { key: "created_at", label: "Data de Criação" }
    ];

    const availableColumnsOrder: any = [
        "created_at"
    ];

    const customNamesOrder: any = {
        created_at: "Data de criação"
    };


    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="COMENTARIOS" />

                <Suspense fallback={<div>Carregando...</div>}>
                    <DataTable
                        timeFilterButton={true}
                        checkbox_delete={false}
                        generate_excel_delete=""
                        delete_bulk_data=""
                        url_delete_data=""
                        name_file_export="Comentarios"
                        modal_delete_bulk={false}
                        active_buttons_searchInput_notification={false}
                        active_buttons_searchInput_comments={true}
                        active_export_data={true}
                        customNamesOrder={customNamesOrder}
                        customNames={customNames}
                        availableColumnsOrder={availableColumnsOrder}
                        columnsOrder={columnsOrder}
                        availableColumns={availableColumns}
                        table_data="comment"
                        data={all_comments}
                        totalPages={totalPages}
                        onFetchData={fetchComments}
                        columns={[
                            {
                                key: 'userBlogImage',
                                label: 'Foto do usúario',
                                render: (item) => (
                                    <>
                                        {item.userBlog?.image_user ? (
                                            <Image
                                                key={item.id}
                                                src={`${API_URL}files/${item.userBlog.image_user}`}
                                                alt={item.userBlog?.name}
                                                width={80}
                                                height={80}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="mr-3 w-[50px] h-[50px] rounded-full bg-gray-300 flex items-center justify-center md:w-[40px] md:h-[40px]">
                                                <MdNotInterested color="black" size={25} />
                                            </div>
                                        )}
                                    </>
                                ),
                            },
                            {
                                key: "userBlog",
                                label: "Nome",
                                render: (item) => (
                                    <>
                                        {item.userBlog?.name ? (
                                            <span key={item.id}>{item.userBlog?.name}</span>
                                        ) :
                                            <span>usuario excluido</span>
                                        }
                                    </>
                                )
                            },
                            {
                                key: "comment",
                                label: "Comentário",
                                render: (item) => (
                                    <div
                                        className="truncate w-40"
                                        key={item.id}
                                    >
                                        <span
                                            className="cursor-pointer"
                                            onClick={() => handleDescriptionClick(item.id, item.comment || "")}
                                        >
                                            {item.comment}
                                        </span>
                                    </div>
                                )
                            },
                            {
                                key: "created_at",
                                label: "Enviado em",
                                render: (item) => (
                                    <span>{moment(item.created_at).format('DD/MM/YYYY HH:mm')}</span>
                                ),
                            },
                            {
                                key: "post_title",
                                label: "Em resposta para",
                                render: (item) => (
                                    <div
                                        key={item.post.id}
                                        className="truncate w-40"
                                    >
                                        <span>
                                            {item.post.title}
                                        </span>
                                    </div>
                                )
                            },
                            {
                                key: "replyCount",
                                label: "Total de respostas",

                            },
                            {
                                key: "comment_like",
                                label: "Likes",

                            },
                            {
                                key: "comment_dislike",
                                label: "Deslikes",

                            },
                            {
                                key: 'status',
                                label: 'Status',
                                render: (item) => (
                                    <span>
                                        {editStatus?.id === item.id && editStatus?.field === "status" ? (
                                            <select
                                                value={editedValue || item.status}
                                                onChange={(e) => setEditedValue(e.target.value)}
                                                onBlur={() => handleSave(item.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSave(item.id);
                                                    }
                                                }}
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
                                key: 'post_link',
                                label: 'Ver post',
                                render: (item) => (
                                    <button
                                        key={item.post.id}
                                        className='p-1 bg-red-600 text-white text-xs rounded hover:bg-hoverButtonBackground transition duration-300'
                                        onClick={() => router.push(`/article/${item.post.custon_url ? item.post.custon_url : item.post.slug_title_post}`)}
                                    >
                                        Ver post
                                    </button>
                                ),
                            },
                        ]}
                    />
                </Suspense>
                {showCommentPopup && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="bg-white p-5 rounded shadow-lg w-96">
                            <h2 className="text-lg font-semibold mb-3 text-black">Ver comentario:</h2>
                            <p
                                className="text-black"
                            >
                                {editedValue}
                            </p>
                            <div className="flex justify-end mt-4 space-x-2">
                                <button
                                    onClick={() => setShowCommentPopup(null)}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-md"
                                >
                                    Sair
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Section>
        </SidebarAndHeader>
    )
}