import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Certificate } from '@/types/resume';
import { Plus, Trash2, ExternalLink, Award } from 'lucide-react';

interface CertificatesFormProps {
  data: Certificate[];
  onAddCertificate: (certificate: Omit<Certificate, 'id'>) => void;
  onUpdateCertificate: (id: string, updates: Partial<Certificate>) => void;
  onRemoveCertificate: (id: string) => void;
}

export const CertificatesForm = ({ 
  data, 
  onAddCertificate, 
  onUpdateCertificate, 
  onRemoveCertificate 
}: CertificatesFormProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCertificate, setNewCertificate] = useState<Omit<Certificate, 'id'>>({
    name: '',
    issuer: '',
    issueDate: '',
    expirationDate: '',
    credentialId: '',
    url: ''
  });

  const handleAddCertificate = () => {
    if (newCertificate.name && newCertificate.issuer && newCertificate.issueDate) {
      onAddCertificate(newCertificate);
      setNewCertificate({
        name: '',
        issuer: '',
        issueDate: '',
        expirationDate: '',
        credentialId: '',
        url: ''
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Certifications & Licenses</h2>
        <p className="text-muted-foreground">
          Add your professional certifications, licenses, and credentials.
        </p>
      </div>

      {/* Existing Certificates */}
      <div className="space-y-4">
        {data.map((certificate) => (
          <Card key={certificate.id} className="p-4 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">{certificate.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveCertificate(certificate.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`cert-name-${certificate.id}`}>Certificate Name</Label>
                <Input
                  id={`cert-name-${certificate.id}`}
                  value={certificate.name}
                  onChange={(e) => onUpdateCertificate(certificate.id, { name: e.target.value })}
                  placeholder="AWS Certified Developer"
                />
              </div>
              
              <div>
                <Label htmlFor={`cert-issuer-${certificate.id}`}>Issuing Organization</Label>
                <Input
                  id={`cert-issuer-${certificate.id}`}
                  value={certificate.issuer}
                  onChange={(e) => onUpdateCertificate(certificate.id, { issuer: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </div>
              
              <div>
                <Label htmlFor={`cert-issue-date-${certificate.id}`}>Issue Date</Label>
                <Input
                  id={`cert-issue-date-${certificate.id}`}
                  type="month"
                  value={certificate.issueDate}
                  onChange={(e) => onUpdateCertificate(certificate.id, { issueDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor={`cert-exp-date-${certificate.id}`}>Expiration Date (Optional)</Label>
                <Input
                  id={`cert-exp-date-${certificate.id}`}
                  type="month"
                  value={certificate.expirationDate || ''}
                  onChange={(e) => onUpdateCertificate(certificate.id, { expirationDate: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor={`cert-id-${certificate.id}`}>Credential ID (Optional)</Label>
                <Input
                  id={`cert-id-${certificate.id}`}
                  value={certificate.credentialId || ''}
                  onChange={(e) => onUpdateCertificate(certificate.id, { credentialId: e.target.value })}
                  placeholder="ABC123DEF456"
                />
              </div>
              
              <div>
                <Label htmlFor={`cert-url-${certificate.id}`}>Credential URL (Optional)</Label>
                <Input
                  id={`cert-url-${certificate.id}`}
                  value={certificate.url || ''}
                  onChange={(e) => onUpdateCertificate(certificate.id, { url: e.target.value })}
                  placeholder="https://verify.example.com"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Certificate */}
      {showAddForm ? (
        <Card className="p-4 border border-primary/20 bg-primary/5">
          <h3 className="font-medium text-foreground mb-4">Add New Certificate</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="new-cert-name">Certificate Name *</Label>
              <Input
                id="new-cert-name"
                value={newCertificate.name}
                onChange={(e) => setNewCertificate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="AWS Certified Developer"
              />
            </div>
            
            <div>
              <Label htmlFor="new-cert-issuer">Issuing Organization *</Label>
              <Input
                id="new-cert-issuer"
                value={newCertificate.issuer}
                onChange={(e) => setNewCertificate(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="Amazon Web Services"
              />
            </div>
            
            <div>
              <Label htmlFor="new-cert-issue-date">Issue Date *</Label>
              <Input
                id="new-cert-issue-date"
                type="month"
                value={newCertificate.issueDate}
                onChange={(e) => setNewCertificate(prev => ({ ...prev, issueDate: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="new-cert-exp-date">Expiration Date (Optional)</Label>
              <Input
                id="new-cert-exp-date"
                type="month"
                value={newCertificate.expirationDate || ''}
                onChange={(e) => setNewCertificate(prev => ({ ...prev, expirationDate: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="new-cert-id">Credential ID (Optional)</Label>
              <Input
                id="new-cert-id"
                value={newCertificate.credentialId || ''}
                onChange={(e) => setNewCertificate(prev => ({ ...prev, credentialId: e.target.value }))}
                placeholder="ABC123DEF456"
              />
            </div>
            
            <div>
              <Label htmlFor="new-cert-url">Credential URL (Optional)</Label>
              <Input
                id="new-cert-url"
                value={newCertificate.url || ''}
                onChange={(e) => setNewCertificate(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://verify.example.com"
              />
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleAddCertificate}>Submit Certificate</Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      ) : (
        <Button 
          onClick={() => setShowAddForm(true)}
          variant="outline" 
          className="w-full h-12 border-dashed"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Certificate
        </Button>
      )}

      {data.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No certificates added yet.</p>
          <p className="text-sm">Add your professional certifications to strengthen your resume.</p>
        </div>
      )}
    </div>
  );
};
