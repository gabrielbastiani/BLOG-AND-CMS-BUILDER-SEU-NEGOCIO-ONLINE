import { Bar } from 'react-chartjs-2';

interface CategoryProp {
    categoryData: any;
}

export function CategoriesData({ categoryData }: CategoryProp) {

    const subcategoriesChartData = {
        labels: categoryData.subcategories?.map((group: any) => group.parentName),
        datasets: [
            {
                label: 'Subcategorias',
                data: categoryData.subcategories?.map((group: any) => group._count.id),
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
            },
        ],
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black">Categorias</h2>
            <p className="text-black mt-3 mb-3">Total de categorias cadastradas: <b>{categoryData.totalCategories}</b></p>
            <h3 className="text-lg font-semibold text-black">Subcategorias por Categoria Pai</h3>
            <Bar data={subcategoriesChartData} />
        </div>
    )
};