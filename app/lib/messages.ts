import { connectToDatabase } from './mongodb';

export async function getMessages() {
  const { db } = await connectToDatabase();
  const messages = await db.collection('messages').find({}).toArray();
  return messages;
}