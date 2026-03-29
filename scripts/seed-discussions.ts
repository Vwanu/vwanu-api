/**
 * Temporary script to seed forum discussions into random interests.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/seed-discussions.ts
 */
import config from 'config';
import { Sequelize } from 'sequelize-typescript';
import Models from '../src/database';
import { Interest } from '../src/database/interest';
import { ForumDiscussion } from '../src/database/forumDiscussion';
import { User } from '../src/database/user';
import { DBConfigurationType } from '../src/schema/serverConf.schema';

// ── Mock data ──────────────────────────────────────────────────────────

interface MockReply {
  id: string;
  body: string;
  userIndex: number; // index into the fetched real users array
  createdAt: string;
}

interface MockDiscussion {
  id: string;
  title: string;
  body: string;
  userIndex: number;
  replies: MockReply[];
  createdAt: string;
}

const mockDiscussions: MockDiscussion[] = [
  {
    id: 'd1',
    title: 'Welcome to the community!',
    body: 'Introduce yourself and let us know what brings you here. We are excited to have you join the conversation.',
    userIndex: 0,
    replies: [
      { id: 'r1-1', body: 'Hey everyone! I am a developer from Port-au-Prince. Excited to be here and connect with like-minded people.', userIndex: 1, createdAt: '2025-12-01T12:30:00Z' },
      { id: 'r1-2', body: 'Welcome! This community has been amazing for networking. You will love it here.', userIndex: 2, createdAt: '2025-12-01T14:00:00Z' },
      { id: 'r1-3', body: 'Glad to join! Looking forward to learning from everyone.', userIndex: 0, createdAt: '2025-12-02T09:00:00Z' },
    ],
    createdAt: '2025-12-01T10:00:00Z',
  },
  {
    id: 'd2',
    title: 'Best resources to get started?',
    body: 'I am new here and looking for recommendations on books, courses, or tutorials. What helped you the most when you were starting out?',
    userIndex: 1,
    replies: [
      { id: 'r2-1', body: 'I would recommend starting with the official documentation. It is well written and covers all the basics.', userIndex: 2, createdAt: '2025-12-03T16:00:00Z' },
      { id: 'r2-2', body: 'YouTube has some great free tutorials. Check out channels like Fireship and Traversy Media.', userIndex: 0, createdAt: '2025-12-04T10:15:00Z' },
    ],
    createdAt: '2025-12-03T14:30:00Z',
  },
  {
    id: 'd3',
    title: 'Weekly discussion thread',
    body: 'Share what you have been working on this week. Any wins, challenges, or interesting discoveries? Let us keep each other motivated.',
    userIndex: 2,
    replies: [
      { id: 'r3-1', body: 'Just shipped a new feature at work. Feels great to see it live!', userIndex: 0, createdAt: '2025-12-05T11:00:00Z' },
    ],
    createdAt: '2025-12-05T09:15:00Z',
  },
  {
    id: 'd4',
    title: 'Tips for staying consistent',
    body: 'Consistency is key but it is hard to maintain. What strategies do you use to stay on track with your goals?',
    userIndex: 0,
    replies: [],
    createdAt: '2025-12-07T16:45:00Z',
  },
  {
    id: 'd5',
    title: 'Collaboration opportunities',
    body: 'Looking for people to collaborate on projects. If you are interested in teaming up, drop a comment with your skills and availability.',
    userIndex: 1,
    replies: [
      { id: 'r5-1', body: 'I am a designer and would love to collaborate. Send me a message!', userIndex: 2, createdAt: '2025-12-10T14:00:00Z' },
      { id: 'r5-2', body: 'Full-stack dev here. Open to weekend projects. What kind of ideas do you have in mind?', userIndex: 0, createdAt: '2025-12-11T08:30:00Z' },
      { id: 'r5-3', body: 'Count me in! I have experience with mobile development and would love to contribute.', userIndex: 1, createdAt: '2025-12-11T15:20:00Z' },
    ],
    createdAt: '2025-12-10T11:20:00Z',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  const dbSettings = config.get<DBConfigurationType>('dbSettings');

  const sequelize = dbSettings.url
    ? new Sequelize(dbSettings.url, { ...dbSettings, logging: false } as any)
    : new Sequelize({ ...dbSettings, logging: false } as any);

  sequelize.addModels(Models);
  await sequelize.authenticate();
  console.log('Connected to database');

  // Fetch all interests
  const interests = await Interest.findAll();
  if (interests.length === 0) {
    console.error('No interests found in the database. Seed some interests first.');
    process.exit(1);
  }
  console.log(`Found ${interests.length} interests`);

  // Fetch some real users to attach discussions to
  const users = await User.findAll({ limit: 10 });
  if (users.length < 3) {
    console.error('Need at least 3 users in the database.');
    process.exit(1);
  }
  console.log(`Using ${users.length} users`);

  let discussionCount = 0;
  let replyCount = 0;

  for (const disc of mockDiscussions) {
    const interest = pickRandom(interests);
    const user = users[disc.userIndex % users.length];

    // Create the top-level discussion
    const created = await ForumDiscussion.create({
      title: disc.title,
      body: disc.body,
      userId: user.id,
      interestId: interest.id,
    } as any);
    discussionCount++;

    console.log(`  [${interest.name}] "${disc.title}" by ${user.id}`);

    // Create replies as child discussions
    for (const reply of disc.replies) {
      const replyUser = users[reply.userIndex % users.length];
      await ForumDiscussion.create({
        title: `Re: ${disc.title}`,
        body: reply.body,
        userId: replyUser.id,
        interestId: interest.id,
        parentId: created.id,
      } as any);
      replyCount++;
    }
  }

  console.log(`\nDone! Created ${discussionCount} discussions and ${replyCount} replies.`);
  await sequelize.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
