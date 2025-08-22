"use server";

import { db } from '@/lib/firebase';
import type { Student, AttendanceRecord } from '@/lib/types';
import { collection, query, where, getDocs, addDoc, orderBy, Timestamp } from 'firebase/firestore';

export async function getStudent(rollNumber: string, name: string): Promise<Student | null> {
  try {
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where('rollNumber', '==', rollNumber), where('name', '==', name));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const studentDoc = querySnapshot.docs[0];
    return { id: studentDoc.id, ...studentDoc.data() } as Student;
  } catch (error) {
    console.error("Error getting student:", error);
    throw new Error("Could not fetch student data.");
  }
}

export async function getAttendanceRecords(studentId: string): Promise<AttendanceRecord[]> {
  try {
    const attendanceRef = collection(db, 'students', studentId, 'attendance');
    const q = query(attendanceRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        date: (data.date as Timestamp).toDate().toLocaleDateString(),
      } as AttendanceRecord;
    });
  } catch (error) {
    console.error("Error getting attendance records:", error);
    throw new Error("Could not fetch attendance records.");
  }
}

export async function addAttendanceRecord(studentId: string, record: Omit<AttendanceRecord, 'date'> & { date: Date }) {
    try {
        const attendanceRef = collection(db, 'students', studentId, 'attendance');
        const recordWithTimestamp = {
            ...record,
            date: Timestamp.fromDate(record.date),
        };
        await addDoc(attendanceRef, recordWithTimestamp);
    } catch (error) {
        console.error("Error adding attendance record:", error);
        throw new Error("Could not save attendance record.");
    }
}
