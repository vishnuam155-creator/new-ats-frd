import { ResumeData } from '@/types/resume';

interface ModernResumeTemplateWithPhotoProps {
  data: ResumeData;
}

export const ModernResumeTemplateWithPhoto = ({ data }: ModernResumeTemplateWithPhotoProps) => {
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
        month: 'short', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white text-gray-900 min-h-[11in] w-[8.5in] mx-auto font-sans">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white p-8">
          {/* Photo */}
          {data.photo && (
            <div className="mb-6">
              <img 
                src={data.photo} 
                alt="Profile" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Contact Info */}
          <div className="mb-5">
            <h2 className="text-xs font-bold tracking-widest mb-2 text-gray-400">CONTACT</h2>
            <div className="text-xs space-y-2">
              {data.contacts.email && <div className="break-words">{data.contacts.email}</div>}
              {data.contacts.phone && <div>{data.contacts.phone}</div>}
              {data.contacts.location && <div>{data.contacts.location}</div>}
              {data.contacts.website && <div className="break-words">{data.contacts.website}</div>}
              {data.contacts.linkedin && <div className="break-words">{data.contacts.linkedin}</div>}
              {data.contacts.github && <div className="break-words">{data.contacts.github}</div>}
            </div>
          </div>

          {/* Skills */}
          {data.skills.length > 0 && (
            <div className="mb-5">
              <h2 className="text-xs font-bold tracking-widest mb-2 text-gray-400">SKILLS</h2>
              <div className="space-y-3">
                {data.skills.map((skill) => (
                  <div key={skill.id}>
                    <div className="text-xs mb-1">{skill.name}</div>
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 w-full ${
                            i < { beginner: 1, intermediate: 3, advanced: 4, expert: 5 }[skill.level] || 0
                              ? 'bg-blue-400'
                              : 'bg-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {data.certificates.length > 0 && (
            <div>
              <h2 className="text-xs font-bold tracking-widest mb-2 text-gray-400">CERTIFICATES</h2>
              <div className="space-y-3 text-xs">
                {data.certificates.map((cert) => (
                  <div key={cert.id}>
                    <div className="font-semibold">{cert.name}</div>
                    <div className="text-gray-400">{cert.issuer}</div>
                    <div className="text-gray-500">{formatDate(cert.issueDate)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-12">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2">
              {data.contacts.firstName} {data.contacts.lastName}
            </h1>
            <div className="h-1 w-20 bg-blue-500 mb-2"></div>
          </div>

          {/* Summary */}
          {data.summary && (
            <div className="mb-5">
              <h2 className="text-sm font-bold tracking-widest text-gray-700 mb-2">PROFILE</h2>
              <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div className="mb-5">
              <h2 className="text-sm font-bold tracking-widest text-gray-700 mb-2">EXPERIENCE</h2>
              <div className="space-y-5">
                {data.experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex justify-between mb-1">
                      <div>
                        <h3 className="text-base font-semibold">{exp.jobTitle}</h3>
                        <p className="text-sm text-blue-600">{exp.company}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-sm text-gray-700 leading-relaxed mt-2">
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
            <div className="mb-5">
              <h2 className="text-sm font-bold tracking-widest text-gray-700 mb-2">EDUCATION</h2>
              <div className="space-y-4">
                {data.education.map((edu) => (
                  <div key={edu.id}>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-semibold">
                          {edu.degree} {edu.fieldOfStudy && `- ${edu.fieldOfStudy}`}
                        </h3>
                        <p className="text-sm text-gray-700">{edu.institution}</p>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}
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
            <div>
              <h2 className="text-sm font-bold tracking-widest text-gray-700 mb-2">PROJECTS</h2>
              <div className="space-y-4">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="text-base font-semibold">{project.name}</h3>
                    {(project.url || project.githubUrl) && (
                      <div className="text-xs text-gray-600">
                        {project.url && <div>URL: {project.url}</div>}
                        {project.githubUrl && <div>GitHub: {project.githubUrl}</div>}
                      </div>
                    )}
                    {project.description && (
                      <div className="text-sm text-gray-700 leading-relaxed mt-1">
                        <div dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }} />
                      </div>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <div className="text-xs text-gray-600 mt-1">
                        {project.technologies.join(' • ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};