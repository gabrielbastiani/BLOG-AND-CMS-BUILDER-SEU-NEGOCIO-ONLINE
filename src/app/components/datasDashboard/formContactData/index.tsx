import { Bar } from 'react-chartjs-2';

interface FormProps {
    contactData: any;
}

export function FormContactData({ contactData }: FormProps) {

    const contactChartData = {
        labels: ["Hoje", "Semana", "Mês"],
        datasets: [
            {
                label: "Formulários de Contato",
                data: [contactData.dailyCount, contactData.weeklyCount, contactData.monthlyCount],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Formulários de Contato</h2>
            <p className="text-black mt-3 mb-3">Total de formulários: <b>{contactData.totalFormContacts}</b></p>
            <h3 className="text-lg font-semibold text-black">Formulários por periodo</h3>
            <Bar data={contactChartData} />
        </div>
    )
};