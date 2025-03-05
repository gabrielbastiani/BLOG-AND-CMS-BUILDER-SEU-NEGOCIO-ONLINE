import Link from "next/link";

export function PostsGrid({ title, posts }: { title: string; posts: string[] }) {
    return (
        <section className="container mx-auto my-12">
            <h2 className="text-xl font-semibold mb-6">{title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {posts.map((post, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg">
                        <img src={`/images/${post}.jpg`} alt={post} className="rounded-md mb-4" />
                        <h3 className="text-lg font-bold">Título do {post}</h3>
                        <p className="text-gray-500">Descrição curta do {post}...</p>
                        <Link href={`/postPage/${index + 1}`} className="text-blue-600 mt-4 block">Leia mais</Link>
                    </div>
                ))}
            </div>
        </section>
    )
}