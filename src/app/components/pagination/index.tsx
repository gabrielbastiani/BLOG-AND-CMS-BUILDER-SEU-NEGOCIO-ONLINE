import { useRouter } from "next/navigation";

interface PageProps {
    totalPages: number;
    currentPage: number;
}

export function Pagination({ currentPage, totalPages }: PageProps) {

    const router = useRouter();

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        router.push(`/user/all_users?page=${page}`);
    };

    return (
        <div className="flex justify-center mt-6 space-x-2">
            <button
                className="px-4 py-2 bg-foreground rounded-md text-black disabled:opacity-50 transition duration-200 hover:bg-opacity-80"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                Anterior
            </button>

            {(() => {
                const maxVisiblePages = 10;
                const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
                const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1);

                return [...Array(endPage - adjustedStartPage + 1)].map((_, i) => {
                    const pageNumber = adjustedStartPage + i;
                    return (
                        <button
                            key={pageNumber}
                            className={`px-4 py-2 mx-1 rounded-md transition duration-200 ${currentPage === pageNumber ? "bg-backgroundButton text-white" : "bg-activeLink text-black hover:bg-opacity-70"}`}
                            onClick={() => handlePageChange(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    );
                });
            })()}

            <button
                className="px-4 py-2 bg-foreground rounded-md text-black disabled:opacity-50 transition duration-200 hover:bg-opacity-80"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                Próximo
            </button>
        </div>
    )
}