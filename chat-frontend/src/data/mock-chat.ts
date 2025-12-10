export interface User {
  id: string;
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export interface ChatSession {
  id: string;
  contact: User;
  messages: Message[];
}

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Charlie Brown' },
  { id: '4', name: 'Diana Prince' },
];

export const MOCK_CHATS: ChatSession[] = [
  {
    id: 'c1',
    contact: MOCK_USERS[0],
    messages: [
      { id: 'm1', senderId: '1', content: 'Hey there!', timestamp: new Date(Date.now() - 1000000) },
      { id: 'm2', senderId: 'me', content: 'Hi Alice! How are you?', timestamp: new Date(Date.now() - 900000) },
      { id: 'm3', senderId: '1', content: 'I am good, thanks! working on the distributed system project.', timestamp: new Date(Date.now() - 800000) },
    ]
  },
  {
    id: 'c2',
    contact: MOCK_USERS[1],
    messages: [
      { id: 'm4', senderId: 'me', content: 'Are you coming to the meeting?', timestamp: new Date(Date.now() - 2000000) },
      { id: 'm5', senderId: '2', content: 'Yes, I will be there in 5 mins.', timestamp: new Date(Date.now() - 1900000) },
    ]
  },
  {
    id: 'c3',
    contact: MOCK_USERS[2],
    messages: [
      { id: 'm6', senderId: '3', content: 'Can you review my PR?', timestamp: new Date(Date.now() - 300000) },
    ]
  }
];
