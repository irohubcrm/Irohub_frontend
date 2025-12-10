import React, { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import axios from 'axios';
import toast from 'react-hot-toast';

const NotificationManager = () => {
    // Use a ref to store the previous count to compare against
    const prevCountRef = useRef(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Access user from Redux to ensure we only poll when logged in
    const user = useSelector((state) => state.auth.user);

    const queryClient = useQueryClient();

    // Define audio refs for 4 sounds
    const audioRefs = {
        sound1: useRef(new Audio('/sounds/sound1.mp3')),
        sound2: useRef(new Audio('/sounds/sound2.mp3')),
        sound3: useRef(new Audio('/sounds/sound3.mp3')),
        sound4: useRef(new Audio('/sounds/sound4.mp3')),
    };

    // Poll for unread notification count
    const { data: notificationCount } = useQuery({
        queryKey: ['unreadNotifications'],
        queryFn: async () => {
            // verified step 23: `count_unreadnotification` is available but I need the route.
            // Route is /notification/get-notifications
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/notification/get-notifications`, {
                withCredentials: true
            });
            // Ensure we return an array
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: !!user, // Only run if user is logged in
        refetchInterval: 30000, // Poll every 30 seconds
        refetchIntervalInBackground: true,
    });

    useEffect(() => {
        if (notificationCount && notificationCount.length > 0) {
            const unread = notificationCount.filter(n => !n.isRead);

            // If we have more unread messages than before, play sound and show toast
            if (unread.length > prevCountRef.current) {
                // Get the latest notification to determine sound
                const latest = unread[0]; // Assuming sorted by createdAt desc (controller does default sort?)
                // Controller: `sort({ createdAt: -1 })` -> Yes.

                const soundToPlay = latest.sound || 'sound1';
                const audio = audioRefs[soundToPlay]?.current;

                if (audio) {
                    audio.play().catch(e => console.error("Audio play failed", e));
                }

                // Show visual notification
                toast((t) => (
                    <span>
                        <b>{latest.title || 'Notification'}</b>
                        <br />
                        {latest.message}
                    </span>
                ), {
                    icon: '🔔',
                    duration: 5000,
                });
            }

            prevCountRef.current = unread.length;
        }
    }, [notificationCount]);



    return (
        <>
            {/* Hidden audio elements if needed, but Audio object is fine */}
        </>
    );
};

export default NotificationManager;
