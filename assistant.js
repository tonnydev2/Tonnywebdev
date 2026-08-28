export class SchoolAssistant {
    constructor() {
        this.container = null;
        this.messageElement = null;
        this.parentContainer = null;
        this.currentOverlay = null;
    }

    async init(parentContainer = document.body) {
        this.parentContainer = parentContainer;
        this.createAssistant();
        return Promise.resolve();
    }

    createAssistant() {
        this.container = document.createElement('div');
        this.container.className = 'assistant-container';
        this.container.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            display: flex;
            align-items: flex-end;
            z-index: 9999999;
            pointer-events: none;
        `;
        this.container.innerHTML = `
            <div class="assistant-message" style="
                position: relative;
                background: linear-gradient(135deg, #1a1a3e, #2a2a4e);
                padding: 15px 20px;
                border-radius: 20px;
                margin-right: 15px;
                max-width: 300px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                border: 1px solid rgba(108, 99, 255, 0.5);
                pointer-events: auto;
            ">
                <div class="assistant-text" style="
                    color: white;
                    font-size: 14px;
                    line-height: 1.6;
                "></div>
                <div class="assistant-beak" style="
                    position: absolute;
                    right: -10px;
                    bottom: 20px;
                    width: 0;
                    height: 0;
                    border-top: 10px solid transparent;
                    border-bottom: 10px solid transparent;
                    border-left: 10px solid #2a2a4e;
                "></div>
            </div>
            <div class="assistant-avatar" style="
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #6C63FF, #FF6584);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 30px;
                box-shadow: 0 10px 30px rgba(108, 99, 255, 0.6);
                pointer-events: auto;
                cursor: pointer;
            ">
                <i class="fas fa-robot"></i>
            </div>
        `;
        
        this.messageElement = this.container.querySelector('.assistant-text');
        document.body.appendChild(this.container);
        
        // Add click to replay
        this.container.querySelector('.assistant-avatar').addEventListener('click', () => {
            this.showCurrentPageGuide();
        });
    }

    async showWelcomeMessage() {
        const message = "Hello! I'm your assistant. I'll help you set up your School Management System.";
        await this.typeMessage(message);
        
        await this.wait(1000);
        const instruction = "Let's start with your school information. This will help personalize your system.";
        await this.typeMessage(instruction);
    }

    async getSchoolInfo() {
        // Create form overlay with galaxy theme
        const formOverlay = document.createElement('div');
        formOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            z-index: 9999998;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        const formContainer = document.createElement('div');
        formContainer.style.cssText = `
            background: linear-gradient(135deg, #1a1a3e, #2a2a4e);
            padding: 30px;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            width: 400px;
            max-width: 90vw;
            border: 1px solid rgba(108, 99, 255, 0.5);
        `;
        
        formContainer.innerHTML = `
            <h3 style="margin-bottom: 20px; color: white; text-align: center; font-family: 'Poppins', sans-serif;">
                School Information
            </h3>
            <input type="text" id="schoolNameInput" placeholder="Enter School Name" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(108, 99, 255, 0.5);
                border-radius: 8px;
                font-size: 14px;
                font-family: 'Poppins', sans-serif;
                box-sizing: border-box;
                color: white;
            ">
            <input type="text" id="schoolLocationInput" placeholder="Enter School Location" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(108, 99, 255, 0.5);
                border-radius: 8px;
                font-size: 14px;
                font-family: 'Poppins', sans-serif;
                box-sizing: border-box;
                color: white;
            ">
            <button id="submitSchoolInfo" style="
                width: 100%;
                padding: 12px;
                background: linear-gradient(135deg, #6C63FF, #FF6584);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
                transition: all 0.3s;
            ">Create School Website</button>
        `;
        
        formOverlay.appendChild(formContainer);
        document.body.appendChild(formOverlay);
        
        const message = "Please enter your school name and location so we can create a personalized website for it.";
        await this.typeMessage(message);
        
        return new Promise((resolve) => {
            const submitBtn = document.getElementById('submitSchoolInfo');
            submitBtn.addEventListener('click', () => {
                const name = document.getElementById('schoolNameInput').value;
                const location = document.getElementById('schoolLocationInput').value;
                
                if (name && location) {
                    formOverlay.remove();
                    this.container.remove();
                    resolve({ name, location });
                } else {
                    alert('Please fill in both fields');
                }
            });
        });
    }

    async guideAddStudent() {
        const message = "To add a student, click the 'Add Student' button and fill in the required information. You'll need to provide the student's name, grade, age, email, and guardian's name.";
        await this.typeMessage(message);
    }

    async guideAddTeacher() {
        const message = "To add a teacher, click the 'Add Teacher' button and fill in the required information. You'll need to provide the teacher's name, subject, email, phone number, and qualification.";
        await this.typeMessage(message);
    }

    async showStudentAdded(studentName) {
        const message = `Great! ${studentName} has been successfully added to the student list. You can now see them in the students section.`;
        await this.typeMessage(message);
    }

    async showTeacherAdded(teacherName) {
        const message = `Excellent! ${teacherName} has been successfully added to the teacher list. You can now see them in the teachers section.`;
        await this.typeMessage(message);
    }

    async showStudentDeleted(studentName) {
        const message = `${studentName} has been removed from the student list.`;
        await this.typeMessage(message);
    }

    async showTeacherDeleted(teacherName) {
        const message = `${teacherName} has been removed from the teacher list.`;
        await this.typeMessage(message);
    }

    async guideStudentsGrid() {
        const message = "Here each student has their own page containing only their details. Click on any student card to view their complete profile.";
        await this.typeMessage(message);
    }

    async guideStudentsManage() {
        const message = "This is the management view. Here you can add new students or remove existing ones using the table below.";
        await this.typeMessage(message);
    }

    async guideHome() {
        const message = "Welcome to your school dashboard! Here you can see an overview of your school's statistics.";
        await this.typeMessage(message);
    }

    async guideTeachers() {
        const message = "This is the teachers management section. You can add, view, and manage all your teachers here.";
        await this.typeMessage(message);
    }

    async guideContacts() {
        const message = "Here you can find all the contact information for your school. This is where parents and visitors can reach you.";
        await this.typeMessage(message);
    }

    async showCurrentPageGuide() {
        const page = document.querySelector('.page[style*="display: block"]');
        if (page) {
            const pageId = page.id;
            if (pageId === 'homePage') {
                await this.guideHome();
            } else if (pageId === 'studentsPage') {
                await this.guideStudentsGrid();
            } else if (pageId === 'teachersPage') {
                await this.guideTeachers();
            } else if (pageId === 'contactsPage') {
                await this.guideContacts();
            }
        }
    }

    async typeMessage(text) {
        return new Promise((resolve) => {
            this.messageElement.textContent = '';
            let index = 0;
            const typingInterval = setInterval(() => {
                if (index < text.length) {
                    this.messageElement.textContent += text.charAt(index);
                    index++;
                } else {
                    clearInterval(typingInterval);
                    resolve();
                }
            }, 30);
        });
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    show() {
        this.container.style.display = 'flex';
    }

    hide() {
        this.container.style.display = 'none';
    }
}