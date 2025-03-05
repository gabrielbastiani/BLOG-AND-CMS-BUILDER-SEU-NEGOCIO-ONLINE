

export function Categories() {
    return (
        <section className="container mx-auto my-12">
            <h2 className="text-xl font-semibold mb-6">Categorias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {['Tecnologia', 'Saúde', 'Negócios', 'Esportes'].map((category, index) => (
                    <div
                        key={index}
                        className="p-4 bg-cover bg-center h-32 flex items-center justify-center text-white text-lg font-bold rounded-lg shadow-md hover:shadow-lg"
                        style={{ backgroundImage: `url(/images/category${index + 1}.jpg)` }}
                    >
                        {category}
                    </div>
                ))}
            </div>
        </section>
    )
}