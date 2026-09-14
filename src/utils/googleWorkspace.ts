import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TrainingSchedule, TrainingModule, Employee, AttendanceRecord, DepartmentItem } from '../types';

// Scopes configured for Google Sheets and Google Calendar
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
];

// Initialize Firebase once safely
let app: any = null;
let authInstance: any = null;
let providerInstance: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  authInstance = getAuth(app);
  providerInstance = new GoogleAuthProvider();
  WORKSPACE_SCOPES.forEach((scope) => providerInstance.addScope(scope));
} catch (e) {
  console.warn('Firebase initialization fallback:', e);
}

export const auth = authInstance;
export const provider = providerInstance;

// In-memory access token cache (NOT persisted in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize auth listener. Restores auth state and notifies caller.
 */
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) {
    if (onAuthFailure) onAuthFailure();
    return () => {};
  }
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Perform Google Sign-In with OAuth pop-up requesting Sheets and Calendar scopes.
 */
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth || !provider) {
    throw new Error('Google authentication service is not initialized.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google OAuth access token');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Get current in-memory access token.
 */
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

/**
 * Sign out of Google Workspace session.
 */
export const googleLogout = async (): Promise<void> => {
  if (auth) {
    await signOut(auth);
  }
  cachedAccessToken = null;
};

// ==========================================
// GOOGLE SHEETS API IMPLEMENTATION
// ==========================================

export interface CreatedSpreadsheetResult {
  id: string;
  spreadsheetUrl: string;
  title: string;
  sheetCount: number;
}

/**
 * Create a new Google Spreadsheet with specified sheets, headers, and rows.
 */
export const createGoogleSpreadsheet = async (
  title: string,
  sheetsData: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
  }[]
): Promise<CreatedSpreadsheetResult> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required. Please sign in with Google first.');
  }

  // 1. Create spreadsheet structure
  const createPayload = {
    properties: {
      title,
    },
    sheets: sheetsData.map((sheet) => ({
      properties: {
        title: sheet.title,
        gridProperties: {
          rowCount: Math.max(sheet.rows.length + 5, 20),
          columnCount: Math.max(sheet.headers.length + 2, 10),
        },
      },
    })),
  };

  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(createPayload),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create Google Sheet (${createRes.status})`);
  }

  const spreadsheet = await createRes.json();
  const spreadsheetId = spreadsheet.spreadsheetId;

  // 2. Populate values in each sheet
  const valueData = sheetsData.map((sheet) => {
    const values = [sheet.headers, ...sheet.rows];
    return {
      range: `'${sheet.title}'!A1`,
      values,
    };
  });

  const batchUpdateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: valueData,
      }),
    }
  );

  if (!batchUpdateRes.ok) {
    console.warn('Could not populate some sheet values:', await batchUpdateRes.text());
  }

  return {
    id: spreadsheetId,
    spreadsheetUrl: spreadsheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    title,
    sheetCount: sheetsData.length,
  };
};

/**
 * Export Training Schedules to a new Google Sheet
 */
export const exportSchedulesToGoogleSheet = async (
  schedules: TrainingSchedule[],
  modules: TrainingModule[]
): Promise<CreatedSpreadsheetResult> => {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const title = `Dyeing Factory - Training Schedules (${timestamp})`;

  const moduleMap = new Map(modules.map((m) => [m.id, m]));

  const headers = [
    'Schedule Code',
    'Training Module',
    'Category',
    'Target Department',
    'Date',
    'Start Time',
    'End Time',
    'Venue / Location',
    'Lead Trainer',
    'Expected Workers',
    'Actual Present',
    'Status',
    'Duration (Mins)',
  ];

  const rows = schedules.map((sch) => {
    const mod = moduleMap.get(sch.moduleId);
    return [
      sch.scheduleCode,
      sch.moduleName || mod?.name || sch.moduleId,
      sch.category,
      sch.targetDepartment,
      sch.date,
      sch.startTime,
      sch.endTime,
      sch.venue,
      sch.trainerName,
      sch.expectedParticipants,
      sch.actualParticipants,
      sch.status,
      mod?.durationMinutes || 60,
    ];
  });

  return await createGoogleSpreadsheet(title, [
    {
      title: 'Training Schedules',
      headers,
      rows,
    },
  ]);
};

/**
 * Export Attendance Records to a new Google Sheet
 */
export const exportAttendanceToGoogleSheet = async (
  attendanceRecords: AttendanceRecord[],
  employees: Employee[],
  schedules: TrainingSchedule[],
  modules: TrainingModule[]
): Promise<CreatedSpreadsheetResult> => {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const title = `Dyeing Factory - Attendance Records (${timestamp})`;

  const empMap = new Map(employees.map((e) => [e.id, e]));
  const schMap = new Map(schedules.map((s) => [s.id, s]));
  const modMap = new Map(modules.map((m) => [m.id, m]));

  const headers = [
    'Record ID',
    'Employee EID',
    'Employee Name',
    'Department',
    'Designation',
    'Training Topic',
    'Session Date',
    'Check-in Time',
    'Attendance Status',
    'Assessment Score (%)',
    'Verification Mode',
    'Remarks',
  ];

  const rows = attendanceRecords.map((record) => {
    const emp = empMap.get(record.employeeId);
    const sch = schMap.get(record.scheduleId);
    const mod = sch ? modMap.get(sch.moduleId) : undefined;

    return [
      record.id,
      record.employeeEid || emp?.eid || 'N/A',
      record.employeeName || emp?.name || 'Unknown Employee',
      record.department || emp?.department || 'Production',
      emp?.designation || 'Operator',
      sch?.moduleName || mod?.name || 'Safety & Compliance Drill',
      sch?.date || 'Scheduled Date',
      record.checkInTime || sch?.startTime || '09:00 AM',
      record.status,
      typeof record.score === 'number' ? record.score : 'N/A',
      record.verificationMethod || 'QR Code',
      record.remarks || '',
    ];
  });

  return await createGoogleSpreadsheet(title, [
    {
      title: 'Attendance Roster',
      headers,
      rows,
    },
  ]);
};

/**
 * Export Full Factory Audit (Multi-tab) to Google Sheets
 */
export const exportFullAuditToGoogleSheet = async (data: {
  departments: DepartmentItem[];
  employees: Employee[];
  schedules: TrainingSchedule[];
  attendanceRecords: AttendanceRecord[];
  modules: TrainingModule[];
}): Promise<CreatedSpreadsheetResult> => {
  const timestamp = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const title = `Apex Dyeing Mills - Complete Training Audit (${timestamp})`;

  // Tab 1: Departments Summary
  const deptHeaders = [
    'Code',
    'Department Name',
    'Risk Level',
    'Supervisor',
    'Phone',
    'Location',
    'Total Workers',
    'Compliance Standard',
    'Status',
  ];
  const deptRows = data.departments.map((d) => [
    d.code,
    d.name,
    d.riskLevel,
    d.manager,
    d.managerPhone || '',
    d.floorLocation || 'Main Plant',
    data.employees.filter((e) => e.department.toLowerCase() === d.name.toLowerCase()).length,
    d.complianceStandard || 'ZDHC & ISO 45001',
    d.status,
  ]);

  // Tab 2: Employee Roster
  const empHeaders = [
    'EID',
    'Full Name',
    'Department',
    'Designation',
    'Blood Group',
    'Phone',
    'Email',
    'Joining Date',
    'Status',
  ];
  const empRows = data.employees.map((e) => [
    e.eid,
    e.name,
    e.department,
    e.designation,
    e.bloodGroup,
    e.phone,
    e.email || '',
    e.joiningDate,
    e.status,
  ]);

  // Tab 3: Training Schedules
  const moduleMap = new Map(data.modules.map((m) => [m.id, m]));
  const schHeaders = [
    'Schedule Code',
    'Module Name',
    'Category',
    'Department',
    'Date',
    'Time',
    'Trainer',
    'Venue',
    'Status',
  ];
  const schRows = data.schedules.map((s) => [
    s.scheduleCode,
    s.moduleName || moduleMap.get(s.moduleId)?.name || s.moduleId,
    s.category,
    s.targetDepartment,
    s.date,
    `${s.startTime} - ${s.endTime}`,
    s.trainerName,
    s.venue,
    s.status,
  ]);

  // Tab 4: Attendance Records
  const empMap = new Map(data.employees.map((e) => [e.id, e]));
  const schMap = new Map(data.schedules.map((s) => [s.id, s]));
  const attHeaders = [
    'Record ID',
    'EID',
    'Employee Name',
    'Department',
    'Session',
    'Date',
    'Status',
    'Score',
    'Verification Mode',
  ];
  const attRows = data.attendanceRecords.map((r) => {
    const emp = empMap.get(r.employeeId);
    const sch = schMap.get(r.scheduleId);
    const mod = sch ? moduleMap.get(sch.moduleId) : undefined;
    return [
      r.id,
      r.employeeEid || emp?.eid || '',
      r.employeeName || emp?.name || '',
      r.department || emp?.department || '',
      sch?.moduleName || mod?.name || sch?.targetDepartment || '',
      sch?.date || '',
      r.status,
      typeof r.score === 'number' ? r.score : 'N/A',
      r.verificationMethod || 'QR Code',
    ];
  });

  return await createGoogleSpreadsheet(title, [
    { title: 'Departments Summary', headers: deptHeaders, rows: deptRows },
    { title: 'Employee Directory', headers: empHeaders, rows: empRows },
    { title: 'Training Schedules', headers: schHeaders, rows: schRows },
    { title: 'Attendance Log', headers: attHeaders, rows: attRows },
  ]);
};

/**
 * Read values from a Google Spreadsheet
 */
export const readGoogleSpreadsheet = async (
  spreadsheetId: string,
  range = 'A1:Z100'
): Promise<{ range: string; values: string[][] }> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required');
  }

  // Extract ID if a full URL was pasted
  const match = spreadsheetId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const cleanId = match ? match[1] : spreadsheetId.trim();

  // First fetch metadata to get the first sheet name if range doesn't specify one
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${cleanId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!metaRes.ok) {
    const err = await metaRes.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Unable to access spreadsheet (${metaRes.status})`);
  }

  const meta = await metaRes.json();
  const firstSheetName = meta.sheets?.[0]?.properties?.title || 'Sheet1';
  const targetRange = range.includes('!') ? range : `'${firstSheetName}'!${range}`;

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${encodeURIComponent(targetRange)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to read values (${res.status})`);
  }

  const data = await res.json();
  return {
    range: data.range || targetRange,
    values: data.values || [],
  };
};

// ==========================================
// GOOGLE CALENDAR API IMPLEMENTATION
// ==========================================

export interface CalendarEventPayload {
  summary: string;
  description: string;
  location?: string;
  startDateTime: string; // ISO 8601 string
  endDateTime: string;   // ISO 8601 string
  timeZone?: string;
}

export interface GoogleCalendarEventItem {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  htmlLink: string;
  status: string;
}

/**
 * Create a new event on Google Calendar
 */
export const createCalendarEvent = async (
  event: CalendarEventPayload,
  calendarId = 'primary'
): Promise<GoogleCalendarEventItem> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required');
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';

  const body = {
    summary: event.summary,
    description: event.description,
    location: event.location || 'Apex Dyeing & Finishing Mills Ltd. - Training Center',
    start: {
      dateTime: event.startDateTime,
      timeZone,
    },
    end: {
      dateTime: event.endDateTime,
      timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to create calendar event (${res.status})`);
  }

  return await res.json();
};

/**
 * List upcoming events from primary Google Calendar
 */
export const listCalendarEvents = async (
  calendarId = 'primary',
  maxResults = 25
): Promise<GoogleCalendarEventItem[]> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required');
  }

  const now = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(); // From yesterday onwards
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
    calendarId
  )}/events?orderBy=startTime&singleEvents=true&timeMin=${encodeURIComponent(
    now
  )}&maxResults=${maxResults}`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to fetch calendar events (${res.status})`);
  }

  const data = await res.json();
  return data.items || [];
};

/**
 * Convert a TrainingSchedule + Module into Google Calendar RFC3339 start and end datetimes
 */
export const formatScheduleForCalendar = (
  schedule: TrainingSchedule,
  module?: TrainingModule
): { startDateTime: string; endDateTime: string; summary: string; description: string } => {
  const dateStr = schedule.date; // e.g. "2026-09-18"

  // Parse start time e.g. "10:00 AM" or "14:00"
  let startHour = 9;
  let startMinute = 0;

  const startMatch = schedule.startTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (startMatch) {
    let h = parseInt(startMatch[1], 10);
    const m = parseInt(startMatch[2], 10);
    const ampm = (startMatch[3] || '').toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    startHour = h;
    startMinute = m;
  }

  // Parse end time e.g. "11:30 AM"
  let endHour = startHour + Math.ceil((module?.durationMinutes || 60) / 60);
  let endMinute = startMinute;
  const endMatch = schedule.endTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (endMatch) {
    let h = parseInt(endMatch[1], 10);
    const m = parseInt(endMatch[2], 10);
    const ampm = (endMatch[3] || '').toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    endHour = h;
    endMinute = m;
  }

  // Build local Date objects
  const [y, m, d] = dateStr.split('-').map(Number);
  const startDate = new Date(y, m - 1, d, startHour, startMinute, 0);
  let endDate = new Date(y, m - 1, d, endHour, endMinute, 0);
  if (endDate <= startDate) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  const moduleTitle = schedule.moduleName || module?.name || 'Safety & Compliance Drill';
  const summary = `[Apex Dyeing] ${moduleTitle} - ${schedule.targetDepartment}`;
  const description = [
    `Apex Dyeing & Finishing Mills Ltd. - Mandatory Training Session`,
    `Schedule Code: ${schedule.scheduleCode}`,
    `Topic: ${moduleTitle}`,
    `Category: ${schedule.category}`,
    `Target Department: ${schedule.targetDepartment}`,
    `Venue: ${schedule.venue}`,
    `Trainer: ${schedule.trainerName} (${schedule.trainerDesignation})`,
    `Status: ${schedule.status}`,
    schedule.notes ? `\nSession Notes: ${schedule.notes}` : '',
    module?.description ? `\nModule Scope: ${module.description}` : '',
  ].filter(Boolean).join('\n');

  return {
    startDateTime: startDate.toISOString(),
    endDateTime: endDate.toISOString(),
    summary,
    description,
  };
};

/**
 * Sync a single schedule to Google Calendar
 */
export const syncScheduleToCalendar = async (
  schedule: TrainingSchedule,
  module?: TrainingModule,
  calendarId = 'primary'
): Promise<GoogleCalendarEventItem> => {
  const formatted = formatScheduleForCalendar(schedule, module);
  return await createCalendarEvent(
    {
      summary: formatted.summary,
      description: formatted.description,
      location: schedule.venue,
      startDateTime: formatted.startDateTime,
      endDateTime: formatted.endDateTime,
    },
    calendarId
  );
};

/**
 * Delete an event from Google Calendar (Destructive operation, caller must confirm)
 */
export const deleteCalendarEvent = async (
  eventId: string,
  calendarId = 'primary'
): Promise<void> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google authentication required');
  }

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok && res.status !== 404) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Failed to delete calendar event (${res.status})`);
  }
};
