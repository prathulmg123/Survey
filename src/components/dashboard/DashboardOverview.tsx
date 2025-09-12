import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";

export const DashboardOverview = () => {
  const stats = [
    {
      title: "Total Surveys",
      value: "24",
      change: "+3 this month",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Responses",
      value: "1,247",
      change: "+152 this week",
      icon: MessageSquare,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Active Participants",
      value: "892",
      change: "+67 today",
      icon: Users,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      title: "Completion Rate",
      value: "84.2%",
      change: "+2.1% this month",
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's an overview of your survey platform.
          </p>
        </div>
        {/* <Button variant="hero" className="gap-2">
          <Plus className="h-4 w-4" />
          Create Survey
        </Button> */}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}  className="group relative overflow-hidden border-border/50 shadow-md hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 animate-scale-in bg-gradient-to-br from-background to-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Surveys */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card  className="group relative overflow-hidden border-border/80 shadow-md hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 animate-scale-in bg-gradient-to-br from-background to-muted/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Recent Surveys
            </CardTitle>
            <CardDescription>
              Your latest survey activities and performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSurveys.map((survey) => (
              <div
                key={survey.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/80 transition-colors duration-200"
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(survey.status)}
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm leading-none">
                      {survey.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{survey.responses} responses</span>
                      <span>•</span>
                      <span>Created {survey.created}</span>
                    </div>
                    {survey.status === "active" && (
                      <div className="flex items-center gap-2 mt-2">
                        <Progress value={survey.completion} className="w-20 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {survey.completion}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(survey.status)}
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card  className="group relative overflow-hidden border-border/80 shadow-md hover:shadow-hover transition-all duration-300 hover:scale-[1.02] hover:border-primary/20 animate-scale-in bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common tasks to get you started
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Plus className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Create New Survey</div>
                <div className="text-xs text-muted-foreground">Start collecting feedback</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <BarChart3 className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">View Analytics</div>
                <div className="text-xs text-muted-foreground">Analyze survey results</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <Users className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Manage Audience</div>
                <div className="text-xs text-muted-foreground">Update participant lists</div>
              </div>
            </Button>
            
            <Button variant="outline" className="w-full justify-start gap-3 h-12">
              <FileText className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Use Template</div>
                <div className="text-xs text-muted-foreground">Quick survey setup</div>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};