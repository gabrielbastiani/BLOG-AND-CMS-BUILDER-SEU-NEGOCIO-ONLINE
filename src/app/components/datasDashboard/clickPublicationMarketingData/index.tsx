"use client";

import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { useEffect, useState } from 'react';
import { setupAPIClient } from '@/services/api';
import { FilterDateClickPublication } from './filterDateClickPublication';

interface PublicationClick {
    date: string;
    title: string;
    clicks: number;
}

interface CliciksMetrics {
    dailyClicks: PublicationClick[];
    weeklyClick: PublicationClick[];
    monthlyClick: PublicationClick[];
}

interface ClickMarketingProps {
    publicationsClickMetrics: CliciksMetrics;
}

export function ClickPublicationMarketingData({ publicationsClickMetrics }: ClickMarketingProps) {

    const [chartData, setChartData] = useState<any>(null);

    const fetchFilteredClick = async (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return;

        const apiClient = setupAPIClient();
        const { data } = await apiClient.get(`/dashboard/publication_marketing/views-by-date`, {
            params: { startDate, endDate },
        });

        // Se for um array, processa os dados
        if (Array.isArray(data)) {
            processChartData(data);
        } else {
            console.error("A resposta da API não é um array válido:", data);
        }
    };

    const processChartData = (data: PublicationClick[]) => {
        const groupedData: Record<string, Record<string, number>> = {};

        data.forEach(({ date, title, clicks }) => {
            if (!groupedData[date]) groupedData[date] = {};
            groupedData[date][title] = clicks;
        });

        const labels = Object.keys(groupedData); // Datas no eixo X
        const publicationsTitles = Array.from(new Set(data.map((pub) => pub.title))); // Títulos dos posts

        const datasets = publicationsTitles.map((title) => ({
            label: title,
            data: labels.map((date) => groupedData[date][title] || 0), // Valores para cada data
            backgroundColor: getRandomColor(),
        }));

        setChartData({ labels, datasets });
    };

    useEffect(() => {
        if (publicationsClickMetrics) {
            const allViews = [
                ...publicationsClickMetrics.dailyClicks,
                ...publicationsClickMetrics.weeklyClick,
                ...publicationsClickMetrics.monthlyClick,
            ];
            processChartData(allViews);
        }
    }, [publicationsClickMetrics]);


    useEffect(() => {
        if (publicationsClickMetrics?.dailyClicks) {
            processChartData(publicationsClickMetrics.dailyClicks);
        }
    }, [publicationsClickMetrics]);

    const chartOptionsFilter: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
        },
        scales: {
            x: { ticks: { font: { size: 10 } } },
            y: { ticks: { font: { size: 10 } } },
        },
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            x: {
                ticks: {
                    font: { size: 10 },
                },
            },
            y: {
                ticks: {
                    font: { size: 10 },
                },
            },
        },
    };

    const dailyClickChartData = publicationsClickMetrics
        ? {
            labels: publicationsClickMetrics.dailyClicks.map((publication: { title: any; }) => publication.title),
            datasets: [
                {
                    label: 'Cliques Diários',
                    data: publicationsClickMetrics.dailyClicks.map((publication: { clicks: any; }) => publication.clicks),
                    backgroundColor: '#FF6384',
                },
            ],
        }
        : null;

    const weeklyClickChartData = publicationsClickMetrics
        ? {
            labels: publicationsClickMetrics.weeklyClick.map((publication: { title: any; }) => publication.title),
            datasets: [
                {
                    label: 'Cliques Semanais',
                    data: publicationsClickMetrics.weeklyClick.map((publication: { clicks: any; }) => publication.clicks),
                    backgroundColor: '#36A2EB',
                },
            ],
        }
        : null;

    const monthlyClickChartData = publicationsClickMetrics
        ? {
            labels: publicationsClickMetrics.monthlyClick.map((publication: { title: any; }) => publication.title),
            datasets: [
                {
                    label: 'Cliques Mensais',
                    data: publicationsClickMetrics.monthlyClick.map((publication: { clicks: any; }) => publication.clicks),
                    backgroundColor: '#FFCE56',
                },
            ],
        }
        : null;

    return (
        <div className="bg-white shadow-md rounded-lg p-4">

            <h2 className="text-lg font-semibold text-black mb-4">Cliques em Publicidades</h2>

            <FilterDateClickPublication onFilter={fetchFilteredClick} />

            <div className="rounded-md border p-3" style={{ height: "350px" }}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Visualizações por Data e Publicação
                </h4>
                {chartData ? <Bar data={chartData} options={chartOptionsFilter} /> : <p>Selecione um intervalo de datas.</p>}
            </div>

            <div className="space-y-4">
                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Cliques Diários</h4>
                    {dailyClickChartData && <Bar data={dailyClickChartData} options={chartOptions} />}
                </div>

                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Cliques Semanais</h4>
                    {weeklyClickChartData && <Bar data={weeklyClickChartData} options={chartOptions} />}
                </div>

                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Cliques Mensais</h4>
                    {monthlyClickChartData && <Bar data={monthlyClickChartData} options={chartOptions} />}
                </div>
            </div>
        </div>
    )
};

const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;