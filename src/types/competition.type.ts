export enum CompetitionCategory {
  SOLO = 'solo',
  GROUP = 'group',
  DUET = 'duet',
}

export enum CompetitionLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum CompetitionMode {
  OFFLINE = 'offline',
  ONLINE = 'online',
}

export enum CompetitionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface RegisteredDancer {
  dancerId: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  score: number;
  registeredAt: string;
}

export interface Competition {
  _id: string;
  organizer_id: string;
  title: string;
  description: string;
  category: CompetitionCategory;
  style: string;
  level: CompetitionLevel;
  age_category: string;
  mode: CompetitionMode;
  duration: string;
  location?: string;
  meeting_link?: string;
  posterImage: string;
  document?: string;
  fee: number;
  date: string;
  maxParticipants: number;
  registrationDeadline: string;
  status: CompetitionStatus;
  registeredDancers: RegisteredDancer[];
  results?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompetitionData {
  title: string;
  description: string;
  category: CompetitionCategory;
  style: string;
  level: CompetitionLevel;
  age_category: string;
  mode: CompetitionMode;
  duration: string;
  location?: string;
  meeting_link?: string;
  posterImage: string;
  document?: string;
  fee: number;
  date: string;
  registrationDeadline: string;
}
