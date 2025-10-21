import { ResumeData } from '@/types/resume';

interface ProfessionalResumeTemplateProps {
  data: ResumeData;
}

export const ProfessionalResumeTemplate = ({ data }: ProfessionalResumeTemplateProps) => {
  const formatDescription = (description: string) => {
    if (!description) return '';
    
    // Split by lines and process bullet points
    const lines = description.split('\n');
    let html = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Check if line is a bullet point
      if (line.startsWith('- ') || line.startsWith('• ')) {
        if (!inList) {
          html += '<ul style="margin: 0.5em 0; padding-left: 1.5em;">';
          inList = true;
        }
        const content = line.substring(2).trim();
        html += `<li style="margin: 0.25em 0;">${content}</li>`;
      } else if (line) {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        html += line + '<br/>';
      }
    }
    
    if (inList) {
      html += '</ul>';
    }
    
    // Apply text formatting
    return html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>')
      .replace(/~~(.*?)~~/g, '<s>$1</s>');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-[11in] w-[8.5in] mx-auto p-12 font-serif leading-relaxed">
      {/* Header */}
      <div className="text-center mb-3 pb-4 border-b-2 border-gray-300">
        <h1 className="text-3xl font-bold mb-2 tracking-wide">
          {data.contacts.firstName} {data.contacts.lastName}
        </h1>
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-center items-center space-x-6">
            {data.contacts.email && (
              <span>{data.contacts.email}</span>
            )}
            {data.contacts.phone && (
              <span>{data.contacts.phone}</span>
            )}
          </div>
          <div className="flex justify-center items-center space-x-6">
            {data.contacts.location && (
              <span>{data.contacts.location}</span>
            )}
            {data.contacts.website && (
              <span>{data.contacts.website}</span>
            )}
          </div>
          {data.contacts.linkedin && (
            <div>LinkedIn: {data.contacts.linkedin}</div>
          )}
          {data.contacts.github && (
            <div>GitHub: {data.contacts.github}</div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {data.summary && (
        <div className="mb-3">
          <h2 className="text-lg font-bold mb-2 text-gray-800 border-b border-gray-200 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-sm leading-relaxed text-gray-700">
            {data.summary}
          </p>
        </div>
      )}

      {/* Work Experience */}
      {data.experience.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-1">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-3">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {exp.jobTitle}
                    </h3>
                    <p className="text-sm font-medium text-gray-700">
                      {exp.company}
                    </p>
                    {exp.location && (
                      <p className="text-xs text-gray-600">{exp.location}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>
                      {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                    </div>
                  </div>
                </div>
                {exp.description && (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-1">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">
                      {edu.degree} {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}
                    </h3>
                    <p className="text-sm text-gray-700">{edu.institution}</p>
                    {edu.gpa && (
                      <p className="text-xs text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>
                      {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}
                    </div>
                  </div>
                </div>
                {edu.description && (
                  <div className="text-sm text-gray-700 leading-relaxed mt-2">
                    <div dangerouslySetInnerHTML={{ __html: formatDescription(edu.description) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-1">
            PROJECTS
          </h2>
          <div className="space-y-3">
            {data.projects.map((project) => (
              <div key={project.id}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-semibold text-gray-800">{project.name}</h3>
                    {project.url && (
                      <p className="text-xs text-gray-600">URL: {project.url}</p>
                    )}
                    {project.githubUrl && (
                      <p className="text-xs text-gray-600">GitHub: {project.githubUrl}</p>
                    )}
                  </div>
                  {(project.startDate || project.endDate) && (
                    <div className="text-right text-sm text-gray-600">
                      <div>
                        {project.startDate && formatDate(project.startDate)} 
                        {project.startDate && project.endDate && ' - '}
                        {project.endDate && formatDate(project.endDate)}
                      </div>
                    </div>
                  )}
                </div>
                {project.description && (
                  <div className="text-sm text-gray-700 leading-relaxed">
                    <div dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }} />
                  </div>
                )}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="text-xs text-gray-600 mt-2">
                    <strong>Technologies:</strong> {project.technologies.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Certificates */}
      {data.certificates.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-1">
            CERTIFICATIONS
          </h2>
          <div className="space-y-3">
            {data.certificates.map((cert) => (
              <div key={cert.id} className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-800">{cert.name}</h3>
                  <p className="text-sm text-gray-700">{cert.issuer}</p>
                  {cert.credentialId && (
                    <p className="text-xs text-gray-600">ID: {cert.credentialId}</p>
                  )}
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div>{formatDate(cert.issueDate)}</div>
                  {cert.expirationDate && (
                    <div className="text-xs">Expires: {formatDate(cert.expirationDate)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-3">
          <h2 className="text-lg font-bold mb-4 text-gray-800 border-b border-gray-200 pb-1">
            TECHNICAL SKILLS
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {data.skills.map((skill) => (
              <div key={skill.id} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{skill.name}</span>
                <span className="text-xs text-gray-600 capitalize">{skill.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};