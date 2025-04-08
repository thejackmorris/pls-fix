import Reader from './components/Reader';

// This will be replaced with actual data fetching
const mockSubject = {
  id: '1',
  title: 'Sample Article',
  content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  url: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: '1',
};

const mockDiscussions = [
  {
    id: '1',
    startIndex: 27,
    endIndex: 50,
    snippet: 'consectetur adipiscing elit',
    createdAt: new Date(),
    updatedAt: new Date(),
    subjectId: '1',
    userId: '1',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <Reader subject={mockSubject} discussions={mockDiscussions} />
    </main>
  );
}
