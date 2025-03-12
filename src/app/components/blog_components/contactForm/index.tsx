"use client";

import dynamic from 'next/dynamic';
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";
const CognitiveChallenge = dynamic(
  () => import('../../../components/cognitiveChallenge/index').then(mod => mod.CognitiveChallenge),
  {
    ssr: false,
    loading: () => (
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        Carregando desafio de segurança...
      </div>
    )
  }
);

const contactFormSchema = z.object({
  name_user: z.string().min(1, "O nome é obrigatório").max(50, "Máximo de 50 caracteres"),
  email_user: z.string().email("E-mail inválido"),
  subject: z.string().min(1, "O assunto é obrigatório").max(100, "Máximo de 100 caracteres"),
  message: z.string().min(1, "A mensagem é obrigatória").max(500, "Máximo de 500 caracteres"),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export default function ContactForm() {

  const [cognitiveValid, setCognitiveValid] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInputs>({
    resolver: zodResolver(contactFormSchema),
  });

  async function onSubmit(data: ContactFormInputs) {

    if (!cognitiveValid) {
      toast.error('Complete o desafio de segurança antes de enviar');
      return;
    }

    setLoading(true);

    try {
      const apiClient = setupAPIClient();

      await apiClient.post(`/form_contact/create_form_contact`, {
        name_user: data.name_user,
        email_user: data.email_user,
        subject: data.subject,
        menssage: data.message
      });

      setLoading(false);

      reset();
      toast.success("Formulario enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar o formulario.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mt-20"
    >
      <div className="mb-4">
        <label htmlFor="name_user" className="block text-gray-700 text-sm font-bold mb-2">
          Nome
        </label>
        <input
          type="text"
          id="name_user"
          {...register("name_user")}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.name_user ? "border-red-500" : ""
            }`}
        />
        {errors.name_user && (
          <p className="text-red-500 text-xs italic">{errors.name_user.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="email_user" className="block text-gray-700 text-sm font-bold mb-2">
          E-mail
        </label>
        <input
          type="email"
          id="email_user"
          {...register("email_user")}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.email_user ? "border-red-500" : ""
            }`}
        />
        {errors.email_user && (
          <p className="text-red-500 text-xs italic">{errors.email_user.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="subject" className="block text-gray-700 text-sm font-bold mb-2">
          Assunto
        </label>
        <input
          type="text"
          id="subject"
          {...register("subject")}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.subject ? "border-red-500" : ""
            }`}
        />
        {errors.subject && (
          <p className="text-red-500 text-xs italic">{errors.subject.message}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="message" className="block text-gray-700 text-sm font-bold mb-2">
          Mensagem
        </label>
        <textarea
          id="message"
          rows={5}
          {...register("message")}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${errors.message ? "border-red-500" : ""
            }`}
        />
        {errors.message && (
          <p className="text-red-500 text-xs italic">{errors.message.message}</p>
        )}
      </div>

      <CognitiveChallenge
        onValidate={(isValid) => setCognitiveValid(isValid)}
      />

      <div className="flex items-center justify-between">
        <button
          type='submit'
          className={`bg-red-600 w-full rounded-md text-white h-10 font-medium ${!cognitiveValid ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          disabled={!cognitiveValid || loading}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
};