// School Website Module - Generates the school website with full functionality
export class SchoolWebsite {
    constructor() {
        this.websiteContainer = null;
        this.parentContainer = null;
        this.data = null;
        this.assistant = null;
        this.currentPage = 'home';
        this.studentViewMode = 'grid';
        this.currentPageIndex = 0;
        this.pages = ['home', 'students', 'teachers', 'advertisements', 'contacts', 'admissions'];
        this.isAnimating = false;
        this.navContainer = null;
        this.floatingButtonsContainer = null;
    }

    async generate(schoolName, location, parentContainer = document.body, data = null, assistant = null) {
        this.parentContainer = parentContainer;
        this.data = data;
        this.assistant = assistant;
        
        // Clear parent container
        this.parentContainer.innerHTML = '';
        
        // Create website container
        this.websiteContainer = document.createElement('div');
        this.websiteContainer.className = 'school-website';
        this.websiteContainer.style.cssText = `
            min-height: 100vh;
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #0a0a1a 0%, #1a1a3e 25%, #0d0d2b 50%, #1a0a2e 75%, #0a0a1a 100%);
            position: relative;
            overflow-x: hidden;
        `;
        
        this.parentContainer.appendChild(this.websiteContainer);
        
        this.generateHeader(schoolName, location);
        this.generateNavigation();
        this.generatePages(schoolName, location);
        this.generateActivitySections();
        this.generateFloatingButtons();
        
        return Promise.resolve();
    }

    generateHeader(schoolName, location) {
        const header = document.createElement('div');
        header.style.cssText = `
            background: rgba(108, 99, 255, 0.1);
            backdrop-filter: blur(10px);
            color: white;
            padding: 60px 20px;
            text-align: center;
            border-bottom: 1px solid rgba(108, 99, 255, 0.3);
            position: relative;
            z-index: 1;
        `;
        header.innerHTML = `
            <h1 style="font-size: 2.5rem; margin-bottom: 10px; color: white;">${schoolName}</h1>
            <p style="font-size: 1.2rem; color: rgba(255, 255, 255, 0.9);">
                <i class="fas fa-map-marker-alt"></i> ${location}
            </p>
        `;
        this.websiteContainer.appendChild(header);
    }

    generateNavigation() {
        const nav = document.createElement('nav');
        nav.style.cssText = `
            background: rgba(10, 10, 26, 0.9);
            backdrop-filter: blur(10px);
            padding: 15px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid rgba(108, 99, 255, 0.3);
        `;
        
        const navContainer = document.createElement('div');
        navContainer.style.cssText = `
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: center;
            gap: 15px;
            flex-wrap: wrap;
        `;
        
        const pages = ['Home', 'Students', 'Teachers', 'Advertisements', 'Admissions', 'Contacts'];
        pages.forEach((page, index) => {
            const link = document.createElement('a');
            link.className = 'nav-link';
            if (index === 0) link.classList.add('active');
            link.dataset.page = page.toLowerCase();
            link.textContent = page;
            link.style.cssText = `
                text-decoration: none;
                color: #fff;
                font-weight: 500;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
                font-family: 'Poppins', sans-serif;
            `;
            
            if (index === 0) {
                link.style.background = 'linear-gradient(135deg, #6C63FF, #FF6584)';
                link.style.color = 'white';
            }
            
            link.addEventListener('click', (e) => {
                this.switchPageWithAnimation(link.dataset.page, navContainer);
            });
            
            navContainer.appendChild(link);
        });
        
        nav.appendChild(navContainer);
        this.websiteContainer.appendChild(nav);
        this.navContainer = navContainer;
    }

    switchPageWithAnimation(pageName, navContainer) {
        if (this.isAnimating || pageName === this.currentPage) return;
        this.isAnimating = true;
        
        const content = this.websiteContainer.querySelector('.content');
        if (!content) return;
        
        const currentPageElement = content.querySelector(`#${this.currentPage}Page`);
        const targetPageElement = content.querySelector(`#${pageName}Page`);
        
        if (!currentPageElement || !targetPageElement) return;
        
        // Fade out current page
        currentPageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        currentPageElement.style.opacity = '0';
        currentPageElement.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
            currentPageElement.style.display = 'none';
            
            // Fade in target page
            targetPageElement.style.display = 'block';
            targetPageElement.style.opacity = '0';
            targetPageElement.style.transform = 'translateX(50px)';
            
            setTimeout(() => {
                targetPageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                targetPageElement.style.opacity = '1';
                targetPageElement.style.transform = 'translateX(0)';
                
                this.currentPage = pageName;
                this.currentPageIndex = this.pages.indexOf(pageName);
                
                // Update nav active state
                if (navContainer) {
                    navContainer.querySelectorAll('.nav-link').forEach(l => {
                        l.classList.remove('active');
                        l.style.background = 'none';
                        l.style.color = '#fff';
                    });
                    
                    const activeLink = navContainer.querySelector(`[data-page="${pageName}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                        activeLink.style.background = 'linear-gradient(135deg, #6C63FF, #FF6584)';
                        activeLink.style.color = 'white';
                    }
                }
                
                // Update content
                if (pageName === 'students') {
                    this.updateStudentsGrid();
                } else if (pageName === 'teachers') {
                    this.updateTeachersTable();
                } else if (pageName === 'advertisements') {
                    this.updateAdvertisements();
                }
                
                this.isAnimating = false;
            }, 50);
        }, 300);
    }

    generatePages(schoolName, location) {
        const content = document.createElement('div');
        content.className = 'content';
        content.style.cssText = `
            max-width: 1200px;
            margin: 30px auto;
            padding: 20px;
            position: relative;
            z-index: 1;
        `;
        
        content.innerHTML = `
            <div class="page" id="homePage" style="display: block;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(108, 99, 255, 0.2);">
                    <h2 style="color: white; margin-bottom: 20px;">Welcome to ${schoolName}</h2>
                    <p style="color: #ccc; margin-bottom: 15px;">Location: ${location}</p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-top: 20px;">
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-user-graduate" style="font-size: 40px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white;">Students</h3>
                            <p style="color: #ccc; font-size: 24px; font-weight: bold;">${this.data ? this.data.getStudentCount() : 0}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-chalkboard-teacher" style="font-size: 40px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white;">Teachers</h3>
                            <p style="color: #ccc; font-size: 24px; font-weight: bold;">${this.data ? this.data.getTeacherCount() : 0}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-bullhorn" style="font-size: 40px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white;">Advertisements</h3>
                            <p style="color: #ccc; font-size: 24px; font-weight: bold;">${this.data ? this.data.getAdvertisements().length : 0}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; text-align: center; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-book" style="font-size: 40px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white;">Courses</h3>
                            <p style="color: #ccc;">Various subjects</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="page" id="studentsPage" style="display: none;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(108, 99, 255, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                        <h2 style="color: white;">Students</h2>
                        <div style="display: flex; gap: 10px;">
                            <button onclick="window.schoolWebsite.toggleStudentView('grid')" style="background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px;">
                                <i class="fas fa-th-large"></i> Grid View
                            </button>
                            <button onclick="window.schoolWebsite.toggleStudentView('manage')" style="background: rgba(255, 255, 255, 0.1); color: white; border: 1px solid rgba(108, 99, 255, 0.3); padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px;">
                                <i class="fas fa-cog"></i> Manage Students
                            </button>
                        </div>
                    </div>
                    <div id="studentsGridContainer"></div>
                    <div id="studentsManageContainer" style="display: none;"></div>
                </div>
            </div>
            
            <div class="page" id="teachersPage" style="display: none;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(108, 99, 255, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: white;">Teachers Management</h2>
                        <button onclick="window.schoolWebsite.showAddTeacherForm()" style="background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px;">
                            <i class="fas fa-plus"></i> Add Teacher
                        </button>
                    </div>
                    <div id="teachersTableContainer"></div>
                </div>
            </div>
            
            <div class="page" id="advertisementsPage" style="display: none;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(108, 99, 255, 0.2);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2 style="color: white;">Advertisements</h2>
                        <button onclick="window.schoolWebsite.showAddAdvertisementForm()" style="background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px;">
                            <i class="fas fa-plus"></i> Add Advertisement
                        </button>
                    </div>
                    <div id="advertisementsContainer"></div>
                </div>
            </div>
            
            <div class="page" id="admissionsPage" style="display: none;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(108, 99, 255, 0.2);">
                    <h2 style="color: white; margin-bottom: 20px; text-align: center;">Admissions & Fees</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 15px; border: 1px solid rgba(108, 99, 255, 0.3); cursor: pointer;" onclick="window.schoolWebsite.showTuitionMenu('primary')">
                            <i class="fas fa-child" style="font-size: 50px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white; margin-bottom: 10px;">Primary School</h3>
                            <p style="color: #ccc;">Grades 1-6</p>
                            <button style="margin-top: 15px; background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">View Tuition & Requirements</button>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 15px; border: 1px solid rgba(108, 99, 255, 0.3); cursor: pointer;" onclick="window.schoolWebsite.showTuitionMenu('secondary')">
                            <i class="fas fa-user-graduate" style="font-size: 50px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white; margin-bottom: 10px;">Secondary School</h3>
                            <p style="color: #ccc;">Grades 7-12</p>
                            <button style="margin-top: 15px; background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">View Tuition & Requirements</button>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 15px; border: 1px solid rgba(108, 99, 255, 0.3); cursor: pointer;" onclick="window.schoolWebsite.showTuitionMenu('advanced')">
                            <i class="fas fa-flask" style="font-size: 50px; color: #6C63FF; margin-bottom: 15px;"></i>
                            <h3 style="color: white; margin-bottom: 10px;">Advanced Level</h3>
                            <p style="color: #ccc;">A-Level</p>
                            <button style="margin-top: 15px; background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">View Tuition & Requirements</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="page" id="contactsPage" style="display: none;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); border: 1px solid rgba(108, 99, 255, 0.2);">
                    <h2 style="color: white; margin-bottom: 20px;">Contact Information</h2>
                    <div style="display: grid; gap: 20px;">
                        <div style="display: flex; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-map-marker-alt" style="font-size: 24px; color: #6C63FF; margin-right: 15px;"></i>
                            <div>
                                <h4 style="color: white; margin-bottom: 5px;">Address</h4>
                                <p style="color: #ccc;">${location}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-phone" style="font-size: 24px; color: #6C63FF; margin-right: 15px;"></i>
                            <div>
                                <h4 style="color: white; margin-bottom: 5px;">Phone</h4>
                                <p style="color: #ccc;">+256 700 000000</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; padding: 15px; background: rgba(255, 255, 255, 0.1); border-radius: 8px; border: 1px solid rgba(108, 99, 255, 0.3);">
                            <i class="fas fa-envelope" style="font-size: 24px; color: #6C63FF; margin-right: 15px;"></i>
                            <div>
                                <h4 style="color: white; margin-bottom: 5px;">Email</h4>
                                <p style="color: #ccc;">info@${schoolName.toLowerCase().replace(/\s+/g, '')}.com</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.websiteContainer.appendChild(content);
        
        // Initial updates
        this.updateStudentsGrid();
        this.updateTeachersTable();
        this.updateAdvertisements();
        
        // Make website instance globally accessible
        window.schoolWebsite = this;
    }

    showTuitionMenu(level) {
        const tuitionData = {
            primary: {
                title: 'Primary School Tuition',
                fees: [
                    { grade: 'Grade 1-2', tuition: '$500', requirements: 'Birth certificate, Previous report card' },
                    { grade: 'Grade 3-4', tuition: '$550', requirements: 'Birth certificate, Previous report card' },
                    { grade: 'Grade 5-6', tuition: '$600', requirements: 'Birth certificate, Previous report card' }
                ]
            },
            secondary: {
                title: 'Secondary School Tuition',
                fees: [
                    { grade: 'Grade 7-8', tuition: '$700', requirements: 'Primary leaving certificate, Birth certificate' },
                    { grade: 'Grade 9-10', tuition: '$800', requirements: 'Previous report card, Birth certificate' },
                    { grade: 'Grade 11-12', tuition: '$900', requirements: 'Previous report card, National ID' }
                ]
            },
            advanced: {
                title: 'Advanced Level Tuition',
                fees: [
                    { grade: 'Senior 5', tuition: '$1000', requirements: 'O-Level certificate, National ID' },
                    { grade: 'Senior 6', tuition: '$1100', requirements: 'Previous report card, National ID' }
                ]
            }
        };
        
        const data = tuitionData[level];
        if (!data) return;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;`;
        
        let feesHTML = '';
        data.fees.forEach(fee => {
            feesHTML += `
                <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 10px; border: 1px solid rgba(108, 99, 255, 0.3);">
                    <h4 style="color: white; margin-bottom: 10px;">${fee.grade}</h4>
                    <p style="color: #FF6584; font-size: 18px; font-weight: bold; margin-bottom: 10px;">${fee.tuition} per term</p>
                    <p style="color: #ccc; font-size: 13px;"><strong style="color: white;">Requirements:</strong> ${fee.requirements}</p>
                </div>
            `;
        });
        
        overlay.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a3e, #2a2a4e); border-radius: 20px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(108, 99, 255, 0.5);">
                <div style="background: linear-gradient(135deg, #6C63FF, #FF6584); padding: 30px; text-align: center; position: relative;">
                    <button onclick="this.closest('div[style]').parentElement.remove()" style="position: absolute; top: 20px; right: 20px; background: #f44336; border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px;">×</button>
                    <h2 style="color: white; margin-bottom: 10px;">${data.title}</h2>
                </div>
                <div style="padding: 30px; display: grid; gap: 20px;">
                    ${feesHTML}
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    generateActivitySections() {
        const homePage = this.websiteContainer.querySelector('#homePage');
        if (!homePage) return;
        
        const activitiesHTML = `
            <div style="margin-top: 30px; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.2);">
                    <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop" alt="Students Learning" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 20px;">
                        <h3 style="color: white; margin-bottom: 10px;">Interactive Learning</h3>
                        <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Our students engage in interactive learning sessions that promote critical thinking and creativity. Modern teaching methods ensure every student reaches their full potential.</p>
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.2);">
                    <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&h=400&fit=crop" alt="Sports Activities" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 20px;">
                        <h3 style="color: white; margin-bottom: 10px;">Sports & Athletics</h3>
                        <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Physical education and sports are integral parts of our curriculum. Students participate in various athletic activities that build teamwork and discipline.</p>
                    </div>
                </div>
                <div style="background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(10px); border-radius: 20px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.2);">
                    <img src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=400&fit=crop" alt="Science Experiments" style="width: 100%; height: 200px; object-fit: cover;">
                    <div style="padding: 20px;">
                        <h3 style="color: white; margin-bottom: 10px;">Science Experiments</h3>
                        <p style="color: #ccc; font-size: 14px; line-height: 1.6;">Hands-on laboratory experiments help students understand scientific concepts practically. Our well-equipped labs provide the perfect environment for discovery.</p>
                    </div>
                </div>
            </div>
        `;
        
        homePage.insertAdjacentHTML('beforeend', activitiesHTML);
    }

    generateFloatingButtons() {
        // Remove existing floating buttons if any
        if (this.floatingButtonsContainer) {
            this.floatingButtonsContainer.remove();
        }
        
        // Create container for floating buttons within the school container
        this.floatingButtonsContainer = document.createElement('div');
        this.floatingButtonsContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 0;
            right: 0;
            transform: translateY(-50%);
            z-index: 999;
            pointer-events: none;
        `;
        
        // Left floating button
        const leftBtn = document.createElement('button');
        leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        leftBtn.style.cssText = `
            position: absolute;
            left: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6C63FF, #FF6584);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 5px 20px rgba(108, 99, 255, 0.4);
            transition: all 0.3s;
            pointer-events: auto;
        `;
        leftBtn.onclick = () => this.navigatePages(-1);
        
        // Right floating button
        const rightBtn = document.createElement('button');
        rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
        rightBtn.style.cssText = `
            position: absolute;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: linear-gradient(135deg, #6C63FF, #FF6584);
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 5px 20px rgba(108, 99, 255, 0.4);
            transition: all 0.3s;
            pointer-events: auto;
        `;
        rightBtn.onclick = () => this.navigatePages(1);
        
        this.floatingButtonsContainer.appendChild(leftBtn);
        this.floatingButtonsContainer.appendChild(rightBtn);
        this.parentContainer.appendChild(this.floatingButtonsContainer);
    }

    navigatePages(direction) {
        const newIndex = this.currentPageIndex + direction;
        if (newIndex < 0 || newIndex >= this.pages.length) return;
        
        const pageName = this.pages[newIndex];
        this.switchPageWithAnimation(pageName, this.navContainer);
    }

    toggleStudentView(mode) {
        this.studentViewMode = mode;
        const gridContainer = this.websiteContainer.querySelector('#studentsGridContainer');
        const manageContainer = this.websiteContainer.querySelector('#studentsManageContainer');
        
        if (!gridContainer || !manageContainer) return;
        
        if (mode === 'grid') {
            gridContainer.style.display = 'block';
            manageContainer.style.display = 'none';
            this.updateStudentsGrid();
        } else {
            gridContainer.style.display = 'none';
            manageContainer.style.display = 'block';
            this.updateStudentsManageTable();
        }
    }

    updateStudentsGrid() {
        const container = this.websiteContainer.querySelector('#studentsGridContainer');
        if (!container || !this.data) return;
        
        const students = this.data.getStudents();
        
        if (students.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">No students enrolled yet.</p>';
            return;
        }
        
        let gridHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 20px;">';
        
        students.forEach(student => {
            const photoUrl = student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6C63FF&color=fff&size=150`;
            
            gridHTML += `
                <div onclick="window.schoolWebsite.showStudentProfile(${student.id})" style="background: rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: all 0.3s; border: 2px solid rgba(108, 99, 255, 0.3);">
                    <div style="width: 100px; height: 100px; margin: 0 auto 15px; border-radius: 50%; overflow: hidden; border: 3px solid #6C63FF;">
                        <img src="${photoUrl}" alt="${student.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <h4 style="color: white; margin-bottom: 5px; font-size: 16px;">${student.name}</h4>
                    <p style="color: #ccc; font-size: 14px;">${student.grade || 'Not Assigned'}</p>
                </div>
            `;
        });
        
        gridHTML += '</div>';
        container.innerHTML = gridHTML;
    }

    updateStudentsManageTable() {
        const container = this.websiteContainer.querySelector('#studentsManageContainer');
        if (!container || !this.data) return;
        
        const students = this.data.getStudents();
        
        let manageHTML = `
            <div style="margin-bottom: 20px;">
                <button onclick="window.schoolWebsite.showAddStudentForm()" style="background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 14px;">
                    <i class="fas fa-plus"></i> Add Student
                </button>
            </div>
        `;
        
        if (students.length === 0) {
            manageHTML += '<p style="color: #ccc; text-align: center; padding: 20px;">No students enrolled yet.</p>';
        } else {
            manageHTML += `
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #6C63FF, #FF6584);">
                                <th style="padding: 15px; text-align: left; color: white;">ID</th>
                                <th style="padding: 15px; text-align: left; color: white;">Name</th>
                                <th style="padding: 15px; text-align: left; color: white;">Grade</th>
                                <th style="padding: 15px; text-align: left; color: white;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            students.forEach(student => {
                manageHTML += `
                    <tr style="border-bottom: 1px solid rgba(108, 99, 255, 0.2); background: rgba(255, 255, 255, 0.05);">
                        <td style="padding: 12px 15px; color: white;">${student.id}</td>
                        <td style="padding: 12px 15px; color: white; font-weight: 500;">${student.name}</td>
                        <td style="padding: 12px 15px; color: #ccc;">${student.grade || 'N/A'}</td>
                        <td style="padding: 12px 15px;">
                            <button onclick="window.schoolWebsite.deleteStudent(${student.id})" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">Delete</button>
                        </td>
                    </tr>
                `;
            });
            
            manageHTML += '</tbody></table></div>';
        }
        
        container.innerHTML = manageHTML;
    }

    updateTeachersTable() {
        const container = this.websiteContainer.querySelector('#teachersTableContainer');
        if (!container || !this.data) return;
        
        const teachers = this.data.getTeachers();
        
        if (teachers.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">No teachers employed yet.</p>';
            return;
        }
        
        let tableHTML = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; font-family: 'Poppins', sans-serif;">
                    <thead>
                        <tr style="background: linear-gradient(135deg, #6C63FF, #FF6584);">
                            <th style="padding: 15px; text-align: left; color: white;">ID</th>
                            <th style="padding: 15px; text-align: left; color: white;">Name</th>
                            <th style="padding: 15px; text-align: left; color: white;">Subject</th>
                            <th style="padding: 15px; text-align: left; color: white;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        teachers.forEach(teacher => {
            tableHTML += `
                <tr style="border-bottom: 1px solid rgba(108, 99, 255, 0.2); background: rgba(255, 255, 255, 0.05);">
                    <td style="padding: 12px 15px; color: white;">${teacher.id}</td>
                    <td style="padding: 12px 15px; color: white; font-weight: 500;">${teacher.name}</td>
                    <td style="padding: 12px 15px; color: #ccc;">${teacher.subject}</td>
                    <td style="padding: 12px 15px;">
                        <button onclick="window.schoolWebsite.deleteTeacher(${teacher.id})" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px;">Delete</button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += '</tbody></table></div>';
        container.innerHTML = tableHTML;
    }

    updateAdvertisements() {
        const container = this.websiteContainer.querySelector('#advertisementsContainer');
        if (!container || !this.data) return;
        
        const ads = this.data.getAdvertisements();
        
        if (ads.length === 0) {
            container.innerHTML = '<p style="color: #ccc; text-align: center; padding: 20px;">No advertisements yet.</p>';
            return;
        }
        
        let adsHTML = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px;">';
        
        ads.forEach(ad => {
            adsHTML += `
                <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; overflow: hidden; border: 1px solid rgba(108, 99, 255, 0.3);">
                    <img src="${ad.image}" alt="${ad.title}" style="width: 100%; height: 150px; object-fit: cover;">
                    <div style="padding: 15px;">
                        <h4 style="color: white; margin-bottom: 5px;">${ad.title}</h4>
                        <p style="color: #ccc; font-size: 14px;">${ad.description}</p>
                        <button onclick="window.schoolWebsite.deleteAdvertisement(${ad.id})" style="background: #f44336; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-size: 12px; margin-top: 10px;">Delete</button>
                    </div>
                </div>
            `;
        });
        
        adsHTML += '</div>';
        container.innerHTML = adsHTML;
    }

    showAddStudentForm() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;`;
        
        const form = document.createElement('div');
        form.style.cssText = `background: linear-gradient(135deg, #1a1a3e, #2a2a4e); padding: 30px; border-radius: 20px; width: 400px; max-width: 90vw; border: 1px solid rgba(108, 99, 255, 0.5);`;
        
        form.innerHTML = `
            <h3 style="margin-bottom: 20px; color: white; text-align: center;">Add Student</h3>
            <input type="text" id="studentName" placeholder="Student Name" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.5); border-radius: 8px; color: white; box-sizing: border-box;">
            <input type="text" id="studentGrade" placeholder="Grade" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.5); border-radius: 8px; color: white; box-sizing: border-box;">
            <button onclick="window.schoolWebsite.submitStudent()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; border-radius: 8px; cursor: pointer;">Add Student</button>
        `;
        
        overlay.appendChild(form);
        document.body.appendChild(overlay);
        window.currentStudentForm = overlay;
    }

    submitStudent() {
        const name = document.getElementById('studentName').value;
        const grade = document.getElementById('studentGrade').value;
        
        if (name && grade) {
            this.data.addStudent({ name, grade });
            this.updateStudentsGrid();
            this.updateStudentsManageTable();
            
            if (window.currentStudentForm) {
                window.currentStudentForm.remove();
            }
        } else {
            alert('Please fill in all fields');
        }
    }

    showAddTeacherForm() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;`;
        
        const form = document.createElement('div');
        form.style.cssText = `background: linear-gradient(135deg, #1a1a3e, #2a2a4e); padding: 30px; border-radius: 20px; width: 400px; max-width: 90vw; border: 1px solid rgba(108, 99, 255, 0.5);`;
        
        form.innerHTML = `
            <h3 style="margin-bottom: 20px; color: white; text-align: center;">Add Teacher</h3>
            <input type="text" id="teacherName" placeholder="Teacher Name" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.5); border-radius: 8px; color: white; box-sizing: border-box;">
            <input type="text" id="teacherSubject" placeholder="Subject" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.5); border-radius: 8px; color: white; box-sizing: border-box;">
            <button onclick="window.schoolWebsite.submitTeacher()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; border-radius: 8px; cursor: pointer;">Add Teacher</button>
        `;
        
        overlay.appendChild(form);
        document.body.appendChild(overlay);
        window.currentTeacherForm = overlay;
    }

    submitTeacher() {
        const name = document.getElementById('teacherName').value;
        const subject = document.getElementById('teacherSubject').value;
        
        if (name && subject) {
            this.data.addTeacher({ name, subject });
            this.updateTeachersTable();
            
            if (window.currentTeacherForm) {
                window.currentTeacherForm.remove();
            }
        } else {
            alert('Please fill in all fields');
        }
    }

    showAddAdvertisementForm() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;`;
        
        const form = document.createElement('div');
        form.style.cssText = `background: linear-gradient(135deg, #1a1a3e, #2a2a4e); padding: 30px; border-radius: 20px; width: 400px; max-width: 90vw; border: 1px solid rgba(108, 99, 255, 0.5);`;
        
        form.innerHTML = `
            <h3 style="margin-bottom: 20px; color: white; text-align: center;">Add Advertisement</h3>
            <input type="text" id="adTitle" placeholder="Title" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.5); border-radius: 8px; color: white; box-sizing: border-box;">
            <input type="text" id="adDescription" placeholder="Description" style="width: 100%; padding: 12px; margin-bottom: 15px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(108, 99, 255, 0.5); border-radius: 8px; color: white; box-sizing: border-box;">
            <button onclick="window.schoolWebsite.submitAdvertisement()" style="width: 100%; padding: 12px; background: linear-gradient(135deg, #6C63FF, #FF6584); color: white; border: none; border-radius: 8px; cursor: pointer;">Add Advertisement</button>
        `;
        
        overlay.appendChild(form);
        document.body.appendChild(overlay);
        window.currentAdForm = overlay;
    }

    submitAdvertisement() {
        const title = document.getElementById('adTitle').value;
        const description = document.getElementById('adDescription').value;
        
        if (title && description) {
            this.data.addAdvertisement({ title, description, image: 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(title) });
            this.updateAdvertisements();
            
            if (window.currentAdForm) {
                window.currentAdForm.remove();
            }
        } else {
            alert('Please fill in all fields');
        }
    }

    showStudentProfile(studentId) {
        const student = this.data.getStudents().find(s => s.id === studentId);
        if (!student) return;
        
        const photoUrl = student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=6C63FF&color=fff&size=200`;
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.8); z-index: 999999; display: flex; align-items: center; justify-content: center;`;
        
        overlay.innerHTML = `
            <div style="background: linear-gradient(135deg, #1a1a3e, #2a2a4e); border-radius: 20px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; border: 1px solid rgba(108, 99, 255, 0.5);">
                <div style="background: linear-gradient(135deg, #6C63FF, #FF6584); padding: 30px; text-align: center; position: relative;">
                    <button onclick="this.closest('div[style]').parentElement.remove()" style="position: absolute; top: 20px; right: 20px; background: #f44336; border: none; color: white; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 20px;">×</button>
                    <img src="${photoUrl}" alt="${student.name}" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid white; margin-bottom: 15px;">
                    <h2 style="color: white; margin-bottom: 5px;">${student.name}</h2>
                    <p style="color: rgba(255, 255, 255, 0.9);">${student.grade || 'Not Assigned'}</p>
                </div>
                <div style="padding: 30px;">
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px;">
                            <h4 style="color: #ccc; font-size: 12px; margin-bottom: 5px;">REGISTER NUMBER</h4>
                            <p style="color: white;">${student.registerNumber || 'REG-' + String(student.id).padStart(4, '0')}</p>
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.1); padding: 15px; border-radius: 10px;">
                            <h4 style="color: #ccc; font-size: 12px; margin-bottom: 5px;">FEES BALANCE</h4>
                            <p style="color: white;">$${student.feesBalance || 0}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    deleteStudent(id) {
        if (confirm('Are you sure you want to delete this student?')) {
            this.data.deleteStudent(id);
            this.updateStudentsGrid();
            this.updateStudentsManageTable();
        }
    }

    deleteTeacher(id) {
        if (confirm('Are you sure you want to delete this teacher?')) {
            this.data.deleteTeacher(id);
            this.updateTeachersTable();
        }
    }

    deleteAdvertisement(id) {
        if (confirm('Are you sure you want to delete this advertisement?')) {
            this.data.deleteAdvertisement(id);
            this.updateAdvertisements();
        }
    }
}