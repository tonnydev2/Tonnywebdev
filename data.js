// School Data Module - Handles data management
export class SchoolData {
    constructor() {
        this.schoolName = '';
        this.location = '';
        this.students = [];
        this.teachers = [];
        this.advertisements = [];
    }

    async init(schoolName, location) {
        this.schoolName = schoolName;
        this.location = location;
        
        // Initialize with default data
        this.students = [
            { 
                id: 1, 
                name: 'John Doe', 
                grade: 'Grade 10', 
                age: 15, 
                email: 'john.doe@student.com', 
                guardian: 'Mr. Doe',
                photo: 'https://ui-avatars.com/api/?name=John+Doe&background=6C63FF&color=fff&size=200',
                course: 'Mathematics',
                feesBalance: 150,
                payCode: 'PAY-000001',
                registerNumber: 'REG-0001',
                attendance: 95,
                performance: 'Excellent',
                comment: 'Consistent performer with great potential.'
            },
            { 
                id: 2, 
                name: 'Jane Smith', 
                grade: 'Grade 11', 
                age: 16, 
                email: 'jane.smith@student.com', 
                guardian: 'Mrs. Smith',
                photo: 'https://ui-avatars.com/api/?name=Jane+Smith&background=FF6584&color=fff&size=200',
                course: 'Science',
                feesBalance: 0,
                payCode: 'PAY-000002',
                registerNumber: 'REG-0002',
                attendance: 98,
                performance: 'Outstanding',
                comment: 'Top of her class in all subjects.'
            },
            { 
                id: 3, 
                name: 'Michael Johnson', 
                grade: 'Grade 9', 
                age: 14, 
                email: 'michael.j@student.com', 
                guardian: 'Mr. Johnson',
                photo: 'https://ui-avatars.com/api/?name=Michael+Johnson&background=4ECDC4&color=fff&size=200',
                course: 'English',
                feesBalance: 300,
                payCode: 'PAY-000003',
                registerNumber: 'REG-0003',
                attendance: 88,
                performance: 'Good',
                comment: 'Shows improvement in participation.'
            },
            { 
                id: 4, 
                name: 'Sarah Williams', 
                grade: 'Grade 12', 
                age: 17, 
                email: 'sarah.w@student.com', 
                guardian: 'Mrs. Williams',
                photo: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=FF6584&color=fff&size=200',
                course: 'History',
                feesBalance: 50,
                payCode: 'PAY-000004',
                registerNumber: 'REG-0004',
                attendance: 92,
                performance: 'Very Good',
                comment: 'Active in extracurricular activities.'
            },
            { 
                id: 5, 
                name: 'David Brown', 
                grade: 'Grade 10', 
                age: 15, 
                email: 'david.b@student.com', 
                guardian: 'Mr. Brown',
                photo: 'https://ui-avatars.com/api/?name=David+Brown&background=6C63FF&color=fff&size=200',
                course: 'Geography',
                feesBalance: 200,
                payCode: 'PAY-000005',
                registerNumber: 'REG-0005',
                attendance: 85,
                performance: 'Average',
                comment: 'Needs improvement in homework completion.'
            }
        ];
        
        this.teachers = [
            { id: 1, name: 'Mr. Johnson', subject: 'Mathematics', email: 'johnson@school.com', phone: '+256 700 000001', qualification: 'MSc Mathematics' },
            { id: 2, name: 'Ms. Davis', subject: 'Science', email: 'davis@school.com', phone: '+256 700 000002', qualification: 'BSc Biology' },
            { id: 3, name: 'Mrs. Wilson', subject: 'English', email: 'wilson@school.com', phone: '+256 700 000003', qualification: 'MA English Literature' },
            { id: 4, name: 'Mr. Anderson', subject: 'History', email: 'anderson@school.com', phone: '+256 700 000004', qualification: 'BA History' }
        ];
        
        this.advertisements = [
            { id: 1, title: 'School Event', description: 'Annual Sports Day', image: 'https://via.placeholder.com/300x200?text=Sports+Day' },
            { id: 2, title: 'Admission Open', description: 'Enroll now for next semester', image: 'https://via.placeholder.com/300x200?text=Admissions' }
        ];
        
        return Promise.resolve();
    }

    addAdvertisement(ad) {
        ad.id = this.advertisements.length + 1;
        this.advertisements.push(ad);
        this.saveToStorage();
        return ad;
    }

    deleteAdvertisement(id) {
        this.advertisements = this.advertisements.filter(a => a.id !== id);
        this.saveToStorage();
    }

    getAdvertisements() {
        return this.advertisements;
    }

    addStudent(student) {
        student.id = this.students.length + 1;
        if (!student.photo) {
            student.photo = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6C63FF&color=fff&size=200`;
        }
        if (!student.course) student.course = 'General Studies';
        if (!student.feesBalance) student.feesBalance = 0;
        if (!student.payCode) student.payCode = 'PAY-' + String(student.id).padStart(6, '0');
        if (!student.registerNumber) student.registerNumber = 'REG-' + String(student.id).padStart(4, '0');
        if (!student.attendance) student.attendance = 95;
        if (!student.performance) student.performance = 'Good';
        if (!student.comment) student.comment = 'No comments yet.';
        
        this.students.push(student);
        this.saveToStorage();
        return student;
    }

    addTeacher(teacher) {
        teacher.id = this.teachers.length + 1;
        this.teachers.push(teacher);
        this.saveToStorage();
        return teacher;
    }

    deleteStudent(id) {
        this.students = this.students.filter(s => s.id !== id);
        this.saveToStorage();
    }

    deleteTeacher(id) {
        this.teachers = this.teachers.filter(t => t.id !== id);
        this.saveToStorage();
    }

    getStudents() {
        return this.students;
    }

    getTeachers() {
        return this.teachers;
    }

    getStudentCount() {
        return this.students.length;
    }

    getTeacherCount() {
        return this.teachers.length;
    }

    saveToStorage() {
        const data = {
            schoolName: this.schoolName,
            location: this.location,
            students: this.students,
            teachers: this.teachers,
            advertisements: this.advertisements
        };
        
        localStorage.setItem('schoolManagementData', JSON.stringify(data));
    }

    loadFromStorage() {
        const savedData = localStorage.getItem('schoolManagementData');
        if (savedData) {
            const data = JSON.parse(savedData);
            this.students = data.students || [];
            this.teachers = data.teachers || [];
            this.advertisements = data.advertisements || [];
        }
    }
}