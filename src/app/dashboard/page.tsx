"use client";

import { useEffect, useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { setupAPIClient } from "@/services/api";
import { SidebarAndHeader } from "../components/sidebarAndHeader";
import { Section } from "../components/section";
import { TitlePage } from "../components/titlePage";
import ScheduledPostsCalendar from "../components/datasDashboard/postData/scheduledPostsCalendar";
import { PostData } from "../components/datasDashboard/postData";
import { CategoriesData } from "../components/datasDashboard/categoriesData";
import { CommentData } from "../components/datasDashboard/commentData";
import { FormContactData } from "../components/datasDashboard/formContactData";
import { UsersData } from "../components/datasDashboard/usersData";
import { NewslattersData } from "../components/datasDashboard/newslattersData";
import { CommentReactionMetrics } from "../components/datasDashboard/commentData/commentReactionMetrics";
import { PostReactionMetrics } from "../components/datasDashboard/postData/postReactionMetrics";
import { ViewsPostsData } from "../components/datasDashboard/viewsPostsData";
import { ClickPublicationMarketingData } from "../components/datasDashboard/clickPublicationMarketingData";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Dashboard() {

  const [postData, setPostData] = useState<any>({});
  const [postViewsMetrics, setPostViewsMetrics] = useState<{
    dailyViews: { title: string; views: number }[];
    weeklyViews: { title: string; views: number }[];
    monthlyViews: { title: string; views: number }[];
  } | null>(null);
  const [postReactionData, setPostReactionData] = useState([]);
  const [categoryData, setCategoryData] = useState<any>({});
  const [commentData, setCommentData] = useState<any>({});
  const [commentReactionData, setCommentReactionData] = useState([]);

  const [contactData, setContactData] = useState<any>({});
  const [newsletterData, setNewsletterData] = useState<any>({});
  const [userData, setUserData] = useState<any>({});

  const [publicationsClick, setPublicationsClick] = useState<{
    dailyViews: { title: string; clicks: number }[];
    weeklyViews: { title: string; clicks: number }[];
    monthlyViews: { title: string; clicks: number }[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const apiClient = setupAPIClient();

      const postsResponse = await apiClient.get("/dashboard/posts/statistics");
      const categoriesResponse = await apiClient.get("/dashboard/categories/statistics");
      const commentsResponse = await apiClient.get("/dashboard/comment/statistics");
      const contactsResponse = await apiClient.get("/dashboard/contact/statistics");
      const newsletterData = await apiClient.get("/dashboard/newslatter/statistics");
      const usersResponse = await apiClient.get("/dashboard/userBlog/statistics");
      const publicationsClicks = await apiClient.get("/dashboard/publication_marketing/statistics");

      setPostData(postsResponse.data);
      setPostReactionData(postsResponse.data.metricsPostsLikesDislikes);
      setPostViewsMetrics(postsResponse.data);
      setCategoryData(categoriesResponse.data);
      setCommentData(commentsResponse.data);
      setCommentReactionData(commentsResponse.data.metricsCommentsLikesDislikes);
      setContactData(contactsResponse.data);
      setNewsletterData(newsletterData.data);
      setUserData(usersResponse.data);
      setPublicationsClick(publicationsClicks.data);
    };

    fetchData();
  }, []);


  return (
    <SidebarAndHeader>
      <Section>

        <TitlePage title="DASHBOARD" />

        <div className="p-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PostData
              postData={postData}
            />
            <PostReactionMetrics
              postReactionData={postReactionData}
            />
            <ScheduledPostsCalendar />
            <CategoriesData
              categoryData={categoryData}
            />
            <CommentData
              commentData={commentData}
            />
            <CommentReactionMetrics
              commentReactionData={commentReactionData}
            />
            <FormContactData
              contactData={contactData}
            />
            <UsersData
              userData={userData}
            />
            <NewslattersData
              newsletterData={newsletterData}
            />
          </div>
          <ViewsPostsData
            /* @ts-ignore */
            postViewsMetrics={postViewsMetrics}
          />
        </div>

        <div className="p-4 space-y-6">
          <ClickPublicationMarketingData
          /* @ts-ignore */
            publicationsClickMetrics={publicationsClick}
          />
        </div>
      </Section>
    </SidebarAndHeader>
  );
}