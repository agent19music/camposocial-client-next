"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TrendingUp, Hash } from "lucide-react";

interface TrendingHashtag {
    name: string;
    count: number;
}

export default function TrendingHashtags() {
    const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrending = async () => {
            setIsLoading(true);
            try {
                const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT;
                if (!apiEndpoint) {
                    throw new Error('API endpoint not configured');
                }

                const response = await fetch(`${apiEndpoint}/trending/hashtags?limit=5`);
                if (!response.ok) {
                    throw new Error('Failed to fetch trending hashtags');
                }

                const data = await response.json();
                setHashtags(data.hashtags || []);
            } catch (err) {
                console.error('Error fetching trending hashtags:', err);
                setError(err instanceof Error ? err.message : 'Failed to load');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrending();

        // Refresh every 5 minutes
        const interval = setInterval(fetchTrending, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#ff9013]" />
                        <h3 className="font-semibold">Trending on Campus</h3>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-24 mb-1" />
                            <div className="h-3 bg-muted rounded w-16" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error || hashtags.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-[#ff9013]" />
                        <h3 className="font-semibold">Trending on Campus</h3>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        {error || "No trending hashtags yet. Start a conversation!"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-[#ff9013]" />
                    <h3 className="font-semibold">Trending on Campus</h3>
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                {hashtags.map((hashtag, index) => (
                    <div
                        key={hashtag.name}
                        className="flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 transition-colors cursor-pointer"
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                            <div>
                                <p className="font-medium text-sm">#{hashtag.name}</p>
                                <p className="text-xs text-muted-foreground">{hashtag.count} yaps</p>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
