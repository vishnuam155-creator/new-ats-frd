import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types/resume';
import { Plus, Trash2, ExternalLink, Folder, X, Github } from 'lucide-react';

interface ProjectsFormProps {
  data: Project[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (id: string, updates: Partial<Project>) => void;
  onRemoveProject: (id: string) => void;
}

export const ProjectsForm = ({ 
  data, 
  onAddProject, 
  onUpdateProject, 
  onRemoveProject 
}: ProjectsFormProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProject, setNewProject] = useState<Omit<Project, 'id'>>({
    name: '',
    description: '',
    technologies: [],
    startDate: '',
    endDate: '',
    isOngoing: false,
    url: '',
    githubUrl: ''
  });
  const [newTech, setNewTech] = useState('');

  const handleAddProject = () => {
    if (newProject.name && newProject.description && newProject.startDate) {
      onAddProject(newProject);
      setNewProject({
        name: '',
        description: '',
        technologies: [],
        startDate: '',
        endDate: '',
        isOngoing: false,
        url: '',
        githubUrl: ''
      });
      setNewTech('');
      setShowAddForm(false);
    }
  };

  const addTechnology = (projectId: string | 'new') => {
    if (!newTech.trim()) return;
    
    if (projectId === 'new') {
      setNewProject(prev => ({
        ...prev,
        technologies: [...prev.technologies, newTech.trim()]
      }));
    } else {
      const project = data.find(p => p.id === projectId);
      if (project) {
        onUpdateProject(projectId, {
          technologies: [...project.technologies, newTech.trim()]
        });
      }
    }
    setNewTech('');
  };

  const removeTechnology = (projectId: string | 'new', techIndex: number) => {
    if (projectId === 'new') {
      setNewProject(prev => ({
        ...prev,
        technologies: prev.technologies.filter((_, index) => index !== techIndex)
      }));
    } else {
      const project = data.find(p => p.id === projectId);
      if (project) {
        onUpdateProject(projectId, {
          technologies: project.technologies.filter((_, index) => index !== techIndex)
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Projects</h2>
        <p className="text-muted-foreground">
          Showcase your personal projects, open source contributions, and side work.
        </p>
      </div>

      {/* Existing Projects */}
      <div className="space-y-4">
        {data.map((project) => (
          <Card key={project.id} className="p-4 border border-border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Folder className="w-5 h-5 text-primary" />
                <h3 className="font-medium text-foreground">{project.name}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveProject(project.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor={`proj-name-${project.id}`}>Project Name</Label>
                <Input
                  id={`proj-name-${project.id}`}
                  value={project.name}
                  onChange={(e) => onUpdateProject(project.id, { name: e.target.value })}
                  placeholder="E-commerce Website"
                />
              </div>
              
              <div>
                <Label htmlFor={`proj-desc-${project.id}`}>Description</Label>
                <Textarea
                  id={`proj-desc-${project.id}`}
                  value={project.description}
                  onChange={(e) => onUpdateProject(project.id, { description: e.target.value })}
                  placeholder="Built a full-stack e-commerce application with user authentication..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`proj-start-${project.id}`}>Start Date</Label>
                  <Input
                    id={`proj-start-${project.id}`}
                    type="month"
                    value={project.startDate}
                    onChange={(e) => onUpdateProject(project.id, { startDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor={`proj-end-${project.id}`}>End Date</Label>
                  <Input
                    id={`proj-end-${project.id}`}
                    type="month"
                    value={project.endDate || ''}
                    onChange={(e) => onUpdateProject(project.id, { endDate: e.target.value })}
                    disabled={project.isOngoing}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`proj-ongoing-${project.id}`}
                  checked={project.isOngoing}
                  onCheckedChange={(checked) => 
                    onUpdateProject(project.id, { 
                      isOngoing: checked as boolean,
                      endDate: checked ? '' : project.endDate
                    })
                  }
                />
                <Label htmlFor={`proj-ongoing-${project.id}`}>This is an ongoing project</Label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`proj-url-${project.id}`}>Live Demo URL (Optional)</Label>
                  <Input
                    id={`proj-url-${project.id}`}
                    value={project.url || ''}
                    onChange={(e) => onUpdateProject(project.id, { url: e.target.value })}
                    placeholder="https://myproject.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`proj-github-${project.id}`}>GitHub URL (Optional)</Label>
                  <Input
                    id={`proj-github-${project.id}`}
                    value={project.githubUrl || ''}
                    onChange={(e) => onUpdateProject(project.id, { githubUrl: e.target.value })}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>
              
              <div>
                <Label>Technologies Used</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                      <span>{tech}</span>
                      <button
                        onClick={() => removeTechnology(project.id, index)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    placeholder="Add technology (React, Node.js, etc.)"
                    onKeyPress={(e) => e.key === 'Enter' && addTechnology(project.id)}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addTechnology(project.id)}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Project */}
      {showAddForm ? (
        <Card className="p-4 border border-primary/20 bg-primary/5">
          <h3 className="font-medium text-foreground mb-4">Add New Project</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-proj-name">Project Name *</Label>
              <Input
                id="new-proj-name"
                value={newProject.name}
                onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                placeholder="E-commerce Website"
              />
            </div>
            
            <div>
              <Label htmlFor="new-proj-desc">Description *</Label>
              <Textarea
                id="new-proj-desc"
                value={newProject.description}
                onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Built a full-stack e-commerce application with user authentication..."
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-proj-start">Start Date *</Label>
                <Input
                  id="new-proj-start"
                  type="month"
                  value={newProject.startDate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="new-proj-end">End Date</Label>
                <Input
                  id="new-proj-end"
                  type="month"
                  value={newProject.endDate || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, endDate: e.target.value }))}
                  disabled={newProject.isOngoing}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-proj-ongoing"
                checked={newProject.isOngoing}
                onCheckedChange={(checked) => 
                  setNewProject(prev => ({ 
                    ...prev, 
                    isOngoing: checked as boolean,
                    endDate: checked ? '' : prev.endDate
                  }))
                }
              />
              <Label htmlFor="new-proj-ongoing">This is an ongoing project</Label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-proj-url">Live Demo URL (Optional)</Label>
                <Input
                  id="new-proj-url"
                  value={newProject.url || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://myproject.com"
                />
              </div>
              
              <div>
                <Label htmlFor="new-proj-github">GitHub URL (Optional)</Label>
                <Input
                  id="new-proj-github"
                  value={newProject.githubUrl || ''}
                  onChange={(e) => setNewProject(prev => ({ ...prev, githubUrl: e.target.value }))}
                  placeholder="https://github.com/username/repo"
                />
              </div>
            </div>
            
            <div>
              <Label>Technologies Used</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-2">
                {newProject.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{tech}</span>
                    <button
                      onClick={() => removeTechnology('new', index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={newTech}
                  onChange={(e) => setNewTech(e.target.value)}
                  placeholder="Add technology (React, Node.js, etc.)"
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology('new')}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => addTechnology('new')}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button onClick={handleAddProject}>Submit Project</Button>
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
          Add Project
        </Button>
      )}

      {data.length === 0 && !showAddForm && (
        <div className="text-center py-8 text-muted-foreground">
          <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No projects added yet.</p>
          <p className="text-sm">Add your personal projects to showcase your skills.</p>
        </div>
      )}
    </div>
  );
};
