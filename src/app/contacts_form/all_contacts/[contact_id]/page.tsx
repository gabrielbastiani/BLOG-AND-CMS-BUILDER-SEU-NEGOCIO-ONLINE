"use client"

import { Section } from "@/app/components/section";
import { SidebarAndHeader } from "@/app/components/sidebarAndHeader";
import { TitlePage } from "@/app/components/titlePage";
import { setupAPIClient } from "@/services/api";
import { useEffect, useState } from "react";
import { RiMailSendLine } from "react-icons/ri";
import { toast } from "react-toastify";

interface ContactProps {
    id: string;
    name_user: string;
    slug_name_user: string;
    email_user: string;
    subject: string;
    menssage: string;
    created_at: string;
}

export default function Contact_id({ params }: { params: { contact_id: string } }) {

    const [contactData, setContactData] = useState<ContactProps>();

    useEffect(() => {
        const apiClient = setupAPIClient();
        async function load_contact() {
            try {
                const response = await apiClient.get(`/contacts_form/contact?form_contact_id=${params.contact_id}`);
                setContactData(response.data);
            } catch (error) {
                console.log(error);
            }
        }
        load_contact();
    }, []);

    const handleClick = () => {
        if (contactData?.email_user && contactData?.subject) {
            window.location.href = `mailto:${contactData?.email_user}?subject=${encodeURIComponent(contactData?.subject)}`;
        } else {
            toast.error("Email ou assunto estão indefinidos.");
            console.error("Email ou assunto estão indefinidos.");
        }
    };


    return (
        <SidebarAndHeader>
            <Section>

                <TitlePage title="CONTATO" />

                <div className="mb-4">
                    <h2 className="text-xl">{contactData?.name_user}</h2>
                </div>

                <div>
                    <p
                        className="flex items-center"
                    >
                        Email: <span className="ml-2">
                            {contactData?.email_user}
                        </span>
                    </p>
                    <p className="mt-3">Assunto: <span>{contactData?.subject}</span></p>
                </div>

                <div className="mt-10">
                    <p className="mb-2">Mensagem:</p>
                    <p className="border p-4">
                        {contactData?.menssage}
                    </p>
                    <button
                        onClick={handleClick}
                        className="mt-3 cursor-pointer flex items-center bg-backgroundButton text-black p-2 font-bold rounded hover:hoverButtonBackground"
                    >
                        Responder
                        <RiMailSendLine
                            className="ml-3"
                            color="whithe"
                            size={30}
                        />
                    </button>
                </div>

            </Section>
        </SidebarAndHeader>
    )
}