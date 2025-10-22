import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ContactInfo } from '@/types/resume';

interface ContactsFormProps {
  data: ContactInfo;
  onChange: (data: Partial<ContactInfo>) => void;
}

export const ContactsForm = ({ data, onChange }: ContactsFormProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Personal Information</h2>
        <p className="text-muted-foreground">
          Start with your basic contact information. This appears at the top of your resume.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            placeholder="John"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => onChange({ lastName: e.target.value })}
            placeholder="Doe"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="john.doe@example.com"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={data.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="San Francisco, CA, USA"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            value={data.title ?? ''}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Senior Software Engineer"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={data.website}
            onChange={(e) => onChange({ website: e.target.value })}
            placeholder="https://johndoe.com"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedin">LinkedIn</Label>
          <Input
            id="linkedin"
            type="url"
            value={data.linkedin}
            onChange={(e) => onChange({ linkedin: e.target.value })}
            placeholder="https://linkedin.com/in/johndoe"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            type="url"
            value={data.github}
            onChange={(e) => onChange({ github: e.target.value })}
            placeholder="https://github.com/johndoe"
            className="transition-all duration-200 focus:shadow-soft"
          />
        </div>
      </div>
    </div>
  );
};