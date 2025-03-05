import BlogLayout from "../components/blog_components/blogLayout";
import ContactForm from "../components/blog_components/contactForm";
import { Footer } from "../components/blog_components/footer";
import { Navbar } from "../components/blog_components/navbar";
import MarketingPopup from "../components/blog_components/popups/marketingPopup";
import { setupAPIClient } from "@/services/api";
import { SlideBanner } from "../components/blog_components/slideBanner";
import PublicationSidebar from "../components/blog_components/publicationSidebar";
import { Metadata, ResolvingMetadata } from "next";

const BLOG_URL = process.env.NEXT_PUBLIC_URL_BLOG;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function generateMetadata(
    parent: ResolvingMetadata
): Promise<Metadata> {

    const fallbackMetadata: Metadata = {
        title: "Contato",
        description: "Entre em contato conosco",
        openGraph: {
            images: [{ url: '../../assets/no-image-icon-6.png' }]
        }
    };

    try {
        const apiClient = setupAPIClient();

        if (!API_URL || !BLOG_URL) {
            console.error('Variáveis de ambiente não configuradas');
            return fallbackMetadata;
        }

        const response = await apiClient.get('/configuration_blog/get_configs');
        const { data } = await apiClient.get(`/seo/get_page?page=Contato`);

        if (!data) {
            return fallbackMetadata;
        }

        const previousImages = (await parent).openGraph?.images || [];

        const ogImages = data.ogImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Contato do blog',
        })) || [];

        const twitterImages = data.twitterImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Contato do blog',
        })) || [];

        const faviconUrl = response.data.favicon
            ? new URL(`files/${response.data.favicon}`, API_URL).toString()
            : "../app/favicon.ico";

        return {
            title: data?.title || 'Contato do blog',
            description: data?.description || 'Entre em contato com o nosso blog',
            metadataBase: new URL(BLOG_URL!),
            robots: {
                follow: true,
                index: true
            },
            icons: {
                icon: faviconUrl
            },
            openGraph: {
                title: data?.ogTitle || 'Contato do blog',
                description: data?.ogDescription || 'Entre em contato com o nosso blog...',
                images: [
                    ...ogImages,
                    ...previousImages,
                ],
                locale: 'pt_BR',
                siteName: response.data.name_blog || 'Contato do blog',
                type: "website"
            },
            twitter: {
                card: 'summary_large_image',
                title: data?.twitterTitle || 'Contato do blog',
                description: data?.twitterDescription || 'Contate o nosso blog...',
                images: [
                    ...twitterImages,
                    ...previousImages,
                ],
                creator: data?.twitterCreator || '@perfil_twitter',
            },
            keywords: data?.keywords || [],
        };
    } catch (error) {
        console.error('Erro ao gerar metadados:', error);
        return fallbackMetadata;
    }
}

async function getData() {
    const apiClient = setupAPIClient();

    try {
        const [banners, sidebar] = await Promise.all([
            apiClient.get('/marketing_publication/existing_banner?local=Pagina_contato'),
            apiClient.get('/marketing_publication/existing_sidebar?local=Pagina_contato')
        ]);

        return {
            existing_slide: banners.data || [],
            existing_sidebar: sidebar.data || [],
        };
    } catch (error) {
        console.error("Erro ao carregar dados de marketing:", error);
        return {
            existing_slide: [],
            existing_sidebar: [],
        };
    }
}

export default async function Contact() {
    const { existing_slide, existing_sidebar } = await getData();

    return (
        <BlogLayout
            navbar={<Navbar />}
            bannersSlide={existing_slide.length >= 1 && <SlideBanner position="SLIDER" local="Pagina_contato" />}
            existing_sidebar={existing_sidebar.length}
            banners={<PublicationSidebar existing_sidebar={existing_sidebar} />}
            footer={<Footer />}
        >
            <div className="contact-page-container">
                <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
                    Fale Conosco
                </h1>
                <div className="max-w-2xl mx-auto">
                    <ContactForm />
                </div>
            </div>

            <MarketingPopup
                position="POPUP"
                local="Pagina_contato"
            />
        </BlogLayout>
    );
}