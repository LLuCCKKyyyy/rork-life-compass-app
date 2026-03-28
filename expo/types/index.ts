export type Quadrant = 1 | 2 | 3 | 4;

export interface Task {
  id: string;
  title: string;
  description?: string;
  quadrant: Quadrant;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  order: number;
}

export interface BigRock {
  id: string;
  title: string;
  description?: string;
  year: number;
  progress: number;
  createdAt: string;
}

export interface KeyPerson {
  id: string;
  name: string;
  relationship: string;
  personalityType?: string;
  communicationNotes?: string;
  gratitudeNotes?: string;
  createdAt: string;
}

export interface Anniversary {
  id: string;
  personId: string;
  title: string;
  date: string;
  recurring: boolean;
  notificationsEnabled: boolean;
}

export interface GratitudeEntry {
  id: string;
  date: string;
  entries: string[];
  gratefulFor: {
    person: string;
    reason: string;
  }[];
}

export interface Review {
  id: string;
  type: "weekly" | "monthly" | "yearly";
  date: string;
  accomplishments: string[];
  gratitudes: string[];
  insights: string[];
}
