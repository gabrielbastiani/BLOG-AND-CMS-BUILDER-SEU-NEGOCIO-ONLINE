import { Suspense } from "react";
import { ReactNode, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import OrderSelect from "../../dataTable/orderSelect";
import PaginationControls from "../../dataTable/paginationControls";
import SearchInput from "../../dataTable/searchInput";

interface DataProps {
    active_buttons_searchInput_notification: boolean;
    active_buttons_searchInput_comments: boolean;
    children: ReactNode;
    customNamesOrder: {};
    availableColumnsOrder: string[];
    columnsOrder: any;
    availableColumns: string[];
    customNames?: {};
    table_data: string;
    url_item_router?: string;
    data: any[];
    totalPages: number;
    onFetchData: (
        params: {
            page: number;
            limit: number;
            search: string;
            orderBy: string;
            orderDirection: string,
        }) => void;
}

function Params_nav_blog({
    active_buttons_searchInput_notification,
    active_buttons_searchInput_comments,
    children,
    availableColumnsOrder,
    customNamesOrder,
    columnsOrder,
    totalPages,
    onFetchData,
}: DataProps) {

    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [orderBy, setOrderBy] = useState("created_at");
    const [orderDirection, setOrderDirection] = useState("desc");
    const [limit, setLimit] = useState(Number(searchParams.get("limit")) || 6);
    const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);

    useEffect(() => {
        const initialSearch = searchParams.get("search") || "";
        const initialOrderBy = searchParams.get("orderBy") || "created_at";
        const initialOrderDirection = searchParams.get("orderDirection") || "desc";
        const initialLimit = Number(searchParams.get("limit")) || 6;
        const initialCurrentPage = Number(searchParams.get("page")) || 1;

        setSearch(initialSearch);
        setOrderBy(initialOrderBy);
        setOrderDirection(initialOrderDirection);
        setLimit(initialLimit);
        setCurrentPage(initialCurrentPage);

    }, [searchParams]);

    const updateUrlParams = () => {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (orderBy) params.set("orderBy", orderBy);
        if (orderDirection) params.set("orderDirection", orderDirection);
        if (limit) params.set("limit", limit.toString());
        if (currentPage) params.set("page", currentPage.toString());

        router.replace(`?${params.toString()}`);
    };

    useEffect(() => {
        updateUrlParams();
    }, [search, orderBy, orderDirection, limit, currentPage]);

    useEffect(() => {
        onFetchData({ page: currentPage, limit, search, orderBy, orderDirection });
    }, [currentPage, limit, orderBy, orderDirection, search]);

    function handleLimitChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setLimit(Number(e.target.value));
        setCurrentPage(1);
    }

    function handleResetFilters() {
        setSearch("");
        setOrderBy("created_at");
        setOrderDirection("desc");
        setLimit(6);
        setCurrentPage(1);
        router.replace("");
    }

    return (
        <Suspense fallback={<p>Carregando...</p>}>
            <div className="container mx-auto my-12 px-4">
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex justify-center sm:justify-between w-full sm:w-80 space-x-2">
                        <SearchInput
                            active_buttons_searchInput_notification={active_buttons_searchInput_notification}
                            active_buttons_searchInput_comments={active_buttons_searchInput_comments}
                            value={search}
                            onChange={setSearch}
                            onReset={handleResetFilters}
                        />
                    </div>

                    <div className="flex items-center w-full sm:w-auto">
                        <OrderSelect
                            orderBy={orderBy}
                            orderDirection={orderDirection}
                            columns={columnsOrder}
                            onOrderByChange={setOrderBy}
                            onOrderDirectionChange={setOrderDirection}
                            availableColumns={availableColumnsOrder}
                            customNames={customNamesOrder}
                        />
                    </div>
                </div>
            </div>

            {children}

            {/* Paginação */}
            <div className="container mx-auto my-12 px-4">
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex justify-center sm:justify-between w-full sm:w-80 space-x-2">
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 bg-gray-300 rounded disabled:opacity-50 text-black w-full sm:w-auto"
                        >
                            Anterior
                        </button>
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-2 bg-gray-300 rounded disabled:opacity-50 text-black w-full sm:w-auto"
                        >
                            Próxima
                        </button>
                    </div>
                    <div className="flex items-center w-full sm:w-auto">
                        <label htmlFor="limit" className="mr-2 text-black">Itens por página:</label>
                        <select
                            id="limit"
                            value={limit}
                            onChange={handleLimitChange}
                            className="border p-2 rounded text-black"
                        >
                            <option value="6">6</option>
                            <option value="10">12</option>
                            <option value="20">18</option>
                        </select>
                    </div>
                </div>
            </div>
        </Suspense>
    );
}

export default Params_nav_blog;