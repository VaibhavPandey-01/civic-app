import * as SecureStore from 'expo-secure-store';
import api, { USE_MOCK } from './api';
import { Feedback, Report } from '../types/report.types';

const MOCK_REPORTS_KEY = 'op_mock_reports';

export const submitFeedback = async (
  reportId: string,
  rating: number,
  comment?: string
): Promise<Feedback> => {
  if (USE_MOCK) {
    try {
      const raw = await SecureStore.getItemAsync(MOCK_REPORTS_KEY);
      if (raw) {
        const reports: Report[] = JSON.parse(raw);
        const report = reports.find((r) => r.id === reportId);
        if (report) {

          report.resolutionNotes = (report.resolutionNotes || '') + `\n\n[Citizen Rating: ${rating} Stars. Comment: ${comment || 'No comment.'}]`;
          await SecureStore.setItemAsync(MOCK_REPORTS_KEY, JSON.stringify(reports));
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    // return a mock feedback response object
    return {
      id: 'mock-feedback-' + Math.random().toString(36).substr(2, 9),
      reportId,
      userId: 'mock-user-id',
      rating,
      comment: comment || '',
      createdAt: new Date().toISOString()
    };
  }

  const response = await api.post('/feedback', {
    reportId,
    rating,
    comment: comment || undefined,
  });
  return response.data.data.feedback;
};
