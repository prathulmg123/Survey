import apiClient from './apiClient';

export interface SurveyResponse {
  success: boolean;
  message: string;
  data: {
    guides: Survey[];
    count: number;
  };
}

export interface ResearchArea {
  id: string;
  name: string;
  description: string;
  sub_topics: Array<{
    id: string;
    name: string;
    description: string;
    follow_up_limit: number;
    consecutive_probes_limit: number;
    completion_criteria: string[];
  }>;
}

export interface Survey {
  _id: string;
  name: string;
  source_document_name: string;
  overall_research_goal: string;
  initiator_question: string;
  research_areas: ResearchArea[];
  status: string;
  created_at: string;
  responses?: number; // Will be added in the mapping
}

export const getSurveys = async (): Promise<SurveyResponse> => {
  const response = await apiClient.get<SurveyResponse>('/api/guides');
  return response.data;
};

export const getSurveyById = async (id: string): Promise<{success: boolean; message: string; data: any}> => {
  const response = await apiClient.get(`/api/guides/${id}`);
  return response.data;
};

export const mapApiSurveyToUiSurvey = (apiSurvey: Survey, index: number) => ({
  id: index + 1,
  _id: apiSurvey._id,
  title: apiSurvey.name,
  description: apiSurvey.overall_research_goal,
  status: apiSurvey.status.toLowerCase(),
  responses: apiSurvey.responses || 0,
  questions: apiSurvey.research_areas?.reduce((total, area) => total + (area.sub_topics?.length || 0), 0) || 0,
  createdAt: apiSurvey.created_at,
  updatedAt: apiSurvey.created_at,
});

export interface CreateSurveyDraftResponse {
  success: boolean;
  message: string;
  data: {
    survey_id: string;
    // Add other response fields as needed
  };
}

export interface CreateSurveyDraftParams {
  name: string;
  description?: string;
  file: File;
}

export const createSurveyDraft = async ({ name, description, file }: CreateSurveyDraftParams): Promise<CreateSurveyDraftResponse> => {
  try {
    console.log('Creating FormData...');
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Preparing query parameters...');
    const params = new URLSearchParams();
    params.append('name', name);
    if (description) {
      params.append('description', description);
    }
    
    console.log('Sending request to API...');
    const response = await apiClient.post<CreateSurveyDraftResponse>(
      `/api/guides/generate-draft?${params.toString()}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds timeout
      }
    );
    
    console.log('API Response:', response);
    return response.data;
  } catch (error) {
    console.error('Error in createSurveyDraft:', {
      error,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    throw error;
  }
};

export const deleteSurvey = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.delete(`/api/guides/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting survey:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete survey'
    };
  }
};

export interface FinalizeSurveyParams {
  surveyId: string;
  name: string;
  source_document_name: string;
  overall_research_goal: string;
  initiator_question: string;
  research_areas: any[];
}

export const finalizeSurvey = async (params: FinalizeSurveyParams): Promise<{ success: boolean; message?: string; data?: any }> => {
  try {
    const response = await apiClient.post(`/api/guides/finalize`, params);
    return { 
      success: true, 
      message: response.data?.message || 'Survey finalized successfully',
      data: response.data
    };
  } catch (error: any) {
    console.error('Error finalizing survey:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to finalize survey' 
    };
  }
};
