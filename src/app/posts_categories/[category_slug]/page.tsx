import BlogLayout from "@/app/components/blog_components/blogLayout";
import { Footer } from "@/app/components/blog_components/footer";
import { Navbar } from "@/app/components/blog_components/navbar";
import { SlideBanner } from "@/app/components/blog_components/slideBanner";
import { setupAPIClient } from "@/services/api";
import MarketingPopup from "@/app/components/blog_components/popups/marketingPopup";
import PublicationSidebar from "@/app/components/blog_components/publicationSidebar";
import { Metadata, ResolvingMetadata } from "next";
import ClientWrapper from "../ClientWrapper";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BLOG_URL = process.env.NEXT_PUBLIC_URL_BLOG;

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
      const apiClient = setupAPIClient();
      const response = await apiClient.get('/configuration_blog/get_configs');
      const { data } = await apiClient.get(`/seo/get_page?page=Artigos em uma determinada categoria`);

      const previousImages = (await parent).openGraph?.images || [];

      const ogImages = data.ogImages?.map((image: string) => ({
          url: new URL(`files/${image}`, API_URL).toString(),
          width: Number(data.ogImageWidth) || 1200,
          height: data.ogImageHeight || 630,
          alt: data.ogImageAlt || 'Artigos em uma determinada categoria do blog',
      })) || [];

      const twitterImages = data.twitterImages?.map((image: string) => ({
          url: new URL(`files/${image}`, API_URL).toString(),
          width: Number(data.ogImageWidth) || 1200,
          height: data.ogImageHeight || 630,
          alt: data.ogImageAlt || 'Artigos em uma determinada categoria do blog',
      })) || [];

      const faviconUrl = response.data.favicon
          ? new URL(`files/${response.data.favicon}`, API_URL).toString()
          : "../app/favicon.ico";

      return {
          title: data?.title || 'Artigos em uma determinada categoria do blog',
          description: data?.description || 'Conheça as categorias do nosso blog',
          metadataBase: new URL(BLOG_URL!),
          robots: {
              follow: true,
              index: true
          },
          icons: {
              icon: faviconUrl
          },
          openGraph: {
              title: data?.ogTitle || 'Artigos em uma determinada categoria do blog',
              description: data?.ogDescription || 'Conheça os artigos do nosso blog...',
              images: [
                  ...ogImages,
                  ...previousImages,
              ],
              locale: 'pt_BR',
              siteName: response.data.name_blog || 'Artigos em uma determinada categoria do blog',
              type: "website"
          },
          twitter: {
              card: 'summary_large_image',
              title: data?.twitterTitle || 'Artigos em uma determinada categoria do blog',
              description: data?.twitterDescription || 'Categorias do nosso blog...',
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
      return {
          title: "Blog",
          description: "Conheça o blog",
      };
  }
}

async function getData(category_slug: string) {
    const apiClient = setupAPIClient();

    try {
        const [bannersResponse, sidebarResponse, categoryResponse] = await Promise.all([
            apiClient.get(`/marketing_publication/existing_banner?local=Pagina_categoria`).catch(e => {
                console.error("Erro em banners:", e.response?.status, e.config?.url);
                return { data: [] };
            }),
            apiClient.get(`/marketing_publication/existing_sidebar?local=Pagina_categoria`).catch(e => {
                console.error("Erro em sidebar:", e.response?.status, e.config?.url);
                return { data: [] };
            }),
            apiClient.get(`/category/data_category?slug_name_category=${category_slug}`).catch(e => {
                console.error("Erro em categoria:", e.response?.status, e.config?.url);
                return { data: {} };
            }),
        ]);

        return {
            loadData: categoryResponse.data,
            all_posts: [],
            totalPages: 0,
            existing_slide: bannersResponse.data || [],
            existing_sidebar: sidebarResponse.data || [],
        };

    } catch (error) {
        console.error("Erro geral:", error);
        return {
            loadData: null,
            all_posts: [],
            totalPages: 0,
            existing_slide: [],
            existing_sidebar: [],
        };
    }
}

export default async function Posts_Categories({ params }: { params: { category_slug: string } }) {
    const { loadData, all_posts, totalPages, existing_slide, existing_sidebar } = await getData(params.category_slug);

    return (
        <BlogLayout
            navbar={<Navbar />}
            bannersSlide={existing_slide.length >= 1 && <SlideBanner position="SLIDER" local="Pagina_categoria" />}
            footer={<Footer />}
            existing_sidebar={existing_sidebar.length}
            banners={<PublicationSidebar existing_sidebar={existing_sidebar} />}
            presentation={
                <section className="bg-gray-800 py-12 text-white text-center">
                    <h1 className="text-3xl font-bold">{`Artigos de ${loadData?.name_category}`}</h1>
                    <p className="text-gray-300 mt-2">
                        {`Explore todos artigos da categoria ${loadData?.name_category}.`}
                    </p>
                </section>
            }
        >
            <ClientWrapper
                category_slug={params.category_slug}
                initialPosts={all_posts}
                totalPages={totalPages}
            />
            <MarketingPopup position="POPUP" local="Pagina_categoria" />
        </BlogLayout>
    );
}