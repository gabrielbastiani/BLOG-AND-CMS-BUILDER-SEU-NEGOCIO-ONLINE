import { Bar } from 'react-chartjs-2';

interface ReactPostProps {
    postReactionData: any;
}

export const PostReactionMetrics = ({ postReactionData }: ReactPostProps) => {
    const chartData = {
        labels: postReactionData.map((post: { title: any; }) => `Post ${post.title}`),
        datasets: [
            {
                label: 'Likes',
                data: postReactionData.map((post: { post_like: any; }) => post.post_like),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            },
            {
                label: 'Dislikes',
                data: postReactionData.map((post: { post_dislike: any; }) => post.post_dislike),
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Reações de Artigos</h2>
            <Bar data={chartData} />
        </div>
    );
};