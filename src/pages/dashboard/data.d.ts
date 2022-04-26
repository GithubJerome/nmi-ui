export interface AnalysisData {
  groups: Course;
}

export interface Course {
  course_id: string,
  course_name: string,
  created_on: number,
  progress: number,
  expiry_date: number,
  description: string,
  requirements: string,
  status: boolean,
  subject: string,
  update_on: string,
}

export interface Skills {
  skill: string,
  answered_questions: number,
  progress: number,
  correct: number,
  time_studied: string
}