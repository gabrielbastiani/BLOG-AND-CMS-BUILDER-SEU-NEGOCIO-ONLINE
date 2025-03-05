import { Footer } from "../components/blog_components/footer";
import { Navbar } from "../components/blog_components/navbar";
import BlogLayout from "../components/blog_components/blogLayout";
import MarketingPopup from "../components/blog_components/popups/marketingPopup";
import { SlideBanner } from "../components/blog_components/slideBanner";
import { setupAPIClient } from "@/services/api";
import PublicationSidebar from "../components/blog_components/publicationSidebar";
import { Metadata, ResolvingMetadata } from "next";
import SafeHTML from "../components/SafeHTML";

const BLOG_URL = process.env.NEXT_PUBLIC_URL_BLOG;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function generateMetadata(
    parent: ResolvingMetadata
): Promise<Metadata> {

    const fallbackMetadata: Metadata = {
        title: "Politicas de privacidade",
        description: "Conheça nossas politicas de privacidade",
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
        const { data } = await apiClient.get(`/seo/get_page?page=Politicas de privacidade`);

        if (!data) {
            return fallbackMetadata;
        }

        const previousImages = (await parent).openGraph?.images || [];

        const ogImages = data.ogImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Politicas de privacidade',
        })) || [];

        const twitterImages = data.twitterImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Politicas de privacidade',
        })) || [];

        const faviconUrl = response.data.favicon
            ? new URL(`files/${response.data.favicon}`, API_URL).toString()
            : "../app/favicon.ico";

        return {
            title: data?.title || 'Politicas de privacidade - Blog',
            description: data?.description || 'Conheça nossas politicas de privacidade',
            metadataBase: new URL(BLOG_URL!),
            robots: {
                follow: true,
                index: true
            },
            icons: {
                icon: faviconUrl
            },
            openGraph: {
                title: data?.ogTitle || 'Politicas de privacidade - Blog',
                description: data?.ogDescription || 'Conheça nossas politicas de privacidade...',
                images: [
                    ...ogImages,
                    ...previousImages,
                ],
                locale: 'pt_BR',
                siteName: response.data.name_blog || 'nossas politicas de privacidade',
                type: "website"
            },
            twitter: {
                card: 'summary_large_image',
                title: data?.twitterTitle || 'Politicas de privacidade - Blog',
                description: data?.twitterDescription || 'Conheça nossas politicas de privacidade...',
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
        const [configs, banners, sidebar] = await Promise.all([
            apiClient.get('/configuration_blog/get_configs'),
            apiClient.get('/marketing_publication/existing_banner?local=Pagina_Politicas de privacidade'),
            apiClient.get('/marketing_publication/existing_sidebar?local=Pagina_Politicas de privacidade')
        ]);

        return {
            configs: configs.data,
            existing_slide: banners.data || [],
            existing_sidebar: sidebar.data || [],
        };
    } catch (error) {
        console.error("Erro ao carregar dados:", error);
        return {
            configs: null,
            existing_slide: [],
            existing_sidebar: [],
        };
    }
}

export default async function Politicas_de_privacidade() {
    const { configs, existing_slide, existing_sidebar } = await getData();

    return (
        <BlogLayout
            navbar={<Navbar />}
            bannersSlide={existing_slide.length >= 1 && <SlideBanner position="SLIDER" local="Pagina_Politicas de privacidade" />}
            existing_sidebar={existing_sidebar.length}
            banners={<PublicationSidebar existing_sidebar={existing_sidebar} />}
            footer={<Footer />}
        >
            <div className="prose max-w-none text-gray-800 prose-h1:text-blue-600 prose-p:mb-4 prose-a:text-indigo-500 hover:prose-a:underline">
                {configs?.privacy_policies && (
                    <SafeHTML html={configs?.privacy_policies} />
                )}
            </div>
            <MarketingPopup
                position="POPUP"
                local="Pagina_Politicas de privacidade"
            />
        </BlogLayout>
    );
}