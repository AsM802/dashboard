import { connectToDatabase } from '../lib/mongodb';

async function getMessages() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('contacts');
    const messages = await collection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Convert ObjectId to string for serialization
    return messages.map(msg => ({
      ...msg,
      _id: msg._id.toString()
    }));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export default async function MessagesPage() {
  const messages = await getMessages();

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Contact Messages</h1>
        
        {messages.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-500 text-lg">No messages found.</p>
            <p className="text-gray-400 mt-2">Submit a message using the contact form to see it here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message: any) => (
              <div key={message._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{message.name}</h3>
                    <p className="text-gray-600">{message.email}</p>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(message.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{message.message}</p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
