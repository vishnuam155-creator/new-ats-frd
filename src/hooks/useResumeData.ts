import { useState, useCallback } from 'react';
import { ResumeData, ResumeStep, Experience, Education, Certificate, Project, Skill } from '@/types/resume';

interface ATSContext { jdText: string; relevantSkills: string[]; suggestedSummary: string; suggestedExperiences: string[]; }

const initialATS: ATSContext = { jdText: '', relevantSkills: [], suggestedSummary: '', suggestedExperiences: [] };

const initialResumeData: ResumeData = {
  contacts: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    website: '',
    linkedin: '',
    github: ''
  },
  summary: '',
  experience: [],
  education: [],
  certificates: [],
  projects: [],
  skills: []
};

export const useResumeData = () => {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [ats, setAts] = useState<ATSContext>(initialATS);
  const [currentStep, setCurrentStep] = useState<ResumeStep>('contacts');

  const updateContacts = useCallback((contacts: Partial<ResumeData['contacts']>) => {
    setResumeData(prev => ({
      ...prev,
      contacts: { ...prev.contacts, ...contacts }
    }));
  }, []);

  const updateSummary = useCallback((summary: string) => {
    setResumeData(prev => ({ ...prev, summary }));
  }, []);

  const addExperience = useCallback((experience: Omit<Experience, 'id'>) => {
    const newExperience: Experience = {
      ...experience,
      id: Date.now().toString()
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  }, []);

  const updateExperience = useCallback((id: string, updates: Partial<Experience>) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      )
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  }, []);

  const addEducation = useCallback((education: Omit<Education, 'id'>) => {
    const newEducation: Education = {
      ...education,
      id: Date.now().toString()
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  }, []);

  const updateEducation = useCallback((id: string, updates: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, ...updates } : edu
      )
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  }, []);

  const addCertificate = useCallback((certificate: Omit<Certificate, 'id'>) => {
    const newCertificate: Certificate = {
      ...certificate,
      id: Date.now().toString()
    };
    setResumeData(prev => ({
      ...prev,
      certificates: [...prev.certificates, newCertificate]
    }));
  }, []);

  const updateCertificate = useCallback((id: string, updates: Partial<Certificate>) => {
    setResumeData(prev => ({
      ...prev,
      certificates: prev.certificates.map(cert => 
        cert.id === id ? { ...cert, ...updates } : cert
      )
    }));
  }, []);

  const removeCertificate = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      certificates: prev.certificates.filter(cert => cert.id !== id)
    }));
  }, []);

  const addSkill = useCallback((skill: Omit<Skill, 'id'>) => {
    const newSkill: Skill = {
      ...skill,
      id: Date.now().toString()
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  }, []);

  const updateSkill = useCallback((id: string, updates: Partial<Skill>) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, ...updates } : skill
      )
    }));
  }, []);

  const addProject = useCallback((project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString()
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(project => project.id !== id)
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  }, []);

  const calculateCompletionScore = useCallback(() => {
    let score = 0;
    const maxScore = 100;

    // Contacts (20 points)
    const { contacts } = resumeData;
    if (contacts.firstName && contacts.lastName) score += 5;
    if (contacts.email) score += 5;
    if (contacts.phone) score += 5;
    if (contacts.location) score += 5;

    // Summary (15 points)
    if (resumeData.summary && resumeData.summary.length > 50) score += 15;

    // Experience (30 points)
    if (resumeData.experience.length > 0) score += 10;
    if (resumeData.experience.some(exp => exp.description.length > 50)) score += 10;
    if (resumeData.experience.length >= 2) score += 10;

    // Education (15 points)
    if (resumeData.education.length > 0) score += 15;

    // Skills (10 points)
    if (resumeData.skills.length >= 3) score += 5;
    if (resumeData.skills.length >= 6) score += 5;

    // Certificates (10 points)
    if (resumeData.certificates.length > 0) score += 10;

    // Projects (10 points) 
    if (resumeData.projects.length > 0) score += 5;
    if (resumeData.projects.some(proj => proj.description.length > 50)) score += 5;

    return Math.round((score / maxScore) * 100);
  }, [resumeData]);

  const getStepCompletionStatus = useCallback((step: ResumeStep): boolean => {
    const { contacts, experience, education } = resumeData;

    switch (step) {
      case 'contacts':
        return (
          contacts.firstName.trim() !== '' &&
          contacts.lastName.trim() !== '' &&
          contacts.email.trim() !== '' &&
          contacts.phone.trim() !== ''
        );
      case 'experience':
        return (
          experience.length === 0 ||
          experience.every(exp =>
            exp.jobTitle.trim() !== '' &&
            exp.company.trim() !== '' &&
            exp.startDate.trim() !== '' &&
            exp.description.trim() !== ''
          )
        );
      case 'education':
        return (
          education.length === 0 ||
          education.every(edu =>
            edu.institution.trim() !== '' &&
            edu.degree.trim() !== '' &&
            edu.fieldOfStudy.trim() !== '' &&
            edu.startDate.trim() !== '' &&
            ((edu.description || '').trim() !== '')
          )
        );
      case 'certificates':
        return resumeData.certificates.length > 0;
      case 'projects':
        return resumeData.projects.length > 0;
      case 'skills':
        return resumeData.skills.length >= 3;
      case 'summary':
        return resumeData.summary.length > 50;
      case 'finalize':
        return calculateCompletionScore() >= 70;
      default:
        return false;
    }
  }, [resumeData, calculateCompletionScore]);

  return {
    resumeData,
    currentStep,
    setCurrentStep,
    updateContacts,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addCertificate,
    updateCertificate,
    removeCertificate,
    addProject,
    updateProject,
    removeProject,
    addSkill,
    updateSkill,
    removeSkill,
    calculateCompletionScore,
    getStepCompletionStatus,
    ats,
    setAts
  };
};