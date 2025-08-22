"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Student, AttendanceRecord } from '@/lib/types';
import { getAbsenceValidation } from '@/app/actions';
import { getAttendanceRecords, addAttendanceRecord } from '@/services/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function AttendanceDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [today, setToday] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [showAbsenceForm, setShowAbsenceForm] = useState(false);
  const [absenceReason, setAbsenceReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = useCallback(async (studentId: string) => {
    try {
      const records = await getAttendanceRecords(studentId);
      setAttendanceRecords(records);
      const todayStr = new Date().toLocaleDateString();
      if (records.some(rec => rec.date === todayStr)) {
        setAttendanceMarked(true);
      }
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch attendance history.' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const studentData = localStorage.getItem('loggedInStudent');
    if (!studentData) {
      router.replace('/');
      return;
    }
    const parsedStudent = JSON.parse(studentData);
    setStudent(parsedStudent);
    setToday(new Date().toLocaleDateString());

    if (parsedStudent.id) {
      fetchAttendance(parsedStudent.id);
    } else {
        setIsLoading(false);
        toast({variant: 'destructive', title: 'Error', description: 'Student ID not found.'})
    }
  }, [router, fetchAttendance, toast]);

  const handleMarkPresent = async () => {
    if (!student?.id) return;
    const newRecord: AttendanceRecord = { date: today, status: 'Present' };
    
    try {
        await addAttendanceRecord(student.id, { status: 'Present', date: new Date() });
        setAttendanceRecords(prev => [newRecord, ...prev]);
        setAttendanceMarked(true);
        toast({
          title: 'Attendance Marked',
          description: 'You have been marked as Present for today.',
        });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark attendance.' });
    }
  };

  const handleMarkAbsent = () => {
    setShowAbsenceForm(true);
  };

  const handleSubmitAbsence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student?.id) return;
    if (!absenceReason.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a reason for your absence.' });
      return;
    }
    setIsSubmitting(true);

    try {
        const validation = await getAbsenceValidation(absenceReason);
        const newRecord: AttendanceRecord = {
          date: today,
          status: 'Absent',
          reason: absenceReason,
          validation: validation,
        };

        await addAttendanceRecord(student.id, { 
            status: 'Absent',
            reason: absenceReason,
            validation,
            date: new Date() 
        });

        setAttendanceRecords(prev => [newRecord, ...prev]);
        setAttendanceMarked(true);
        setShowAbsenceForm(false);
        
        toast({
          title: 'Attendance Marked',
          description: `You have been marked as Absent. Reason validation: ${validation.isValid ? 'Valid' : 'Suspicious'}.`,
        });
    } catch(e) {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to mark absence.' });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading || !student) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 md:p-8">
      <div className="flex flex-col gap-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Welcome, {student.name}!</h1>
            <p className="text-muted-foreground">Roll Number: {student.rollNumber}</p>
          </div>
          <Button variant="outline" onClick={() => { localStorage.removeItem('loggedInStudent'); router.push('/'); }}>Logout</Button>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Mark Today's Attendance</CardTitle>
            <CardDescription>Today is {today}. Please mark your attendance below.</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceMarked ? (
              <div className="flex items-center justify-center rounded-md bg-accent/20 p-6">
                <p className="text-lg font-medium text-accent-foreground">Your attendance for today has already been marked.</p>
              </div>
            ) : (
              !showAbsenceForm ? (
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                  <Button size="lg" className="flex-1" onClick={handleMarkPresent}>
                    <CheckCircle2 className="mr-2 h-5 w-5" /> Present
                  </Button>
                  <Button size="lg" variant="outline" className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground" onClick={handleMarkAbsent}>
                    <XCircle className="mr-2 h-5 w-5" /> Absent
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmitAbsence} className="space-y-4">
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-foreground">Reason for Absence</label>
                    <Textarea
                      id="reason"
                      value={absenceReason}
                      onChange={(e) => setAbsenceReason(e.target.value)}
                      placeholder="e.g., Feeling unwell"
                      className="mt-1"
                      rows={3}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                     <Button type="button" variant="ghost" onClick={() => setShowAbsenceForm(false)} disabled={isSubmitting}>Cancel</Button>
                     <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Submit Reason
                     </Button>
                  </div>
                </form>
              )
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Attendance History</CardTitle>
            <CardDescription>Here is a summary of your past attendance records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="min-w-[200px]">Reason for Absence</TableHead>
                    <TableHead>AI Validation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === 'Present' ? 'default' : 'destructive'} className={record.status === 'Present' ? 'bg-primary/80' : ''}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>{record.reason || 'N/A'}</TableCell>
                      <TableCell>
                        {record.validation ? (
                          <Badge variant={record.validation.isValid ? 'secondary' : 'destructive'} className="cursor-pointer" title={record.validation.explanation}>
                            {record.validation.isValid ? 'Valid' : 'Suspicious'}
                          </Badge>
                        ) : record.status === 'Absent' ? 'N/A' : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
             {attendanceRecords.length === 0 && (
              <p className="py-4 text-center text-muted-foreground">No attendance history found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
