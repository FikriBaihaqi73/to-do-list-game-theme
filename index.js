// Game variables
let level = 1;
let xp = 0;
let requiredXp = 100;
let completedCount = 0;
let quests = [];
let currentFilter = 'all';

// DOM elements
const questInput = document.getElementById('quest-input');
const addQuestBtn = document.getElementById('add-quest-btn');
const questList = document.getElementById('quest-list');
const levelElement = document.getElementById('level');
const currentXpElement = document.getElementById('current-xp');
const requiredXpElement = document.getElementById('required-xp');
const completedQuestsElement = document.getElementById('completed-quests');
const progressBar = document.getElementById('progress-bar');
const achievementElement = document.getElementById('achievement');
const achievementText = document.getElementById('achievement-text');
const levelUpElement = document.getElementById('level-up');
const newLevelElement = document.getElementById('new-level');
const filterButtons = document.querySelectorAll('.filter-btn');

// Load quests from local storage
function loadQuests() {
    const savedQuests = localStorage.getItem('gameQuests');
    const savedStats = localStorage.getItem('gameStats');
    
    if (savedQuests) {
        quests = JSON.parse(savedQuests);
        renderQuests();
    }
    
    if (savedStats) {
        const stats = JSON.parse(savedStats);
        level = stats.level;
        xp = stats.xp;
        requiredXp = stats.requiredXp;
        completedCount = stats.completedCount;
        updateStats();
    }
}

// Save quests to local storage
function saveQuests() {
    localStorage.setItem('gameQuests', JSON.stringify(quests));
    
    const stats = {
        level,
        xp,
        requiredXp,
        completedCount
    };
    
    localStorage.setItem('gameStats', JSON.stringify(stats));
}

// Add a new quest
function addQuest() {
    const questText = questInput.value.trim();
    
    if (questText === '') return;
    
    const quest = {
        id: Date.now(),
        text: questText,
        completed: false,
        createdAt: new Date()
    };
    
    quests.push(quest);
    questInput.value = '';
    
    saveQuests();
    renderQuests();
    showAchievement('New Quest Added', 'Begin your adventure!');
}

// Delete a quest
function deleteQuest(id) {
    const questIndex = quests.findIndex(quest => quest.id === id);
    
    if (quests[questIndex].completed) {
        completedCount--;
    }
    
    quests = quests.filter(quest => quest.id !== id);
    
    saveQuests();
    renderQuests();
    updateStats();
}

// Toggle quest completion
function toggleComplete(id) {
    const quest = quests.find(quest => quest.id === id);
    quest.completed = !quest.completed;
    
    if (quest.completed) {
        completedCount++;
        gainXp(25);
        showAchievement('Quest Completed', '+25 XP gained!');
    } else {
        completedCount--;
        gainXp(-25);
    }
    
    saveQuests();
    renderQuests();
    updateStats();
}

// Gain XP and check for level up
function gainXp(amount) {
    xp += amount;
    
    if (xp >= requiredXp) {
        levelUp();
    } else if (xp < 0) {
        xp = 0;
    }
}

// Level up
function levelUp() {
    level++;
    xp = xp - requiredXp;
    requiredXp = Math.floor(requiredXp * 1.5);
    
    updateStats();
    showLevelUp();
    
    // Check for more level ups
    if (xp >= requiredXp) {
        levelUp();
    }
}

// Show level up animation
function showLevelUp() {
    newLevelElement.textContent = level;
    levelUpElement.classList.add('show');
    
    setTimeout(() => {
        levelUpElement.classList.remove('show');
    }, 3000);
}

// Show achievement notification
function showAchievement(title, text) {
    achievementText.textContent = text;
    achievementElement.querySelector('.achievement-title').textContent = title;
    achievementElement.classList.add('show');
    
    setTimeout(() => {
        achievementElement.classList.remove('show');
    }, 3000);
}

// Update stats display
function updateStats() {
    levelElement.textContent = level;
    currentXpElement.textContent = xp;
    requiredXpElement.textContent = requiredXp;
    completedQuestsElement.textContent = completedCount;
    
    const progressPercent = (xp / requiredXp) * 100;
    progressBar.style.width = `${progressPercent}%`;
}

// Render quests based on current filter
function renderQuests() {
    let filteredQuests;
    
    switch (currentFilter) {
        case 'active':
            filteredQuests = quests.filter(quest => !quest.completed);
            break;
        case 'completed':
            filteredQuests = quests.filter(quest => quest.completed);
            break;
        default:
            filteredQuests = quests;
    }
    
    if (filteredQuests.length === 0) {
        questList.innerHTML = `
            <div class="empty-state">
                ${currentFilter === 'all' ? 'Your quest log is empty. Add your first quest!' : 
                  currentFilter === 'active' ? 'No active quests. All quests completed!' : 
                                               'No completed quests yet. Keep going!'}
            </div>
        `;
        return;
    }
    
    questList.innerHTML = '';
    
    filteredQuests.forEach(quest => {
        const li = document.createElement('li');
        li.className = `quest-item ${quest.completed ? 'completed' : ''}`;
        
        li.innerHTML = `
            <div class="quest-text">${quest.text}</div>
            <div class="quest-actions">
                <button class="complete-btn" title="Complete Quest">✓</button>
                <button class="delete-btn" title="Delete Quest">✕</button>
            </div>
        `;
        
        const completeBtn = li.querySelector('.complete-btn');
        const deleteBtn = li.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', () => toggleComplete(quest.id));
        deleteBtn.addEventListener('click', () => deleteQuest(quest.id));
        
        questList.appendChild(li);
    });
}

// Filter quests
function filterQuests(filter) {
    currentFilter = filter;
    
    filterButtons.forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    renderQuests();
}

// Event listeners
addQuestBtn.addEventListener('click', addQuest);

questInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addQuest();
    }
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterQuests(btn.dataset.filter);
    });
});

// Initialize
loadQuests();
updateStats();