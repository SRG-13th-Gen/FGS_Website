import "server-only";
import mysql, {
  type Pool,
  type PoolConnection,
  type RowDataPacket,
  type ResultSetHeader,
} from "mysql2/promise";
import { getServerEnvironment } from "@/lib/env/server";
export type SqlValue = string | number | boolean | null | Buffer;
let pool: Pool | undefined;
export function getPool(): Pool {
  if (pool) return pool;
  const env = getServerEnvironment();
  if (!env.DB_HOST || !env.DB_NAME || !env.DB_USER || !env.DB_PASSWORD)
    throw new Error("Content database is not configured.");
  pool = mysql.createPool({
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    connectionLimit: 5,
    connectTimeout: 10000,
    charset: "utf8mb4",
    timezone: "Z",
    dateStrings: true,
  });
  return pool;
}
export async function rows<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: SqlValue[] = [],
  connection?: PoolConnection,
): Promise<T[]> {
  const [result] = await (connection ?? getPool()).execute<T[]>(sql, params);
  return result;
}
export async function mutate(
  sql: string,
  params: SqlValue[] = [],
  connection?: PoolConnection,
): Promise<ResultSetHeader> {
  const [result] = await (connection ?? getPool()).execute<ResultSetHeader>(
    sql,
    params,
  );
  return result;
}
export async function transaction<T>(
  operation: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
export function isoDate(value: string | null): string | null {
  return value
    ? new Date(
        value.replace(" ", "T") + (value.endsWith("Z") ? "" : "Z"),
      ).toISOString()
    : null;
}
