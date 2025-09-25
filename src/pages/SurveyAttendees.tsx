import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Mail, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { getSurveyAttendees, SurveyAttendee } from '@/api/surveyService';
import { toast } from 'sonner';
import { Loader } from '@/components/ui/Loader';

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
     <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
             <div className="text-center">
               <Loader text="Loading Attendees..." show={true} size={52} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ">
          {filteredUsers.map((user) => (
            <div 
              key={user.user_id} 
              className="group relative bg-white dark:bg-gray-900/95 rounded-2xl border border-gray-100 dark:border-gray-700/80 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 dark:hover:border-blue-500/70 hover:ring-1 hover:ring-blue-100 dark:hover:ring-blue-900/30"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-transparent to-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10 h-full p-5">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="absolute -inset-1 from-blue-300 via-indigo-300 to-purple-300 dark:from-blue-100/90 dark:via-indigo-100/90 dark:to-purple-100/90 rounded-full blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 dark:from-blue-500/90 dark:to-indigo-500/90 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white/90 dark:border-gray-800/90">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conversation</span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-300">
                        {user.conversation_turns} turns
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 mr-3">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Session Start</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                            {formatDate(user.created_at).split(',')[0]}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-300 mr-3">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Last Activity</p>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
                            {formatDate(user.last_activity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {user.ai_summary?.status === 'generated' && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center mb-2">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 mr-2">
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">AI Summary</p>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 pl-2 border-l-2 border-blue-200 dark:border-blue-800 ml-1.5">
                        {user.ai_summary.summary_text}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-5">
                  <button 
                    onClick={() => console.log('View user conversation:', user.user_id)}
                    className="w-full flex items-center justify-center px-2 py-1.5 bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600 text-sm text-white font-medium rounded-md shadow-sm hover:shadow transform transition-all duration-200 hover:-translate-y-0.5 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:ring-opacity-50"
                  >
                    View Summary
                  </button>
                </div>
              </div>
              </div>
          ))}
            </div>
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
    // </div>
  );
}
