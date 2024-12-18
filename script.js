const subjects = [
    "HS 3810-01 Health Systems and Structures",
    "HS 3210-01 Human Diseases",
    "HS 3814-01 Community Health",
    "HS 4812-01 Bioethics"
];

const tasks = [
    "Written Assignment",
    "Self quiz",
    "Discussion forum",
    "Learning journal"
];

function selectSubject() {
    const weekNumber = document.getElementById('weekNumber').value;
    const subjectSelectionContainer = document.getElementById('subjectSelectionContainer');
    subjectSelectionContainer.innerHTML = '';

    if (weekNumber) {
        const subjectSelect = document.createElement('select');
        subjectSelect.id = 'subjectSelect';
        subjectSelect.onchange = () => {
            createTaskTable(weekNumber, subjectSelect.value);
            displayReport(weekNumber);
        };
        subjects.forEach((subject, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = subject;
            subjectSelect.appendChild(option);
        });

        subjectSelectionContainer.appendChild(subjectSelect);
        if (subjectSelect.value) {
            createTaskTable(weekNumber, subjectSelect.value);
            displayReport(weekNumber);
        }
    }
}

function createTaskTable(weekNumber, subjectIndex) {
    const tasksContainer = document.getElementById('tasksContainer');
    tasksContainer.innerHTML = '';

    const table = document.createElement('table');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `<th>Task</th><th>Action</th>`;
    table.appendChild(headerRow);

    tasks.forEach(task => {
        const key = `${subjects[subjectIndex]}_${task}_week${weekNumber}`;
        const isChecked = localStorage.getItem(key) === 'done' ? 'checked' : '';
        const taskRow = document.createElement('tr');
        taskRow.innerHTML = `
            <td>${task} (Week ${weekNumber})</td>
            <td>
                <input type="radio" name="${key}" ${isChecked} onclick="storeTask('${key}')"
                    ondblclick="undoTask('${key}', this)">
            </td>
        `;
        table.appendChild(taskRow);
    });

    // Extra tasks
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(`${subjects[subjectIndex]}_`) && 
            key.endsWith(`_week${weekNumber}`) && 
            !tasks.includes(key.split('_')[1])) {
            
            const isChecked = localStorage.getItem(key) === 'done' ? 'checked' : '';
            const taskRow = document.createElement('tr');
            taskRow.innerHTML = `
                <td>${key.split('_')[1]} (Week ${weekNumber})</td>
                <td>
                    <input type="radio" name="${key}" ${isChecked} onclick="storeTask('${key}')"
                        ondblclick="undoTask('${key}', this)">
                    <button onclick="removeExtraTask('${key}', ${weekNumber}, ${subjectIndex})">Remove</button>
                </td>
            `;
            table.appendChild(taskRow);
        }
    }

    tasksContainer.appendChild(table);

    const extraTaskContainer = document.getElementById('extraTaskContainer');
    extraTaskContainer.innerHTML = `
        <label for="extraTask">Add an extra task for Week ${weekNumber}? </label>
        <select id="extraTaskOption" onchange="toggleExtraTaskInput(${weekNumber}, ${subjectIndex})">
            <option value="no">No</option>
            <option value="yes">Yes</option>
        </select>
        <div id="extraTaskInputContainer"></div>
    `;
}

function toggleExtraTaskInput(weekNumber, subjectIndex) {
    const extraTaskOption = document.getElementById('extraTaskOption').value;
    const extraTaskInputContainer = document.getElementById('extraTaskInputContainer');

    if (extraTaskOption === 'yes') {
        extraTaskInputContainer.innerHTML = `
            <input type="text" id="extraTask" name="extraTask" placeholder="Enter extra task">
            <button type="button" onclick="addExtraTask(${weekNumber}, ${subjectIndex})">Add Task</button>
        `;
    } else {
        extraTaskInputContainer.innerHTML = '';
    }
}

function addExtraTask(weekNumber, subjectIndex) {
    const extraTask = document.getElementById('extraTask').value;
    if (extraTask) {
        const key = `${subjects[subjectIndex]}_${extraTask}_week${weekNumber}`;
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, 'not done');
            createTaskTable(weekNumber, subjectIndex);
            displayReport(weekNumber);
        } else {
            alert('This task already exists!');
        }
    }
}

function removeExtraTask(key, weekNumber, subjectIndex) {
    if (confirm('Are you sure you want to remove this extra task?')) {
        localStorage.removeItem(key);
        createTaskTable(weekNumber, subjectIndex);
        displayReport(weekNumber);
    }
}

function storeTask(key) {
    localStorage.setItem(key, 'done');
    const weekNumber = document.getElementById('weekNumber').value;
    displayReport(weekNumber);
}

function undoTask(key, radioButton) {
    localStorage.setItem(key, 'not done');
    radioButton.checked = false;
    const weekNumber = document.getElementById('weekNumber').value;
    displayReport(weekNumber);
}

function displayReport(weekNumber) {
    const reportContainer = document.getElementById('reportContainer');
    reportContainer.innerHTML = '<h2>Weekly Report</h2>';

    subjects.forEach(subject => {
        const subjectSection = document.createElement('div');
        const subjectHeading = document.createElement('h3');
        subjectHeading.textContent = subject;
        subjectSection.appendChild(subjectHeading);

        const table = document.createElement('table');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `<th>Task</th><th>Status</th>`;
        table.appendChild(headerRow);

        tasks.forEach(task => {
            const key = `${subject}_${task}_week${weekNumber}`;
            const isChecked = localStorage.getItem(key) === 'done';
            const status = isChecked ? '<span class="tick">&#10004;</span>' : '<span class="cross">&#10008;</span>';
            const taskRow = document.createElement('tr');
            taskRow.innerHTML = `
                <td>${task} (Week ${weekNumber})</td>
                <td>${status}</td>
            `;
            table.appendChild(taskRow);
        });

        // Extra tasks
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${subject}_`) && key.endsWith(`_week${weekNumber}`) && !tasks.includes(key.split('_')[1])) {
                const isChecked = localStorage.getItem(key) === 'done';
                const status = isChecked ? '<span class="tick">&#10004;</span>' : '<span class="cross">&#10008;</span>';
                const taskRow = document.createElement('tr');
                taskRow.innerHTML = `
                    <td>${key.split('_')[1]} (Week ${weekNumber})</td>
                    <td>${status}</td>
                `;
                table.appendChild(taskRow);
            }
        }

        subjectSection.appendChild(table);
        reportContainer.appendChild(subjectSection);
    });

    // Add options to generate PDF or print
    const reportOptionsContainer = document.createElement('div');
    reportOptionsContainer.innerHTML = `
        <button onclick="generatePDF()">Generate PDF</button>
        <button onclick="printReport()">Print Report</button>
    `;
    reportContainer.appendChild(reportOptionsContainer);
}

// Print Preview
function printReport() {
    const reportContainer = document.getElementById('reportContainer');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
            <head>
                <title>Report</title>
            </head>
            <body>
                <h1>Weekly Report</h1>
                ${reportContainer.innerHTML}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

// Generate PDF
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let yPosition = 10;
    doc.setFontSize(16);
    doc.text("Weekly Report", 10, yPosition);

    subjects.forEach(subject => {
        yPosition += 10;
        doc.setFontSize(14);
        doc.text(subject, 10, yPosition);

        tasks.forEach(task => {
            yPosition += 10;
            const key = `${subject}_${task}_week${document.getElementById('weekNumber').value}`;
            const status = localStorage.getItem(key) === 'done' ? '✔' : '✘';
            doc.text(`${task}: ${status}`, 10, yPosition);
        });

        // Extra tasks
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith(`${subject}_`) && key.endsWith(`_week${document.getElementById('weekNumber').value}`) && !tasks.includes(key.split('_')[1])) {
                yPosition += 10;
                const status = localStorage.getItem(key) === 'done' ? '✔' : '✘';
                doc.text(`${key.split('_')[1]}: ${status}`, 10, yPosition);
            }
        }
    });

    doc.save('Weekly_Report.pdf');
}
