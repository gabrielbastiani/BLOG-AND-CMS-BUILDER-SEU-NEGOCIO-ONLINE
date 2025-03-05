"use client";

import { Bar } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';
import { useEffect, useState } from 'react';
import { setupAPIClient } from '@/services/api';
import { FilterDateViewsPost } from './filterDateViewsPost';

interface PostView {
    date: string;
    title: string;
    views: number;
}

interface ViewsMetrics {
    dailyViews: PostView[];
    weeklyViews: PostView[];
    monthlyViews: PostView[];
}

interface ViewsProps {
    postViewsMetrics: ViewsMetrics;
}

export function ViewsPostsData({ postViewsMetrics }: ViewsProps) {

    const [chartData, setChartData] = useState<any>(null);

    const fetchFilteredViews = async (startDate: string, endDate: string) => {
        if (!startDate || !endDate) return;

        const apiClient = setupAPIClient();
        const { data } = await apiClient.get("/dashboard/posts/views-by-date", {
            params: { startDate, endDate },
        });

        // Se for um array, processa os dados
        if (Array.isArray(data)) {
            processChartData(data);
        } else {
            console.error("A resposta da API não é um array válido:", data);
        }
    };

    const processChartData = (data: PostView[]) => {
        const groupedData: Record<string, Record<string, number>> = {};

        data.forEach(({ date, title, views }) => {
            if (!groupedData[date]) groupedData[date] = {};
            groupedData[date][title] = views;
        });

        const labels = Object.keys(groupedData); // Datas no eixo X
        const postTitles = Array.from(new Set(data.map((post) => post.title))); // Títulos dos posts

        const datasets = postTitles.map((title) => ({
            label: title,
            data: labels.map((date) => groupedData[date][title] || 0), // Valores para cada data
            backgroundColor: getRandomColor(),
        }));

        setChartData({ labels, datasets });
    };

    useEffect(() => {
        if (postViewsMetrics) {
            const allViews = [
                ...postViewsMetrics.dailyViews,
                ...postViewsMetrics.weeklyViews,
                ...postViewsMetrics.monthlyViews,
            ];
            processChartData(allViews);
        }
    }, [postViewsMetrics]);


    useEffect(() => {
        if (postViewsMetrics?.dailyViews) {
            processChartData(postViewsMetrics.dailyViews);
        }
    }, [postViewsMetrics]);

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

    const dailyViewsChartData = postViewsMetrics
        ? {
            labels: postViewsMetrics.dailyViews.map((post: { title: any; }) => post.title),
            datasets: [
                {
                    label: 'Visualizações Diárias',
                    data: postViewsMetrics.dailyViews.map((post: { views: any; }) => post.views),
                    backgroundColor: '#FF6384',
                },
            ],
        }
        : null;

    const weeklyViewsChartData = postViewsMetrics
        ? {
            labels: postViewsMetrics.weeklyViews.map((post: { title: any; }) => post.title),
            datasets: [
                {
                    label: 'Visualizações Semanais',
                    data: postViewsMetrics.weeklyViews.map((post: { views: any; }) => post.views),
                    backgroundColor: '#36A2EB',
                },
            ],
        }
        : null;

    const monthlyViewsChartData = postViewsMetrics
        ? {
            labels: postViewsMetrics.monthlyViews.map((post: { title: any; }) => post.title),
            datasets: [
                {
                    label: 'Visualizações Mensais',
                    data: postViewsMetrics.monthlyViews.map((post: { views: any; }) => post.views),
                    backgroundColor: '#FFCE56',
                },
            ],
        }
        : null;

    return (
        <div className="bg-white shadow-md rounded-lg p-4">

            <h2 className="text-lg font-semibold text-black mb-4">Visualizações de Artigos</h2>

            <FilterDateViewsPost onFilter={fetchFilteredViews} />

            <div className="rounded-md border p-3" style={{ height: "350px" }}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Visualizações por Data e Artigo
                </h4>
                {chartData ? <Bar data={chartData} options={chartOptionsFilter} /> : <p>Selecione um intervalo de datas.</p>}
            </div>

            <div className="space-y-4">
                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualizações Diárias</h4>
                    {dailyViewsChartData && <Bar data={dailyViewsChartData} options={chartOptions} />}
                </div>

                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualizações Semanais</h4>
                    {weeklyViewsChartData && <Bar data={weeklyViewsChartData} options={chartOptions} />}
                </div>

                <div className="rounded-md border p-3" style={{ height: '250px' }}>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Visualizações Mensais</h4>
                    {monthlyViewsChartData && <Bar data={monthlyViewsChartData} options={chartOptions} />}
                </div>
            </div>
        </div>
    )
};

const getRandomColor = () =>
    `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`;