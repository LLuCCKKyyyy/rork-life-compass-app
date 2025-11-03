import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useMemo, useCallback } from "react";

import type { Task, BigRock, Quadrant } from "@/types";

const TASKS_KEY = "life-compass-tasks";
const BIG_ROCKS_KEY = "life-compass-big-rocks";

export const [TasksProvider, useTasks] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bigRocks, setBigRocks] = useState<BigRock[]>([]);
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: [TASKS_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(TASKS_KEY);
      return stored ? (JSON.parse(stored) as Task[]) : [];
    },
  });

  const bigRocksQuery = useQuery({
    queryKey: [BIG_ROCKS_KEY],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(BIG_ROCKS_KEY);
      return stored ? (JSON.parse(stored) as BigRock[]) : [];
    },
  });

  const { mutate: saveTasks } = useMutation({
    mutationFn: async (newTasks: Task[]) => {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
      return newTasks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TASKS_KEY] });
    },
  });

  const { mutate: saveBigRocks } = useMutation({
    mutationFn: async (newBigRocks: BigRock[]) => {
      await AsyncStorage.setItem(BIG_ROCKS_KEY, JSON.stringify(newBigRocks));
      return newBigRocks;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BIG_ROCKS_KEY] });
    },
  });

  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(tasksQuery.data);
    }
  }, [tasksQuery.data]);

  useEffect(() => {
    if (bigRocksQuery.data) {
      setBigRocks(bigRocksQuery.data);
    }
  }, [bigRocksQuery.data]);

  const addTask = useCallback((task: Omit<Task, "id" | "createdAt" | "order">) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      order: tasks.filter((t) => t.quadrant === task.quadrant).length,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveTasks(updated);
  }, [tasks, saveTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTasks(updated);
    saveTasks(updated);
  }, [tasks, saveTasks]);

  const deleteTask = useCallback((id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  }, [tasks, saveTasks]);

  const reorderTasks = useCallback((quadrant: Quadrant, fromIndex: number, toIndex: number) => {
    const quadrantTasks = tasks
      .filter((t) => t.quadrant === quadrant)
      .sort((a, b) => a.order - b.order);
    const [movedTask] = quadrantTasks.splice(fromIndex, 1);
    quadrantTasks.splice(toIndex, 0, movedTask);
    
    const reordered = quadrantTasks.map((task, index) => ({ ...task, order: index }));
    const otherTasks = tasks.filter((t) => t.quadrant !== quadrant);
    const updated = [...otherTasks, ...reordered];
    
    setTasks(updated);
    saveTasks(updated);
  }, [tasks, saveTasks]);

  const addBigRock = useCallback((rock: Omit<BigRock, "id" | "createdAt">) => {
    const newRock: BigRock = {
      ...rock,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...bigRocks, newRock];
    setBigRocks(updated);
    saveBigRocks(updated);
  }, [bigRocks, saveBigRocks]);

  const updateBigRock = useCallback((id: string, updates: Partial<BigRock>) => {
    const updated = bigRocks.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setBigRocks(updated);
    saveBigRocks(updated);
  }, [bigRocks, saveBigRocks]);

  const deleteBigRock = useCallback((id: string) => {
    const updated = bigRocks.filter((r) => r.id !== id);
    setBigRocks(updated);
    saveBigRocks(updated);
  }, [bigRocks, saveBigRocks]);

  return useMemo(() => ({
    tasks,
    bigRocks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    addBigRock,
    updateBigRock,
    deleteBigRock,
    isLoading: tasksQuery.isLoading || bigRocksQuery.isLoading,
  }), [tasks, bigRocks, addTask, updateTask, deleteTask, reorderTasks, addBigRock, updateBigRock, deleteBigRock, tasksQuery.isLoading, bigRocksQuery.isLoading]);
});

export function useTasksByQuadrant(quadrant: Quadrant) {
  const { tasks } = useTasks();
  return useMemo(
    () => tasks.filter((t) => t.quadrant === quadrant).sort((a, b) => a.order - b.order),
    [tasks, quadrant]
  );
}
