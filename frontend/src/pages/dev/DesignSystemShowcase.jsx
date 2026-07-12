import React, { useState } from 'react';
import { Button } from '../../common/components/ui/Button';
import { Input } from '../../common/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../common/components/ui/Card';
import { Badge } from '../../common/components/ui/Badge';
import { Modal } from '../../common/components/ui/Modal';
import { EmptyState } from '../../common/components/ui/EmptyState';
import { Skeleton } from '../../common/components/ui/Skeleton';
import { PageHeader } from '../../common/components/ui/PageHeader';
import { StatCard } from '../../common/components/ui/StatCard';
import { useTheme } from '../../app/theme-context';
import { 
  Check, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Search, 
  Mail, 
  MapPin, 
  Users, 
  Activity,
  Trash2,
  Calendar
} from 'lucide-react';

export default function DesignSystemShowcase() {
  const { theme, setTheme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleLoading = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors p-8">
      
      {/* Theme Toggle for Dev Page */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-surface p-2 rounded-lg border shadow-sm">
        <span className="text-sm font-medium self-center px-2">Theme:</span>
        <button onClick={() => setTheme('light')} className={`px-3 py-1 rounded text-sm ${theme === 'light' ? 'bg-primary text-white' : 'bg-secondary'}`}>Light</button>
        <button onClick={() => setTheme('dark')} className={`px-3 py-1 rounded text-sm ${theme === 'dark' ? 'bg-primary text-white' : 'bg-secondary'}`}>Dark</button>
      </div>

      <PageHeader 
        title="Design System Showcase"
        description="A comprehensive library of reusable UI components built with semantic design tokens."
        breadcrumbs={[{ label: 'Dev' }, { label: 'Design System' }]}
        actions={
          <Button leftIcon={<Check className="w-4 h-4" />}>Publish System</Button>
        }
      />

      <div className="space-y-16 max-w-5xl">
        
        {/* Colors (Visualizer) */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Semantic Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Background', bg: 'bg-background', text: 'text-foreground' },
              { name: 'Surface', bg: 'bg-surface', text: 'text-foreground' },
              { name: 'Muted Surface', bg: 'bg-surface-muted', text: 'text-foreground' },
              { name: 'Primary', bg: 'bg-primary', text: 'text-primary-foreground' },
              { name: 'Secondary', bg: 'bg-secondary', text: 'text-secondary-foreground' },
              { name: 'Destructive', bg: 'bg-destructive', text: 'text-destructive-foreground' },
              { name: 'Success', bg: 'bg-success', text: 'text-success-foreground' },
              { name: 'Warning', bg: 'bg-warning', text: 'text-warning-foreground' },
              { name: 'Info', bg: 'bg-info', text: 'text-info-foreground' },
            ].map(color => (
              <div key={color.name} className="flex flex-col gap-2">
                <div className={`h-16 rounded-lg border shadow-sm flex items-center justify-center ${color.bg} ${color.text}`}>
                  <span className="text-xs font-semibold px-2 text-center">{color.name}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Buttons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Buttons</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Sizes</h3>
              <div className="flex flex-wrap items-end gap-4">
                <Button size="sm">Small (sm)</Button>
                <Button size="md">Medium (md)</Button>
                <Button size="lg">Large (lg)</Button>
                <Button size="icon" aria-label="Search"><Search className="w-5 h-5" /></Button>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">States & Icons</h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button isLoading={isLoading} onClick={toggleLoading}>Click to Load</Button>
                <Button leftIcon={<Mail className="w-4 h-4" />}>Email</Button>
                <Button rightIcon={<MapPin className="w-4 h-4" />}>Location</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Inputs</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Default Input</label>
                <Input placeholder="Enter your name" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">With Left Icon</label>
                <Input leftIcon={<Search className="w-4 h-4" />} placeholder="Search items..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Disabled</label>
                <Input disabled placeholder="Cannot type here" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Error State</label>
                <Input error="Invalid email address" defaultValue="wrong-email" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">With Both Icons</label>
                <Input 
                  leftIcon={<Mail className="w-4 h-4" />} 
                  rightIcon={<Check className="w-4 h-4 text-success" />} 
                  placeholder="Email" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Badges</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
              <span className="w-24 text-sm text-muted-foreground">Solid:</span>
              <Badge variant="default">Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <span className="w-24 text-sm text-muted-foreground">Outline:</span>
              <Badge outline variant="default">Default</Badge>
              <Badge outline variant="primary">Primary</Badge>
              <Badge outline variant="success">Success</Badge>
              <Badge outline variant="warning">Warning</Badge>
              <Badge outline variant="error">Error</Badge>
              <Badge outline variant="info">Info</Badge>
            </div>
          </div>
        </section>

        {/* Cards & Stats */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Cards & Stats</h2>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatCard 
              title="Total Workers" 
              value="142" 
              icon={Users} 
              trend="up" 
              trendValue="12%" 
            />
            <StatCard 
              title="Active Tasks" 
              value="48" 
              icon={Activity} 
              trend="neutral" 
              trendValue="0%" 
            />
            <StatCard 
              title="Failed Visits" 
              value="3" 
              icon={AlertTriangle} 
              trend="down" 
              trendValue="2%" 
              className="border-destructive/30"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card variant="default">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard border and background.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Ideal for general layout structural blocks.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" className="w-full">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>No border, distinct shadow.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Ideal for floating elements, popovers, or highlighted content.</p>
              </CardContent>
              <CardFooter>
                <Button variant="primary" size="sm" className="w-full">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="interactive">
              <CardHeader>
                <CardTitle>Interactive Card</CardTitle>
                <CardDescription>Hover effects enabled.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Ideal for lists or grids where the whole card is clickable.</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Modals */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Modals</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal Demo</Button>
          
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Delete Project"
            description="Are you sure you want to delete this project? This action cannot be undone and will remove all associated data."
            footer={
              <>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} onClick={() => setIsModalOpen(false)}>Delete</Button>
              </>
            }
          >
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 mt-2">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>Warning:</strong> 12 workers are currently assigned to active tasks in this project.
                </p>
              </div>
            </div>
          </Modal>
        </section>

        {/* Empty States & Skeletons */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b pb-2">Feedback & Loading</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <EmptyState 
                icon={Calendar}
                title="No schedule found"
                description="You haven't set up any availability windows for this week yet."
                action={<Button size="sm">Add Availability</Button>}
              />
            </Card>
            
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-1/3 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-[80%]" />
                <div className="flex gap-2 pt-4">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

      </div>
    </div>
  );
}
