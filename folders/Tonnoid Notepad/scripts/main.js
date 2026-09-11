const fileInput = document.getElementById('fileInput');
const textContainer = document.getElementById('textContainer');
const images = document.querySelector('.images');
const count = document.getElementById('count');
const charCount = document.getElementById('charCount');
const status = document.getElementById('status');
const settings = document.querySelector('.settings');
const size = document.querySelector('.size');
const dialogue = document.querySelector('.dialogue');
const range = document.querySelector('.range')
const label = document.querySelector('label');
const darkTheme = document.querySelector('.darkMode');
const radio = document.querySelectorAll('.radio');
const radioLabel = document.querySelectorAll('.radioLabel');
const textColor = document.querySelector('.textColor');
const colorInput = document.querySelector('.colorInput');

// Define array of valid words to search for
const searchWords = ['const', 'function', 'for', 'do', 'class', 'while','constructor','let','return','as','import','export'];

// Initialize with saved text (plain text only)
textContainer.value = localStorage.getItem('my-text') || '';

// SIMPLE input handler - NO highlighting while typing
textContainer.addEventListener('input', (e) => {
    const plainText = textContainer.value;
    
    // Update counts
    countText(plainText);    
    // Save plain text
    save(plainText);
});

function addToSpaces(){
    for(let i=0; i<textContainer.value.length; i++){
        const index = Array.from(spaces).indexOf(textContainer.value[i]); 
        if (index > -1) continue;
        if(textContainer.value[i] === ' ') spaces.push(textContainer.value[i]);
    }
}
function countText(plainText){
    count.textContent = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;    
    charCount.textContent = plainText.length;
}
function show(element){
    element.style.display = 'block';
}

function hide(element){
    element.style.display = 'none';
}

// Function to highlight multiple words
function highlightMultipleWords(text, words, color = 'red') {
    if (!words || words.length === 0 || !text) return text;
    
    let highlightedText = text;
    
    words.forEach(word => {
        if (word && word.trim()) {
            const escaped = word.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
            highlightedText = highlightedText.replace(regex, match => 
                `<span class="highlight" style="color:${color}; background-color:${color}20;">${match}</span>`
            );
        }
    });
    
    return highlightedText;
}

function getUniqueSearchWords() {
    return searchWords;
}

// APPLY HIGHLIGHT - only when called manually
function applyHighlight() {
    const wordsToHighlight = getUniqueSearchWords();
    
    if (wordsToHighlight.length === 0) {
        alert('Please add words to highlight');
        return;
    }
    
    const color = 'orange';
    const plainText = textContainer.value;
    
    if (!plainText.trim()) {
        status.textContent = 'No text to highlight';
        return;
    }
    
    const highlightedHTML = highlightMultipleWords(plainText, wordsToHighlight, color);
    
    // Set as innerHTML to render the spans
    textContainer.value = highlightedHTML;
    
    // Still save plain text
    localStorage.setItem('my-text', plainText);
    status.textContent = `Highlighted ${wordsToHighlight.length} word(s)`;
}

// CLEAR HIGHLIGHTS
function clearHighlights() {
    const plainText = textContainer.value;
    textContainer.value = plainText;
    status.textContent = 'Highlights cleared';
}

fileInput.addEventListener('change',(event)=>{
    const files = event.target.files;
    
    for(let file of files){
        const reader = new FileReader();
        reader.onload = function(e){
            const result = e.target.result;
            
            if(file.type.startsWith('image')){
                const image = document.createElement('img');
                image.src = result;
                images.appendChild(image);
            }else{
                textContainer.value = result;
            }
        };
        if(file.type.startsWith('image')){
            reader.readAsDataURL(file);
        }else{
            reader.readAsText(file); 
        }
    }
});

settings.addEventListener('click',(e)=>{
    displaySetMenu();
    e.stopPropagation();
});  

size.addEventListener('click',(e)=>{
    show(range);
    show(label);
    e.stopPropagation();
});

document.addEventListener('click',()=>{
    hide(range);
    hide(dialogue);
    hide(label);
    setTimeout(()=>{
       hide(colorInput); 
    },10000);
    setTimeout(()=>{
        radioLabel.forEach(label =>{
            hide(label);
        });
        radio.forEach(rad =>{
            hide(rad);
        });
    },1000);
});

range.addEventListener('input',(e)=>{
    const size = e.target.value + 'px';
    label.innerHTML = size;
    formatSize(size);    
    hide(dialogue);
});

darkTheme.addEventListener('click',(e)=>{
    radio.forEach(rad =>{
        show(rad);
    });
    radioLabel.forEach(label =>{
        show(label);
    });
    dialogue.style.opacity = '0.2';
    e.stopPropagation();
});

document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', function() {
        if(this.value === 'ON') applyDarkTheme();
        else applyLightTheme();
    });
});

textColor.addEventListener('click',(e)=>{
    show(colorInput);
    e.stopPropagation();
});
colorInput.addEventListener('input',(e)=>{
    const input = e.target.value;
    changeColor(input);
});

function formatSize(size){
    textContainer.style.fontSize = size;
}

function applyDarkTheme(){
    document.body.style.background = '#000';
    textContainer.style.background = '#333';
    textContainer.style.color = '#f0f0f0';
}

function applyLightTheme(){
    document.body.style.background = '#fff';
    textContainer.style.background = '#f0f0f0';
    textContainer.style.color = '#000';
}

function download(){
    const text = textContainer.value; // Always get plain text
    if(text.includes('<html>') || text.includes('<body>') || text.includes('<head>')) textExt = 'html';
    else if(text.includes('const') || text.includes('document') || text.includes('function')) textExt = 'js';
    else if(text.includes('padding') || text.includes('position') || text.includes('display') || text.includes('margin')) textExt = 'css';
    else if(text.includes('iostream') || text.includes('endl') || text.includes('cout') || text.includes('cin')) textExt = 'cpp';
    else textExt = 'txt';
    
    const fileName = prompt('Enter File Name');
    const blob = new Blob([text], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.${textExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function save(text){
    status.textContent = 'Unsaved changes';
    // Always save plain text
    const plainText = text.replace ? text.replace(/<[^>]*>/g, '') : text;
    localStorage.setItem('my-text', plainText);
    status.textContent = 'All changes saved';
}

function displaySetMenu(){
    show(dialogue);
    dialogue.style.opacity = '1';
}
function changeColor(color = 'black'){
    textContainer.style.color = color;
}
 changeColor(colorInput.value);
 countText(textContainer.value);