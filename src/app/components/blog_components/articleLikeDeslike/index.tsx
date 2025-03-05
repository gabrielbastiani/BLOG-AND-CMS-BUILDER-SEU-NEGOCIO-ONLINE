"use client"

import { FaThumbsDown, FaThumbsUp } from "react-icons/fa";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { setupAPIClient } from "@/services/api";

interface ReactionPostProps {
    post_id: string;
    like: number;
    deslike: number;
}

export default function ArticleLikeDislike({
    post_id,
    like: initialLike,
    deslike: initialDislike,
}: ReactionPostProps) {
    const [like, setLike] = useState(initialLike);
    const [dislike, setDislike] = useState(initialDislike);
    const [loading, setLoading] = useState(false);

    const isValidUUID = (id: string) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    async function fetchUpdatedReactions() {
        if (!post_id || !isValidUUID(post_id)) {
            console.error("post_id inválido:", post_id);
            return;
        }
        try {
            const apiClient = setupAPIClient();
            const response = await apiClient.get(
                `/post/reload_data?post_id=${post_id}`
            );
            const { post_like: updatedLike, post_dislike: updatedDislike } = response.data;
            setLike(updatedLike);
            setDislike(updatedDislike);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        console.log("post_id recebido:", post_id);
        if (post_id) {
            fetchUpdatedReactions();
        }
    }, [post_id]);    

    const handleLikeDislike = async (isLike: boolean) => {
        if (loading) return; // Evita múltiplas requisições simultâneas
        setLoading(true);

        try {
            const apiClient = setupAPIClient();
            await apiClient.patch(`/post/likes`, {
                post_id: post_id,
                isLike,
            });
            await fetchUpdatedReactions();
        } catch (error) {
            toast.error("Erro ao registrar sua reação.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const formatLike = (like: number): string => {
        if (like >= 1_000_000) {
            return (like / 1_000_000).toFixed(1).replace(".0", "") + " Mi";
        }
        if (like >= 1_000) {
            return (like / 1_000).toFixed(1).replace(".0", "") + " Mil";
        }
        return like.toString();
    };

    const formatDislikes = (dislike: number): string => {
        if (dislike >= 1_000_000) {
            return (dislike / 1_000_000).toFixed(1).replace(".0", "") + " Mi";
        }
        if (dislike >= 1_000) {
            return (dislike / 1_000).toFixed(1).replace(".0", "") + " Mil";
        }
        return dislike.toString();
    };

    return (
        <div className="flex flex-col items-center mt-8 space-y-4">
            <h2 className="text-lg font-bold text-gray-700">
                Gostou ou não do conteúdo?
            </h2>
            <div className="flex items-center gap-6">
                <button
                    onClick={() => handleLikeDislike(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-hoverButtonBackground hover:text-white"
                        }`}
                    disabled={loading}
                >
                    <FaThumbsUp className="text-xl" />
                    <span className="font-medium">{formatLike(like)}</span>
                </button>
                <button
                    onClick={() => handleLikeDislike(false)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white"
                        }`}
                    disabled={loading}
                >
                    <FaThumbsDown className="text-xl" />
                    <span className="font-medium">{formatDislikes(dislike)}</span>
                </button>
            </div>
        </div>
    );
}