import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatBot } from '@prathul/chatbot';
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressPage = () => {
  // Mock data for demonstration
  const surveyStats = {
    totalSurveys: 8,
    activeSurveys: 5,
    completedSurveys: 3,
    avgResponseRate: 68,
    totalResponses: 1245,
  };

  const recentSurveys = [
    { id: 1, name: 'Employee Engagement Q3', progress: 75, responses: 240, target: 320 },
    { id: 2, name: 'Product Feedback', progress: 45, responses: 90, target: 200 },
    { id: 3, name: 'Customer Satisfaction', progress: 90, responses: 450, target: 500 },
  ];

  const responseData = [
    { name: 'Mon', responses: 40 },
    { name: 'Tue', responses: 65 },
    { name: 'Wed', responses: 52 },
    { name: 'Thu', responses: 78 },
    { name: 'Fri', responses: 95 },
    { name: 'Sat', responses: 30 },
    { name: 'Sun', responses: 55 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Conversational Survey Agent</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Interact with our AI assistant to manage and analyze your surveys
          </p>
        </div>
      </div>
      
      {/* <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '380px',
        height: '600px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <iframe 
          src="/chatbot-widget/index.html" 
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
            display: 'block',
            flexGrow: 1
          }}
          title="AI Survey Assistant"
          allow="microphone"
        />
      </div> */}
       <div style={{
        position: 'relative',
        width: '100%',
        height: '70vh',
        minHeight: '600px',
        backgroundColor: '#fff',
        borderRadius: '10px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <iframe 
          src="/chatbot-widget/index.html" 
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
            display: 'block'
          }}
          title="AI Survey Assistant"
          allow="microphone"
        />
      </div>
    </div>
  );
};

export default ProgressPage;
