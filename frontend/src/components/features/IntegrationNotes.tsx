/**
 * Integration Notes Component
 * 
 * This component provides guidance on how to integrate the Chat UI template
 * with real backend services and data management.
 */
export const IntegrationNotes = () => {
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                    rounded-lg p-4 m-4 text-sm">
      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
        🚀 How to Integrate with Real Backend
      </h3>
      <div className="space-y-2 text-blue-800 dark:text-blue-200">
        <div>
          <strong>1. State Management:</strong> Replace useState with Redux, Zustand, or Context API
        </div>
        <div>
          <strong>2. API Integration:</strong> Replace mock data in mockData.ts with real API calls
        </div>
        <div>
          <strong>3. Real-time Updates:</strong> Add WebSocket connections for live chat updates
        </div>
        <div>
          <strong>4. Authentication:</strong> Add login/logout and user session management
        </div>
        <div>
          <strong>5. File Uploads:</strong> Implement file attachment support in Composer
        </div>
        <div>
          <strong>6. Search:</strong> Connect ChatSearchInput to your search API
        </div>
        <div>
          <strong>7. AI Integration:</strong> Connect to your AI assistant API for responses
        </div>
      </div>
    </div>
  );
};
