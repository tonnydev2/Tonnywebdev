         // Sample app data - replace with your own content
        const apps = [
            { name: "Guess number", icon: "guess.png", link: "Number guess.html" },
            { name: "Typing simulator", icon: "typer.png", link: "Typer 2.html" },
            { name: "Bouncing simulator", icon: "bounce.png", link: "bounce.html" },
            { name: "Robot boy", icon: "robot.png", link: "sprite sheet./index.html" },
            { name: "Ludo", icon: "ludo.png", link: "ludo super/index.html" },
            { name: "Gallery", icon: "photos.png", link: "switcher/switch.html" },
            { name: "Matatu", icon: "matatu.png", link: "Tonnoid Matatu.html" },
            { name: "Hero Dog", icon: "dog.png", link: "dog Game/index.html" },
            { name: "Lottery", icon: "lottery.png", link: "lottery.html" },
            { name: "Calculator", icon: "calc.png", link: "calculator.html" },
            { name: "Notes", icon: "notepad.png", link: "notepad.html" },
            { name: "Story games", icon: "story1.png", link: "story Game.html" },
            { name: "R P S", icon: "rps.png", link: "Rock Paper Scissors .html" },
            { name: "Checkers", icon: "chess.png", link: "checkers-v2.html" },
            { name: "Lucky spin", icon: "payment-modal.png", link: "payment model.html" }
        ];

        // Function to render apps
        function renderApps() {
            const appGrid = document.getElementById('appGrid');
            appGrid.innerHTML = '';
            
            apps.forEach(app => {
                const appItem = document.createElement('a');
                appItem.href = app.link;
                appItem.className = 'app-item';
                
                if(apps.icon === undefined){
                appItem.innerHTML = `
                    <div class="app-icon">
                        <img src="${app.icon}">
                    </div>
                    <span class="app-name">${app.name}</span>`;
                    }else{
                   appItem.innerHTML += `<div class="app-icon">
                         <img src="${app.icon}">
                      </div>
                      <span class="app-name">${app.name}</span>`;
                    }
                console.log(appItem);
                appGrid.appendChild(appItem);
            });
        }

        // Check if user has stored their own apps in localStorage
        function loadUserApps() {
            const userApps = localStorage.getItem('userApps');
            if (userApps) {
                try {
                    const parsedApps = JSON.parse(userApps);
                    // Replace the default apps with user's apps
                    apps.length = 0;
                    apps.push(...parsedApps);
                } catch (e) {
                    console.error('Error parsing user apps from localStorage:', e);
                }
            }
        }

        // Initialize the launcher
        function init() {
            loadUserApps();
            renderApps();
        }

        // Run initialization when page loads
        document.addEventListener('DOMContentLoaded', init);


