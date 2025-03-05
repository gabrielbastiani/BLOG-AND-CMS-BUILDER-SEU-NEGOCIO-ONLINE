"use client";

import { useContext, useEffect, useState } from "react";
import Image from "next/image";
import { FaThumbsUp, FaThumbsDown, FaReply } from "react-icons/fa";
import { AuthContextBlog } from "@/contexts/AuthContextBlog";
import no_user from "../../../../assets/no-user.jpg";
import { ModalLogin } from "../popups/modalLogin";
import { ModalEditUser } from "../popups/modalEditUser";
import { ModalCreateUser } from "../popups/modalCreateUser";
import { setupAPIClient } from "@/services/api";
import { toast } from "react-toastify";
import moment from "moment";

interface CommentsProps {
    parentId: string;
    id: string;
    post_id: string;
    userBlog_id: string;
    userBlog: any;
    name_user: string;
    image_user: string;
    comment: string;
    replies: CommentsProps[];
    comment_like: number;
    comment_dislike: number;
    created_at: string | number | Date;
}

interface CommentProps {
    post_id: string;
}

export function CommentsSection({ post_id }: CommentProps) {
    const { isAuthenticated, user } = useContext(AuthContextBlog);

    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!RECAPTCHA_SITE_KEY) {
        throw new Error(
            "A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida."
        );
    }

    const [comments, setComments] = useState<CommentsProps[]>([]);
    const [newComment, setNewComment] = useState<string>("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [modalLogin, setModalLogin] = useState(false);
    const [modalEditUser, setModalEditUser] = useState(false);
    const [modalCreateUser, setModalCreateUser] = useState(false);

    function organizeComments(comments: CommentsProps[]): CommentsProps[] {
        const commentMap = new Map<string, CommentsProps>();

        comments.forEach((comment) => {
            comment.replies = [];
            commentMap.set(comment.id, comment);
        });

        const organized: CommentsProps[] = [];

        comments.forEach((comment) => {
            if (comment.parentId) {
                const parent = commentMap.get(comment.parentId);
                if (parent) parent.replies.push(comment);
            } else {
                organized.push(comment);
            }
        });

        return organized;
    }

    const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    useEffect(() => {
        async function loadCommentsPost() {
            if (!post_id || !isValidUUID(post_id)) {
                console.error("post_id inválido:", post_id);
                return;
            }
            try {
                const apiClient = setupAPIClient();
                const response = await apiClient.get(
                    `/comment/get_comments/post?post_id=${post_id}`
                );
                const organized = organizeComments(response.data);
                setComments(organized);
            } catch (error) {
                console.error(error);
            }
        }
        loadCommentsPost();
    }, [post_id]);

    async function loadCommentsPost() {
        if (!post_id || !isValidUUID(post_id)) {
            console.error("post_id inválido:", post_id);
            return;
        }
        try {
            const apiClient = setupAPIClient();
            const response = await apiClient.get(
                `/comment/get_comments/post?post_id=${post_id}`
            );
            const organized = organizeComments(response.data);
            setComments(organized);
        } catch (error) {
            console.error(error);
        }
    }

    const handleLikeDislike = async (id: string, isLike: boolean) => {
        try {
            const apiClient = setupAPIClient();
            await apiClient.patch(`/comment/likes`, {
                comment_id: id,
                isLike,
            });
            loadCommentsPost();
        } catch (error) {
            toast.error("Erro ao registrar sua reação.");
            console.error(error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!newComment.trim()) return;

        try {
            const apiClient = setupAPIClient();
            await apiClient.post("/comment/create_comment", {
                post_id: post_id,
                userBlog_id: user?.id,
                name_user: user?.name,
                image_user: user?.image_user,
                comment: newComment,
                parentId: replyingTo
            });
            setNewComment("");
            setReplyingTo(null);
            toast.warning("Comentário enviado para analise do administrador!");
            loadCommentsPost();
        } catch (error) {
            toast.error("Erro ao enviar comentário.");
            console.error(error);
        }
    };

    const CommentItem = ({ comment, nivel = 0 }: { comment: CommentsProps; nivel?: number }) => {

        const [isReplying, setIsReplying] = useState(false);
        const [replyContent, setReplyContent] = useState("");

        const handleReplyClick = () => {
            setIsReplying(!isReplying);
        };

        const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setReplyContent(e.target.value);
        };

        const handleReplySubmit = async () => {
            if (!replyContent.trim()) {
                toast.error("Digite uma resposta válida.");
                return;
            }

            try {
                const apiClient = setupAPIClient();
                const { data: newReply } = await apiClient.post(`/comment/create_comment`, {
                    post_id: comment.post_id,
                    userBlog_id: user?.id,
                    name_user: user?.name,
                    image_user: user?.image_user,
                    comment: replyContent,
                    parentId: comment.id,
                });

                setComments((prevComments) =>
                    prevComments.map((c) =>
                        c.id === comment.id
                            ? {
                                ...c,
                                replies: [...(c.replies || []), newReply],
                            }
                            : c
                    )
                );

                setReplyContent("");
                setIsReplying(false);
                toast.warning("Resposta enviada para analise do administrador!");
                loadCommentsPost();
            } catch (error) {
                console.error(error);
                toast.error("Erro ao enviar a resposta.");
            }
        };

        const formatLike = (comment_like: number): string => {
            if (comment_like >= 1_000_000) {
                return (comment_like / 1_000_000).toFixed(1).replace(".0", "") + " Mi";
            }
            if (comment_like >= 1_000) {
                return (comment_like / 1_000).toFixed(1).replace(".0", "") + " Mil";
            }
            return comment_like.toString();
        };

        const formatDislikes = (comment_dislike: number): string => {
            if (comment_dislike >= 1_000_000) {
                return (comment_dislike / 1_000_000).toFixed(1).replace(".0", "") + " Mi";
            }
            if (comment_dislike >= 1_000) {
                return (comment_dislike / 1_000).toFixed(1).replace(".0", "") + " Mil";
            }
            return comment_dislike.toString();
        };

        return (
            <div className={`ml-${nivel * 4} border-l pl-4 mb-4`}>
                <div className="flex items-start mb-2">
                    <Image
                        src={comment.image_user ? `${API_URL}files/${comment.image_user}` : no_user}
                        alt={comment.name_user}
                        width={40}
                        height={40}
                        className="rounded-full"
                    />
                    <div className="ml-2">
                        <h4 className="font-semibold text-black">{comment.name_user}</h4>
                        <p className="text-gray-600 text-xs mb-2">{moment(comment.created_at).format('DD/MM/YYYY HH:mm')}</p>
                        <p className="text-gray-600 text-sm">{comment.comment}</p>
                        <div className="mt-2 flex space-x-4">
                            <button
                                onClick={() => handleLikeDislike(comment.id, true)}
                                className="flex items-center text-gray-600 hover:text-blue-500"
                            >
                                <FaThumbsUp className="mr-1" />
                                {formatLike(comment.comment_like)}
                            </button>
                            <button
                                onClick={() => handleLikeDislike(comment.id, false)}
                                className="flex items-center text-gray-600 hover:text-red-500"
                            >
                                <FaThumbsDown className="mr-1" />
                                {formatDislikes(comment.comment_dislike)}
                            </button>
                            <button
                                onClick={handleReplyClick}
                                className="flex items-center text-gray-600 hover:text-green-500"
                            >
                                <FaReply className="mr-1" />
                                Responder
                            </button>
                        </div>
                    </div>
                </div>
                {isReplying && (
                    <>
                        {isAuthenticated && (
                            <div className="ml-8 mt-4">
                                <textarea
                            value={replyContent}
                            onChange={handleReplyChange}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-md text-black"
                            placeholder="Escreva sua resposta..."
                        />
                        <button
                            onClick={handleReplySubmit}
                            className="mb-5 mt-2 px-4 py-2 bg-backgroundButton text-white rounded-md hover:hoverButtonBackground"
                        >
                            Enviar Resposta
                        </button>
                        </div>
                        )}
                    </>        
                )}
                {comment.replies?.map((reply) => (
                    <CommentItem key={reply.id} comment={reply} nivel={nivel + 1} />
                ))}
            </div>
        );
    };


    return (
        <div>
            <div className="flex justify-between mb-4">
                {!isAuthenticated && (
                    <div>
                        <button
                            onClick={() => setModalLogin(true)}
                            className="px-4 py-2 bg-backgroundButton text-white rounded-md hover:bg-hoverButtonBackground"
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setModalCreateUser(true)}
                            className="ml-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Cadastrar
                        </button>
                    </div>
                )}
                {isAuthenticated && (
                    <button
                        onClick={() => setModalEditUser(true)}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-400"
                    >
                        Editar Perfil
                    </button>
                )}
            </div>

            {comments.length >= 0 ? (
                <div className="mt-10">
                    <h2 className="text-lg font-semibold text-black mb-4">Comentários:</h2>
                    {isAuthenticated ? (
                        <div className="mb-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                rows={4}
                                className="w-full p-4 border border-gray-300 rounded-md text-black"
                                placeholder="Escreva seu comentário..."
                            />
                            <button
                                onClick={handleCommentSubmit}
                                className="mt-2 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-300"
                            >
                                Enviar
                            </button>
                        </div>
                    ) : (
                        <p className="text-black mb-5">Faça login para comentar.</p>
                    )}
                    {comments.map((comment) => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            ) : (
                <p className="text-red-400 mb-6">Nenhum comentário disponível...</p>
            )}

            <div>
                {modalLogin && <ModalLogin onClose={() => setModalLogin(false)} />}
                {modalEditUser && <ModalEditUser onClose={() => setModalEditUser(false)} />}
                {modalCreateUser && (
                    <ModalCreateUser
                        onClose={() => setModalCreateUser(false)}
                        loginModal={() => setModalLogin(true)}
                    />
                )}
            </div>
        </div>
    )
}
