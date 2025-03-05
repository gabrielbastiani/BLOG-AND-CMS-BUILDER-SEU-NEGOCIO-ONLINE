export interface Category {
  id: string;
  name_category: string;
  slug_name_category: string;
  image_category?: string;
  description?: string;
  order?: number;
  status: "Disponivel" | "Indisponivel";
  parentId?: string | null;
  nivel?: number;
  length?: number;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export interface PostsProps {
  id: string;
  text_post: string;
  author: string;
  title: string;
  slug_title_post: string;
  custom_url: string;
  image_post?: string;
  post_like?: number;
  post_dislike?: number;
  views?: number;
  status: string;
  publish_at?: string | number | Date;
  created_at: string | number | Date;
  edit?: string;
  seo_keywords?: string[];
  tags?: Array<{
    tag?: {
      id: string;
      tag_name?: string;
      slug_tag_name?: string;
    };
  }>;
  categories?: Array<{
    category?: {
      id: string;
      name_category?: string;
      slug_name_category?: string;
    };
  }>;
  comment?: Array<{
    id: string;
    post_id: string;
    userBlog_id: string;
    userBlog: any;
    name_user: string;
    image_user: string;
    comment: string;
    replies: any;
    comment_like: number;
    comment_dislike: number;
    created_at: string | number | Date;
  }>
}