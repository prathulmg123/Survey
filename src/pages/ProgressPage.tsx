import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { ChatBot } from 'chat-bot-prathul';
import { ChatBot } from '@prathul/chatbot';

const ProgressPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Survey Progress</h2>
          <p className="text-muted-foreground">
            Track and manage your survey progress
          </p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Your Survey Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Here you can view and track the progress of your surveys. This page provides an overview of all your in-progress surveys, 
              showing completion status, response rates, and other key metrics to help you monitor your survey campaigns effectively.
            </p>
            <p className="text-muted-foreground">
              As you continue working on your surveys, this dashboard will update in real-time to reflect the latest status and 
              provide you with actionable insights to improve response rates and data quality.
            </p>
          </div>

          <div >
      <h1>Chat with our AI Assistant</h1>
      <ChatBot
            apiUrl="https://your-api-endpoint.com/chat"
            placeholder="Type your message here..."
            botName="AI Assistant"
            userName="You"
            height="600px"
            onMessageSent={(message) => console.log('Message sent:', message)}
            onResponseReceived={(response) => console.log('Response:', response)}
            onError={(error) => console.error('Error:', error)}
            theme="light"
            className="border-2 border-blue-400/30 dark:border-blue-500/30 rounded-xl shadow-xl shadow-blue-200/50 dark:shadow-blue-900/30 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-300/50 "
          /> 
    </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPage;
