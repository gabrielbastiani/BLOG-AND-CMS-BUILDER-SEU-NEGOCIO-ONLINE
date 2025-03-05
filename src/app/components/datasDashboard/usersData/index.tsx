import { Bar } from 'react-chartjs-2';

interface UsersProps {
    userData: any;
}

export function UsersData({ userData }: UsersProps) {

    const userGrowthChartData = {
        labels: ['Diário', 'Semanal', 'Mensal'],
        datasets: [
            {
                label: 'Novos Usuários',
                data: userData
                    ? [userData.dailyGrowth, userData.weeklyGrowth, userData.monthlyGrowth]
                    : [0, 0, 0],
                backgroundColor: ['#36A2EB', '#4BC0C0', '#FFCE56'],
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Usuários do Blog Registrados</h2>
            <p className="text-black mt-3 mb-3">Total de usuários do blog: <b>{userData.totalUserBlog}</b></p>
            <h3 className="text-lg font-semibold text-black">Cadastros de usuários do blog por periodo</h3>
            <Bar data={userGrowthChartData} />
        </div>
    )
};