"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import { toast } from "react-toastify";
import { setupAPIClient } from "@/services/api";

const contactFormSchema = z.object({
  name_user: z.string().min(1, "O nome é obrigatório").max(50, "Máximo de 50 caracteres"),
  email_user: z.string().email("E-mail inválido"),
  subject: z.string().min(1, "O assunto é obrigatório").max(100, "Máximo de 100 caracteres"),
  message: z.string().min(1, "A mensagem é obrigatória").max(500, "Máximo de 500 caracteres"),
});

type ContactFormInputs = z.infer<typeof contactFormSchema>;

export default function ContactForm() {

  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!RECAPTCHA_SITE_KEY) {
    throw new Error("A variável NEXT_PUBLIC_RECAPTCHA_SITE_KEY não está definida.");
  }

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<ReCAPTCHA | null>(null);

  const onChangeCaptcha = (token: string | null) => {
    setRecaptchaToken(token);
  };

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
      if (!recaptchaToken) {
        toast.error("Por favor, verifique o reCAPTCHA.");
        return;
      }

      const apiClient = setupAPIClient();

      await apiClient.post(`/form_contact/create_form_contact`, {
        name_user: data.name_user,
        email_user: data.email_user,
        subject: data.subject,
        menssage: data.message
      });

      // Reseta o formulário
      reset();
      toast.success("Formulario enviado com sucesso.");
    } catch (error) {
      console.error("Erro ao enviar formulário:", error);
      toast.error("Erro ao enviar o formulario.")
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

      <div className="mb-4">
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={onChangeCaptcha}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-backgroundButton hover:bg-hoverButtonBackground text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </div>
    </form>
  );
};