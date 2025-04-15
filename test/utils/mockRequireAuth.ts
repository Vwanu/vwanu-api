/* eslint-disable import/prefer-default-export */
import { mockAuthManager } from './mockCognito';

// This module mocks the requireAuth hook for testing
export const {requireAuth} = mockAuthManager;
