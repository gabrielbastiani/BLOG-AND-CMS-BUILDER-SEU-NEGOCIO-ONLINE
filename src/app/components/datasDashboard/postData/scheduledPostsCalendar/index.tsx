import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { setupAPIClient } from "@/services/api";

interface Post {
    id: number;
    title: string;
    publish_at: string;
    status: string;
}

interface CalendarData {
    [year: number]: {
        [month: number]: {
            [day: number]: Post[];
        };
    };
}

const ScheduledPostsCalendar = () => {
    const [calendarData, setCalendarData] = useState<CalendarData>({});
    const [allPostsProgramed, setAllPostsProgramed] = useState();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [postsForDay, setPostsForDay] = useState<Post[]>([]);

    useEffect(() => {
        const fetchCalendarData = async () => {
            const apiClient = setupAPIClient();
            try {
                const response = await apiClient.get("/dashboard/posts/statistics");
                setCalendarData(response.data.calendarData);
                setAllPostsProgramed(response.data.totalPostsPublish);
            } catch (error) {
                console.error("Erro ao carregar dados do calendário:", error);
            }
        };

        fetchCalendarData();
    }, []);

    const handleDateClick = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();

        const posts = calendarData[year]?.[month]?.[day] || [];
        setPostsForDay(posts);
        setSelectedDate(date);
    };

    return (
        <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-lg font-semibold text-black mb-4">
                Calendário de Artigos Programados
            </h2>
            <p className="text-black mt-3 mb-3">Total de posts cadastrados: <b>{allPostsProgramed}</b></p>
            <Calendar
                onClickDay={handleDateClick}
                value={selectedDate}
                locale="pt-BR"
                tileClassName="text-black"
                tileContent={({ date, view }) => {
                    if (view === "month") {
                        const year = date.getFullYear();
                        const month = date.getMonth() + 1;
                        const day = date.getDate();
                        const posts = calendarData[year]?.[month]?.[day] || [];

                        if (posts.length > 0) {
                            return (
                                <div className="relative">
                                    <span>{day}</span>
                                    <div className="absolute bottom-0 left-0 text-xs text-white bg-blue-600 rounded-full w-5 h-5 flex items-center justify-center">
                                        {posts.length}
                                    </div>
                                </div>
                            );
                        }
                    }
                    return null;
                }}
            />
            {postsForDay.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-md font-medium text-black">Artigos Programados:</h3>
                    <ul className="list-disc pl-5 text-black">
                        {postsForDay.map((post) => (
                            <li key={post.id}>
                                <span className="font-bold text-black">{post.title}</span> -{" "}
                                {new Date(post.publish_at).toLocaleString()}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ScheduledPostsCalendar;