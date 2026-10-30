const STORAGE_KEY = "name_enhancer_v1";

let characters = JSON.parse(
    localStorage.getItem(STORAGE_KEY) || "[]"
);

function saveGame() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(characters)
    );
}

function createCharacter() {
    if (characters.length >= 5) {
        alert("최대 5개까지 생성할 수 있습니다.");
        return;
    }

    const input = document.getElementById("nameInput");
    const name = input.value.trim();

    if (!name) {
        alert("강화할 이름을 입력하세요.");
        return;
    }

    if (name.length > 20) {
        alert("이름은 20자 이내로 입력하세요.");
        return;
    }

    characters.push({
        id: crypto.randomUUID(),
        name: name,
        level: 1,
        createdAt: Date.now()
    });

    saveGame();
    input.value = "";
    renderCharacters();
}

function renderCharacters() {
    const list = document.getElementById("characterList");
    list.innerHTML = "";

    characters.forEach(character => {
        const card = document.createElement("div");
        card.style.cssText =
            "background:#202020;padding:20px;margin:12px 0;border-radius:8px;";

        const name = document.createElement("h3");
        name.textContent = character.name;

        const level = document.createElement("p");
        level.textContent = `LV.${character.level} / ${getEnhanceInfo(character.level).grade}`;

        const maxLevel = document.createElement("p");
        maxLevel.textContent =
            "🏅 최고 기록: LV." +
            Math.max(character.maxLevel || character.level, character.level);
        maxLevel.style.cssText =
            "color:#ffd700;font-size:14px;";

        const enhanceButton = document.createElement("button");
        enhanceButton.textContent = "강화";
        enhanceButton.onclick = () => enhanceCharacter(character.id);
        enhanceButton.style.marginTop = "10px";

        const timer = document.createElement("p");
        timer.className = "enhance-timer";
        timer.dataset.id = character.id;
        timer.style.color = "#aaaaaa";
        timer.textContent = "강화 가능";

        const info = getEnhanceInfo(character.level);

        const probability = document.createElement("p");
        probability.style.cssText =
            "color:#aaaaaa;font-size:14px;line-height:1.8;";

        probability.innerHTML =
            "✨ 성공 확률: " + info.success + "%<br>" +
            "🛡️ 유지 확률: " + info.keep + "%<br>" +
            "📉 실패 확률: " + info.fail + "%<br>" +
            "💥 실패 시 파괴 확률: " + info.destroy + "%";

        const historyButton = document.createElement("button");
        historyButton.textContent = "기록";
        historyButton.style.marginLeft = "10px";
        historyButton.onclick = () => showEnhanceHistory(character.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "삭제";
        deleteButton.style.marginLeft = "10px";
        deleteButton.onclick = () => deleteCharacter(character.id);

        

        const resultMessage = document.createElement("div");
        resultMessage.className = "last-enhance-result";
        resultMessage.textContent = character.lastResult || "";

        resultMessage.style.cssText =
            "margin:14px auto;padding:10px;" +
            "white-space:pre-line;line-height:1.6;" +
            "font-size:16px;font-weight:bold;";

        if (resultMessage.textContent.includes("✨")) {
            resultMessage.style.color = "#66dd88";
        } else if (resultMessage.textContent.includes("💥")) {
            resultMessage.style.color = "#ff6666";
        } else {
            resultMessage.style.color = "#cccccc";
        }

        if (!resultMessage.textContent) {
            resultMessage.style.display = "none";
        }

        card.append(
            name, level, maxLevel, probability,
            enhanceButton, historyButton, deleteButton,
            resultMessage, timer
        );
        list.appendChild(card);
    });

    document.getElementById("slotCount").textContent =
        `${characters.length} / 5`;
}

document.addEventListener("DOMContentLoaded", renderCharacters);

// 레벨별 강화 확률 및 등급
function getEnhanceInfo(level) {
    if (level >= 200) return { grade: "챌린저", success: 15, keep: 10, fail: 75, destroy: 70 };
    if (level >= 150) return { grade: "그랜드마스터", success: 20, keep: 10, fail: 70, destroy: 55 };
    if (level >= 130) return { grade: "마스터", success: 25, keep: 10, fail: 65, destroy: 45 };
    if (level >= 100) return { grade: "다이아", success: 30, keep: 10, fail: 60, destroy: 35 };
    if (level >= 70) return { grade: "에메랄드", success: 35, keep: 10, fail: 55, destroy: 30 };
    if (level >= 50) return { grade: "골드", success: 45, keep: 10, fail: 45, destroy: 25 };
    if (level >= 30) return { grade: "실버", success: 55, keep: 10, fail: 35, destroy: 20 };
    if (level >= 10) return { grade: "브론즈", success: 65, keep: 10, fail: 25, destroy: 15 };
    return { grade: "아이언", success: 75, keep: 10, fail: 15, destroy: 10 };
}

function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rollLevelIncrease() {
    const roll = Math.random() * 100;

    if (roll < 70) return randomInRange(1, 11);
    if (roll < 90) return randomInRange(12, 15);
    if (roll < 97) return randomInRange(16, 19);
    return randomInRange(20, 21);
}

function rollLevelDecrease() {
    const roll = Math.random() * 100;

    if (roll < 60) return randomInRange(1, 3);
    if (roll < 85) return randomInRange(4, 6);
    if (roll < 97) return randomInRange(7, 10);
    return randomInRange(11, 15);
}

function calculateEnhancement(level) {
    const info = getEnhanceInfo(level);
    const roll = Math.random() * 100;

    if (roll < info.success) {
        return {
            result: "success",
            increase: rollLevelIncrease()
        };
    }

    if (roll < info.success + info.keep) {
        return {
            result: "keep",
            increase: 0
        };
    }

    if (Math.random() * 100 < info.destroy) {
        return {
            result: "destroy",
            increase: 0
        };
    }

    return {
        result: "fail",
        increase: -rollLevelDecrease()
    };
}

function enhanceCharacter(id) {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    const remaining = getRemainingSeconds(character);
    if (remaining > 0) {
        alert(remaining + "초 이후 강화가 가능합니다.");
        return;
    }

    character.nextEnhanceAt = Date.now() + ENHANCE_COOLDOWN;

    const beforeLevel = character.level;
    character.maxLevel = Math.max(
        character.maxLevel || beforeLevel,
        beforeLevel
    );

    const result = calculateEnhancement(beforeLevel);

    if (result.result === "success") {
        character.level += result.increase;
        character.maxLevel = Math.max(
            character.maxLevel,
            character.level
        );
    } else if (result.result === "fail") {
        character.level = Math.max(
            1,
            character.level + result.increase
        );
    }

    addEnhanceHistory(character, result.result, beforeLevel);

    if (result.result === "destroy") {
        saveDestroyedCharacter(character);
        characters = characters.filter(c => c.id !== id);
        saveGame();
        renderCharacters();

        alert(
            "💥 강화 파괴!\n" +
            character.name + " | 최종 LV." + beforeLevel
        );
        return;
    }

    saveGame();
    renderCharacters();

    let message = "";

    if (result.result === "success") {
        message =
            "✨ 강화 성공!\n" +
            character.name + " | LV." + beforeLevel +
            " → LV." + character.level +
            " (+" + result.increase + ")";
    } else if (result.result === "keep") {
        message =
            "🛡️ 강화 유지!\n" +
            character.name + " | LV." + character.level + " 유지";
    } else if (result.result === "fail") {
        message =
            "📉 강화 실패!\n" +
            character.name + " | LV." + beforeLevel +
            " → LV." + character.level +
            " (-" + (beforeLevel - character.level) + ")";
    }

    showEnhanceResult(id, message);
}

// 강화 대기시간 (30초)
const ENHANCE_COOLDOWN = 30000;

// 남은 강화 대기시간 계산
function getRemainingSeconds(character) {
    const nextTime = character.nextEnhanceAt || 0;
    const remaining = nextTime - Date.now();

    return Math.max(0, Math.ceil(remaining / 1000));
}

// 실시간 강화 카운트다운
function updateEnhanceTimers() {
    document.querySelectorAll(".enhance-timer").forEach(timer => {
        const character = characters.find(
            c => c.id === timer.dataset.id
        );

        if (!character) return;

        const remaining = getRemainingSeconds(character);

        if (remaining > 0) {
            timer.textContent = "남은 시간: 00:" +
                String(remaining).padStart(2, "0");
        } else {
            timer.textContent = "강화 가능";
        }
    });
}

// 0.25초마다 남은 시간 확인
setInterval(updateEnhanceTimers, 250);

// 화면이 열리거나 다시 활성화될 때 갱신
document.addEventListener("DOMContentLoaded", updateEnhanceTimers);
document.addEventListener("visibilitychange", updateEnhanceTimers);

// 강화 기록 저장
function addEnhanceHistory(character, result, beforeLevel) {
    if (!character.history) {
        character.history = [];
    }

    character.history.unshift({
        result: result,
        before: beforeLevel,
        after: character.level,
        increase: character.level - beforeLevel,
        time: Date.now()
    });

    // 최근 10회만 보관
    character.history = character.history.slice(0, 10);

    saveGame();
}

// 강화 기록 확인
function showEnhanceHistory(id) {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    const history = character.history || [];

    if (history.length === 0) {
        alert("아직 강화 기록이 없습니다.");
        return;
    }

    const lines = history.map(h => {
        if (h.result === "success") {
            return "✨ 성공 LV." + h.before +
                   " → LV." + h.after +
                   " (+" + h.increase + ")";
        }

        if (h.result === "keep") {
            return "🛡️ 유지 LV." + h.before;
        }

        if (h.result === "fail") {
            if (h.after < h.before) {
                return "📉 실패 LV." + h.before +
                       " → LV." + h.after +
                       " (-" + (h.before - h.after) + ")";
            }

            return "💨 실패 LV." + h.before + " 유지";
        }

        if (h.result === "destroy") {
            return "💥 파괴 LV." + h.before;
        }

        return "알 수 없는 강화 기록";
    });

    alert(
        character.name + " 강화 기록\n\n" +
        lines.join("\n")
    );
}

// 명예의 전당 저장소
const HALL_OF_FAME_KEY = "name_enhancer_hall_v1";

// 명예의 전당 불러오기
function getHallOfFame() {
    return JSON.parse(
        localStorage.getItem(HALL_OF_FAME_KEY) || "[]"
    );
}

// 파괴된 이름 보관
function saveDestroyedCharacter(character) {
    const hall = getHallOfFame();

    hall.unshift({
        id: character.id,
        name: character.name,
        level: character.level,
        maxLevel: Math.max(
            character.maxLevel || character.level,
            character.level,
            ...(character.history || []).map(h => h.after || 0)
        ),
        grade: getEnhanceInfo(character.level).grade,
        history: character.history || [],
        destroyedAt: Date.now()
    });

    localStorage.setItem(
        HALL_OF_FAME_KEY,
        JSON.stringify(hall)
    );
}

// 명예의 전당 버튼 연결
function connectHallButton() {
    const button = document.getElementById("hallButton");
    if (!button) return;

    button.onclick = showHallHistory;
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connectHallButton);
} else {
    connectHallButton();
}

function getHallMaxLevel(character) {
    const history = character.history || [];

    return Math.max(
        character.maxLevel || 0,
        character.level || 1,
        ...history.flatMap(h => [h.before || 0, h.after || 0])
    );
}

function showHallHistory() {
    const hall = getHallOfFame()
        .sort((a, b) => getHallMaxLevel(b) - getHallMaxLevel(a));

    if (hall.length === 0) {
        alert("명예의 전당에 기록이 없습니다.");
        return;
    }

    const list = hall.map((c, i) =>
        (i + 1) + ". " + c.name +
        " / 최고 LV." + getHallMaxLevel(c) +
        " / 파괴 LV." + c.level
    ).join("\n");

    const input = prompt(
        "🏆 강화 기록을 확인할 순위를 입력하세요.\n\n" + list
    );

    if (input === null) return;

    const rank = Number(input);

    if (!Number.isInteger(rank) || rank < 1 || rank > hall.length) {
        alert("올바른 순위를 입력해 주세요.");
        return;
    }

    const character = hall[rank - 1];
    const maxLevel = getHallMaxLevel(character);
    const maxGrade = getEnhanceInfo(maxLevel).grade;
    const history = character.history || [];

    const lines = history.map(h => {
        if (h.result === "success") {
            return "✨ LV." + h.before +
                   " → LV." + h.after +
                   " (+" + (h.after - h.before) + ")";
        }

        if (h.result === "keep") {
            return "🛡️ LV." + h.before + " 유지";
        }

        if (h.result === "fail") {
            if (h.after < h.before) {
                return "📉 LV." + h.before +
                       " → LV." + h.after +
                       " (-" + (h.before - h.after) + ")";
            }

            return "💨 LV." + h.before + " 실패";
        }

        if (h.result === "destroy") {
            return "💥 LV." + h.before + " 파괴";
        }

        return "알 수 없는 기록";
    });

    alert(
        "🏆 " + character.name +
        "\n🏅 최고 LV." + maxLevel + " / " + maxGrade +
        "\n💥 파괴 LV." + character.level +
        "\n\n📜 강화 기록\n" +
        (lines.join("\n") || "강화 기록 없음")
    );
}

// 강화 대상 직접 삭제
function deleteCharacter(id) {
    const character = characters.find(c => c.id === id);

    if (!character) return;

    const confirmed = confirm(
        "'" + character.name + "'을(를) 삭제하시겠습니까?\n\n" +
        "현재 레벨: LV." + character.level + "\n" +
        "삭제하면 복구할 수 없습니다."
    );

    if (!confirmed) return;

    characters = characters.filter(c => c.id !== id);

    saveGame();
    renderCharacters();

    alert("🗑️ 이름이 삭제되었습니다.");
}

// 게임 데이터 JSON 백업
function exportGameData() {
    const backup = {
        version: 1,
        exportedAt: new Date().toISOString(),
        characters: characters,
        hallOfFame: getHallOfFame()
    };

    const json = JSON.stringify(backup, null, 2);

    const blob = new Blob(
        [json],
        { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "name_enhancer_backup.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// JSON 백업 파일 복원
async function importGameData(file) {
    if (!file) return;

    try {
        const text = await file.text();
        const backup = JSON.parse(text);

        // 백업 파일 기본 검증
        if (
            backup.version !== 1 ||
            !Array.isArray(backup.characters) ||
            !Array.isArray(backup.hallOfFame) ||
            backup.characters.length > 5 ||
            !backup.characters.every(c =>
                c && typeof c.id === "string" &&
                typeof c.name === "string" &&
                Number.isSafeInteger(c.level) &&
                c.level >= 1
            ) ||
            !backup.hallOfFame.every(c =>
                c && typeof c.name === "string" &&
                Number.isSafeInteger(c.level) &&
                c.level >= 1
            )
        ) {
            alert("올바른 게임 백업 파일이 아닙니다.");
            return;
        }

        const confirmed = confirm(
            "현재 게임 데이터를 백업 파일로 교체하시겠습니까?\n\n" +
            "기존 데이터는 덮어쓰기 됩니다."
        );

        if (!confirmed) return;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(backup.characters)
        );

        localStorage.setItem(
            HALL_OF_FAME_KEY,
            JSON.stringify(backup.hallOfFame)
        );

        characters = backup.characters;

        renderCharacters();

        alert("✅ 게임 데이터 복원 완료!");

    } catch (error) {
        alert("❌ 백업 파일을 읽을 수 없습니다.");
        console.error(error);
    }
}

// 게임 데이터 전체 초기화
function resetGameData() {
    const first = confirm(
        "⚠️ 게임 데이터를 모두 초기화하시겠습니까?\n\n" +
        "이름, 레벨, 강화 기록, 명예의 전당이 삭제됩니다."
    );

    if (!first) return;

    const second = confirm(
        "정말 초기화하시겠습니까?\n\n" +
        "삭제된 데이터는 백업 파일 없이는 복구할 수 없습니다."
    );

    if (!second) return;

    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HALL_OF_FAME_KEY);

    characters = [];

    renderCharacters();

    alert("✅ 게임 데이터 초기화 완료!");
}


function showEnhanceResult(id, message) {
    const character = characters.find(c => c.id === id);

    if (character) {
        character.lastResult = message;
        saveGame();
    }

    alert(message);
    renderCharacters();
}



