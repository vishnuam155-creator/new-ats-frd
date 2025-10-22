import { ReactNode } from "react";

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  title?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
}

export interface Education {
  endYear: ReactNode;
  school: ReactNode;
  startYear: ReactNode;
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrentlyStudying: boolean;
  gpa?: string;
  description?: string;
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  isOngoing: boolean;
  url?: string;
  githubUrl?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Not specified';
  category: string;
}

export interface ResumeData {
  contacts: ContactInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  certificates: Certificate[];
  projects: Project[];
  skills: Skill[];
  photo?: string; // Base64 encoded photo
}

export type ResumeStep = 'contacts' | 'experience' | 'education' | 'certificates' | 'projects' | 'skills' | 'summary' | 'finalize';

export interface ResumeStepInfo {
  id: ResumeStep;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}