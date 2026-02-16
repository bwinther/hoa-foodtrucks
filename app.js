// State
let currentView = 'upcoming';
let calendarDate = new Date();

// Utilities
function parseDate(dateStr) {
    return new Date(dateStr + 'T00:00:00');
}

function formatDate(date, options) {
    return date.toLocaleDateString('en-US', options);
}

function isThisWeek(date) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    
    return date >= startOfWeek && date < endOfWeek;
}

function isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
}

// Render truck card
function renderTruckCard(truck, showPastStyle = true) {
    const date = parseDate(truck.date);
    const past = isPast(date);
    const dateStr = formatDate(date, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    
    let links = '';
    if (truck.website || truck.menu) {
        links = '<div class="links">';
        if (truck.website) links += `<a href="${truck.website}" target="_blank">🌐 Website</a>`;
        if (truck.menu) links += `<a href="${truck.menu}" target="_blank">📋 Menu</a>`;
        links += '</div>';
    }
    
    return `
        <div class="truck-card${showPastStyle && past ? ' past' : ''}">
            <div class="date">${dateStr}</div>
            <div class="truck-name">${truck.name}</div>
            <div class="details">
                <span class="time">${truck.time}</span>
                <span class="location">${truck.location}</span>
            </div>
            ${truck.description ? `<p class="description">${truck.description}</p>` : ''}
            ${links}
        </div>
    `;
}

// Upcoming view
function renderUpcoming() {
    const container = document.getElementById('upcoming-list');
    
    const thisWeek = foodTrucks
        .filter(t => isThisWeek(parseDate(t.date)))
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));
    
    if (thisWeek.length === 0) {
        // Show next upcoming if nothing this week
        const upcoming = foodTrucks
            .filter(t => !isPast(parseDate(t.date)))
            .sort((a, b) => parseDate(a.date) - parseDate(b.date));
        
        if (upcoming.length > 0) {
            container.innerHTML = `
                <p style="color: white; margin-bottom: 1rem;">Nothing scheduled this week. Next up:</p>
                ${upcoming.slice(0, 3).map(t => renderTruckCard(t, false)).join('')}
            `;
        } else {
            container.innerHTML = `
                <div class="no-trucks">
                    <p>🚚 No upcoming food trucks scheduled</p>
                    <p style="margin-top: 0.5rem; font-size: 0.875rem;">Check back soon!</p>
                </div>
            `;
        }
        return;
    }
    
    container.innerHTML = thisWeek.map(t => renderTruckCard(t)).join('');
}

// Calendar view
function renderCalendar() {
    const monthEl = document.getElementById('calendar-month');
    const gridEl = document.getElementById('calendar-grid');
    
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    monthEl.textContent = formatDate(calendarDate, { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Build truck lookup
    const trucksByDate = {};
    foodTrucks.forEach(t => {
        trucksByDate[t.date] = t;
    });
    
    let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        .map(d => `<div class="calendar-header">${d}</div>`)
        .join('');
    
    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(year, month, day);
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const truck = trucksByDate[dateStr];
        const isToday = date.getTime() === today.getTime();
        const past = date < today;
        
        let classes = 'calendar-day';
        if (isToday) classes += ' today';
        if (truck) classes += ' has-truck' + (past ? ' past' : '');
        
        let tooltip = truck ? `<span class="truck-tooltip">${truck.name}</span>` : '';
        
        html += `<div class="${classes}">${day}${tooltip}</div>`;
    }
    
    // Next month padding
    const remaining = 42 - (startPadding + lastDay.getDate());
    for (let day = 1; day <= remaining && remaining < 7; day++) {
        html += `<div class="calendar-day other-month">${day}</div>`;
    }
    
    gridEl.innerHTML = html;
}

// Archive view
function renderArchive(filter = '') {
    const container = document.getElementById('archive-list');
    
    let trucks = [...foodTrucks].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    
    if (filter) {
        const f = filter.toLowerCase();
        trucks = trucks.filter(t => 
            t.name.toLowerCase().includes(f) || 
            (t.description && t.description.toLowerCase().includes(f))
        );
    }
    
    if (trucks.length === 0) {
        container.innerHTML = '<div class="no-trucks">No matches found</div>';
        return;
    }
    
    // Group by year
    const byYear = {};
    trucks.forEach(t => {
        const year = parseDate(t.date).getFullYear();
        if (!byYear[year]) byYear[year] = [];
        byYear[year].push(t);
    });
    
    let html = '';
    Object.keys(byYear).sort((a, b) => b - a).forEach(year => {
        html += `<div class="archive-year">${year}</div>`;
        html += byYear[year].map(t => renderTruckCard(t)).join('');
    });
    
    container.innerHTML = html;
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        const view = btn.dataset.view;
        document.getElementById(view).classList.add('active');
        
        if (view === 'calendar') renderCalendar();
        if (view === 'archive') renderArchive();
    });
});

// Calendar nav
document.getElementById('prev-month').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() - 1);
    renderCalendar();
});

document.getElementById('next-month').addEventListener('click', () => {
    calendarDate.setMonth(calendarDate.getMonth() + 1);
    renderCalendar();
});

// Archive search
document.getElementById('archive-search').addEventListener('input', (e) => {
    renderArchive(e.target.value);
});

// Last updated
document.getElementById('last-updated').textContent = formatDate(parseDate(lastUpdated), {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// Initial render
renderUpcoming();
