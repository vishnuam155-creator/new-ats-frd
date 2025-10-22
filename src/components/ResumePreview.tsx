import { ResumeData } from '@/types/resume';
import { Card } from '@/components/ui/card';
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
}

export const ResumePreview = ({ data }: ResumePreviewProps) => {
  const formatDescription = (description: string) => {
    return description
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/•/g, '•')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => `<div class="mb-1">${line}</div>`)
      .join('');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month] = dateStr.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="w-full h-full bg-preview-bg">
      <Card className="max-w-2xl mx-auto bg-white text-black shadow-large min-h-[800px] print:shadow-none">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {data.contacts.firstName || 'Name'} {data.contacts.lastName || 'A M'}
            </h1>
            {data.contacts.title && (
              <p className="text-sm text-gray-600 mb-2">{data.contacts.title}</p>
            )}
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center justify-center space-x-4 flex-wrap">
                {data.contacts.email && (
                  <div className="flex items-center space-x-1">
                    <Mail className="w-3 h-3" />
                    <span>{data.contacts.email}</span>
                  </div>
                )}
                {data.contacts.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="w-3 h-3" />
                    <span>{data.contacts.phone}</span>
                  </div>
                )}
              </div>
              {data.contacts.location && (
                <div className="flex items-center justify-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{data.contacts.location }</span>
                </div>
              )}
              <div className="flex items-center justify-center space-x-4 flex-wrap text-xs">
                {data.contacts.website && (
                  <div className="flex items-center space-x-1">
                    <Globe className="w-3 h-3" />
                    <span>{data.contacts.website}</span>
                  </div>
                )}
                {data.contacts.linkedin && (
                  <div className="flex items-center space-x-1">
                    <Linkedin className="w-3 h-3" />
                    <span>LinkedIn</span>
                  </div>
                )}
                {data.contacts.github && (
                  <div className="flex items-center space-x-1">
                    <Github className="w-3 h-3" />
                    <span>GitHub</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                SUMMARY
              </h2>
              <div 
                className="text-sm text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatDescription(data.summary) }}
              />
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                EXPERIENCE
              </h2>
              <div className="space-y-4">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exp.jobTitle}</h3>
                        <div className="text-sm text-gray-600">{exp.company}</div>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        <div>{formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}</div>
                        {exp.location && <div>{exp.location}</div>}
                      </div>
                    </div>
                    {exp.description && (
                      <div 
                        className="text-sm text-gray-700 leading-relaxed mt-2"
                        dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                EDUCATION
              </h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                        <div className="text-sm text-gray-600">{edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</div>
                        {edu.gpa && <div className="text-sm text-gray-600">GPA: {edu.gpa}</div>}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}
                      </div>
                    </div>
                    {edu.description && (
                      <div 
                        className="text-sm text-gray-700 leading-relaxed mt-2"
                        dangerouslySetInnerHTML={{ __html: formatDescription(edu.description) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Projects */}
          {data.projects.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                PROJECTS
              </h2>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900">{project.name}</h3>
                        <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                          {project.technologies.map((tech, index) => (
                            <span key={index} className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 text-right">
                        <div>{formatDate(project.startDate)} - {project.isOngoing ? 'Ongoing' : formatDate(project.endDate || '')}</div>
                        {project.url && <div className="text-xs">Live Demo</div>}
                        {project.githubUrl && <div className="text-xs">GitHub</div>}
                      </div>
                    </div>
                    {project.description && (
                      <div 
                        className="text-sm text-gray-700 leading-relaxed mt-2"
                        dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Certificates */}
          {data.certificates.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                CERTIFICATIONS
              </h2>
              <div className="space-y-2">
                {data.certificates.map((cert) => (
                  <div key={cert.id} className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-800">{cert.name}</h4>
                      <div className="text-sm text-gray-600">{cert.issuer}</div>
                      {cert.credentialId && (
                        <div className="text-xs text-gray-500">ID: {cert.credentialId}</div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(cert.issueDate)}
                      {cert.expirationDate && ` - ${formatDate(cert.expirationDate)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Skills */}
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3 uppercase tracking-wide">
                SKILLS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {Array.from(new Set(data.skills.map(skill => skill.category))).map(category => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-800 mb-1">{category}</h4>
                    <div className="text-sm text-gray-600">
                      {data.skills
                        .filter(skill => skill.category === category)
                        .map(skill => `${skill.name} (${skill.level})`)
                        .join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};