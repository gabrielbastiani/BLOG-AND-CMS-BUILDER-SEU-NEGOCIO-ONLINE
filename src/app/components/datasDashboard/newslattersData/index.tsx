import { Bar } from 'react-chartjs-2';

interface NewsProps {
    newsletterData: any;
}

export function NewslattersData({ newsletterData }: NewsProps) {

    const newsletterChartData = {
        labels: ['Hoje', 'Esta Semana', 'Este Mês'],
        datasets: [
            {
                label: 'Newsletters Registradas',
                data: [
                    newsletterData.dailyCount || 0,
                    newsletterData.weeklyCount || 0,
                    newsletterData.monthlyCount || 0,
                ],
                backgroundColor: ['#FFCE56', '#4BC0C0', '#FF6384'],
            },
        ],
    };

    return (
        <div className="chart bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-black mb-4">Newsletters</h2>
            <p className="text-black mt-3 mb-3">Total de newsletters: <b>{newsletterData.totalNewslatters}</b></p>
            <h3 className="text-lg font-semibold text-black">Newslatters por periodo</h3>
            <Bar data={newsletterChartData} />
        </div>
    )
};