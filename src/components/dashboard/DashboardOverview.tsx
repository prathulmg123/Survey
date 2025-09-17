import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLoader } from "@/hooks/useLoader";
import { Loader } from "@/components/ui/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  Users,
  FileText,
  TrendingUp,
  Plus,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  Download,
  AlertCircle,
  Lightbulb,
  BarChart2,
  PieChart,
  Activity,
  TrendingUp as TrendingUpIcon,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export const DashboardOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    // Set a timeout to hide the loader after 3 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
      hideLoader();
    }, 500);

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      clearTimeout(timer);
      hideLoader();
    };
  }, [showLoader, hideLoader]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading..." show={true} size={52} />
        </div>
      </div>
    );
  }
  const stats = [
    {
      title: "Total Surveys",
      value: "24",
      change: { value: "+3", period: "this month", isPositive: true },
      icon: FileText,
      color: "text-[#3c83f5]",
      bgColor: "bg-[#3c83f5]/10",
      trend: [12, 15, 18, 21, 24],
    },
    {
      title: "Total Responses",
      value: "1,247",
      change: { value: "+152", period: "this week", isPositive: true },
      icon: MessageSquare,
      color: "text-[#3c83f5]",
      bgColor: "bg-[#3c83f5]/10",
      trend: [800, 920, 1050, 1095, 1247],
    },
    {
      title: "Active Participants",
      value: "892",
      change: { value: "+67", period: "today", isPositive: true },
      icon: Users,
      color: "text-[#3c83f5]",
      bgColor: "bg-[#3c83f5]/10",
      trend: [700, 750, 800, 825, 892],
    },
    {
      title: "Completion Rate",
      value: "84.2%",
      change: { value: "+2.1%", period: "this month", isPositive: true },
      icon: TrendingUp,
      color: "text-[#3c83f5]",
      bgColor: "bg-[#3c83f5]/10",
      trend: [78, 80, 81.5, 82.1, 84.2],
    },
  ];

  const responseData = [
    { name: 'Mon', responses: 120 },
    { name: 'Tue', responses: 210 },
    { name: 'Wed', responses: 180 },
    { name: 'Thu', responses: 280 },
    { name: 'Fri', responses: 190 },
    { name: 'Sat', responses: 150 },
    { name: 'Sun', responses: 120 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 65, color: '#3c83f5' },
    { name: 'Neutral', value: 25, color: '#bcc3ca' },
    { name: 'Negative', value: 10, color: '#ef4444' },
  ];

  const surveyPerformance = [
    { name: 'Q1', completion: 78, target: 85 },
    { name: 'Q2', completion: 82, target: 85 },
    { name: 'Q3', completion: 76, target: 85 },
    { name: 'Q4', completion: 89, target: 85 },
  ];

  const insights = [
    {
      id: 1,
      title: 'Low Response Rate',
      description: '3 surveys have less than 20 responses',
      action: 'Send reminder emails to participants',
      icon: AlertCircle,
      color: 'text-warning',
    },
    {
      id: 2,
      title: 'High Drop-off Rate',
      description: 'Survey #123 has 45% drop-off at question 5',
      action: 'Review question complexity',
      icon: AlertCircle,
      color: 'text-destructive',
    },
    {
      id: 3,
      title: 'Positive Trend',
      description: 'Customer satisfaction increased by 12% this month',
      action: 'View detailed report',
      icon: TrendingUpIcon,
      color: 'text-success',
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            <span className="text-muted-foreground">Responses: </span>
            <span className="font-medium">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-3 rounded-lg shadow-lg">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  const recentSurveys = [
    {
      id: 1,
      title: "Customer Satisfaction Q4 2024",
      status: "active",
      responses: 234,
      completion: 78,
      created: "2 days ago",
    },
    {
      id: 2,
      title: "Product Feedback Survey",
      status: "draft",
      responses: 0,
      completion: 0,
      created: "1 week ago",
    },
    {
      id: 3,
      title: "Employee Engagement Survey",
      status: "completed",
      responses: 89,
      completion: 92,
      created: "2 weeks ago",
    },
    {
      id: 4,
      title: "Market Research Study",
      status: "active",
      responses: 156,
      completion: 65,
      created: "3 days ago",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-success text-success-foreground">Active</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
      case "draft":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Dashboard</h2>

          <p className="text-muted-foreground text-base text-sm mt-2">
            Welcome back! Here's an overview of your survey platform.
          </p>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="group relative overflow-hidden border-border/50 shadow-md hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 animate-scale-in bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.change.isPositive ? (
                  <ArrowUpRight className="h-3 w-3 text-success" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-destructive" />
                )}
                <span className={`text-xs ${stat.change.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {stat.change.value} {stat.change.period}
                </span>
              </div>
              <div className="h-10 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stat.trend.map((value, index) => ({ value, index }))}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={stat.change.isPositive ? '#10B981' : '#EF4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Response Trend Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Response Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="responses"
                  stroke="#3c83f5"
                  strokeWidth={2}
                  dot={{
                    fill: "#3c83f5",
                    strokeWidth: 2,
                    r: 4,
                    stroke: "#fff"
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "#fff",
                    strokeWidth: 2,
                    fill: "#3c83f5"
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sentiment Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <PieChart className="h-4 w-4 text-primary" />
              Response Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex flex-col items-center justify-center">
            <div className="relative h-40 w-40">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">4.2</span>
                <span className="text-xs text-muted-foreground">Avg. Rating</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 w-full">
              {sentimentData.map((item) => (
                <div key={item.name} className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs mt-1">{item.name}</span>
                  <span className="text-sm font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Survey Performance */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-primary" />
              Survey Performance vs Target
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Target</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Actual</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={surveyPerformance}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border p-3 rounded-lg shadow-lg">
                        <p className="font-medium">Quarter {label}</p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Target: </span>
                          <span className="font-medium">{payload[0].payload.target}%</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">Actual: </span>
                          <span className="font-medium">{payload[0].payload.completion}%</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="target"
                fill="#bcc3ca"
                radius={[4, 4, 0, 0]}
                opacity={0.7}
                barSize={70}
              />
              <Bar
                dataKey="completion"
                fill="#3c83f5"
                radius={[4, 4, 0, 0]}
                barSize={70}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Surveys & Insights */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="group relative overflow-hidden border-border/80 shadow-md hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 animate-scale-in bg-gradient-to-br from-background to-muted/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Recent Surveys
              </CardTitle>
              <CardDescription>
                Your latest survey activities and performance
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <span>Filter</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8">
                <Download className="h-3.5 w-3.5 mr-1.5" />
                <span>Export</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search surveys..."
                className="pl-9 h-9 text-sm"
              />
            </div>

            <div className="space-y-3">
              {recentSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors duration-200 group/item"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-lg mt-0.5 ${survey.status === 'active' ? 'bg-[#3c83f5]/10 text-[#3c83f5]' : survey.status === 'completed' ? 'bg-muted text-muted-foreground' : 'bg-[#bcc3ca]/10 text-[#bcc3ca]'}`}>
                      {getStatusIcon(survey.status)}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm leading-none truncate">
                          {survey.title}
                        </h4>
                        <div className="flex-shrink-0">
                          {getStatusBadge(survey.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{survey.responses} responses</span>
                        <span>•</span>
                        <span>Created {survey.created}</span>
                      </div>
                      {survey.status === "active" && (
                        <div className="pt-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Completion</span>
                            <span className="font-medium">{survey.completion}%</span>
                          </div>
                          <Progress value={survey.completion} className="h-1.5" />
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover/item:opacity-100 transition-opacity"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-2">
              View All Surveys
            </Button>
          </CardContent>
        </Card>

        {/* Insights & Recommendations */}
        <Card className="group relative overflow-hidden border-border/80 shadow-md hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 animate-scale-in bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Insights & Recommendations
                </CardTitle>
                <CardDescription>
                  Actionable insights to improve your surveys
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                <span>3 New</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="insights" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="insights" className="space-y-4 pt-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg mt-0.5 ${insight.color === 'text-warning' ? 'text-[#bcc3ca] bg-[#bcc3ca]/10' : insight.color === 'text-destructive' ? 'text-[#ef4444] bg-[#ef4444]/10' : 'text-[#3c83f5] bg-[#3c83f5]/10'}`}>
                        <insight.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                        <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                          {insight.action}
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="recommendations" className="pt-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm">Improve Response Rates</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Try sending reminder emails to participants who haven't responded yet.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                      Set up reminders
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium text-sm">Enhance Survey Design</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Consider adding more images and simplifying complex questions.
                    </p>
                    <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
                      View design tips
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="bg-muted/30 p-4 rounded-lg">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Performance Summary
              </h4>
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Response Rate</p>
                  <p className="font-medium">64.5%</p>
                  <p className="text-xs text-success flex items-center">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    +5.2% from last month
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avg. Completion Time</p>
                  <p className="font-medium">2.8 min</p>
                  <p className="text-xs text-destructive flex items-center">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    -0.5 min from last month
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};