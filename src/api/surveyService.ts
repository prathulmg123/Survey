import apiClient from './apiClient';

export interface SurveyResponse {
  success: boolean;
  message: string;
  data: {
    sessions: Survey[];
    count: number;
  };
}

export interface Survey {
  _id: string;
  human_readable_id: string;
  status: string;
  created_at: string;
  responses?: number; // Will be added in the mapping
}

export const getSurveys = async (): Promise<SurveyResponse> => {
  const response = await apiClient.get<SurveyResponse>('/api/surveys');
  return response.data;
};

export const getSurveyById = async (id: string): Promise<{success: boolean; message: string; data: any}> => {
  const response = await apiClient.get(`/api/surveys/${id}`);
  return response.data;
};

export const mapApiSurveyToUiSurvey = (apiSurvey: Survey, index: number) => ({
  id: index + 1,
  _id: apiSurvey._id,
  title: apiSurvey.human_readable_id.replace(/-/g, ' ').replace(/\d+$/, '').trim(),
  description: `Survey ID: ${apiSurvey.human_readable_id}`,
  status: apiSurvey.status.toLowerCase(),
  responses: apiSurvey.responses || 0,
  questions: 0, // Not provided in the API
  createdAt: apiSurvey.created_at,
  updatedAt: apiSurvey.created_at, // Using created_at as updated_at if not provided
});
