import { Pie } from 'react-chartjs-2';

interface CommentProps {
    commentData: any;
}

export function CommentData({ commentData }: CommentProps) {

    const commentChartData = {
        labels: commentData.commentsByStatus?.map((status: any) => status.status),
        datasets: [
            {
                label: "Comentários por Status",
                data: commentData.commentsByStatus?.map((status: any) => status._count.id),
                backgroundColor: ["#FFCE56", "#4BC0C0", "#FF6384"],
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Comentários</h2>
            <p className="text-black mt-3 mb-3">Total de comentarios: <b>{commentData.totalComment}</b></p>
            <h3 className="text-lg font-semibold text-black">Comentários por status</h3>
            <Pie data={commentChartData} />
        </div>
    )
};