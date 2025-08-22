export interface Student {
  name: string;
  rollNumber: string;
}

export interface AttendanceRecord {
  date: string;
  status: 'Present' | 'Absent';
  reason?: string;
  validation?: {
    isValid: boolean;
    explanation: string;
  };
}
