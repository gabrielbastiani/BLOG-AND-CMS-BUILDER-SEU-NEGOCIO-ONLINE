import { Pie } from 'react-chartjs-2';

interface PostProps {
    postData: any;
}

export function PostData({ postData }: PostProps) {

    const postChartData = {
        labels: postData.postsByStatus?.map((status: any) => status.status),
        datasets: [
            {
                label: "Artigos por Status",
                data: postData.postsByStatus?.map((status: any) => status._count.id),
                backgroundColor: ["#FF6384", "#36A2EB"],
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Artigos</h2>
            <p className="text-black mt-3 mb-3">Total de posts cadastrados: <b>{postData.totalPosts}</b></p>
            <h3 className="text-lg font-semibold text-black">Artigos por status</h3>
            <Pie data={postChartData} />
        </div>
    )
};