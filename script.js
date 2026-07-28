// 네일 디자인 샘플 풀
const sampleDesigns = [
    { name: "민트 도트", bg: "#A8E6CF", color: "#222" },
    { name: "시럽 누드", bg: "#FFD3B6", color: "#222" },
    { name: "글리터 실버", bg: "#E0E0E0", color: "#000" },
    { name: "퍼플 프렌치", bg: "#D5AAFF", color: "#fff" },
    { name: "레드 체리", bg: "#FF8B94", color: "#fff" }
];

const tabToggleBtn = document.getElementById('tabToggleBtn');
const mainView = document.getElementById('mainView');
const archiveView = document.getElementById('archiveView');
const rollBtn = document.getElementById('rollBtn');
const saveArchiveBtn = document.getElementById('saveArchiveBtn');
const nailSlots = document.querySelectorAll('.nail-slot');
const archiveGrid = document.getElementById('archiveGrid');
const photoUpload = document.getElementById('photoUpload');

let currentActiveDesigns = [];
let archiveList = [
    { date: "2026.07.07", title: "시럽 누드 조합" },
    { date: "2026.06.16", title: "퍼플 프렌치 조합" }
];

// 탭 전환 (추천 ↔ 아카이브)
let isArchiveView = false;
tabToggleBtn.addEventListener('click', () => {
    isArchiveView = !isArchiveView;
    if (isArchiveView) {
        mainView.style.display = 'none';
        archiveView.style.display = 'flex';
        tabToggleBtn.textContent = '메인으로 돌아가기';
        renderArchive();
    } else {
        mainView.style.display = 'flex';
        archiveView.style.display = 'none';
        tabToggleBtn.textContent = '아카이브 보기';
    }
});

// 슬롯머신 롤링 시작
rollBtn.addEventListener('click', () => {
    rollBtn.disabled = true;
    rollBtn.textContent = "슬롯 돌아가는 중... 🎰";
    saveArchiveBtn.style.display = 'none';

    let count = 0;
    // 0.1초마다 디자인이 빠르게 바뀌는 효과 (총 1.5초간 롤링)
    const rollingInterval = setInterval(() => {
        nailSlots.forEach(slot => {
            const randomDesign = sampleDesigns[Math.floor(Math.random() * sampleDesigns.length)];
            slot.style.backgroundColor = randomDesign.bg;
            slot.style.color = randomDesign.color;
            slot.textContent = randomDesign.name;
        });
        count++;

        if (count > 15) {
            clearInterval(rollingInterval);
            finalizeResult();
        }
    }, 100);
});

// 최종 결과 확정 및 꼼지락(Wiggle) 효과 트리거
function finalizeResult() {
    currentActiveDesigns = [];
    nailSlots.forEach((slot, index) => {
        const finalDesign = sampleDesigns[Math.floor(Math.random() * sampleDesigns.length)];
        slot.style.backgroundColor = finalDesign.bg;
        slot.style.color = finalDesign.color;
        slot.textContent = finalDesign.name;
        currentActiveDesigns.push(finalDesign.name);

        // 손가락 꼼지락 모션 부여
        const finger = slot.parentElement;
        finger.style.transform = "translateY(-4px) rotate(2deg)";
        setTimeout(() => {
            finger.style.transform = "translateY(0px) rotate(0deg)";
        }, 300);
    });

    rollBtn.disabled = false;
    rollBtn.textContent = "다시 뽑기 🎲";
    saveArchiveBtn.style.display = 'block';
}

// 아카이브 저장
saveArchiveBtn.addEventListener('click', () => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    archiveList.unshift({
        date: today,
        title: `${currentActiveDesigns[0]} 외 조합`
    });
    alert("현재 네일 조합이 아카이브에 안전하게 저장되었습니다! 💅");
    saveArchiveBtn.style.display = 'none';
});

// 실제 손 사진 업로드 시 템플릿 변환 시뮬레이션
photoUpload.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
        archiveList.unshift({
            date: today,
            title: "업로드된 실사진 룩북"
        });
        renderArchive();
        alert("사진이 성공적으로 템플릿에 맞게 변환되어 아카이브에 추가되었습니다! ✨");
    }
});

// 아카이브 리스트 렌더링
function renderArchive() {
    archiveGrid.innerHTML = '';
    archiveList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'archive-card';
        card.innerHTML = `
            <div class="archive-date">${item.date}</div>
            <div class="archive-preview">💅 ${item.title}</div>
        `;
        archiveGrid.appendChild(card);
    });
}

