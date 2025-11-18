import { describe, it, expect } from 'vitest';
import {
  snakeToCamel,
  camelToSnake,
  keysToCamel,
  keysToSnake,
} from './case-transform';

describe('Case Transformation Utilities', () => {
  describe('snakeToCamel', () => {
    it('should convert snake_case to camelCase', () => {
      expect(snakeToCamel('user_id')).toBe('userId');
      expect(snakeToCamel('first_name')).toBe('firstName');
      expect(snakeToCamel('created_at')).toBe('createdAt');
    });

    it('should handle strings without underscores', () => {
      expect(snakeToCamel('name')).toBe('name');
      expect(snakeToCamel('id')).toBe('id');
    });

    it('should handle multiple underscores', () => {
      expect(snakeToCamel('user_profile_image_url')).toBe('userProfileImageUrl');
    });
  });

  describe('camelToSnake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(camelToSnake('userId')).toBe('user_id');
      expect(camelToSnake('firstName')).toBe('first_name');
      expect(camelToSnake('createdAt')).toBe('created_at');
    });

    it('should handle strings without capitals', () => {
      expect(camelToSnake('name')).toBe('name');
      expect(camelToSnake('id')).toBe('id');
    });

    it('should handle multiple capitals', () => {
      expect(camelToSnake('userProfileImageUrl')).toBe('user_profile_image_url');
    });
  });

  describe('keysToCamel', () => {
    it('should transform object keys from snake_case to camelCase', () => {
      const input = {
        user_id: '123',
        first_name: 'John',
        last_name: 'Doe',
      };

      const expected = {
        userId: '123',
        firstName: 'John',
        lastName: 'Doe',
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        user_id: '123',
        user_profile: {
          profile_image: 'url',
          bio_text: 'Hello',
        },
      };

      const expected = {
        userId: '123',
        userProfile: {
          profileImage: 'url',
          bioText: 'Hello',
        },
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle arrays of objects', () => {
      const input = [
        { user_id: '1', first_name: 'John' },
        { user_id: '2', first_name: 'Jane' },
      ];

      const expected = [
        { userId: '1', firstName: 'John' },
        { userId: '2', firstName: 'Jane' },
      ];

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should handle arrays within objects', () => {
      const input = {
        user_id: '123',
        user_posts: [
          { post_id: '1', post_title: 'First' },
          { post_id: '2', post_title: 'Second' },
        ],
      };

      const expected = {
        userId: '123',
        userPosts: [
          { postId: '1', postTitle: 'First' },
          { postId: '2', postTitle: 'Second' },
        ],
      };

      expect(keysToCamel(input)).toEqual(expected);
    });

    it('should preserve non-object values', () => {
      expect(keysToCamel('string')).toBe('string');
      expect(keysToCamel(123)).toBe(123);
      expect(keysToCamel(true)).toBe(true);
      expect(keysToCamel(null)).toBe(null);
    });

    it('should handle Date objects', () => {
      const date = new Date('2024-01-01');
      expect(keysToCamel(date)).toBe(date);
    });
  });

  describe('keysToSnake', () => {
    it('should transform object keys from camelCase to snake_case', () => {
      const input = {
        userId: '123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expected = {
        user_id: '123',
        first_name: 'John',
        last_name: 'Doe',
      };

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('should handle nested objects', () => {
      const input = {
        userId: '123',
        userProfile: {
          profileImage: 'url',
          bioText: 'Hello',
        },
      };

      const expected = {
        user_id: '123',
        user_profile: {
          profile_image: 'url',
          bio_text: 'Hello',
        },
      };

      expect(keysToSnake(input)).toEqual(expected);
    });

    it('should handle arrays of objects', () => {
      const input = [
        { userId: '1', firstName: 'John' },
        { userId: '2', firstName: 'Jane' },
      ];

      const expected = [
        { user_id: '1', first_name: 'John' },
        { user_id: '2', first_name: 'Jane' },
      ];

      expect(keysToSnake(input)).toEqual(expected);
    });
  });

  describe('Real-world AI Insights transformation', () => {
    it('should transform AI insights response correctly', () => {
      const input = {
        id: '123',
        user_id: '456',
        period_start: '2024-01-01',
        period_end: '2024-01-31',
        monthly_summary: 'You spent $1000 this month',
        category_insights: [
          {
            category: 'Food',
            total_spent: 500,
            percentage_of_total: 50,
            insight: 'High spending on food',
          },
        ],
        spending_spikes: [
          {
            date: '2024-01-15',
            amount: 200,
            category: 'Shopping',
            description: 'Large purchase',
          },
        ],
        recommendations: ['Save more', 'Budget better'],
        projections: {
          next_week: 250,
          next_month: 1000,
          confidence: 'high',
          explanation: 'Based on trends',
        },
        generated_at: '2024-01-31T12:00:00Z',
      };

      const expected = {
        id: '123',
        userId: '456',
        periodStart: '2024-01-01',
        periodEnd: '2024-01-31',
        monthlySummary: 'You spent $1000 this month',
        categoryInsights: [
          {
            category: 'Food',
            totalSpent: 500,
            percentageOfTotal: 50,
            insight: 'High spending on food',
          },
        ],
        spendingSpikes: [
          {
            date: '2024-01-15',
            amount: 200,
            category: 'Shopping',
            description: 'Large purchase',
          },
        ],
        recommendations: ['Save more', 'Budget better'],
        projections: {
          nextWeek: 250,
          nextMonth: 1000,
          confidence: 'high',
          explanation: 'Based on trends',
        },
        generatedAt: '2024-01-31T12:00:00Z',
      };

      expect(keysToCamel(input)).toEqual(expected);
    });
  });
});
