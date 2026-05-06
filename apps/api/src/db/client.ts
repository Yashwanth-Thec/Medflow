export interface QueryableDatabase {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export function getDatabase(): QueryableDatabase {
  // TODO: wire a real Postgres client after DATABASE_URL is available in the deployment environment.
  return {
    async query() {
      throw new Error("Database client is not configured yet");
    },
  };
}
