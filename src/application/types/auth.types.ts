export interface UserSession {
  user: {
    id: string;
    name: string | null;
    email: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
    image?: string | null;
  };
  session: {
    id: string;
    createdAt: Date;
    userAgent?: string;
    // Add other session fields if needed
  };
}

export interface ProfileTabProps {
  data: UserSession;
}
