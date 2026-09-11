const canvas = document.getElementById('mygl');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const img = document.getElementById('img');

let deck = [];

for(let i=0; i<4; i++){
    deck.push(generateNumberRange(0,12));
}
const allCards = {
    clubs: deck[0],
    diamonds: deck[1],
    hearts: deck[2],
    spades: deck[3]
};
deck[0] = allCards.clubs.map(it => 'clubs_' + it);
deck[1] = allCards.diamonds.map(it => 'diamonds_' + it);
deck[2] = allCards.hearts.map(it => 'hearts_' + it);
deck[3] = allCards.spades.map(it => 'spades_' + it);

const deck2 = deck.slice();

function shuffleArray(array){
    for(let i=array.length-1; i>=0; i--){
        let j = Math.floor(Math.random() * (i+1));
        [array[i],array[j]] = [array[j],array[i]];
    }
    return array;
}
let shuffledDeck = shuffleArray(deck.flat().concat(deck2.flat()));
let pickSlices = [];
let j = 0;
for(let i=0; i<8; i++){
    pickSlices.push(shuffledDeck.slice(j, j+4));
    j += 4;
}

pickSlices.flat().forEach(it =>{
    const index = Array.from(shuffledDeck).indexOf(it);
    shuffledDeck.splice(index,1);
});
let disabledCards = [];
let activeCards = [];
pickSlices.forEach(column => {
    if(column.length > 0) {
        activeCards.push(column[column.length - 1]);
    }
});

 
let cardPositions = [];

function generateNumberRange(start,end){
    const arr = [];
    for(let i= start; i<=end; i++){
        arr.push(i);
    }
    return arr;
}

let image = {
    width: 1041,
    height: 691,
    frameWidth: 1041/13,
    frameHeight: 691/6.3,
}

ctx.imageSmoothingEnabled = false;

let isDragging = false;
let draggedCard = null;
let draggedCards = [];
let dragOffsetX = 0;
let dragOffsetY = 0;
let dragStartX = 0;
let dragStartY = 0;
let sourceColumn = -1;
let sourceRow = -1;
let stock = {
			x: undefined,
			y: undefined,
			width: undefined,
			height: undefined,
};

function getCardPosition(cardName) {
    const [suit, value] = cardName.split('_');
    const cardValue = parseInt(value);
    
    let suitRow;
    switch(suit) {
        case 'clubs':
            suitRow = 0;
            break;
        case 'diamonds':
            suitRow = 1;
            break;
        case 'hearts':
            suitRow = 2;
            break;
        case 'spades':
            suitRow = 3;
            break;
        default:
            suitRow = 0;
    }
    
    return {
        frameX: image.frameWidth * cardValue,
        frameY: image.frameHeight * suitRow
    };
}

function getCardValue(cardName) {
    const [suit, value] = cardName.split('_');
    return parseInt(value);
}

function getCardSuit(cardName) {
    const [suit, value] = cardName.split('_');
    return suit;
}

function drawCard(ctx, cardName, x, y, width, height) {
    const pos = getCardPosition(cardName);
    
    ctx.drawImage(
        img,
        pos.frameX, pos.frameY,
        image.frameWidth, image.frameHeight,
        x, y,
        width, height
    );
}

function drawCoverCard(ctx, x, y, width, height) {
    ctx.drawImage(
        img,
        image.frameWidth * 0, image.frameHeight * 4,
        image.frameWidth, image.frameHeight,
        x, y,
        width, height
    );
}
function drawDisabledCard(ctx, x, y, width, height) {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(
        x, y,
        width, height
    );
}
function isDisabled(cardName){
    return disabledCards.includes(cardName);
}
function isCardActive(cardName) {
    return activeCards.includes(cardName);
}

function isValidDrop(draggedCardName, targetCardName) {
     
    const draggedValue = getCardValue(draggedCardName);
    const targetValue = getCardValue(targetCardName);
    
        
    const draggedSuit = getCardSuit(draggedCardName);
    const targetSuit = getCardSuit(targetCardName);
    
     
    const isValueCorrect = draggedValue + 1 === targetValue;
    
     
    const draggedIsRed = (draggedSuit === 'diamonds' || draggedSuit === 'hearts');
    const targetIsRed = (targetSuit === 'diamonds' || targetSuit === 'hearts');
    const isOppositeColor = draggedIsRed !== targetIsRed;
    
   
    const isValid = isValueCorrect && isOppositeColor;
     
    return isValid;
}

function draw(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const cardWidth = 50 * 0.8;
    const cardHeight = 80 * 0.8;
    const startX = 10 * 0.8;
    const startY = 200 * 0.8;
    const columnSpacing = 60 * 0.8;
    const rowSpacing = 40 * 0.8;
    
    cardPositions = [];
    
    for(let col = 0; col < pickSlices.length; col++) {
        if(pickSlices[col]) {
            for(let row = 0; row < pickSlices[col].length; row++) {
                const x = startX + (col * columnSpacing);
                const y = startY + (row * rowSpacing);
                const cardName = pickSlices[col][row];
                
                if(!isDragging || !draggedCards.includes(cardName)) {
                    cardPositions.push({
                        cardName: cardName,
                        x: x,
                        y: y,
                        width: cardWidth,
                        height: cardHeight,
                        column: col,
                        row: row
                    });
                    
                    if(isCardActive(cardName)) {
                        drawCard(ctx, cardName, x, y, cardWidth, cardHeight);
                        if(isDisabled(cardName)){
                            drawDisabledCard(ctx,x,y,cardWidth,cardHeight);
                        }
                    } else {
                        drawCoverCard(ctx, x, y, cardWidth, cardHeight);
                    }
                    
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = 'black';
                    ctx.strokeRect(x, y, cardWidth, cardHeight);
                }
            }
        }
    }
    
    stock.x = canvas.width * 0.7;
    stock.y = canvas.height * 0.1;
			   stock.width = cardWidth;
			   stock.height = cardHeight;
    if(shuffledDeck.length > 0) {
        drawCoverCard(ctx, stock.x, stock.y, stock.width, stock.height);
        ctx.strokeRect(stock.x, stock.y, stock.width, stock.height);
    }
    
    if(isDragging && draggedCards.length > 0) {
        for(let i = 0; i < draggedCards.length; i++) {
            const x = dragStartX - dragOffsetX;
            const y = dragStartY - dragOffsetY + (i * 30 * 0.8);
            drawCard(ctx, draggedCards[i], x, y, cardWidth, cardHeight);
            
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'blue';
            ctx.strokeRect(x, y, cardWidth, cardHeight);
        }
    }
}
//handle stock
function handleStock(mouse){
			if(!(mouse.clientX >= stock.x && mouse.clientX <= stock.x + stock.width && mouse.clientY >= stock.y && mouse.clientY <= stock.y + stock.height )){
						return;
			}
			disabledCards.push(...activeCards);
			pickSlices.forEach((col,index) =>{
						const slices = shuffledDeck.slice(index,index + 1);
						col.push(...slices);
			});
			const topCards = shuffledDeck.slice(0,pickSlices.length);
			activeCards.push(...topCards);
			shuffledDeck.splice(Array.from(shuffledDeck).indexOf(topCards[0]),topCards.length);
    draw();
}

// Handle both mouse and touch events
function handleDragStart(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
       
    for(let i = cardPositions.length - 1; i >= 0; i--) {
        const pos = cardPositions[i];
        if(isCardActive(pos.cardName) && !isDisabled(pos.cardName) &&
           mouseX >= pos.x && mouseX <= pos.x + pos.width &&
           mouseY >= pos.y && mouseY <= pos.y + pos.height) {
            
            isDragging = true;
            draggedCard = pos.cardName;
            sourceColumn = pos.column;
            sourceRow = pos.row;
            dragOffsetX = mouseX - pos.x;
            dragOffsetY = mouseY - pos.y;
            dragStartX = mouseX;
            dragStartY = mouseY;
            
            draggedCards = [];
            for(let row = sourceRow; row < pickSlices[sourceColumn].length; row++) {
                draggedCards.push(pickSlices[sourceColumn][row]);
            }
               draw();
            						break;
        }
    }
}

function handleDragMove(clientX, clientY) {
    if(isDragging) {
        const rect = canvas.getBoundingClientRect();
        dragStartX = clientX - rect.left;
        dragStartY = clientY - rect.top;
        draw();
    }
}

function handleDragEnd(clientX, clientY) {
    if(!isDragging) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    
       
    let droppedOnCard = null;
    let targetColumn = -1;
    let targetRow = -1;
    
    for(let i = 0; i < cardPositions.length; i++) {
        const pos = cardPositions[i];
        if(mouseX >= pos.x && mouseX <= pos.x + pos.width &&
           mouseY >= pos.y && mouseY <= pos.y + pos.height) {
            if(pos.column !== sourceColumn) {
                droppedOnCard = pos;
                targetColumn = pos.column;
                targetRow = pos.row;
                break;
            }
        }
    }
    
    if(droppedOnCard && draggedCards.length > 0) {
        if(isValidDrop(draggedCards[0], droppedOnCard.cardName)) {
            console.log('Valid drop! Moving cards');
            
            pickSlices[sourceColumn].splice(sourceRow, draggedCards.length);
            pickSlices[targetColumn].push(...draggedCards);
            
            if(!activeCards.includes(draggedCards[0])) {
                activeCards.push(draggedCards[0]);
            }
            let leftCard = pickSlices[sourceColumn][sourceRow -1];
            if(!isCardActive(leftCard) && !isDisabled(leftCard)){
                activeCards.push(leftCard);
            }else if(isCardActive(leftCard) && isDisabled(leftCard)){
                console.log('yes');
                const disabled = pickSlices[sourceColumn].filter(it => isDisabled(it));
                for(let i=0; i<disabled.length; i++){
                    let card = disabled[i];
                    disabledCards.splice(Array.from(disabledCards).indexOf(card),1);
               									 console.log(card);
                }
                
                
            }
            
        }  
    } 
    
    isDragging = false;
    draggedCard = null;
    draggedCards = [];
    sourceColumn = -1;
    sourceRow = -1;
    
    draw();
}

// Mouse events
canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
});

canvas.addEventListener('mousemove', (e) => {
    e.preventDefault();
    handleDragMove(e.clientX, e.clientY);
});

canvas.addEventListener('mouseup', (e) => {
    e.preventDefault();
    handleDragEnd(e.clientX, e.clientY);
});

// Touch events - properly pass coordinates
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
			  handleStock(touch);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragMove(touch.clientX, touch.clientY);
});

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    // Use changedTouches for the end event
    const touch = e.changedTouches[0];
    handleDragEnd(touch.clientX, touch.clientY);
});
canvas.addEventListener('click',(e)=>{
			
});

// Initial draw
draw();