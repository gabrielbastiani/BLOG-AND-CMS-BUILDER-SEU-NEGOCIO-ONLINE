import { Footer } from "../components/blog_components/footer";
import { Navbar } from "../components/blog_components/navbar";
import BlogLayout from "../components/blog_components/blogLayout";
import MarketingPopup from "../components/blog_components/popups/marketingPopup";
import { SlideBanner } from "../components/blog_components/slideBanner";
import { setupAPIClient } from "@/services/api";
import PublicationSidebar from "../components/blog_components/publicationSidebar";
import { Metadata, ResolvingMetadata } from "next";

const BLOG_URL = process.env.NEXT_PUBLIC_URL_BLOG;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function generateMetadata({
    parent
}: {
    parent: ResolvingMetadata
}): Promise<Metadata> {

    if (!API_URL || !BLOG_URL) {
        throw new Error('Variáveis de ambiente não configuradas');
    }

    const fallbackMetadata: Metadata = {
        title: "Sobre Nós",
        description: "Conheça mais sobre nosso blog",
        openGraph: {
            images: [{ url: new URL('../../assets/no-image-icon-6.png', BLOG_URL).toString() }]
        }
    };

    try {
        const apiClient = setupAPIClient();

        if (!API_URL || !BLOG_URL) {
            console.error('Variáveis de ambiente não configuradas');
            return fallbackMetadata;
        }

        const response = await apiClient.get('/configuration_blog/get_configs');
        const { data } = await apiClient.get(`/seo/get_page?page=Sobre`);

        if (!data) {
            return fallbackMetadata;
        }
        
        const previousImages = (await parent).openGraph?.images || [];

        const ogImages = data.ogImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Sobre',
        })) || [];

        const twitterImages = data.twitterImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Sobre',
        })) || [];

        const faviconUrl = response.data.favicon
            ? new URL(`files/${response.data.favicon}`, API_URL).toString()
            : "../app/favicon.ico";

        return {
            title: data?.title || 'Sobre - Nosso Blog',
            description: data?.description || 'Conheça nosso blog',
            metadataBase: new URL(BLOG_URL!),
            robots: {
                follow: true,
                index: true
            },
            icons: {
                icon: faviconUrl
            },
            openGraph: {
                title: data?.ogTitle || 'Sobre - Nosso Blog',
                description: data?.ogDescription || 'Conheça nosso blog...',
                images: [
                    ...ogImages,
                    ...previousImages,
                ],
                locale: 'pt_BR',
                siteName: response.data.name_blog || 'Nosso Blog',
                type: "website"
            },
            twitter: {
                card: 'summary_large_image',
                title: data?.twitterTitle || 'Sobre - Nosso Blog',
                description: data?.twitterDescription || 'Conheça nosso blog...',
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
            apiClient.get('/marketing_publication/existing_banner?local=Pagina_sobre'),
            apiClient.get('/marketing_publication/existing_sidebar?local=Pagina_sobre')
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

export default async function About() {
    const { configs, existing_slide, existing_sidebar } = await getData();

    return (
        <BlogLayout
            navbar={<Navbar />}
            bannersSlide={existing_slide.length >= 1 && <SlideBanner position="SLIDER" local="Pagina_sobre" />}
            existing_sidebar={existing_sidebar.length}
            banners={<PublicationSidebar existing_sidebar={existing_sidebar} />}
            footer={<Footer />}
        >
            <div className="container mx-auto my-12 px-6">
                <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
                    Sobre
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Sobre o autor do blog
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {configs?.about_author_blog || 'Nossos autores são especialistas dedicados a trazer o melhor conteúdo.'}
                        </p>
                    </div>

                    <div className="bg-white shadow-lg rounded-lg p-8">
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                            Sobre o blog
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {configs?.description_blog || 'Um espaço dedicado a compartilhar conhecimento e experiências relevantes.'}
                        </p>
                    </div>
                </div>
            </div>
            <MarketingPopup
                position="POPUP"
                local="Pagina_sobre"
            />
        </BlogLayout>
    );
}