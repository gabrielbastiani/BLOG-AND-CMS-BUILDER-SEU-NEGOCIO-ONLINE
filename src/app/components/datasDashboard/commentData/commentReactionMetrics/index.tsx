import { Bar } from 'react-chartjs-2';

interface ReactCommentProps {
    commentReactionData: any;
}

export const CommentReactionMetrics = ({ commentReactionData }: ReactCommentProps) => {

    const chartData = {
        labels: commentReactionData.map((comment: { comment: any; }) => `Comment ${comment.comment}`),
        datasets: [
            {
                label: 'Likes',
                data: commentReactionData.map((comment: { comment_like: any; }) => comment.comment_like),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
                label: 'Dislikes',
                data: commentReactionData.map((comment: { comment_dislike: any; }) => comment.comment_dislike),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Reações de Comentários</h2>
            <Bar data={chartData} />
        </div>
    );
};