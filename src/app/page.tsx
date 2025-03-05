import BlogLayout from "./components/blog_components/blogLayout";
import { Footer } from "./components/blog_components/footer";
import { Navbar } from "./components/blog_components/navbar";
import { SlideBanner } from "./components/blog_components/slideBanner";
import HomePage from "./components/blog_components/homePage";
import { setupAPIClient } from "@/services/api";
import PublicationSidebar from "./components/blog_components/publicationSidebar";
import { Metadata, ResolvingMetadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BLOG_URL = process.env.NEXT_PUBLIC_URL_BLOG;

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {

  const fallbackMetadata: Metadata = {
    title: "Blog",
    description: "Veja o melhor conteudo na internet.",
    openGraph: {
      images: [{ url: '../assets/no-image-icon-6.png' }]
    }
  };

  try {
    const apiClient = setupAPIClient();

    if (!API_URL || !BLOG_URL) {
      console.error('Variáveis de ambiente não configuradas');
      return fallbackMetadata;
    }

    const response = await apiClient.get('/configuration_blog/get_configs');
    const { data } = await apiClient.get(`/seo/get_page?page=Pagina principal`);

    if (!data) {
      return fallbackMetadata;
    }

    const previousImages = (await parent).openGraph?.images || [];

    const ogImages = data.ogImages?.map((image: string) => ({
      url: new URL(`files/${image}`, API_URL).toString(),
      width: Number(data.ogImageWidth) || 1200,
      height: data.ogImageHeight || 630,
      alt: data.ogImageAlt || 'Blog',
    })) || [];

    const twitterImages = data.twitterImages?.map((image: string) => ({
      url: new URL(`files/${image}`, API_URL).toString(),
      width: Number(data.ogImageWidth) || 1200,
      height: data.ogImageHeight || 630,
      alt: data.ogImageAlt || 'Blog',
    })) || [];

    const faviconUrl = response.data.favicon
      ? new URL(`files/${response.data.favicon}`, API_URL).toString()
      : "../app/favicon.ico";

    return {
      title: data?.title || 'Nosso Blog',
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
        title: data?.ogTitle || 'Nosso Blog',
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
        title: data?.twitterTitle || 'Nosso Blog',
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
  const [banners, sidebar] = await Promise.all([
    apiClient.get(`/marketing_publication/existing_banner?local=Pagina_inicial`),
    apiClient.get(`/marketing_publication/existing_sidebar?local=Pagina_inicial`),
  ]);
  return {
    existing_slide: banners.data || [],
    existing_sidebar: sidebar.data || [],
  };
}

export default async function Home_page() {
  const { existing_slide, existing_sidebar } = await getData();

  return (
    <BlogLayout
      navbar={<Navbar />}
      bannersSlide={existing_slide.length >= 1 && <SlideBanner position="SLIDER" local="Pagina_inicial" />}
      footer={<Footer />}
      existing_sidebar={existing_sidebar.length}
      banners={<PublicationSidebar existing_sidebar={existing_sidebar} />}
    >
      <HomePage />
    </BlogLayout>
  );
}