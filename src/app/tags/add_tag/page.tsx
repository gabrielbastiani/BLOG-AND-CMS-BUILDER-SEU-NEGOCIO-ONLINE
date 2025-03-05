"use client"

import { BulkDatas } from "@/app/components/bulkDatas";
import { Input } from "@/app/components/input";
import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { AuthContext } from "@/contexts/AuthContext";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const schema = z.object({
    tag_name: z.string().nonempty("O campo é obrigatório")
});

type FormData = z.infer<typeof schema>;

export default function Add_tag() {

    const { user } = useContext(AuthContext);

    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        mode: "onChange",
    });

    async function onSubmit(data: FormData) {
        setLoading(true);

        try {
            const apiClient = setupAPIClient();
            await apiClient.post('/tag/create_tag', {
                tag_name: data.tag_name
            });

            toast.success('Cadastro de tag feito com sucesso!');
            reset({ tag_name: "" });
        } catch (error) {
            if (error instanceof Error && 'response' in error && error.response) {
                console.log((error as any).response.data);
                toast.error('Ops, erro ao cadastrara tag.');
            } else {
                console.error(error);
                toast.error('Erro ao cadastrar.');
            }
            reset({ tag_name: "" });
        } finally {
            setLoading(false);
        }
    }



    return (
        <SidebarAndHeader>
            <Section>
                <TitlePage title="ADICIONAR TAG" />

                <div className="flex flex-col space-y-6 w-full max-w-md md:max-w-none">

                    <Input
                        styles="border-2 rounded-md h-12 px-3 w-full max-w-sm"
                        type="text"
                        placeholder="Nome da tag..."
                        name="tag_name"
                        error={errors.tag_name?.message}
                        register={register}
                    />

                    <button
                        onClick={handleSubmit(onSubmit)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSubmit(onSubmit);
                            }
                        }}
                        className="w-full md:w-80 px-6 py-3 bg-backgroundButton text-white rounded hover:bg-hoverButtonBackground transition duration-300"
                    >
                        {loading ? "Cadastrando..." : "Cadastrar"}
                    </button>

                    {user?.role === "SUPER_ADMIN" ?
                        <>
                            <hr />

                            <BulkDatas
                                link_donwload="/tag/donwload_excel_tag?user_id"
                                name_file="modelo_tags.xlsx"
                                link_register_data="/tag/bulk_tags?user_id"
                            />
                        </>
                        :
                        null
                    }
                </div>
            </Section>
        </SidebarAndHeader>
    )
}