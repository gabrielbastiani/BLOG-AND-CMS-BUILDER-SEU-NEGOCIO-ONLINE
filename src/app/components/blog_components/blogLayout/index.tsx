"use client"

import { ReactNode, useState } from "react";

interface BlogLayoutProps {
    navbar: ReactNode;
    footer: ReactNode;
    children: ReactNode;
    banners?: ReactNode;
    bannersSlide?: ReactNode;
    presentation?: ReactNode;
    existing_sidebar: number;
}

const BlogLayout: React.FC<BlogLayoutProps> = ({ navbar, existing_sidebar, footer, children, banners, bannersSlide, presentation }) => {
    const [showMobileBanners, setShowMobileBanners] = useState(true);

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            {/* Navbar */}
            {navbar}

            {/* Banners */}
            {bannersSlide && (
                <div className="w-full bg-gray-200 overflow-hidden">
                    {bannersSlide}
                </div>
            )}

            {presentation}

            <main className="flex-1 flex">
                {/* Main Content */}
                <div className="w-full flex-1 bg-white p-4 rounded shadow">
                    {children}
                </div>

                {/* Aside (Fixed Scroll) */}
                {existing_sidebar >= 1 ? (
                    <aside className="hidden lg:block sticky top-28 h-screen w-[300px] bg-gray-50 p-4 shadow">
                        <div className="overflow-y-auto h-full">
                            {/* Conteúdo do Aside */}
                            {banners}
                        </div>
                    </aside>
                ) : null}
            </main>

            {/* Banners - Mobile */}
            {banners && showMobileBanners && (
                <div className="fixed bottom-0 left-0 w-full bg-gray-50 border-t shadow-lg lg:hidden z-20">
                    <div className="flex items-center justify-between p-4">
                        <span className="text-gray-700 font-medium">Aproveite!!!</span>
                        <button
                            onClick={() => setShowMobileBanners(false)}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            ✕ Fechar
                        </button>
                    </div>
                    <div className="flex overflow-x-auto gap-4 p-4">
                        {Array.isArray(banners)
                            ? banners.map((banner, index) => (
                                <div key={index} className="min-w-[70%] flex-shrink-0">
                                    {banner}
                                </div>
                            ))
                            : banners}
                    </div>
                </div>
            )}

            {/* Footer */}
            {footer}
        </div>
    );
};

export default BlogLayout;