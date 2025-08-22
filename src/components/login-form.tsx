"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BookUser } from 'lucide-react';

// Mock student data
const MOCK_STUDENTS = [
  { name: 'Jane Doe', rollNumber: '101' },
  { name: 'John Smith', rollNumber: '102' },
];

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [rollNumber, setRollNumber] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const student = MOCK_STUDENTS.find(
      (s) => s.rollNumber === rollNumber.trim() && s.name.toLowerCase() === name.trim().toLowerCase()
    );

    setTimeout(() => {
      if (student) {
        // In a real app, you'd use a more secure session management system.
        localStorage.setItem('loggedInStudent', JSON.stringify(student));
        router.push('/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Invalid roll number or name. Please try again.',
        });
        setIsLoading(false);
      }
    }, 1000); // Simulate network delay
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <BookUser className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">PSG iTech</CardTitle>
          <CardDescription>Sign in to manage your attendance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rollNumber">Roll Number</Label>
              <Input
                id="rollNumber"
                type="text"
                placeholder="e.g., 101"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
