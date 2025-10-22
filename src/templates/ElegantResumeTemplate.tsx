import { ResumeData } from '@/types/resume';
import { Github, Globe, Image as ImageIcon, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

interface ElegantTemplateProps {
  data: ResumeData;
  showPhoto?: boolean;
}

const formatDescription = (description?: string) => {
  if (!description) return '';

  const lines = description.split('\n');
  let html = '';
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('• ')) {
      if (!inList) {
        html += '<ul style="margin: 0.35em 0; padding-left: 1.2em;">';
        inList = true;
      }
      const content = line.substring(2).trim();
      html += `<li style="margin: 0.15em 0;">${content}</li>`;
    } else {
      if (inList) {
        html += '</ul>';
        inList = false;
      }
      html += `${line}<br/>`;
    }
  }

  if (inList) {
    html += '</ul>';
  }

  return html
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/__(.*?)__/g, '<u>$1</u>')
    .replace(/~~(.*?)~~/g, '<s>$1</s>');
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) {
    return dateStr;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
};

const formatDateRange = (start?: string, end?: string, isCurrent?: boolean, presentLabel = 'Present') => {
  const formattedStart = formatDate(start);
  const formattedEnd = isCurrent ? presentLabel : formatDate(end);
  if (formattedStart && formattedEnd) {
    return `${formattedStart} – ${formattedEnd}`;
  }
  return formattedStart || formattedEnd || '';
};

const ElegantResumeTemplateBase = ({ data, showPhoto }: ElegantTemplateProps) => {
  const contactDetails = [
    { icon: Phone, value: data.contacts.phone },
    { icon: Mail, value: data.contacts.email },
    { icon: MapPin, value: data.contacts.location },
    { icon: Globe, value: data.contacts.website },
    { icon: Linkedin, value: data.contacts.linkedin },
    { icon: Github, value: data.contacts.github },
  ].filter(detail => detail.value && detail.value.trim().length > 0);

  return (
    <div className="w-[794px] h-[1123px] mx-auto bg-white text-slate-800 font-['Open Sans'] flex shadow-lg">
      <aside className="w-[280px] bg-slate-900 text-slate-100 p-8 flex flex-col items-center">
        {showPhoto && (
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/40 shadow-lg flex items-center justify-center bg-white/10">
            {data.photo ? (
              <img
                src={data.photo}
                alt={`${data.contacts.firstName || ''} ${data.contacts.lastName || ''}`.trim() || 'Profile photo'}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-12 h-12 text-white/60" />
            )}
          </div>
        )}

        <h1
          className={`text-center text-2xl font-bold tracking-wide uppercase ${showPhoto ? 'mt-6' : 'mt-2'}`}
        >
          {data.contacts.firstName}
          {data.contacts.firstName && data.contacts.lastName && ' '}
          <span className="text-sky-300">{data.contacts.lastName}</span>
        </h1>
        {data.contacts.title && (
          <p className="mt-2 text-xs tracking-[0.35em] uppercase text-sky-200 text-center">
            {data.contacts.title}
          </p>
        )}

        {contactDetails.length > 0 && (
          <section className="w-full mt-8">
            <h2 className="text-[0.7rem] font-semibold tracking-[0.4em] uppercase text-sky-200">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {contactDetails.map(({ icon: Icon, value }, index) => (
                <li key={`${value}-${index}`} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="break-words leading-snug">{value}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {data.summary && (
          <section className="w-full mt-8">
            <h2 className="text-[0.7rem] font-semibold tracking-[0.4em] uppercase text-sky-200">About Me</h2>
            <div
              className="mt-3 text-sm leading-relaxed text-slate-100/90"
              dangerouslySetInnerHTML={{ __html: formatDescription(data.summary) }}
            />
          </section>
        )}

        {data.skills.length > 0 && (
          <section className="w-full mt-8">
            <h2 className="text-[0.7rem] font-semibold tracking-[0.4em] uppercase text-sky-200">Skills</h2>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {data.skills.map(skill => (
                <li key={skill.id} className="px-3 py-1 rounded-full bg-white/10 text-slate-100">
                  {skill.name}
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>

      <main className="flex-1 p-10 pr-12">
        {data.education.length > 0 && (
          <section className="mb-8">
            <header className="border-b border-slate-200 pb-3 mb-5">
              <h2 className="text-lg font-semibold tracking-[0.2em] uppercase text-slate-700">Education</h2>
            </header>
            <div className="space-y-6">
              {data.education.map(edu => {
                const educationRange = formatDateRange(edu.startDate, edu.endDate, edu.isCurrentlyStudying);
                return (
                  <article key={edu.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">
                          {edu.degree}
                          {edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                        </h3>
                        <p className="text-sm text-slate-600">{edu.institution}</p>
                        {edu.gpa && <p className="text-xs text-slate-500">GPA: {edu.gpa}</p>}
                      </div>
                      {educationRange && (
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{educationRange}</span>
                      )}
                    </div>
                    {edu.description && (
                      <div
                        className="text-sm text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatDescription(edu.description) }}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {data.experience.length > 0 && (
          <section className="mb-8">
            <header className="border-b border-slate-200 pb-3 mb-5">
              <h2 className="text-lg font-semibold tracking-[0.2em] uppercase text-slate-700">Experience</h2>
            </header>
            <div className="space-y-6">
              {data.experience.map(exp => {
                const experienceRange = formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob);
                return (
                  <article key={exp.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">{exp.jobTitle}</h3>
                        <p className="text-sm text-slate-600">
                          {exp.company}
                          {exp.location ? ` • ${exp.location}` : ''}
                        </p>
                      </div>
                      {experienceRange && (
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{experienceRange}</span>
                      )}
                    </div>
                    {exp.description && (
                      <div
                        className="text-sm text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatDescription(exp.description) }}
                      />
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {data.projects.length > 0 && (
          <section className="mb-8">
            <header className="border-b border-slate-200 pb-3 mb-5">
              <h2 className="text-lg font-semibold tracking-[0.2em] uppercase text-slate-700">Projects</h2>
            </header>
            <div className="space-y-5">
              {data.projects.map(project => {
                const projectRange = formatDateRange(project.startDate, project.endDate, project.isOngoing, 'Ongoing');
                return (
                  <article key={project.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-slate-800">{project.name}</h3>
                        {project.technologies.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2 text-[0.65rem] uppercase tracking-wide text-slate-500">
                            {project.technologies.map((tech, index) => (
                              <span key={`${tech}-${index}`} className="px-2 py-1 bg-slate-100 rounded-full">
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {projectRange && (
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{projectRange}</span>
                      )}
                    </div>
                    {project.description && (
                      <div
                        className="text-sm text-slate-600 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formatDescription(project.description) }}
                      />
                    )}
                    {(project.url || project.githubUrl) && (
                      <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                        {project.url && (
                          <span className="underline decoration-sky-300">{project.url}</span>
                        )}
                        {project.githubUrl && (
                          <span className="underline decoration-sky-300">{project.githubUrl}</span>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {data.certificates.length > 0 && (
          <section>
            <header className="border-b border-slate-200 pb-3 mb-5">
              <h2 className="text-lg font-semibold tracking-[0.2em] uppercase text-slate-700">Certifications</h2>
            </header>
            <div className="space-y-5">
              {data.certificates.map(cert => (
                <article key={cert.id} className="space-y-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-base font-semibold text-slate-800">{cert.name}</h3>
                      <p className="text-sm text-slate-600">{cert.issuer}</p>
                      {cert.credentialId && (
                        <p className="text-xs text-slate-500">Credential ID: {cert.credentialId}</p>
                      )}
                    </div>
                    <span className="text-sm font-medium text-slate-500 whitespace-nowrap">
                      {formatDate(cert.issueDate)}
                      {cert.expirationDate ? ` – ${formatDate(cert.expirationDate)}` : ''}
                    </span>
                  </div>
                  {cert.url && (
                    <span className="text-xs text-sky-600 underline break-all">{cert.url}</span>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export const ElegantResumeTemplate = ({ data }: { data: ResumeData }) => (
  <ElegantResumeTemplateBase data={data} />
);

export const ElegantResumeTemplateWithPhoto = ({ data }: { data: ResumeData }) => (
  <ElegantResumeTemplateBase data={data} showPhoto />
);

export default ElegantResumeTemplate;
