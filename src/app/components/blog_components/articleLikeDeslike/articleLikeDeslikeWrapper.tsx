import { setupAPIClient } from "@/services/api";
import ArticleLikeDislike from "."; 

interface WrapperProps {
    post_id: string;
}

async function getInitialReactions(post_id: string) {
    try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get(
            `/post/reload_data?post_id=${post_id}`
        );
        return {
            initialLike: response.data.post_like,
            initialDislike: response.data.post_dislike
        };
    } catch (error) {
        console.error("Error fetching initial reactions:", error);
        return { initialLike: 0, initialDislike: 0 };
    }
}

export default async function ArticleLikeDislikeWrapper({ post_id }: WrapperProps) {
    const { initialLike, initialDislike } = await getInitialReactions(post_id);
    
    return (
        <ArticleLikeDislike
            post_id={post_id}
            like={initialLike}
            deslike={initialDislike}
        />
    );
}