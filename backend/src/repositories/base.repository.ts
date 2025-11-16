import { SupabaseClient } from '@supabase/supabase-js';
import { executeQuery, executeMutation, RetryOptions } from '../utils/database.js';

/**
 * Base repository class providing common CRUD operations
 * All specific repositories should extend this class
 */
export abstract class BaseRepository<T> {
  protected client: SupabaseClient;
  protected tableName: string;

  constructor(client: SupabaseClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Find all records for a user
   */
  async findAll(userId: string, options?: RetryOptions): Promise<T[]> {
    return executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });
        return result;
      },
      options
    );
  }

  /**
   * Find a single record by ID
   */
  async findById(id: string, userId: string, options?: RetryOptions): Promise<T | null> {
    try {
      const result = await executeQuery(
        async () => {
          const result = await this.client
            .from(this.tableName)
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();
          return result;
        },
        options
      );
      return result as T;
    } catch (error) {
      // Return null if not found instead of throwing
      if (error instanceof Error && error.message.includes('No rows found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>, userId: string, options?: RetryOptions): Promise<T> {
    const recordWithUser = {
      ...data,
      user_id: userId,
    };

    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .insert(recordWithUser)
          .select()
          .single();
        return result;
      },
      options
    );
  }

  /**
   * Create multiple records in bulk
   */
  async createMany(data: Partial<T>[], userId: string, options?: RetryOptions): Promise<T[]> {
    const recordsWithUser = data.map((item) => ({
      ...item,
      user_id: userId,
    }));

    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .insert(recordsWithUser)
          .select();
        return result;
      },
      options
    );
  }

  /**
   * Update a record by ID
   */
  async update(
    id: string,
    data: Partial<T>,
    userId: string,
    options?: RetryOptions
  ): Promise<T> {
    return executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .update(data)
          .eq('id', id)
          .eq('user_id', userId)
          .select()
          .single();
        return result;
      },
      options
    );
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string, userId: string, options?: RetryOptions): Promise<void> {
    await executeMutation(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        return result;
      },
      options
    );
  }

  /**
   * Count records for a user
   */
  async count(userId: string, options?: RetryOptions): Promise<number> {
    const result = await executeQuery(
      async () => {
        const result = await this.client
          .from(this.tableName)
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        return result;
      },
      options
    );

    return (result as any[]).length;
  }

  /**
   * Check if a record exists
   */
  async exists(id: string, userId: string): Promise<boolean> {
    const record = await this.findById(id, userId);
    return record !== null;
  }
}
