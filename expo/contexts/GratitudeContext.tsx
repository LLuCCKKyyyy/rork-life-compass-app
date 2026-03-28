import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";

import type { GratitudeEntry, Review } from "@/types";

const GRATITUDE_KEY = "life-compass-gratitude";
const REVIEWS_KEY = "life-compass-reviews";

export const [GratitudeProvider, useGratitude] = createContextHook(() => {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const queryClient = useQueryClient();

  const entriesQuery = useQuery({
    queryKey: [GRATITUDE_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(GRATITUDE_KEY);
      return stored ? (JSON.parse(stored) as GratitudeEntry[]) : [];
    },
  });

  const reviewsQuery = useQuery({
    queryKey: [REVIEWS_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(REVIEWS_KEY);
      return stored ? (JSON.parse(stored) as Review[]) : [];
    },
  });

  const { mutate: saveEntries } = useMutation({
    mutationFn: async (newEntries: GratitudeEntry[]) => {
      await AsyncStorage.setItem(GRATITUDE_KEY, JSON.stringify(newEntries));
      return newEntries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [GRATITUDE_KEY] });
    },
  });

  const { mutate: saveReviews } = useMutation({
    mutationFn: async (newReviews: Review[]) => {
      await AsyncStorage.setItem(REVIEWS_KEY, JSON.stringify(newReviews));
      return newReviews;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEWS_KEY] });
    },
  });

  useEffect(() => {
    if (entriesQuery.data) {
      setEntries(entriesQuery.data);
    }
  }, [entriesQuery.data]);

  useEffect(() => {
    if (reviewsQuery.data) {
      setReviews(reviewsQuery.data);
    }
  }, [reviewsQuery.data]);

  const getTodayEntry = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    return entries.find((e) => e.date === today);
  }, [entries]);

  const addOrUpdateEntry = useCallback((entry: Omit<GratitudeEntry, "id">) => {
    const existingIndex = entries.findIndex((e) => e.date === entry.date);
    let updated: GratitudeEntry[];
    
    if (existingIndex >= 0) {
      updated = entries.map((e, i) => 
        i === existingIndex ? { ...e, ...entry } : e
      );
    } else {
      const newEntry: GratitudeEntry = {
        ...entry,
        id: Date.now().toString(),
      };
      updated = [...entries, newEntry];
    }
    
    setEntries(updated);
    saveEntries(updated);
  }, [entries, saveEntries]);

  const addReview = useCallback((review: Omit<Review, "id">) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
    };
    const updated = [...reviews, newReview];
    setReviews(updated);
    saveReviews(updated);
  }, [reviews, saveReviews]);

  const deleteReview = useCallback((id: string) => {
    const updated = reviews.filter((r) => r.id !== id);
    setReviews(updated);
    saveReviews(updated);
  }, [reviews, saveReviews]);

  return useMemo(() => ({
    entries,
    reviews,
    getTodayEntry,
    addOrUpdateEntry,
    addReview,
    deleteReview,
    isLoading: entriesQuery.isLoading || reviewsQuery.isLoading,
  }), [entries, reviews, getTodayEntry, addOrUpdateEntry, addReview, deleteReview, entriesQuery.isLoading, reviewsQuery.isLoading]);
});
