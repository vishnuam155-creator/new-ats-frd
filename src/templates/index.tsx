
import { ResumeData } from '@/types/resume';
import { Image as ImageIcon } from 'lucide-react';

export type Mode = 'with' | 'without';

export type TemplateDef = {
  id: string;
  name: string;
  mode: Mode;
  render: (data: ResumeData, photoDataUrl?: string) => JSX.Element;
};

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div className="mt-3">
      <div className="text-sm font-semibold tracking-wide text-primary mb-1">{title}</div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

// WITH PHOTO
export function TemplateWithPhoto_A(data: ResumeData, photo?: string) {
  return (
    <div className="w-[794px] h-[1123px] p-8 bg-white text-foreground font-sans">
      <div className="flex gap-6 items-start">
        <div className="w-28 h-28 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
          {photo ? <img src={photo} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-muted-foreground" />}
        </div>
        <div>
          <div className="text-2xl font-bold">{data.contacts.firstName} {data.contacts.lastName}</div>
          <div className="text-sm text-muted-foreground">{data.contacts.email} • {data.contacts.phone} • {data.contacts.location}</div>
        </div>
      </div>
      {data.summary && <Section title="SUMMARY">{data.summary}</Section>}
      {!!data.skills.length && (
        <div className="mt-3">
          <div className="text-sm font-semibold tracking-wide text-primary mb-1">SKILLS</div>
          <div className="flex flex-wrap gap-1 text-xs">
            {data.skills.map(s => (<span key={s.id} className="px-2 py-0.5 border border-border rounded">{s.name}</span>))}
          </div>
        </div>
      )}
      {!!data.experience.length && (
        <div className="mt-3">
          <div className="text-sm font-semibold tracking-wide text-primary mb-1">EXPERIENCE</div>
          <div className="space-y-2">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="text-sm font-semibold">{exp.jobTitle} · {exp.company}</div>
                <div className="text-xs text-muted-foreground">{exp.location} • {exp.startDate} – {exp.isCurrentJob ? 'Present' : exp.endDate}</div>
                <div className="text-sm whitespace-pre-line mt-1">{exp.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {!!data.education.length && (
        <div className="mt-3">
          <div className="text-sm font-semibold tracking-wide text-primary mb-1">EDUCATION</div>
          <div className="space-y-1">
            {data.education.map(ed => (
              <div key={ed.id} className="text-sm">
                <span className="font-medium">{ed.degree}</span> – {ed.school} ({ed.startYear}–{ed.endYear})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function TemplateWithPhoto_B(data: ResumeData, photo?: string) {
  return (
    <div className="w-[794px] h-[1123px] p-8 bg-white text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">{data.contacts.firstName} {data.contacts.lastName}</div>
          <div className="text-sm text-muted-foreground">{data.contacts.email} • {data.contacts.phone}</div>
        </div>
        <div className="w-24 h-24 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
          {photo ? <img src={photo} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-muted-foreground" />}
        </div>
      </div>
      {data.summary && <Section title="PROFILE">{data.summary}</Section>}
      {!!data.skills.length && (
        <Section title="SKILLS">
          <ul className="text-sm list-disc pl-5">
            {data.skills.map(s => (<li key={s.id}>{s.name}</li>))}
          </ul>
        </Section>
      )}
      {!!data.education.length && (
        <Section title="EDUCATION">
          {data.education.map(ed => (
            <div key={ed.id} className="text-sm mb-1">
              <div className="font-medium">{ed.degree} – {ed.school}</div>
              <div className="text-xs text-muted-foreground">{ed.startYear}–{ed.endYear}</div>
            </div>
          ))}
        </Section>
      )}
      {!!data.experience.length && (
        <Section title="EXPERIENCE">
          <div className="space-y-2">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="text-sm font-semibold">{exp.jobTitle} · {exp.company}</div>
                <div className="text-xs text-muted-foreground">{exp.location} • {exp.startDate} – {exp.isCurrentJob ? 'Present' : exp.endDate}</div>
                <div className="text-sm whitespace-pre-line mt-1">{exp.description}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// WITHOUT PHOTO
export function TemplateWithoutPhoto_A(data: ResumeData) {
  return (
    <div className="w-[794px] h-[1123px] p-8 bg-white text-foreground font-sans">
      <div className="text-3xl font-bold">{data.contacts.firstName} {data.contacts.lastName}</div>
      <div className="text-sm text-muted-foreground">{data.contacts.email} • {data.contacts.phone} • {data.contacts.location}</div>
      {data.summary && <Section title="SUMMARY">{data.summary}</Section>}
      {!!data.skills.length && (
        <div className="mt-3">
          <div className="text-sm font-semibold tracking-wide text-primary mb-1">SKILLS</div>
          <div className="flex flex-wrap gap-1 text-xs">
            {data.skills.map(s => (<span key={s.id} className="px-2 py-0.5 border border-border rounded">{s.name}</span>))}
          </div>
        </div>
      )}
      {!!data.experience.length && (
        <Section title="EXPERIENCE">
          <div className="space-y-2">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="text-sm font-semibold">{exp.jobTitle} · {exp.company}</div>
                <div className="text-xs text-muted-foreground">{exp.location} • {exp.startDate} – {exp.isCurrentJob ? 'Present' : {exp.endDate}}</div>
                <div className="text-sm whitespace-pre-line mt-1">{exp.description}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
      {!!data.education.length && (
        <Section title="EDUCATION">
          {data.education.map(ed => (
            <div key={ed.id} className="text-sm">
              <span className="font-medium">{ed.degree}</span> – {ed.school} ({ed.startYear}–{ed.endYear})
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

export function TemplateWithoutPhoto_B(data: ResumeData) {
  return (
    <div className="w-[794px] h-[1123px] p-8 bg-white text-foreground">
      <div className="flex items-baseline justify-between">
        <div className="text-3xl font-bold">{data.contacts.firstName} {data.contacts.lastName}</div>
        <div className="text-xs text-muted-foreground">{data.contacts.email} • {data.contacts.phone}</div>
      </div>
      {data.summary && <Section title="PROFILE">{data.summary}</Section>}
      <div className="grid grid-cols-2 gap-4 mt-3">
        {!!data.skills.length && (
          <div>
            <div className="text-sm font-semibold tracking-wide text-primary mb-1">SKILLS</div>
            <ul className="text-sm list-disc pl-5">
              {data.skills.map(s => (<li key={s.id}>{s.name}</li>))}
            </ul>
          </div>
        )}
        {!!data.education.length && (
          <div>
            <div className="text-sm font-semibold tracking-wide text-primary mb-1">EDUCATION</div>
            {data.education.map(ed => (
              <div key={ed.id} className="text-sm mb-1">
                <div className="font-medium">{ed.degree} – {ed.school}</div>
                <div className="text-xs text-muted-foreground">{ed.startYear}–{ed.endYear}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {!!data.experience.length && (
        <Section title="EXPERIENCE">
          <div className="space-y-2">
            {data.experience.map(exp => (
              <div key={exp.id}>
                <div className="text-sm font-semibold">{exp.jobTitle} · {exp.company}</div>
                <div className="text-xs text-muted-foreground">{exp.location} • {exp.startDate} – {exp.isCurrentJob ? 'Present' : {exp.endDate}}</div>
                <div className="text-sm whitespace-pre-line mt-1">{exp.description}</div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

export const withPhotoTemplates: TemplateDef[] = [
  { id: 'with-a', name: 'Classic Photo', mode: 'with', render: (d, p) => TemplateWithPhoto_A(d, p) },
  { id: 'with-b', name: 'Modern Photo', mode: 'with', render: (d, p) => TemplateWithPhoto_B(d, p) },
];

export const withoutPhotoTemplates: TemplateDef[] = [
  { id: 'without-a', name: 'Classic', mode: 'without', render: (d) => TemplateWithoutPhoto_A(d) },
  { id: 'without-b', name: 'Modern', mode: 'without', render: (d) => TemplateWithoutPhoto_B(d) },
];
