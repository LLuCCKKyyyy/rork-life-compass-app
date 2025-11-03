import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";

import type { KeyPerson, Anniversary } from "@/types";

const PEOPLE_KEY = "life-compass-people";
const ANNIVERSARIES_KEY = "life-compass-anniversaries";

export const [RelationshipsProvider, useRelationships] = createContextHook(() => {
  const [people, setPeople] = useState<KeyPerson[]>([]);
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const queryClient = useQueryClient();

  const peopleQuery = useQuery({
    queryKey: [PEOPLE_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(PEOPLE_KEY);
      return stored ? (JSON.parse(stored) as KeyPerson[]) : [];
    },
  });

  const anniversariesQuery = useQuery({
    queryKey: [ANNIVERSARIES_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(ANNIVERSARIES_KEY);
      return stored ? (JSON.parse(stored) as Anniversary[]) : [];
    },
  });

  const { mutate: savePeople } = useMutation({
    mutationFn: async (newPeople: KeyPerson[]) => {
      await AsyncStorage.setItem(PEOPLE_KEY, JSON.stringify(newPeople));
      return newPeople;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PEOPLE_KEY] });
    },
  });

  const { mutate: saveAnniversaries } = useMutation({
    mutationFn: async (newAnniversaries: Anniversary[]) => {
      await AsyncStorage.setItem(ANNIVERSARIES_KEY, JSON.stringify(newAnniversaries));
      return newAnniversaries;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNIVERSARIES_KEY] });
    },
  });

  useEffect(() => {
    if (peopleQuery.data) {
      setPeople(peopleQuery.data);
    }
  }, [peopleQuery.data]);

  useEffect(() => {
    if (anniversariesQuery.data) {
      setAnniversaries(anniversariesQuery.data);
    }
  }, [anniversariesQuery.data]);

  const addPerson = useCallback((person: Omit<KeyPerson, "id" | "createdAt">) => {
    const newPerson: KeyPerson = {
      ...person,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...people, newPerson];
    setPeople(updated);
    savePeople(updated);
  }, [people, savePeople]);

  const updatePerson = useCallback((id: string, updates: Partial<KeyPerson>) => {
    const updated = people.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setPeople(updated);
    savePeople(updated);
  }, [people, savePeople]);

  const deletePerson = useCallback((id: string) => {
    const updated = people.filter((p) => p.id !== id);
    setPeople(updated);
    savePeople(updated);
    
    const updatedAnniversaries = anniversaries.filter((a) => a.personId !== id);
    setAnniversaries(updatedAnniversaries);
    saveAnniversaries(updatedAnniversaries);
  }, [people, anniversaries, savePeople, saveAnniversaries]);

  const addAnniversary = useCallback((anniversary: Omit<Anniversary, "id">) => {
    const newAnniversary: Anniversary = {
      ...anniversary,
      id: Date.now().toString(),
    };
    const updated = [...anniversaries, newAnniversary];
    setAnniversaries(updated);
    saveAnniversaries(updated);
  }, [anniversaries, saveAnniversaries]);

  const updateAnniversary = useCallback((id: string, updates: Partial<Anniversary>) => {
    const updated = anniversaries.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAnniversaries(updated);
    saveAnniversaries(updated);
  }, [anniversaries, saveAnniversaries]);

  const deleteAnniversary = useCallback((id: string) => {
    const updated = anniversaries.filter((a) => a.id !== id);
    setAnniversaries(updated);
    saveAnniversaries(updated);
  }, [anniversaries, saveAnniversaries]);

  const getPersonAnniversaries = useCallback((personId: string) => {
    return anniversaries.filter((a) => a.personId === personId);
  }, [anniversaries]);

  return useMemo(() => ({
    people,
    anniversaries,
    addPerson,
    updatePerson,
    deletePerson,
    addAnniversary,
    updateAnniversary,
    deleteAnniversary,
    getPersonAnniversaries,
    isLoading: peopleQuery.isLoading || anniversariesQuery.isLoading,
  }), [
    people,
    anniversaries,
    addPerson,
    updatePerson,
    deletePerson,
    addAnniversary,
    updateAnniversary,
    deleteAnniversary,
    getPersonAnniversaries,
    peopleQuery.isLoading,
    anniversariesQuery.isLoading,
  ]);
});
