/**
 * Example usage of generated types for React Native frontend
 * This file demonstrates how to use the auto-generated types
 */

import {
  UserInterface,
  PostInterface,
  CreateUserInput,
  CreatePostInput,
  ApiResponse,
  PaginatedResponse,
  ID
} from './index';

// Example: API Response handling
async function fetchUser(userId: ID): Promise<UserInterface> {
  const response = await fetch(`/api/users/${userId}`);
  const result: ApiResponse<UserInterface> = await response.json();

  if (result.success && result.data) {
    return result.data;
  }

  throw new Error(result.error || 'Failed to fetch user');
}

// Example: Creating a new user
async function createUser(userData: CreateUserInput['body']): Promise<UserInterface> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const result: ApiResponse<UserInterface> = await response.json();
  return result.data!;
}

// Example: Fetching paginated posts
async function fetchPosts(): Promise<PaginatedResponse<PostInterface>> {
  const response = await fetch('/api/posts');
  return response.json();
}

// Example: Type-safe state management (Redux/Zustand)
interface AppState {
  currentUser: UserInterface | null;
  posts: PostInterface[];
  loading: boolean;
  error: string | null;
}

// Example: React component props (React Native)
interface UserProfileProps {
  user: UserInterface;
  onUpdate: (user: UserInterface) => void;
}

// Example: Form validation types
interface CreatePostForm extends CreatePostInput {
  errors?: {
    postText?: string;
    media?: string;
  };
}

export {
  fetchUser,
  createUser,
  fetchPosts,
  type AppState,
  type UserProfileProps,
  type CreatePostForm
};