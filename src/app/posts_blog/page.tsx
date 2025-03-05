import { Suspense } from 'react';
import Image from "next/image";
import { setupAPIClient } from "@/services/api";
import { Navbar } from "../components/blog_components/navbar";
import { Footer } from "../components/blog_components/footer";
import BlogLayout from "../components/blog_components/blogLayout";
import mkt from '../../assets/no-image-icon-6.png';
import { SlideBanner } from "../components/blog_components/slideBanner";
import MarketingPopup from "../components/blog_components/popups/marketingPopup";
import { Metadata, ResolvingMetadata } from "next";
import ClientWrapper from "./ClientWrapper";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BLOG_URL = process.env.NEXT_PUBLIC_URL_BLOG;

export async function generateMetadata(
    parent: ResolvingMetadata
): Promise<Metadata> {

    const fallbackMetadata: Metadata = {
        title: "Todos os artigos",
        description: "Veja todos os nossos artigos",
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
        const { data } = await apiClient.get(`/seo/get_page?page=Todos os artigos`);

        if (!data) {
            return fallbackMetadata;
        }

        const previousImages = (await parent).openGraph?.images || [];

        const ogImages = data.ogImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Todos os artigos do blog',
        })) || [];

        const twitterImages = data.twitterImages?.map((image: string) => ({
            url: new URL(`files/${image}`, API_URL).toString(),
            width: Number(data.ogImageWidth) || 1200,
            height: data.ogImageHeight || 630,
            alt: data.ogImageAlt || 'Todos os artigos do blog',
        })) || [];

        const faviconUrl = response.data.favicon
            ? new URL(`files/${response.data.favicon}`, API_URL).toString()
            : "../app/favicon.ico";

        return {
            title: data?.title || 'Todos os artigos do blog',
            description: data?.description || 'Conheça os artigos do nosso blog',
            metadataBase: new URL(BLOG_URL!),
            robots: {
                follow: true,
                index: true
            },
            icons: {
                icon: faviconUrl
            },
            openGraph: {
                title: data?.ogTitle || 'Todos os artigos do blog',
                description: data?.ogDescription || 'Conheça os artigos do nosso blog...',
                images: [
                    ...ogImages,
                    ...previousImages,
                ],
                locale: 'pt_BR',
                siteName: response.data.name_blog || 'Todos os artigos do blog',
                type: "website"
            },
            twitter: {
                card: 'summary_large_image',
                title: data?.twitterTitle || 'Todos os artigos do blog',
                description: data?.twitterDescription || 'Conheça os artigos do nosso blog...',
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

    const [postsResponse, bannersResponse, sidebarResponse] = await Promise.all([
        apiClient.get(`/post/articles/blog`),
        apiClient.get(`/marketing_publication/existing_banner?local=Pagina_todos_artigos`),
        apiClient.get(`/marketing_publication/existing_sidebar?local=Pagina_todos_artigos`),
    ]);

    return {
        all_posts: postsResponse.data.posts,
        totalPages: postsResponse.data.totalPages,
        existing_slide: bannersResponse.data || [],
        existing_sidebar: sidebarResponse.data || [],
    };
}

export default async function Posts_blog() {
    const { all_posts, totalPages, existing_slide, existing_sidebar } = await getData();

    return (
        <BlogLayout
            navbar={<Navbar />}
            bannersSlide={existing_slide.length >= 1 && <SlideBanner position="SLIDER" local="Pagina_todos_artigos" />}
            footer={<Footer />}
            existing_sidebar={existing_sidebar.length}
            banners={[
                <Image src={mkt} alt="Banner 1" className="w-full rounded" width={80} height={80} priority />,
                <Image src={mkt} alt="Banner 2" className="w-full rounded" width={80} height={80} priority />
            ]}
            presentation={
                <section className="bg-gray-800 py-12 text-white text-center">
                    <h1 className="text-3xl font-bold">Todos os artigos</h1>
                    <p className="text-gray-300 mt-2">
                        Explore todos os artigos do blog.
                    </p>
                </section>
            }
        >
            <Suspense fallback={<div>Carregando...</div>}>
                <ClientWrapper
                    all_posts={all_posts}
                    totalPages={totalPages}
                />
            </Suspense>
            <MarketingPopup position="POPUP" local="Pagina_todos_artigos" />
        </BlogLayout>
    );
}