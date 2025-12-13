 const rock = document.getElementById('rock');
        const paper = document.getElementById('paper');
        const scissors = document.getElementById('scissors');
        const message1 = document.getElementById('message1');
        const message2 = document.getElementById('message2');
        const winsElement = document.getElementById('wins');
        const losesElement = document.getElementById('loses');
        const tiesElement = document.getElementById('ties');
        const reset = document.getElementById('reset');
        const resultElement = document.getElementById('result');

        // Load saved score from localStorage
        const savedScore = JSON.parse(localStorage.getItem('score')) || {
            wins: 0,
            loses: 0,
            ties: 0
        };

        // Load saved result from localStorage
        const storedText = localStorage.getItem('result');

        // Initialize score
        let score = savedScore;
        updateScoreDisplay();

        // Set initial result text
        if (storedText) {
            resultElement.textContent = JSON.parse(storedText);
        }

        // Game sounds
        const winSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        const loseSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        const tieSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        const clickSound = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==');
        
        // In a real implementation, you would use actual sound files
        // For this example, we'll simulate sounds with a simple function
        function playSound(type) {
            // Create a simple beep sound
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = context.createOscillator();
            const gainNode = context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(context.destination);
            
            switch(type) {
                case 'win':
                    oscillator.frequency.value = 800;
                    break;
                case 'lose':
                    oscillator.frequency.value = 400;
                    break;
                case 'tie':
                    oscillator.frequency.value = 600;
                    break;
                case 'click':
                    oscillator.frequency.value = 500;
                    break;
            }
            
            gainNode.gain.value = 0.3;
            oscillator.start();
            
            // Stop after a short duration
            setTimeout(() => {
                oscillator.stop();
            }, 200);
        }

        // Animation function
        function animate(element) {
            element.classList.add('animation');
            setTimeout(() => {
                element.classList.remove('animation');
            }, 1500);
        }

                // Computer move function
        function compMove() {
            const compChoices = ['✊', '✋', '✌️'];
            const randIndex = Math.floor(Math.random() * 3);
            return compChoices[randIndex];
        }

        // Update score display
        function updateScoreDisplay() {
            winsElement.textContent = score.wins;
            losesElement.textContent = score.loses;
            tiesElement.textContent = score.ties;
        }

        let isProcessing = false;

        // Main game logic
        function checkGame(userChoice, compChoice) {
            if (isProcessing) return;
            isProcessing = true;

            // Play click sound
            playSound('click');

            let result = '';

            if (userChoice === compChoice) {
                result = "It's a tie!";
                score.ties++;
                resultElement.className = 'result tie';
                playSound('tie');
            } else if (
                (userChoice === '✊' && compChoice === '✌️') ||
                (userChoice === '✋' && compChoice === '✊') ||
                (userChoice === '✌️' && compChoice === '✋')
            ) {
                result = "You win!";
                score.wins++;
                resultElement.className = 'result win';
                playSound('win');
            } else {
                result = "You lose!";
                score.loses++;
                resultElement.className = 'result lose';
                playSound('lose');
            }

            // Save to localStorage
            localStorage.setItem('result', JSON.stringify(result));
            localStorage.setItem('score', JSON.stringify(score));

            // Update display
            updateScoreDisplay();
            message1.innerHTML = userChoice;
            message2.innerHTML = compChoice;
            resultElement.innerHTML = result;

            // Animate choices
            animate(message1);
            animate(message2);

            // Reset processing flag after animation
            setTimeout(() => {
                isProcessing = false;
            }, 1500);
        }

        // Event handlers for player choices
        rock.onclick = function() {
            const compChoice = compMove();
            checkGame('✊', compChoice);
        }

        paper.onclick = function() {
            const compChoice = compMove();
            checkGame('✋', compChoice);
        }

        scissors.onclick = function() {
            const compChoice = compMove();
            checkGame('✌️', compChoice);
        }
        // Reset button - fixed to update immediately
        reset.onclick = function() {
            // Play click sound
            playSound('click');
            
            // Reset score
            score = {
                wins: 0,
                loses: 0,
                ties: 0
            };
            
            // Update localStorage
            localStorage.setItem('score', JSON.stringify(score));
            localStorage.setItem('result', JSON.stringify('Make your move!'));
            
            // Update display immediately
            updateScoreDisplay();
            message1.innerHTML = '?';
            message2.innerHTML = '?';
            resultElement.innerHTML = 'Make your move!';
            resultElement.className = 'result';
        }