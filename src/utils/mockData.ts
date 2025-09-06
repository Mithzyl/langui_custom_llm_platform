import Memory from '@/types/Memory';
import { v4 as uuidv4 } from 'uuid';

export const generateMockMemories = (count: number = 10): Memory[] => {
  const sampleMemories = [
    'User is interested in the computer science program at Uppsala University',
    'User has a vegetarian wife',
    'Looking for recommended attractions in Wuhu',
    'User is looking for recipes that can be done in 10 minutes',
    'User is interested in how to make 龙井虾仁',
    'User can enjoy a wider variety of foods including eggs and dairy',
    'User is looking for recommendations for Hangzhou specialty dishes',
    'User is interested in how to make 东坡肉 (Dongpo Pork)',
    'User plans to travel to 柳州',
    'User is interested in the recipe for 香辣鱿鱼 (Spicy Squid)'
  ];

  return Array.from({ length: count }, (_, index) => ({
    id: uuidv4(),
    memory: sampleMemories[index % sampleMemories.length],
    hash: uuidv4().replace(/-/g, ''),
    metadata: null,
    created_at: new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString(),
    updated_at: Math.random() > 0.7 ? new Date().toISOString() : null,
    user_id: "637414fd-6a9e-452e-8468-02adca3c083c"
  }));
};

// Usage example:
// const mockMemories = generateMockMemories(5);