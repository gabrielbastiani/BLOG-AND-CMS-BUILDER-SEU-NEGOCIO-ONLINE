"use client";
import { setupAPIClient } from "@/services/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const contactFormSchema = z.object({
    email_user: z.string().email("E-mail inválido"),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export function Newsletter() {

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ContactFormInputs>({
        resolver: zodResolver(contactFormSchema),
    });

    async function onSubmit(data: ContactFormInputs) {
        try {
            const apiClient = setupAPIClient();

            await apiClient.post(`/newsletter/create_newsletter`, {
                email_user: data.email_user
            });

            reset();
            toast.success("Cadastrado com sucesso.");
        } catch (error) {
            console.error("Erro ao enviar formulário:", error);
            toast.error("Erro ao cadastrar o formulario.")
        }
    };

    return (
        <section className="bg-gray-500 py-12">
            <div className="container mx-auto text-center">
                <h2 className="text-xl font-semibold mb-4">Assine nossa Newsletter</h2>
                <p className="text-black mb-6">Receba as últimas notícias direto no seu email!</p>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex justify-center gap-4"
                >
                    <input
                        type="email"
                        placeholder="Seu email"
                        {...register("email_user")}
                        className="text-black p-3 w-1/2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />
                    <button type="submit" className="p-3 bg-backgroundButton text-white rounded-lg hover:bg-hoverButtonBackground">
                        Inscrever-se
                    </button>
                </form>
            </div>
        </section>
    )
}