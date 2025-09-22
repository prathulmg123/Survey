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
      <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight !text-[#374151] dark:!text-gray-200">AI Survey Assistant</h2>
          <p className="text-muted-foreground text-base text-sm">
          Get instant insights and recommendations for your survey data
          </p>
        </div>

     
    </div>
  );
};

export default ProgressPage;
