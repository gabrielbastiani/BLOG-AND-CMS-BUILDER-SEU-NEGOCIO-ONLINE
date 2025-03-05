"use client"

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface SEOSettings {
    id: string;
    page: string;
    title: string | null;
    created_at: string;
}

export default function SEOSettingsList() {

    const router = useRouter();
    
    const [seoSettings, setSeoSettings] = useState<SEOSettings[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadSeoSettings() {
            try {
                const apiClient = setupAPIClient();
                const response = await apiClient.get("/seo/all_seos");

                setSeoSettings(response.data);
                setError(null);
            } catch (err) {
                setError("Erro ao carregar configurações SEO");
                toast.error("Erro ao carregar configurações");
            } finally {
                setLoading(false);
            }
        }

        loadSeoSettings();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <SidebarAndHeader>
                <Section>
                    <TitlePage title="Configurações SEO" />
                    <div className="text-center py-8">Carregando...</div>
                </Section>
            </SidebarAndHeader>
        );
    }

    if (error) {
        return (
            <SidebarAndHeader>
                <Section>
                    <TitlePage title="Configurações SEO" />
                    <div className="text-center text-red-500 py-8">{error}</div>
                </Section>
            </SidebarAndHeader>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="w-full table-auto">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Página</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Título SEO</th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Data de Criação</th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">Ações</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {seoSettings.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                Nenhuma configuração SEO encontrada
                            </td>
                        </tr>
                    ) : (
                        seoSettings.map((setting) => (
                            <tr key={setting.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {setting.page}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {setting.title || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {formatDate(setting.created_at)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            onClick={() => router.push(`/configurations/seo_pages/${setting.id}`)}
                                        >
                                            Editar
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}