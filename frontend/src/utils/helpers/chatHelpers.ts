// chatHelpers.ts
import type { Chat } from '@/types/chat.type';
export function extractId(data: any): string {
  if (!data) {
    return '';
  }

  // Handle objects with id fields
  if (typeof data === 'object' && data !== null) {
    if (data.id && typeof data.id === 'string') {
      return data.id;
    }
    if (data._id && typeof data._id === 'string') {
      return data._id;
    }
    // New: Handle case where an object is passed instead of an ID
    if (data.user && typeof data.user === 'object' && data.user.id) {
        return data.user.id;
    }
    if (data.shop && typeof data.shop === 'object' && data.shop.id) {
        return data.shop.id;
    }
  }

  if (typeof data === 'string' && data !== '[object Object]') {
    return data;
  }

  return '';
}

/**
 * Correctly extracts the chat ID from a Chat object.
 * This is a new helper function that ensures the ID is a string.
 */
export function getChatId(chat: Chat): string {
  // Check if the chat object has a valid `id` or `_id` field
  if (chat && typeof chat === 'object') {
    if (typeof chat.id === 'string' && chat.id.length > 0) {
      return chat.id;
    }
    if (typeof (chat as any)._id === 'string' && (chat as any)._id.length > 0) {
      return (chat as any)._id;
    }
    // If ID is not a direct property, check for a nested chat object (from messages API)
    if (chat.chat && typeof chat.chat === 'object' && typeof (chat.chat as any).id === 'string') {
      return (chat.chat as any).id;
    }
  }
  return '';
}


export function isValidChatId(chatId: string): boolean {
  console.log('isValidChatId: Checking chatId:', chatId, 'type:', typeof chatId);

  if (!chatId || typeof chatId !== 'string') {
    console.log('isValidChatId: Invalid - not a string or empty');
    return false;
  }

  const trimmedId = chatId.trim();
  if (!trimmedId) {
    console.log('isValidChatId: Invalid - empty after trim');
    return false;
  }

  // Check for corrupted object strings
  if (trimmedId === '[object Object]' || trimmedId.includes('[object Object]')) {
    console.error('isValidChatId: Invalid - corrupted object string:', trimmedId);
    return false;
  }

  // Valid MongoDB ObjectId pattern (24 hex characters)
  const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
  if (mongoIdRegex.test(trimmedId)) {
    console.log('isValidChatId: Valid MongoDB ObjectId format');
    return true;
  }

  // Valid userId-shopId pattern (two MongoDB ObjectIds separated by hyphen)
  const compositeIdRegex = /^[0-9a-fA-F]{24}-[0-9a-fA-F]{24}$/;
  if (compositeIdRegex.test(trimmedId)) {
    console.log('isValidChatId: Valid composite ID format');
    return true;
  }

  // Allow other formats but log them
  if (trimmedId.length >= 5) {
    console.log('isValidChatId: Accepting non-standard format:', trimmedId);
    return true;
  }

  console.log('isValidChatId: Invalid - too short or invalid format');
  return false;
}

// Enhanced debugging function to analyze chat object structure
export function debugChatObject(chat: Chat, label: string = 'Chat Object') {
  console.log(`🐛 Debug ${label}`);
  console.log('Raw chat object:', chat);
  console.log('userId type:', typeof chat.userId, 'value:', chat.userId);
  console.log('shopId type:', typeof chat.shopId, 'value:', chat.shopId);
  console.log('_id type:', typeof chat._id, 'value:', chat._id);
  console.log('id type:', typeof chat.id, 'value:', chat.id);

  const userId = extractId(chat.userId);
  const shopId = extractId(chat.shopId);
  const chatId = getChatId(chat);
  const isValid = isValidChatId(chatId);

  console.log('Extracted userId:', userId);
  console.log('Extracted shopId:', shopId);
  console.log('Generated chatId:', chatId);
  console.log('Is valid:', isValid);

  // Check for data corruption
  const corruptionIssues = [];

  if (typeof chat.userId === 'string' && chat.userId.includes('[object Object]')) {
    corruptionIssues.push('userId is corrupted object string');
  }

  if (typeof chat.shopId === 'string' && chat.shopId.includes('[object Object]')) {
    corruptionIssues.push('shopId is corrupted object string');
  }

  if (corruptionIssues.length > 0) {
    console.error('🚨 Data Corruption Issues:', corruptionIssues);
    console.error('This suggests objects are being stringified incorrectly somewhere in the data pipeline');
  }

  return {
    userId,
    shopId,
    chatId,
    isValid,
    hasCorruption: corruptionIssues.length > 0,
    corruptionIssues
  };
}

// Utility to clean corrupted chat objects
export function cleanChatObject(chat: Chat): Chat | null {
  if (!chat) return null;

  // If we detect corruption, try to reconstruct from available data
  const hasCorruption = (
    (typeof chat.userId === 'string' && chat.userId.includes('[object Object]')) ||
    (typeof chat.shopId === 'string' && chat.shopId.includes('[object Object]'))
  );

  if (!hasCorruption) {
    return chat; // Return as-is if no corruption detected
  }

  console.warn('🔧 Attempting to clean corrupted chat object:', chat);

  // Try to find valid data in other fields or nested structures
  const cleanedChat = { ...chat };

  // Check if there are user/shop objects nested elsewhere
  if (chat.user && typeof chat.user === 'object') {
    cleanedChat.userId = chat.user;
  }

  if (chat.shop && typeof chat.shop === 'object') {
    cleanedChat.shopId = chat.shop;
  }

  // Validate the cleaned object
  const userId = extractId(cleanedChat.userId);
  const shopId = extractId(cleanedChat.shopId);

  if (!userId || !shopId) {
    console.error('🚫 Unable to clean corrupted chat object - insufficient data');
    return null;
  }

  console.log('✅ Successfully cleaned chat object');
  return cleanedChat;
}

// Type guard to check if a chat object is valid
export function isValidChatObject(chat: any): chat is Chat {
  if (!chat || typeof chat !== 'object') {
    return false;
  }

  const userId = extractId(chat.userId);
  const shopId = extractId(chat.shopId);
  const chatId = getChatId(chat);

  return Boolean(userId && shopId && isValidChatId(chatId));
}

export default {
  extractId,
  getChatId,
  isValidChatId,
  debugChatObject,
  cleanChatObject,
  isValidChatObject
};