"use client"

import { Suspense } from 'react';
import DataTable from "@/app/components/dataTable";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import moment from "moment";
import { useState } from "react";
import { toast } from "react-toastify";

interface TagProps {
    id: string;
    tag_name: string;
    created_at: string | number | Date;
}

export default function All_tags() {

    const apiClient = setupAPIClient();

    const [all_tags, setAll_tags] = useState<TagProps[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [editingTag, setEditingTag] = useState<{ id: string, field: string } | null>(null);
    const [editedValue, setEditedValue] = useState<string>("");

    async function fetchTags({ page, limit, search, orderBy, orderDirection, startDate, endDate }: any) {
        try {
            const response = await apiClient.get(`/tag/all_tags`, {
                params: { page, limit, search, orderBy, orderDirection, startDate, endDate }
            });
            setAll_tags(response.data.tags);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.log(error);
        }
    }

    const handleSave = async (id: string) => {
        try {
            const data = {
                tag_name: editedValue,
                tag_id: id,
            };

            await apiClient.put(`/tag/update`, data);

            setAll_tags((prevTag) =>
                prevTag.map((ta) => (ta.id === id ? { ...ta, tag_name: editedValue } : ta))
            );

            setEditingTag(null);
            toast.success("Dado atualizado com sucesso");
        } catch (error) {
            console.log("Erro ao atualizar a tag:", error);
            toast.error("Erro ao atualizar o dado!!!");
        }
    };


    const handleEdit = (id: string, field: string, currentValue: string) => {
        setEditingTag({ id, field });
        setEditedValue(currentValue);
    };

    // ---- COLUNAS PARA EXPORTAÇÂO DE DADOS ---- //

    const availableColumns = ["tag_name", "created_at"];

    const customNames: any = {
        tag_name: "Nome da tag",
        created_at: "Data de cadastro"
    };

    // ---- SELECT PARA ORDENAÇÂO DOS ---- //

    const columnsOrder: any = [
        { key: "tag_name", label: "Nome da tag" },
        { key: "created_at", label: "Data de Criação" },
    ];

    const availableColumnsOrder: any = ["tag_name", "created_at"];

    const customNamesOrder: any = {
        tag_name: "Nome da Tag",
        created_at: "Data de Registro"
    };


    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="TODAS AS TAGS" />

                <Suspense fallback={<div>Carregando...</div>}>
                    <DataTable
                        timeFilterButton={true}
                        checkbox_delete={true}
                        active_buttons_searchInput_comments={false}
                        generate_excel_delete="/tag/download_excel_delete_tags?user_id"
                        delete_bulk_data="/tag/bulk_delete_tags?user_id"
                        modal_delete_bulk={true}
                        active_buttons_searchInput_notification={false}
                        active_export_data={true}
                        customNamesOrder={customNamesOrder}
                        availableColumnsOrder={availableColumnsOrder}
                        customNames={customNames}
                        name_file_export="Tags"
                        columnsOrder={columnsOrder}
                        availableColumns={availableColumns}
                        table_data="tag"
                        url_delete_data="/tag/delete_tag"
                        data={all_tags}
                        columns={[
                            {
                                key: "tag_name",
                                label: "Nome da Tag",
                                render: (item) => (
                                    <>
                                        {editingTag?.id === item.id && editingTag?.field === "tag_name" ? (
                                            <input
                                                key={item.id}
                                                type="text"
                                                value={editedValue}
                                                onChange={(e) => setEditedValue(e.target.value)}
                                                onBlur={() => handleSave(item.id)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        handleSave(item.id);
                                                    }
                                                }}
                                                className="border-gray-300 rounded-md p-1 text-black"
                                            />
                                        ) : (
                                            <span
                                                key={item.id}
                                                onClick={() => handleEdit(item.id, "tag_name", item.tag_name)}
                                                className="cursor-pointer hover:underline text-white truncate max-w-44"
                                            >
                                                {item.tag_name}
                                            </span>
                                        )}
                                    </>
                                ),
                            },
                            {
                                key: "created_at",
                                label: "Data de Criação",
                                render: (item) => (
                                    <span>{moment(item.created_at).format('DD/MM/YYYY HH:mm')}</span>
                                ),
                            },
                        ]}
                        totalPages={totalPages}
                        onFetchData={fetchTags}
                    />
                </Suspense>
            </Section>
        </SidebarAndHeader>
    )
}