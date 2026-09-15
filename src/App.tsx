import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  TrainingModule, 
  TrainingSchedule, 
  AttendanceRecord, 
  TrainingPhoto, 
  Certificate, 
  User, 
  SessionStatus,
  DepartmentItem,
  FactoryFacilityIdentity 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_EMPLOYEES, 
  INITIAL_MODULES, 
  INITIAL_SCHEDULES, 
  INITIAL_ATTENDANCE, 
  INITIAL_PHOTOS, 
  INITIAL_CERTIFICATES,
  INITIAL_DEPARTMENTS,
  INITIAL_FACTORY_IDENTITY 
} from './data/initialData';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { EmployeesView } from './components/EmployeesView';
import { EmployeeProfileModal } from './components/EmployeeProfileModal';
import { ModulesView } from './components/ModulesView';
import { DepartmentsView } from './components/DepartmentsView';
import { ScheduleView } from './components/ScheduleView';
import { AutoScheduleModal } from './components/AutoScheduleModal';
import { AttendanceView } from './components/AttendanceView';
import { QrScannerModal } from './components/QrScannerModal';
import { PhotosView } from './components/PhotosView';
import { PhotoUploadModal } from './components/PhotoUploadModal';
import { CertificatesView } from './components/CertificatesView';
import { CertificateModal } from './components/CertificateModal';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { GoogleWorkspaceView } from './components/GoogleWorkspaceView';
import { LoginModal } from './components/LoginModal';
import { LoginView } from './components/LoginView';
import { exportAuditReportToExcel } from './utils/exportUtils';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Dynamic Users & Security Credentials State
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('dyeing_system_users');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_USERS;
  });

  // Authentication & Active Role
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('dyeing_system_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_USERS[0]; // Default: Admin
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Factory Facility Identity & Compliance State
  const [factoryIdentity, setFactoryIdentity] = useState<FactoryFacilityIdentity>(() => {
    const saved = localStorage.getItem('dyeing_system_facility_identity');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_FACTORY_IDENTITY;
  });

  // Core Data with localStorage persistence
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('dyeing_system_employees');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_EMPLOYEES;
  });

  const [modules, setModules] = useState<TrainingModule[]>(() => {
    const saved = localStorage.getItem('dyeing_system_modules');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_MODULES;
  });

  const [schedules, setSchedules] = useState<TrainingSchedule[]>(() => {
    const saved = localStorage.getItem('dyeing_system_schedules');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SCHEDULES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('dyeing_system_attendance');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_ATTENDANCE;
  });

  const [photos, setPhotos] = useState<TrainingPhoto[]>(() => {
    const saved = localStorage.getItem('dyeing_system_photos');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_PHOTOS;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const saved = localStorage.getItem('dyeing_system_certificates');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_CERTIFICATES;
  });

  // Dynamic Departments State
  const [departments, setDepartments] = useState<DepartmentItem[]>(() => {
    const saved = localStorage.getItem('dyeing_system_departments');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_DEPARTMENTS;
  });

  // Cross-view department filter jump
  const [employeeFilterDept, setEmployeeFilterDept] = useState<string>('All');

  // Selected schedule for attendance
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>(
    schedules[0]?.id || ''
  );

  // Modals
  const [isAutoScheduleOpen, setIsAutoScheduleOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);
  const [selectedProfileEmployee, setSelectedProfileEmployee] = useState<Employee | null>(null);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('dyeing_system_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_facility_identity', JSON.stringify(factoryIdentity));
  }, [factoryIdentity]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_departments', JSON.stringify(departments));
  }, [departments]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_modules', JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_photos', JSON.stringify(photos));
  }, [photos]);

  useEffect(() => {
    localStorage.setItem('dyeing_system_certificates', JSON.stringify(certificates));
  }, [certificates]);

  // Auditor is read-only
  const canEdit = currentUser.role !== 'Auditor';

  // --- Handlers ---
  // User Management & Security Credentials handlers
  const handleUpdateUser = (updatedUser: User) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
  };

  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    if (currentUser.id === userId) {
      const fallback = users.find((u) => u.id !== userId && u.role === 'Admin') || users.find((u) => u.id !== userId) || INITIAL_USERS[0];
      setCurrentUser(fallback);
    }
  };

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
  };

  const handleResetUsersToDefault = () => {
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
  };

  const handleUpdateFactoryIdentity = (updated: FactoryFacilityIdentity) => {
    setFactoryIdentity(updated);
  };

  // Department handlers
  const handleAddDepartment = (newDept: DepartmentItem) => {
    setDepartments((prev) => [...prev, newDept]);
  };

  const handleEditDepartment = (originalName: string, updatedDept: DepartmentItem) => {
    setDepartments((prev) =>
      prev.map((d) => (d.id === updatedDept.id ? updatedDept : d))
    );

    // If department name was changed, cascade to all related records
    if (originalName !== updatedDept.name) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.department === originalName ? { ...emp, department: updatedDept.name } : emp
        )
      );
      setAttendanceRecords((prev) =>
        prev.map((att) =>
          att.department === originalName ? { ...att, department: updatedDept.name } : att
        )
      );
      setCertificates((prev) =>
        prev.map((cert) =>
          cert.department === originalName ? { ...cert, department: updatedDept.name } : cert
        )
      );
      setSchedules((prev) =>
        prev.map((sch) =>
          sch.targetDepartment === originalName ? { ...sch, targetDepartment: updatedDept.name } : sch
        )
      );
    }
  };

  const handleDeleteDepartment = (departmentId: string, departmentName: string, reassignToDeptName?: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== departmentId));

    if (reassignToDeptName) {
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.department === departmentName ? { ...emp, department: reassignToDeptName } : emp
        )
      );
      setAttendanceRecords((prev) =>
        prev.map((att) =>
          att.department === departmentName ? { ...att, department: reassignToDeptName } : att
        )
      );
      setCertificates((prev) =>
        prev.map((cert) =>
          cert.department === departmentName ? { ...cert, department: reassignToDeptName } : cert
        )
      );
      setSchedules((prev) =>
        prev.map((sch) =>
          sch.targetDepartment === departmentName ? { ...sch, targetDepartment: reassignToDeptName } : sch
        )
      );
    }
  };

  // Employee handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const handleEditEmployee = (updatedEmp: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e))
    );
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Module handlers
  const handleAddModule = (newMod: TrainingModule) => {
    setModules((prev) => [...prev, newMod]);
  };

  const handleUpdateModule = (updatedMod: TrainingModule) => {
    setModules((prev) => prev.map((m) => (m.id === updatedMod.id ? updatedMod : m)));
  };

  const handleDeleteModule = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
  };

  // Schedule handlers
  const handleAddSchedule = (newSch: TrainingSchedule) => {
    setSchedules((prev) => [newSch, ...prev]);
    setSelectedScheduleId(newSch.id);
  };

  const handleUpdateScheduleStatus = (scheduleId: string, status: SessionStatus) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, status } : s))
    );
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
  };

  const handleAutoScheduleGenerate = (newSchedules: TrainingSchedule[]) => {
    setSchedules((prev) => [...newSchedules, ...prev]);
    if (newSchedules[0]) {
      setSelectedScheduleId(newSchedules[0].id);
    }
  };

  // Attendance handlers
  const handleUpdateAttendance = (record: AttendanceRecord) => {
    setAttendanceRecords((prev) => {
      const idx = prev.findIndex(
        (a) => a.scheduleId === record.scheduleId && a.employeeId === record.employeeId
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = record;
        return copy;
      }
      return [...prev, record];
    });

    // Update actual participant count in schedule
    if (record.status === 'Present') {
      setSchedules((prev) =>
        prev.map((s) => {
          if (s.id === record.scheduleId) {
            const count = attendanceRecords.filter(
              (a) => a.scheduleId === s.id && a.status === 'Present'
            ).length;
            return { ...s, actualParticipants: Math.max(s.actualParticipants, count + 1) };
          }
          return s;
        })
      );
    }
  };

  const handleBulkMarkPresent = (scheduleId: string) => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newRecords: AttendanceRecord[] = employees.map((emp) => ({
      id: `att-${scheduleId}-${emp.id}`,
      scheduleId,
      employeeId: emp.id,
      employeeEid: emp.eid,
      employeeName: emp.name,
      department: emp.department,
      status: 'Present',
      checkInTime: timeNow,
      verificationMethod: 'Manual ID',
      score: 85 + Math.floor(Math.random() * 12),
      remarks: 'Bulk verified present',
    }));

    setAttendanceRecords((prev) => {
      const filtered = prev.filter((a) => a.scheduleId !== scheduleId);
      return [...filtered, ...newRecords];
    });

    setSchedules((prev) =>
      prev.map((s) =>
        s.id === scheduleId
          ? { ...s, actualParticipants: employees.length, status: 'Completed' }
          : s
      )
    );
  };

  // QR Scan Handler
  const handleQrScanSuccess = (employee: Employee) => {
    if (!selectedScheduleId && schedules[0]) {
      setSelectedScheduleId(schedules[0].id);
    }
    const currentSchId = selectedScheduleId || schedules[0]?.id;
    if (!currentSchId) return;

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const record: AttendanceRecord = {
      id: `att-qr-${currentSchId}-${employee.id}`,
      scheduleId: currentSchId,
      employeeId: employee.id,
      employeeEid: employee.eid,
      employeeName: employee.name,
      department: employee.department,
      status: 'Present',
      checkInTime: timeNow,
      verificationMethod: 'QR Code',
      score: 90,
      remarks: 'Instant biometric/QR verified',
    };

    handleUpdateAttendance(record);
  };

  // Photo handlers
  const handleUploadPhoto = (newPhoto: TrainingPhoto) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
  };

  // Certificate handlers
  const handleAddCertificate = (newCert: Certificate) => {
    setCertificates((prev) => [newCert, ...prev]);
  };

  const handleIssueCertForWorker = (emp: Employee, mod: TrainingModule) => {
    const certCode = `ZDHC-CERT-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);

    const newCert: Certificate = {
      id: `cert-${Date.now()}`,
      certificateNumber: certCode,
      employeeId: emp.id,
      employeeEid: emp.eid,
      employeeName: emp.name,
      department: emp.department,
      designation: emp.designation,
      moduleId: mod.id,
      moduleName: mod.name,
      category: mod.category,
      completionDate: today,
      validUntil: nextYear.toISOString().split('T')[0],
      trainerName: 'Tanvir Hossain (EHS Specialist)',
      score: 92,
      status: 'Valid',
    };

    handleAddCertificate(newCert);
    setViewingCertificate(newCert);
  };

  // Reset database to factory initial state
  const handleResetData = () => {
    if (window.confirm('Reset all factory training records to initial demo database?')) {
      setDepartments(INITIAL_DEPARTMENTS);
      setEmployees(INITIAL_EMPLOYEES);
      setModules(INITIAL_MODULES);
      setSchedules(INITIAL_SCHEDULES);
      setAttendanceRecords(INITIAL_ATTENDANCE);
      setPhotos(INITIAL_PHOTOS);
      setCertificates(INITIAL_CERTIFICATES);
      localStorage.clear();
      alert('Database successfully restored to factory initial demo state.');
    }
  };

  // Current active schedule object
  const activeSchedule = schedules.find((s) => s.id === selectedScheduleId) || schedules[0];

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-800 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenWorkspace={() => setActiveTab('workspace')}
        onQuickExport={() => {
          const trainedCount = new Set(
            attendanceRecords.filter((a) => a.status === 'Present').map((a) => a.employeeId)
          ).size;
          exportAuditReportToExcel(
            {
              totalEmployees: employees.length,
              trainedThisMonth: trainedCount,
              trainingSessions: schedules.length,
              pendingCount: Math.max(0, employees.length - trainedCount),
              attendanceRate: 96,
              complianceScore: 95,
            },
            schedules,
            employees
          );
        }}
      />

      {/* Role Notice Banner if Auditor is active */}
      {currentUser.role === 'Auditor' && (
        <div className="bg-amber-500 text-slate-900 px-6 py-2 text-xs font-semibold flex items-center justify-between shadow-xs print:hidden">
          <span>
            🔍 <strong>Auditor / Buyer Inspector Mode:</strong> Viewing full factory compliance ledger in read-only verification mode. All export & print tools are enabled.
          </span>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="underline hover:text-slate-800 text-[11px]"
          >
            Switch to Admin
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'employees') {
              setEmployeeFilterDept('All');
            }
            setActiveTab(tab);
          }}
          counts={{
            employees: employees.length,
            departments: departments.length,
            modules: modules.length,
            schedules: schedules.length,
            pendingTraining: Math.max(
              0,
              employees.length -
                new Set(
                  attendanceRecords
                    .filter((a) => a.status === 'Present')
                    .map((a) => a.employeeId)
                ).size
            ),
            photos: photos.length,
          }}
          userRole={currentUser.role}
        />

        {/* View Router Main Content */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto print:p-0 print:max-w-none">
          {activeTab === 'dashboard' && (
            <DashboardView
              employees={employees}
              schedules={schedules}
              modules={modules}
              attendanceRecords={attendanceRecords}
              departments={departments}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenAutoSchedule={() => setIsAutoScheduleOpen(true)}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
              onExportAuditExcel={() => {
                const trainedCount = new Set(
                  attendanceRecords.filter((a) => a.status === 'Present').map((a) => a.employeeId)
                ).size;
                exportAuditReportToExcel(
                  {
                    totalEmployees: employees.length,
                    trainedThisMonth: trainedCount,
                    trainingSessions: schedules.length,
                    pendingCount: Math.max(0, employees.length - trainedCount),
                    attendanceRate: 96,
                    complianceScore: 95,
                  },
                  schedules,
                  employees
                );
              }}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeesView
              employees={employees}
              departments={departments}
              initialSelectedDept={employeeFilterDept}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              onSelectEmployeeProfile={(emp) => setSelectedProfileEmployee(emp)}
              onOpenDepartments={() => setActiveTab('departments')}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'departments' && (
            <DepartmentsView
              departments={departments}
              employees={employees}
              schedules={schedules}
              attendanceRecords={attendanceRecords}
              currentUser={currentUser}
              onAddDepartment={handleAddDepartment}
              onEditDepartment={handleEditDepartment}
              onDeleteDepartment={handleDeleteDepartment}
              onNavigateToEmployeesWithFilter={(deptName) => {
                setEmployeeFilterDept(deptName);
                setActiveTab('employees');
              }}
              onViewEmployeesInDept={(deptName) => {
                setEmployeeFilterDept(deptName);
                setActiveTab('employees');
              }}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'modules' && (
            <ModulesView
              modules={modules}
              onAddModule={handleAddModule}
              onUpdateModule={handleUpdateModule}
              onDeleteModule={handleDeleteModule}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              schedules={schedules}
              modules={modules}
              onAddSchedule={handleAddSchedule}
              onUpdateStatus={handleUpdateScheduleStatus}
              onDeleteSchedule={handleDeleteSchedule}
              onOpenAutoScheduleModal={() => setIsAutoScheduleOpen(true)}
              onOpenAttendance={(sch) => {
                setSelectedScheduleId(sch.id);
                setActiveTab('attendance');
              }}
              onOpenWorkspace={() => setActiveTab('workspace')}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceView
              schedules={schedules}
              employees={employees}
              attendanceRecords={attendanceRecords}
              selectedScheduleId={selectedScheduleId || schedules[0]?.id}
              onSelectSchedule={(id) => setSelectedScheduleId(id)}
              onUpdateAttendance={handleUpdateAttendance}
              onBulkMarkPresent={handleBulkMarkPresent}
              onOpenQrScanner={() => setIsQrScannerOpen(true)}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'photos' && (
            <PhotosView
              photos={photos}
              schedules={schedules}
              onOpenUploadModal={() => setIsPhotoUploadOpen(true)}
              onDeletePhoto={handleDeletePhoto}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'certificates' && (
            <CertificatesView
              certificates={certificates}
              employees={employees}
              modules={modules}
              departments={departments}
              onViewCertificate={(cert) => setViewingCertificate(cert)}
              onAddCertificate={handleAddCertificate}
              canEdit={canEdit}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              employees={employees}
              schedules={schedules}
              attendanceRecords={attendanceRecords}
              modules={modules}
              departments={departments}
              onOpenWorkspace={() => setActiveTab('workspace')}
            />
          )}

          {activeTab === 'workspace' && (
            <GoogleWorkspaceView
              schedules={schedules}
              modules={modules}
              employees={employees}
              attendanceRecords={attendanceRecords}
              departments={departments}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              users={users}
              departments={departments}
              factoryIdentity={factoryIdentity}
              onUpdateFactoryIdentity={handleUpdateFactoryIdentity}
              onUpdateUser={handleUpdateUser}
              onAddUser={handleAddUser}
              onDeleteUser={handleDeleteUser}
              onSwitchUser={handleSwitchUser}
              onResetUsersToDefault={handleResetUsersToDefault}
              onOpenLogin={() => setIsLoginOpen(true)}
              onResetData={handleResetData}
              onOpenDepartments={() => setActiveTab('departments')}
              onNavigateToLogin={() => setActiveTab('login')}
            />
          )}

          {activeTab === 'login' && (
            <LoginView
              users={users}
              currentUser={currentUser}
              factoryIdentity={factoryIdentity}
              onLogin={(user) => {
                setCurrentUser(user);
                setActiveTab('dashboard');
              }}
              onLogout={() => {
                const fallback = users[0] || INITIAL_USERS[0];
                setCurrentUser(fallback);
              }}
              onNavigate={(tab) => setActiveTab(tab as NavTab)}
              onOpenUserManagement={() => setActiveTab('settings')}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {/* 1. Login / Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        currentUser={currentUser}
        users={users}
        onLogin={(u) => setCurrentUser(u)}
        onManageUsers={() => {
          setIsLoginOpen(false);
          setActiveTab('settings');
        }}
      />

      {/* 2. QR Code Attendance Scanner Modal */}
      {activeSchedule && (
        <QrScannerModal
          isOpen={isQrScannerOpen}
          onClose={() => setIsQrScannerOpen(false)}
          schedule={activeSchedule}
          employees={employees}
          onScanSuccess={handleQrScanSuccess}
        />
      )}

      {/* 3. Monthly Automatic Schedule Generator Modal */}
      <AutoScheduleModal
        isOpen={isAutoScheduleOpen}
        onClose={() => setIsAutoScheduleOpen(false)}
        modules={modules}
        onGenerate={handleAutoScheduleGenerate}
      />

      {/* 4. Photo & Evidence Upload Modal */}
      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        schedules={schedules}
        onUpload={handleUploadPhoto}
        currentUser={currentUser.name}
      />

      {/* 5. Employee Training Passport & History Modal */}
      <EmployeeProfileModal
        isOpen={!!selectedProfileEmployee}
        onClose={() => setSelectedProfileEmployee(null)}
        employee={selectedProfileEmployee}
        attendanceRecords={attendanceRecords}
        schedules={schedules}
        modules={modules}
        certificates={certificates}
        onViewCertificate={(cert) => setViewingCertificate(cert)}
        onIssueCertificate={handleIssueCertForWorker}
      />

      {/* 6. Training Certificate Generator & Viewer Modal */}
      <CertificateModal
        isOpen={!!viewingCertificate}
        onClose={() => setViewingCertificate(null)}
        certificate={viewingCertificate}
      />
    </div>
  );
}
