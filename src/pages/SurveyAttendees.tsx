import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Mail, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getSurveyAttendees, SurveyAttendee } from '@/api/surveyService';
import { toast } from 'sonner';

export default function SurveyAttendees() {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<SurveyAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [surveyTitle, setSurveyTitle] = useState('Survey');

  // Fetch survey attendees
  useEffect(() => {
    const fetchAttendees = async () => {
      if (!surveyId) return;
      
      try {
        setLoading(true);
        const response = await getSurveyAttendees(surveyId);
        
        if (response.success && response.data) {
          setUsers(response.data.attendance_details || []);
          setSurveyTitle(`Survey #${surveyId.substring(0, 6)} Attendees`);
        } else {
          toast.error(response.message || 'Failed to fetch survey attendees');
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching survey attendees:', error);
        toast.error('An error occurred while fetching survey attendees');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendees();
  }, [surveyId]);

  const filteredUsers = users.filter(user => 
    (user.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            Inactive
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            Unknown
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between mb-6">
                 <div>
                   <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">
                     Survey Attendees
                   </h2>
                   <nav className="flex mt-2" aria-label="Breadcrumb">
                     <ol className="flex text-sm items-center space-x-2">
                       <li>
                         <div>
                            <Link to="/manage" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                             Survey
                           </Link> 
                         </div>
                       </li>
                       <li>
                         <div className="flex items-center">
                            <span className="flex items-center">
                              <svg className="h-5 w-4 text-gray-400 mx-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Attendees
                              </span>
                            </span>
                         </div>
                       </li>
                     </ol>
                   </nav>
                 </div>
         
               </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search participants..."
                className="pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span>{users.length} participants</span>
              {/* <span className="mx-2">•</span> */}
              {/* <span className="text-green-500 dark:text-green-400">
                {users.filter(u => u.status === 'completed').length} completed
              </span> */}
              {/* <span className="mx-2">•</span>
              <span className="text-blue-500 dark:text-blue-400">
                {users.filter(u => u.status === 'active').length} active
              </span> */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.user_id} className="group hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {user.username}
                  </CardTitle>
                  {getStatusBadge(user.status)}
                </div>
                <CardDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Mail className="h-4 w-4 mr-1.5" />
                  <span className="truncate">{user.email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Attendance Type</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {user.attendance_type.replace('_', ' ')}
                    </span>
                  </div> */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Conversation Turns</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.conversation_turns}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Session Started</span>
                    <div className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1 text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatDate(user.created_at).split(',')[0]}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Last Activity</span>
                    <div className="flex items-center">
                      <Clock className="h-3.5 w-3.5 mr-1 text-blue-400" />
                      <span className="text-blue-600 dark:text-blue-400">
                        {formatDate(user.last_activity)}
                      </span>
                    </div>
                  </div>
                  {user.ai_summary?.status === 'generated' && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">AI Summary</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {user.ai_summary.summary_text}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-blue-50 dark:group-hover:bg-gray-700/50 transition-colors"
                    onClick={() => {
                      // TODO: Navigate to user's conversation detail page
                      console.log('View user conversation:', user.user_id);
                    }}
                  >
                    View Summary
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No participants found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {searchTerm ? 'Try a different search term' : 'No participants have taken this survey yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
