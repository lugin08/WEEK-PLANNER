// Theme

const themeButton =
    document.getElementById("theme-toggle");

function applyTheme() {

    const lightMode =
        localStorage.getItem("theme") === "light";

    document.body.classList.toggle(
        "light-mode",
        lightMode
    );

    if (themeButton) {
        themeButton.textContent =
            lightMode ? "🌙" : "☀️";
    }
}

applyTheme();

if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            const lightMode =
                document.body.classList.toggle(
                    "light-mode"
                );

            localStorage.setItem(
                "theme",
                lightMode ? "light" : "dark"
            );

            themeButton.textContent =
                lightMode ? "🌙" : "☀️";

            if (
                typeof window.drawProgressChart ===
                "function"
            ) {
                window.drawProgressChart();
            }
        }
    );
}


// Common functions

function createEmptyWeek() {

    return {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
    };
}


function getWeekStart(date) {

    const start =
        new Date(date);

    const day =
        start.getDay();

    const difference =
        day === 0
            ? -6
            : 1 - day;

    start.setDate(
        start.getDate() + difference
    );

    start.setHours(
        0,
        0,
        0,
        0
    );

    return start;
}


function getWeekId(date) {

    const monday =
        getWeekStart(date);

    const year =
        monday.getFullYear();

    const month =
        String(
            monday.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            monday.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function getWeekDates(weekId) {

    const parts =
        weekId.split("-");

    const monday =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            Number(parts[2])
        );

    const sunday =
        new Date(monday);

    sunday.setDate(
        monday.getDate() + 6
    );

    return {
        start: monday,
        end: sunday
    };
}


function formatDate(date) {

    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric"
        }
    ).toUpperCase();
}


function getDateKey(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function dateFromKey(key) {

    const parts =
        key.split("-");

    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );
}


function calculateWeekProgress(tasks) {

    let total = 0;
    let completed = 0;

    Object.values(tasks).forEach(
        dayTasks => {

            total +=
                dayTasks.length;

            completed +=
                dayTasks.filter(
                    task =>
                        task.completed
                ).length;
        }
    );

    return {
        total,
        completed,
        percent:
            total === 0
                ? 0
                : Math.round(
                    (
                        completed /
                        total
                    ) * 100
                )
    };
}


// Daily activity

function getDailyActivity() {

    return JSON.parse(
        localStorage.getItem(
            "dailyActivity"
        )
    ) || {};
}


function saveDailyActivity(activity) {

    localStorage.setItem(
        "dailyActivity",
        JSON.stringify(activity)
    );
}


function addDailyActivity(date) {

    const activity =
        getDailyActivity();

    const key =
        getDateKey(date);

    activity[key] =
        (activity[key] || 0) + 1;

    saveDailyActivity(
        activity
    );
}


function removeDailyActivity(date) {

    const activity =
        getDailyActivity();

    const key =
        getDateKey(date);

    if (!activity[key]) {
        return;
    }

    activity[key]--;

    if (activity[key] <= 0) {
        delete activity[key];
    }

    saveDailyActivity(
        activity
    );
}


// Weekly history

function syncWeekHistory() {

    const currentWeekId =
        getWeekId(new Date());

    const savedWeekId =
        localStorage.getItem(
            "currentWeekId"
        );

    let weekTasks =
        JSON.parse(
            localStorage.getItem(
                "weekTasks"
            )
        );

    let history =
        JSON.parse(
            localStorage.getItem(
                "weekHistory"
            )
        ) || [];


    if (!savedWeekId) {

        localStorage.setItem(
            "currentWeekId",
            currentWeekId
        );

        if (!weekTasks) {

            localStorage.setItem(
                "weekTasks",
                JSON.stringify(
                    createEmptyWeek()
                )
            );
        }

        return;
    }


    if (
        savedWeekId ===
        currentWeekId
    ) {
        return;
    }


    weekTasks =
        weekTasks ||
        createEmptyWeek();

    const progress =
        calculateWeekProgress(
            weekTasks
        );

    const dates =
        getWeekDates(
            savedWeekId
        );

    const alreadySaved =
        history.some(
            week =>
                week.id ===
                savedWeekId
        );


    if (!alreadySaved) {

        history.push({

            id:
                savedWeekId,

            start:
                dates.start.toISOString(),

            end:
                dates.end.toISOString(),

            tasks:
                weekTasks,

            total:
                progress.total,

            completed:
                progress.completed,

            percent:
                progress.percent
        });
    }


    localStorage.setItem(
        "weekHistory",
        JSON.stringify(
            history
        )
    );


    localStorage.setItem(
        "weekTasks",
        JSON.stringify(
            createEmptyWeek()
        )
    );


    localStorage.setItem(
        "currentWeekId",
        currentWeekId
    );
}


syncWeekHistory();


// Shared week data

let sharedWeekTasks =
    JSON.parse(
        localStorage.getItem(
            "weekTasks"
        )
    ) || createEmptyWeek();


// Make sure every day exists

const dayKeys = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
];


dayKeys.forEach(
    day => {

        if (
            !Array.isArray(
                sharedWeekTasks[day]
            )
        ) {

            sharedWeekTasks[day] =
                [];
        }
    }
);


function saveSharedWeekTasks() {

    localStorage.setItem(
        "weekTasks",
        JSON.stringify(
            sharedWeekTasks
        )
    );
}


// Get today's day name

function getTodayName() {

    const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    return dayNames[
        new Date().getDay()
    ];
}


// Migration from old TODAY system

function migrateOldTodayTasks() {

    const oldTasks =
        JSON.parse(
            localStorage.getItem(
                "todayTasks"
            )
        );

    if (
        !Array.isArray(oldTasks) ||
        oldTasks.length === 0
    ) {
        return;
    }


    const todayName =
        getTodayName();


    if (
        sharedWeekTasks[todayName].length === 0
    ) {

        sharedWeekTasks[todayName] =
            oldTasks;

        saveSharedWeekTasks();
    }


    localStorage.removeItem(
        "todayTasks"
    );
}


migrateOldTodayTasks();


// TODAY

const todayTaskList =
    document.getElementById(
        "task-list"
    );

const addTodayTask =
    document.getElementById(
        "add-task"
    );


if (
    todayTaskList &&
    addTodayTask
) {

    const todayName =
        getTodayName();


    let userName =
        localStorage.getItem(
            "userName"
        );


    if (!userName) {

        userName =
            prompt(
                "What's your name?"
            ) ||
            "Yaroslav";

        userName =
            userName.trim() ||
            "Yaroslav";

        localStorage.setItem(
            "userName",
            userName
        );
    }


    const nameElement =
        document.getElementById(
            "user-name"
        );


    if (nameElement) {

        nameElement.textContent =
            userName.toUpperCase();
    }


    const dateElement =
        document.getElementById(
            "current-date"
        );


    if (dateElement) {

        dateElement.textContent =
            new Date()
                .toLocaleDateString(
                    "en-US",
                    {
                        weekday: "long",
                        month: "long",
                        day: "numeric"
                    }
                )
                .toUpperCase();
    }


    function updateTodayProgress() {

        const tasks =
            sharedWeekTasks[
                todayName
            ];


        const completed =
            tasks.filter(
                task =>
                    task.completed
            ).length;

        const total =
            tasks.length;


        const percent =
            total === 0
                ? 0
                : Math.round(
                    (
                        completed /
                        total
                    ) * 100
                );


        const percentElement =
            document.getElementById(
                "progress-percent"
            );

        const fill =
            document.getElementById(
                "progress-fill"
            );

        const counter =
            document.getElementById(
                "task-counter"
            );


        if (percentElement) {

            percentElement.textContent =
                `${percent}%`;
        }


        if (fill) {

            fill.style.width =
                `${percent}%`;
        }


        if (counter) {

            counter.textContent =
                `${completed} / ${total} completed`;
        }
    }


    function showTodayTasks() {

        todayTaskList.innerHTML =
            "";


        const tasks =
            sharedWeekTasks[
                todayName
            ];


        tasks.forEach(
            (task, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "task-card";


                if (task.completed) {

                    card.classList.add(
                        "completed"
                    );
                }


                card.innerHTML = `
                    <div class="task-left">

                        <button class="complete-button">
                            ${task.completed ? "✓" : ""}
                        </button>

                        <div>
                            <h3>${task.name}</h3>
                            <p>${task.time}</p>
                        </div>

                    </div>

                    <button class="delete-button">
                        ×
                    </button>
                `;


                card.querySelector(
                    ".complete-button"
                ).addEventListener(
                    "click",
                    () => {

                        const currentTask =
                            sharedWeekTasks[
                                todayName
                            ][index];


                        const wasCompleted =
                            currentTask.completed;


                        currentTask.completed =
                            !wasCompleted;


                        if (
                            !wasCompleted &&
                            currentTask.completed
                        ) {

                            currentTask.completedAt =
                                getDateKey(
                                    new Date()
                                );

                            addDailyActivity(
                                new Date()
                            );
                        }


                        if (
                            wasCompleted &&
                            !currentTask.completed
                        ) {

                            if (
                                currentTask.completedAt
                            ) {

                                removeDailyActivity(
                                    dateFromKey(
                                        currentTask.completedAt
                                    )
                                );
                            }

                            delete currentTask.completedAt;
                        }


                        saveSharedWeekTasks();

                        showTodayTasks();

                        updateTodayProgress();
                    }
                );


                card.querySelector(
                    ".delete-button"
                ).addEventListener(
                    "click",
                    () => {

                        const currentTask =
                            sharedWeekTasks[
                                todayName
                            ][index];


                        if (
                            currentTask.completed &&
                            currentTask.completedAt
                        ) {

                            removeDailyActivity(
                                dateFromKey(
                                    currentTask.completedAt
                                )
                            );
                        }


                        sharedWeekTasks[
                            todayName
                        ].splice(
                            index,
                            1
                        );


                        saveSharedWeekTasks();

                        showTodayTasks();

                        updateTodayProgress();
                    }
                );


                todayTaskList.appendChild(
                    card
                );
            }
        );
    }


    addTodayTask.addEventListener(
        "click",
        () => {

            const name =
                prompt(
                    "Enter your task:"
                );


            if (
                !name ||
                !name.trim()
            ) {
                return;
            }


            const time =
                prompt(
                    "Enter the time (for example: 18:00):"
                );


            sharedWeekTasks[
                todayName
            ].push({

                name:
                    name.trim(),

                time:
                    time ||
                    "No time",

                completed:
                    false
            });


            saveSharedWeekTasks();

            showTodayTasks();

            updateTodayProgress();
        }
    );


    showTodayTasks();

    updateTodayProgress();
}


// WEEK

const dayCards =
    document.querySelectorAll(
        ".day-card"
    );


if (dayCards.length > 0) {

    const weekTasks =
        sharedWeekTasks;


    const now =
        new Date();

    const monday =
        getWeekStart(now);

    const sunday =
        new Date(monday);


    sunday.setDate(
        monday.getDate() + 6
    );


    const weekRange =
        document.getElementById(
            "week-range"
        );


    if (weekRange) {

        weekRange.textContent =
            `${formatDate(monday)} — ${formatDate(sunday)}`;
    }


    const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];


    const todayName =
        dayNames[
            now.getDay()
        ];


    dayCards.forEach(
        card => {

            if (
                card.dataset.day ===
                todayName
            ) {

                card.classList.add(
                    "today"
                );


                const label =
                    card.querySelector(
                        ".today-label"
                    );


                if (label) {

                    label.textContent =
                        "TODAY";
                }
            }
        }
    );


    function getDayDate(dayName) {

        const offsets = {

            monday: 0,
            tuesday: 1,
            wednesday: 2,
            thursday: 3,
            friday: 4,
            saturday: 5,
            sunday: 6
        };


        const date =
            new Date(monday);


        date.setDate(
            monday.getDate() +
            offsets[dayName]
        );


        return date;
    }


    function updateWeekProgress() {

        const progress =
            calculateWeekProgress(
                weekTasks
            );


        const element =
            document.getElementById(
                "week-progress"
            );


        if (element) {

            element.textContent =
                `${progress.percent}%`;
        }
    }


    function showWeekTasks() {

        document
            .querySelectorAll(
                ".day-tasks"
            )
            .forEach(
                container => {

                    const card =
                        container.closest(
                            ".day-card"
                        );


                    const day =
                        card.dataset.day;


                    container.innerHTML =
                        "";


                    weekTasks[day]
                        .forEach(
                            (task, index) => {

                                const taskElement =
                                    document.createElement(
                                        "div"
                                    );


                                taskElement.className =
                                    "day-task";


                                if (
                                    task.completed
                                ) {

                                    taskElement
                                        .classList
                                        .add(
                                            "completed"
                                        );
                                }


                                taskElement.innerHTML = `
                                    <div class="day-task-info">

                                        <span class="day-task-name">
                                            ${task.name}
                                        </span>

                                        <span class="day-task-time">
                                            ${task.time}
                                        </span>

                                    </div>

                                    <div class="day-task-buttons">

                                        <button class="day-task-complete">
                                            ${task.completed ? "✓" : ""}
                                        </button>

                                        <button class="day-task-delete">
                                            ×
                                        </button>

                                    </div>
                                `;


                                taskElement
                                    .querySelector(
                                        ".day-task-complete"
                                    )
                                    .addEventListener(
                                        "click",
                                        () => {

                                            const currentTask =
                                                weekTasks[
                                                    day
                                                ][
                                                    index
                                                ];


                                            const wasCompleted =
                                                currentTask.completed;


                                            currentTask.completed =
                                                !wasCompleted;


                                            if (
                                                !wasCompleted &&
                                                currentTask.completed
                                            ) {

                                                const taskDate =
                                                    getDayDate(
                                                        day
                                                    );


                                                currentTask.completedAt =
                                                    getDateKey(
                                                        taskDate
                                                    );


                                                addDailyActivity(
                                                    taskDate
                                                );
                                            }


                                            if (
                                                wasCompleted &&
                                                !currentTask.completed
                                            ) {

                                                if (
                                                    currentTask.completedAt
                                                ) {

                                                    removeDailyActivity(
                                                        dateFromKey(
                                                            currentTask.completedAt
                                                        )
                                                    );
                                                }


                                                delete currentTask.completedAt;
                                            }


                                            saveSharedWeekTasks();

                                            showWeekTasks();

                                            updateWeekProgress();
                                        }
                                    );


                                taskElement
                                    .querySelector(
                                        ".day-task-delete"
                                    )
                                    .addEventListener(
                                        "click",
                                        () => {

                                            const currentTask =
                                                weekTasks[
                                                    day
                                                ][
                                                    index
                                                ];


                                            if (
                                                currentTask.completed &&
                                                currentTask.completedAt
                                            ) {

                                                removeDailyActivity(
                                                    dateFromKey(
                                                        currentTask.completedAt
                                                    )
                                                );
                                            }


                                            weekTasks[
                                                day
                                            ].splice(
                                                index,
                                                1
                                            );


                                            saveSharedWeekTasks();

                                            showWeekTasks();

                                            updateWeekProgress();
                                        }
                                    );


                                container.appendChild(
                                    taskElement
                                );
                            }
                        );
                }
            );
    }


    document
        .querySelectorAll(
            ".add-day-task"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const card =
                            button.closest(
                                ".day-card"
                            );

                        const day =
                            card.dataset.day;


                        const name =
                            prompt(
                                "Enter your task:"
                            );


                        if (
                            !name ||
                            !name.trim()
                        ) {
                            return;
                        }


                        const time =
                            prompt(
                                "Enter the time (for example: 18:00):"
                            );


                        weekTasks[
                            day
                        ].push({

                            name:
                                name.trim(),

                            time:
                                time ||
                                "No time",

                            completed:
                                false
                        });


                        saveSharedWeekTasks();

                        showWeekTasks();

                        updateWeekProgress();
                    }
                );
            }
        );


    showWeekTasks();

    updateWeekProgress();
}


// PROGRESS

const progressCanvas =
    document.getElementById(
        "progress-chart"
    );


if (progressCanvas) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "weekHistory"
            )
        ) || [];


    const currentTasks =
        sharedWeekTasks;


    const currentProgress =
        calculateWeekProgress(
            currentTasks
        );


    const currentWeekId =
        getWeekId(
            new Date()
        );


    const allWeeks = [
        ...history,
        {
            id:
                currentWeekId,

            tasks:
                currentTasks,

            total:
                currentProgress.total,

            completed:
                currentProgress.completed,

            percent:
                currentProgress.percent,

            current:
                true
        }
    ];


    let totalTasks = 0;
    let completedTasks = 0;


    allWeeks.forEach(
        week => {

            const progress =
                calculateWeekProgress(
                    week.tasks ||
                    createEmptyWeek()
                );


            totalTasks +=
                week.total !== undefined
                    ? week.total
                    : progress.total;


            completedTasks +=
                week.completed !== undefined
                    ? week.completed
                    : progress.completed;
        }
    );


    const average =
        allWeeks.length === 0
            ? 0
            : Math.round(
                allWeeks.reduce(
                    (sum, week) =>
                        sum + week.percent,
                    0
                ) /
                allWeeks.length
            );


    const totalWeeksElement =
        document.getElementById(
            "total-weeks"
        );

    const totalTasksElement =
        document.getElementById(
            "total-tasks"
        );

    const completedTasksElement =
        document.getElementById(
            "completed-tasks"
        );

    const averageElement =
        document.getElementById(
            "average-progress"
        );


    if (totalWeeksElement) {

        totalWeeksElement.textContent =
            allWeeks.length;
    }


    if (totalTasksElement) {

        totalTasksElement.textContent =
            totalTasks;
    }


    if (completedTasksElement) {

        completedTasksElement.textContent =
            completedTasks;
    }


    if (averageElement) {

        averageElement.textContent =
            `${average}%`;
    }


    let bestWeek = null;


    allWeeks.forEach(
        (week, index) => {

            if (
                !bestWeek ||
                week.percent >
                bestWeek.percent
            ) {

                bestWeek = {
                    ...week,
                    number:
                        index + 1
                };
            }
        }
    );


    if (bestWeek) {

        const bestWeekElement =
            document.getElementById(
                "best-week"
            );

        const bestScoreElement =
            document.getElementById(
                "best-score"
            );


        if (bestWeekElement) {

            bestWeekElement.textContent =
                bestWeek.current
                    ? "CURRENT WEEK"
                    : `WEEK ${bestWeek.number}`;
        }


        if (bestScoreElement) {

            bestScoreElement.textContent =
                `${bestWeek.percent}%`;
        }
    }


    const emptyMessage =
        document.getElementById(
            "chart-empty"
        );


    if (emptyMessage) {

        emptyMessage.style.display =
            allWeeks.length > 0
                ? "none"
                : "block";
    }


    window.drawProgressChart =
        function () {

            const ctx =
                progressCanvas.getContext(
                    "2d"
                );


            const width =
                progressCanvas.parentElement
                    .clientWidth - 50;

            const height =
                300;


            if (width <= 0) {
                return;
            }


            progressCanvas.width =
                width;

            progressCanvas.height =
                height;


            const padding =
                40;


            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            const lightMode =
                document.body.classList.contains(
                    "light-mode"
                );


            ctx.strokeStyle =
                lightMode
                    ? "#ddd"
                    : "#333";

            ctx.lineWidth =
                1;


            for (
                let i = 0;
                i <= 4;
                i++
            ) {

                const y =
                    padding +
                    (
                        (
                            height -
                            padding * 2
                        ) / 4
                    ) * i;


                ctx.beginPath();

                ctx.moveTo(
                    padding,
                    y
                );

                ctx.lineTo(
                    width - padding,
                    y
                );

                ctx.stroke();


                ctx.fillStyle =
                    "#777";

                ctx.font =
                    "12px Inter";


                const value =
                    100 - i * 25;


                ctx.fillText(
                    `${value}%`,
                    5,
                    y + 4
                );
            }


            ctx.strokeStyle =
                "#e10600";

            ctx.lineWidth =
                3;

            ctx.beginPath();


            allWeeks.forEach(
                (week, index) => {

                    const x =
                        padding +
                        index *
                        (
                            (
                                width -
                                padding * 2
                            ) /
                            Math.max(
                                allWeeks.length - 1,
                                1
                            )
                        );


                    const y =
                        height -
                        padding -
                        (
                            week.percent /
                            100
                        ) *
                        (
                            height -
                            padding * 2
                        );


                    if (index === 0) {

                        ctx.moveTo(
                            x,
                            y
                        );

                    } else {

                        ctx.lineTo(
                            x,
                            y
                        );
                    }
                }
            );


            ctx.stroke();


            allWeeks.forEach(
                (week, index) => {

                    const x =
                        padding +
                        index *
                        (
                            (
                                width -
                                padding * 2
                            ) /
                            Math.max(
                                allWeeks.length - 1,
                                1
                            )
                        );


                    const y =
                        height -
                        padding -
                        (
                            week.percent /
                            100
                        ) *
                        (
                            height -
                            padding * 2
                        );


                    ctx.fillStyle =
                        "#e10600";


                    ctx.beginPath();

                    ctx.arc(
                        x,
                        y,
                        5,
                        0,
                        Math.PI * 2
                    );

                    ctx.fill();


                    ctx.fillStyle =
                        "#777";

                    ctx.font =
                        "12px Inter";


                    ctx.fillText(
                        `W${index + 1}`,
                        x - 8,
                        height - 12
                    );
                }
            );
        };


    window.drawProgressChart();
}


// Week history

const historyList =
    document.getElementById(
        "week-history-list"
    );


if (historyList) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "weekHistory"
            )
        ) || [];


    historyList.innerHTML =
        "";


    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="history-card">

                <p class="chart-empty">
                    NO COMPLETED WEEKS YET
                </p>

            </div>
        `;

    } else {

        [...history]
            .reverse()
            .forEach(
                (week, index) => {

                    const dates =
                        week.start &&
                        week.end
                            ? {
                                start:
                                    new Date(
                                        week.start
                                    ),

                                end:
                                    new Date(
                                        week.end
                                    )
                            }
                            : getWeekDates(
                                week.id
                            );


                    const calculated =
                        calculateWeekProgress(
                            week.tasks ||
                            createEmptyWeek()
                        );


                    const progress =
                        week.percent !==
                        undefined
                            ? week.percent
                            : calculated.percent;


                    const total =
                        week.total !==
                        undefined
                            ? week.total
                            : calculated.total;


                    const completed =
                        week.completed !==
                        undefined
                            ? week.completed
                            : calculated.completed;


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "history-card";


                    card.innerHTML = `
                        <div class="history-header">

                            <span class="history-date">
                                ${formatDate(dates.start)}
                                —
                                ${formatDate(dates.end)}
                            </span>

                            <span class="history-percent">
                                ${progress}%
                            </span>

                        </div>

                        <div class="history-info">

                            <span>
                                ${completed} / ${total} completed
                            </span>

                            <span>
                                WEEK ${history.length - index}
                            </span>

                        </div>

                        <div class="history-bar">

                            <div
                                class="history-fill"
                                style="width: ${progress}%"
                            ></div>

                        </div>
                    `;


                    historyList.appendChild(
                        card
                    );
                }
            );
    }
}


// Streak

const currentStreakElement =
    document.getElementById(
        "current-streak"
    );

const bestStreakElement =
    document.getElementById(
        "best-streak"
    );


if (
    currentStreakElement &&
    bestStreakElement
) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "weekHistory"
            )
        ) || [];


    const currentTasks =
        sharedWeekTasks;


    const weeks = [
        ...history,
        {
            tasks:
                currentTasks,

            current:
                true
        }
    ];


    let currentStreak =
        0;

    let bestStreak =
        0;

    let streak =
        0;


    weeks.forEach(
        week => {

            const progress =
                calculateWeekProgress(
                    week.tasks ||
                    createEmptyWeek()
                );


            if (
                progress.percent >= 70
            ) {

                streak++;


                if (
                    streak >
                    bestStreak
                ) {

                    bestStreak =
                        streak;
                }

            } else {

                streak =
                    0;
            }
        }
    );


    for (
        let i = weeks.length - 1;
        i >= 0;
        i--
    ) {

        const progress =
            calculateWeekProgress(
                weeks[i].tasks ||
                createEmptyWeek()
            );


        if (
            progress.percent >= 70
        ) {

            currentStreak++;

        } else {

            break;
        }
    }


    currentStreakElement.textContent =
        currentStreak;

    bestStreakElement.textContent =
        bestStreak;
}


// Activity calendar

const activityCalendar =
    document.getElementById(
        "activity-calendar"
    );


if (activityCalendar) {

    const activity =
        getDailyActivity();


    const today =
        new Date();


    const year =
        today.getFullYear();

    const month =
        today.getMonth();


    const monthElement =
        document.getElementById(
            "activity-month"
        );


    if (monthElement) {

        monthElement.textContent =
            today.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            ).toUpperCase();
    }


    activityCalendar.innerHTML =
        "";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const mondayOffset =
        firstDay === 0
            ? 6
            : firstDay - 1;


    for (
        let i = 0;
        i < mondayOffset;
        i++
    ) {

        const emptyCell =
            document.createElement(
                "div"
            );


        emptyCell.className =
            "activity-day";


        emptyCell.style.visibility =
            "hidden";


        activityCalendar.appendChild(
            emptyCell
        );
    }


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateKey =
            getDateKey(date);


        const count =
            activity[dateKey] || 0;


        const cell =
            document.createElement(
                "div"
            );


        cell.className =
            "activity-day";


        if (count >= 1) {

            cell.classList.add(
                "level-1"
            );
        }

        if (count >= 2) {

            cell.classList.add(
                "level-2"
            );
        }

        if (count >= 3) {

            cell.classList.add(
                "level-3"
            );
        }

        if (count >= 5) {

            cell.classList.add(
                "level-4"
            );
        }


        cell.title =
            `${dateKey}: ${count} completed`;


        activityCalendar.appendChild(
            cell
        );
    }
}


// Weekly goals

const goalsList =
    document.getElementById(
        "goals-list"
    );

const addGoalButton =
    document.getElementById(
        "add-goal"
    );


if (
    goalsList &&
    addGoalButton
) {

    const currentWeekId =
        getWeekId(
            new Date()
        );


    let savedGoals =
        JSON.parse(
            localStorage.getItem(
                "weeklyGoals"
            )
        ) || [];


    const savedGoalsWeek =
        localStorage.getItem(
            "weeklyGoalsWeek"
        );


    if (
        savedGoalsWeek !==
        currentWeekId
    ) {

        savedGoals =
            [];

        localStorage.setItem(
            "weeklyGoals",
            JSON.stringify(
                savedGoals
            )
        );

        localStorage.setItem(
            "weeklyGoalsWeek",
            currentWeekId
        );
    }


    function saveGoals() {

        localStorage.setItem(
            "weeklyGoals",
            JSON.stringify(
                savedGoals
            )
        );
    }


    function updateGoalsProgress() {

        const total =
            savedGoals.length;

        const completed =
            savedGoals.filter(
                goal =>
                    goal.completed
            ).length;


        const percent =
            total === 0
                ? 0
                : Math.round(
                    (
                        completed /
                        total
                    ) * 100
                );


        const progress =
            document.getElementById(
                "goals-progress"
            );

        const fill =
            document.getElementById(
                "goals-progress-fill"
            );


        if (progress) {

            progress.textContent =
                `${percent}%`;
        }


        if (fill) {

            fill.style.width =
                `${percent}%`;
        }
    }


    function showGoals() {

        goalsList.innerHTML =
            "";


        savedGoals.forEach(
            (goal, index) => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "goal-card";


                if (goal.completed) {

                    card.classList.add(
                        "completed"
                    );
                }


                card.innerHTML = `
                    <div class="goal-left">

                        <button class="goal-check">
                            ${goal.completed ? "✓" : ""}
                        </button>

                        <span class="goal-name">
                            ${goal.name}
                        </span>

                    </div>

                    <button class="goal-delete">
                        ×
                    </button>
                `;


                card.querySelector(
                    ".goal-check"
                ).addEventListener(
                    "click",
                    () => {

                        savedGoals[index]
                            .completed =
                            !savedGoals[index]
                                .completed;

                        saveGoals();

                        showGoals();

                        updateGoalsProgress();
                    }
                );


                card.querySelector(
                    ".goal-delete"
                ).addEventListener(
                    "click",
                    () => {

                        savedGoals.splice(
                            index,
                            1
                        );

                        saveGoals();

                        showGoals();

                        updateGoalsProgress();
                    }
                );


                goalsList.appendChild(
                    card
                );
            }
        );
    }


    addGoalButton.addEventListener(
        "click",
        () => {

            const name =
                prompt(
                    "Enter your weekly goal:"
                );


            if (
                !name ||
                !name.trim()
            ) {
                return;
            }


            savedGoals.push({

                name:
                    name.trim(),

                completed:
                    false
            });


            saveGoals();

            showGoals();

            updateGoalsProgress();
        }
    );


    showGoals();

    updateGoalsProgress();
}


// Achievements

const achievementsList =
    document.getElementById(
        "achievements-list"
    );


if (achievementsList) {

    const history =
        JSON.parse(
            localStorage.getItem(
                "weekHistory"
            )
        ) || [];


    const currentTasks =
        sharedWeekTasks;


    const activity =
        getDailyActivity();


    const allWeeks = [
        ...history,
        {
            tasks:
                currentTasks
        }
    ];


    let totalTasks =
        0;

    let completedTasks =
        0;


    allWeeks.forEach(
        week => {

            const progress =
                calculateWeekProgress(
                    week.tasks ||
                    createEmptyWeek()
                );


            totalTasks +=
                progress.total;

            completedTasks +=
                progress.completed;
        }
    );


    const activeDays =
        Object.keys(
            activity
        ).filter(
            date =>
                activity[date] > 0
        ).length;


    let bestWeekScore =
        0;


    allWeeks.forEach(
        week => {

            const progress =
                calculateWeekProgress(
                    week.tasks ||
                    createEmptyWeek()
                );


            if (
                progress.percent >
                bestWeekScore
            ) {

                bestWeekScore =
                    progress.percent;
            }
        }
    );


    const achievements = [

        {
            icon: "🥇",

            title:
                "FIRST STEP",

            description:
                "Complete your first task.",

            current:
                Math.min(
                    completedTasks,
                    1
                ),

            target:
                1,

            unlocked:
                completedTasks >= 1
        },

        {
            icon: "🔥",

            title:
                "7 DAYS",

            description:
                "Be active on 7 different days.",

            current:
                Math.min(
                    activeDays,
                    7
                ),

            target:
                7,

            unlocked:
                activeDays >= 7
        },

        {
            icon: "🎯",

            title:
                "90% WEEK",

            description:
                "Reach 90% progress in a week.",

            current:
                Math.min(
                    bestWeekScore,
                    90
                ),

            target:
                90,

            unlocked:
                bestWeekScore >= 90
        },

        {
            icon: "📅",

            title:
                "4 WEEKS",

            description:
                "Track four weeks.",

            current:
                Math.min(
                    allWeeks.length,
                    4
                ),

            target:
                4,

            unlocked:
                allWeeks.length >= 4
        },

        {
            icon: "👑",

            title:
                "10 WEEKS",

            description:
                "Track ten weeks.",

            current:
                Math.min(
                    allWeeks.length,
                    10
                ),

            target:
                10,

            unlocked:
                allWeeks.length >= 10
        },

        {
            icon: "💪",

            title:
                "100 TASKS",

            description:
                "Complete 100 tasks.",

            current:
                Math.min(
                    completedTasks,
                    100
                ),

            target:
                100,

            unlocked:
                completedTasks >= 100
        }

    ];


    achievementsList.innerHTML =
        "";


    achievements.forEach(
        achievement => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                achievement.unlocked
                    ? "achievement-card unlocked"
                    : "achievement-card locked";


            const progress =
                Math.round(
                    (
                        achievement.current /
                        achievement.target
                    ) * 100
                );


            card.innerHTML = `

                <div class="achievement-icon">
                    ${achievement.icon}
                </div>

                <h3>
                    ${achievement.title}
                </h3>

                <p>
                    ${achievement.description}
                </p>

                ${
                    achievement.unlocked
                        ? `
                            <span class="achievement-status">
                                UNLOCKED ✓
                            </span>
                        `
                        : `
                            <div class="achievement-progress">

                                <div class="achievement-progress-text">
                                    <span>
                                        ${achievement.current} / ${achievement.target}
                                    </span>

                                    <span>
                                        ${progress}%
                                    </span>
                                </div>

                                <div class="achievement-progress-bar">

                                    <div
                                        class="achievement-progress-fill"
                                        style="width: ${progress}%"
                                    ></div>

                                </div>

                            </div>
                        `
                }

            `;


            achievementsList.appendChild(
                card
            );
        }
    );
}


// Daily notes

const noteInput =
    document.getElementById(
        "daily-note"
    );

const saveNoteButton =
    document.getElementById(
        "save-note"
    );

const noteStatus =
    document.getElementById(
        "note-status"
    );


if (
    noteInput &&
    saveNoteButton
) {

    const today =
        getDateKey(
            new Date()
        );


    const notes =
        JSON.parse(
            localStorage.getItem(
                "dailyNotes"
            )
        ) || {};


    if (notes[today]) {

        noteInput.value =
            notes[today];

        if (noteStatus) {

            noteStatus.textContent =
                "SAVED";
        }
    }


    saveNoteButton.addEventListener(
        "click",
        () => {

            notes[today] =
                noteInput.value.trim();


            localStorage.setItem(
                "dailyNotes",
                JSON.stringify(
                    notes
                )
            );


            if (noteStatus) {

                noteStatus.textContent =
                    "SAVED";
            }
        }
    );


    noteInput.addEventListener(
        "input",
        () => {

            if (noteStatus) {

                noteStatus.textContent =
                    "NOT SAVED";
            }
        }
    );
}


// Calendar

const calendarDays =
    document.getElementById(
        "calendar-days"
    );

const calendarMonth =
    document.getElementById(
        "calendar-month"
    );

const previousMonth =
    document.getElementById(
        "prev-month"
    );

const nextMonth =
    document.getElementById(
        "next-month"
    );

const calendarInfo =
    document.getElementById(
        "calendar-info"
    );


if (calendarDays) {

    const activity =
        getDailyActivity();


    let calendarDate =
        new Date();


    function drawCalendar() {

        calendarDays.innerHTML =
            "";


        const year =
            calendarDate.getFullYear();

        const month =
            calendarDate.getMonth();


        calendarMonth.textContent =
            calendarDate.toLocaleDateString(
                "en-US",
                {
                    month: "long",
                    year: "numeric"
                }
            ).toUpperCase();


        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();


        const mondayOffset =
            firstDay === 0
                ? 6
                : firstDay - 1;


        for (
            let i = 0;
            i < mondayOffset;
            i++
        ) {

            const empty =
                document.createElement(
                    "div"
                );


            empty.className =
                "calendar-day empty";


            calendarDays.appendChild(
                empty
            );
        }


        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();


        const todayKey =
            getDateKey(
                new Date()
            );


        for (
            let day = 1;
            day <= daysInMonth;
            day++
        ) {

            const date =
                new Date(
                    year,
                    month,
                    day
                );


            const key =
                getDateKey(date);


            const count =
                activity[key] || 0;


            const dayElement =
                document.createElement(
                    "div"
                );


            dayElement.className =
                "calendar-day";


            dayElement.textContent =
                day;


            if (key === todayKey) {

                dayElement.classList.add(
                    "today"
                );
            }


            if (count > 0) {

                dayElement.classList.add(
                    "active"
                );
            }


            if (count >= 3) {

                dayElement.classList.add(
                    "high-activity"
                );
            }


            dayElement.addEventListener(
                "click",
                () => {

                    const formattedDate =
                        date.toLocaleDateString(
                            "en-US",
                            {
                                weekday: "long",
                                month: "long",
                                day: "numeric"
                            }
                        );


                    calendarInfo.textContent =
                        count > 0
                            ? `${formattedDate.toUpperCase()} — ${count} TASKS COMPLETED`
                            : `${formattedDate.toUpperCase()} — NO ACTIVITY`;
                }
            );


            calendarDays.appendChild(
                dayElement
            );
        }
    }


    previousMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() - 1
            );

            drawCalendar();
        }
    );


    nextMonth.addEventListener(
        "click",
        () => {

            calendarDate.setMonth(
                calendarDate.getMonth() + 1
            );

            drawCalendar();
        }
    );


    drawCalendar();
}