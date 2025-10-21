import { ResumeData } from '@/types/resume';

interface newResumeTemplateProps {
  data: ResumeData;
}

export const newResumeTemplate = ({ data }: newResumeTemplateProps) => {
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
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-[11in] w-[8.5in] mx-auto p-12 font-sans">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-300 to-purple-200 bg-clip-text text-transparent">
          {data.contacts.firstName} {data.contacts.lastName}
        </h1>
        <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600">
          {data.contacts.email && <span>📧 {data.contacts.email}</span>}
          {data.contacts.phone && <span>📱 {data.contacts.phone}</span>}
          {data.contacts.location && <span>📍 {data.contacts.location}</span>}
        </div>
        {(data.contacts.website || data.contacts.linkedin || data.contacts.github) && (
          <div className="flex justify-center flex-wrap gap-4 text-xs text-gray-500 mt-2">
            {data.contacts.website && <span>🌐 {data.contacts.website}</span>}
            {data.contacts.linkedin && <span>💼 {data.contacts.linkedin}</span>}
            {data.contacts.github && <span>💻 {data.contacts.github}</span>}
          </div>
        )}
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-6 bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-3">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-800">About Me</h2>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-6 bg-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            <h2 className="text-xl font-bold text-gray-800">Experience</h2>
          </div>
          <div className="space-y-5">
            {data.experience.map((exp, index) => (
              <div key={exp.id} className={index > 0 ? 'pt-5 border-t border-gray-200' : ''}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-base font-bold text-blue-600">{exp.jobTitle}</h3>
                    <p className="text-sm font-medium text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-xs text-gray-500 bg-blue-50 px-3 py-1 rounded-full">
                    {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-sm text-gray-600 leading-relaxed mt-2">
                    <div dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education & Skills - Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Education */}
        {data.education.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></div>
              <h2 className="text-lg font-bold text-gray-800">Education</h2>
            </div>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <h3 className="text-sm font-bold text-gray-800">
                    {edu.degree}
                  </h3>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(edu.startDate)} - {edu.isCurrentlyStudying ? 'Present' : formatDate(edu.endDate)}
                  </p>
                  {edu.description && (
                    <div className="text-xs text-gray-600 leading-relaxed mt-1">
                      <div dangerouslySetInnerHTML={{ __html: formatDescription(edu.description) }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></div>
              <h2 className="text-lg font-bold text-gray-800">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill) => (
                <span
                  key={skill.id}
                  className="text-xs bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 px-3 py-1 rounded-full font-medium"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Projects & Certificates */}
      {(data.projects.length > 0 || data.certificates.length > 0) && (
        <div className="grid grid-cols-2 gap-6">
          {/* Projects */}
          {data.projects.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></div>
                <h2 className="text-lg font-bold text-gray-800">Projects</h2>
              </div>
              <div className="space-y-3">
                {data.projects.map((project) => (
                  <div key={project.id}>
                    <h3 className="text-sm font-bold text-blue-600">{project.name}</h3>
                    {(project.url || project.githubUrl) && (
                      <div className="text-xs text-gray-500">
                        {project.url && <div>🌐 {project.url}</div>}
                        {project.githubUrl && <div>💻 {project.githubUrl}</div>}
                      </div>
                    )}
                    {project.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        <div dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certificates */}
          {data.certificates.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-2"></div>
                <h2 className="text-lg font-bold text-gray-800">Certificates</h2>
              </div>
              <div className="space-y-3">
                {data.certificates.map((cert) => (
                  <div key={cert.id}>
                    <h3 className="text-sm font-bold text-gray-800">{cert.name}</h3>
                    <p className="text-xs text-gray-600">{cert.issuer}</p>
                    <p className="text-xs text-gray-500">{formatDate(cert.issueDate)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};