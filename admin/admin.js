/* ==========================================================
   NAILY ADMIN v3
   단일 페이지 + 게시물 수정(edit) 지원
========================================================== */


/* ==========================================================
   STATE
========================================================== */

const state = {

    mode: "create",          // "create" | "edit"
    editingDate: null,       // edit 모드일 때 수정 중인 원본 date

    originalPhotos: [],      // [{kind:"new", file} | {kind:"existing", path}]
    inspiration: null,       // {kind:"new", file} | {kind:"existing", path} | null
    graphic: null,           // {kind:"new", file} | {kind:"existing", path} | null
    thumbnail: null,         // {kind:"new", file} | {kind:"existing", path} | null

    colors: ["#F7D4E2"],

    entries: [],

    publishing: false

};


/* ==========================================================
   CONSTANTS
========================================================== */

const PASSWORD_KEY = "naily-admin-password";


/* ==========================================================
   DOM
========================================================== */

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];


/* Login */

const loginOverlay = $("#loginOverlay");
const loginForm = $("#loginForm");
const loginPassword = $("#loginPassword");
const loginError = $("#loginError");


/* Form */

const form = $("#archiveForm");


/* Header / Entry List */

const newRecordButton = $("#newRecordButton");
const entryListItems = $("#entryListItems");


/* Inputs */

const archiveDate = $("#archiveDate");
const dateHelp = $("#dateHelp");
const archiveTitle = $("#archiveTitle");
const archiveMemo = $("#archiveMemo");
const archiveShape = $("#archiveShape");
const archiveFinish = $("#archiveFinish");


/* Upload */

const originalInput = $("#originalPhotos");
const inspirationInput = $("#inspirationImage");
const graphicInput = $("#nailGraphic");


/* Preview (upload) */

const originalPreview = $("#originalPhotoPreview");
const inspirationPreview = $("#inspirationPreview");
const graphicPreviewSection = $("#graphicPreviewSection");
const graphicPreviewLabel = $("#graphicPreviewLabel");
const graphicPreviewImage = $("#graphicPreviewImage");
const thumbnailPreview = $("#thumbnailPreview");


/* Thumbnail crop */

const pickThumbnailAreaButton = $("#pickThumbnailArea");
const thumbnailCropDialog = $("#thumbnailCropDialog");
const cropStage = $("#cropStage");
const cropImage = $("#cropImage");
const cropBox = $("#cropBox");
const cropSizeInput = $("#cropSize");
const cancelCropButton = $("#cancelCrop");
const confirmCropButton = $("#confirmCrop");


/* Publish */

const publishButton = $("#publishArchive");


/* Progress */

const publishProgress = $("#publishProgress");
const progressBar = $("#publishProgressBar");
const progressValue = $("#publishProgressValue");
const progressLabel = $("#publishProgressLabel");


/* Status */

const statusMessage = $("#statusMessage");
const statusText = $("#statusMessageText");


/* Colors */

const colorList = $("#colorList");
const addColorButton = $("#addColor");


/* Toast */

const toast = $("#toast");
const toastText = $("#toastText");
let toastTimer = null;


/* ==========================================================
   LOGIN
========================================================== */

function getPassword() {
    return sessionStorage.getItem(PASSWORD_KEY);
}

function savePassword(password) {
    sessionStorage.setItem(PASSWORD_KEY, password);
}

function clearPassword() {
    sessionStorage.removeItem(PASSWORD_KEY);
}

function showLogin(message = "") {
    loginOverlay.hidden = false;
    loginError.textContent = message;
    loginPassword.focus();
}

function hideLogin() {
    loginOverlay.hidden = true;
}

loginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const password = loginPassword.value.trim();

    if (!password) {
        loginError.textContent = "비밀번호를 입력하세요.";
        return;
    }

    savePassword(password);
    loginPassword.value = "";
    loginError.textContent = "";
    hideLogin();
});


/* ==========================================================
   STATUS
========================================================== */

function showStatus(message, error = false) {
    statusMessage.hidden = false;
    statusText.textContent = message;
    statusMessage.style.borderColor = error ? "#d83d3d" : "";
}

function hideStatus() {
    statusMessage.hidden = true;
}


/* ==========================================================
   MEMO
========================================================== */

archiveMemo.addEventListener("input", () => {
    $("#memoCount").textContent = `${archiveMemo.value.length} / 3000`;
});


/* ==========================================================
   FILE UTILITIES
========================================================== */

function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
        if (!file) {
            resolve(null);
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            resolve({
                name: file.name,
                type: file.type,
                size: file.size,
                data: reader.result
            });
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


/* ==========================================================
   IMAGE COMPRESSION
   Vercel Serverless Functions reject request bodies over
   ~4.5MB. Base64 inflates file size by ~33%, and raw phone
   photos (2-8MB each) blow past that instantly once you have
   a graphic + inspiration + several original photos in one
   JSON payload. Downscale + re-encode as JPEG client-side
   before it ever becomes base64, so a publish never gets
   silently rejected by the platform before it reaches
   api/publish.js.
========================================================== */

function loadImageElement(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const image = new Image();

        image.onload = () => {
            URL.revokeObjectURL(url);
            resolve(image);
        };

        image.onerror = (error) => {
            URL.revokeObjectURL(url);
            reject(error);
        };

        image.src = url;
    });
}

function renameToJpg(name) {
    const base = String(name || "image").replace(/\.[a-zA-Z0-9]+$/, "");
    return `${base || "image"}.jpg`;
}

async function compressImageFile(file, maxDimension = 1600, quality = 0.82) {
    if (!file) {
        return null;
    }

    let image;

    try {
        image = await loadImageElement(file);
    } catch (error) {
        return fileToDataURL(file);
    }

    let width = image.naturalWidth || image.width;
    let height = image.naturalHeight || image.height;

    if (!width || !height) {
        return fileToDataURL(file);
    }

    if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, width, height);

    const dataURL = canvas.toDataURL("image/jpeg", quality);

    return {
        name: renameToJpg(file.name),
        type: "image/jpeg",
        size: file.size,
        data: dataURL
    };
}

/*
 * 수정(edit) 모드에서 기존 이미지를 다시 안 올리면 이 슬롯은
 * {kind:"existing", path} 형태로 남아있다 — 서버로는 새로 업로드하지
 * 않고 기존 경로를 그대로 재사용하라는 뜻으로 전송한다.
 *
 * 썸네일은 "data" 슬롯일 수도 있다 — 네일 그래픽에서 직접 크롭해
 * 캔버스로 이미 인코딩까지 끝낸 dataURL이므로, 다시 압축하지 않고
 * 그대로 전송한다.
 */
async function serializeSlot(slot, maxDimension, quality) {
    if (!slot) {
        return null;
    }

    if (slot.kind === "existing") {
        return { existingPath: slot.path };
    }

    if (slot.kind === "data") {
        return { name: slot.name, type: slot.type, size: slot.size || 0, data: slot.data };
    }

    return compressImageFile(slot.file, maxDimension, quality);
}

/* nails.json에는 "./assets/..." 형태로 저장되어 있다 — 앞의 "./"를
   떼어 서버가 기대하는 "assets/..." 형태로 맞춘다. */
function stripLeadingPath(path) {
    return String(path || "").replace(/^\.?\/+/, "");
}

function revokeInput(input) {
    input.value = "";
}

function createImage(src, alt) {
    const image = document.createElement("img");
    image.className = "uploadPreview__image";
    image.src = src;
    image.alt = alt;
    return image;
}

function createRemoveButton(handler) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "uploadPreview__remove";
    button.innerHTML = "×";
    button.addEventListener("click", handler);
    return button;
}

function createBadge(text) {
    const badge = document.createElement("span");
    badge.className = "uploadPreview__badge";
    badge.textContent = text;
    return badge;
}


/* ==========================================================
   PREVIEW CARD (업로드 미리보기 — 신규 파일 / 기존 이미지 공용)
========================================================== */

function createPreviewCard(slot, onRemove) {
    const card = document.createElement("div");
    card.className = "uploadPreview__item";

    if (slot.kind === "existing") {
        card.appendChild(createImage(`/${slot.path}`, "기존 이미지"));
        card.appendChild(createBadge("SAVED"));
    } else if (slot.kind === "data") {
        card.appendChild(createImage(slot.data, "선택한 썸네일 영역"));
    } else {
        const reader = new FileReader();

        reader.onload = (e) => {
            card.appendChild(createImage(e.target.result, slot.file.name));
        };

        reader.readAsDataURL(slot.file);
    }

    card.appendChild(createRemoveButton(onRemove));

    return card;
}


/* ==========================================================
   ORIGINAL PHOTO
========================================================== */

function renderOriginalPhotos() {
    originalPreview.innerHTML = "";

    state.originalPhotos.forEach((slot, index) => {
        originalPreview.appendChild(
            createPreviewCard(slot, () => {
                state.originalPhotos.splice(index, 1);
                renderOriginalPhotos();
            })
        );
    });

    $("#originalPhotoCount").textContent = `${state.originalPhotos.length} / 8`;
}


/* ==========================================================
   INSPIRATION
========================================================== */

function renderInspiration() {
    inspirationPreview.innerHTML = "";

    if (!state.inspiration) {
        return;
    }

    inspirationPreview.appendChild(
        createPreviewCard(state.inspiration, () => {
            state.inspiration = null;
            revokeInput(inspirationInput);
            renderInspiration();
        })
    );
}


/* ==========================================================
   GRAPHIC
========================================================== */

function renderGraphic() {
    if (!state.graphic) {
        graphicPreviewSection.hidden = true;
        graphicPreviewImage.removeAttribute("src");
        return;
    }

    graphicPreviewLabel.textContent =
        state.graphic.kind === "existing"
            ? "현재 등록된 그래픽 (바꾸려면 REMOVE 후 새로 올리세요)"
            : "GRAPHIC PREVIEW";

    if (state.graphic.kind === "existing") {
        graphicPreviewImage.src = `/${state.graphic.path}`;
    } else {
        const reader = new FileReader();

        reader.onload = (e) => {
            graphicPreviewImage.src = e.target.result;
        };

        reader.readAsDataURL(state.graphic.file);
    }

    graphicPreviewSection.hidden = false;
}


/* ==========================================================
   GRID THUMBNAIL
========================================================== */

function renderThumbnail() {
    thumbnailPreview.innerHTML = "";

    if (!state.thumbnail) {
        return;
    }

    thumbnailPreview.appendChild(
        createPreviewCard(state.thumbnail, () => {
            state.thumbnail = null;
            renderThumbnail();
        })
    );
}


/* ==========================================================
   FILE INPUT
========================================================== */

originalInput.addEventListener("change", (e) => {
    const files = [...e.target.files].map((file) => ({ kind: "new", file }));
    state.originalPhotos = [...state.originalPhotos, ...files].slice(0, 8);
    renderOriginalPhotos();
    revokeInput(originalInput);
});

inspirationInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    state.inspiration = file ? { kind: "new", file } : null;
    renderInspiration();
});

graphicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    state.graphic = file ? { kind: "new", file } : null;
    renderGraphic();
});


/* ==========================================================
   REMOVE GRAPHIC
========================================================== */

$("#removeGraphic").addEventListener("click", () => {
    state.graphic = null;
    revokeInput(graphicInput);
    renderGraphic();
});


/* ==========================================================
   DRAG & DROP
========================================================== */

function bindDropzone(zone, input, callback) {
    zone.addEventListener("dragover", (e) => {
        e.preventDefault();
        zone.classList.add("is-dragover");
    });

    zone.addEventListener("dragleave", () => {
        zone.classList.remove("is-dragover");
    });

    zone.addEventListener("drop", (e) => {
        e.preventDefault();
        zone.classList.remove("is-dragover");
        callback([...e.dataTransfer.files]);
    });
}

bindDropzone($("#originalDropzone"), originalInput, (files) => {
    const newSlots = files.map((file) => ({ kind: "new", file }));
    state.originalPhotos = [...state.originalPhotos, ...newSlots].slice(0, 8);
    renderOriginalPhotos();
});

bindDropzone($("#inspirationDropzone"), inspirationInput, (files) => {
    state.inspiration = files[0] ? { kind: "new", file: files[0] } : null;
    renderInspiration();
});

bindDropzone($("#graphicDropzone"), graphicInput, (files) => {
    state.graphic = files[0] ? { kind: "new", file: files[0] } : null;
    renderGraphic();
});


/* ==========================================================
   COLOR EDITOR
========================================================== */

function renderColors() {
    colorList.innerHTML = "";

    state.colors.forEach((color, index) => {
        const item = document.createElement("div");
        item.className = "colorEditor__item";

        const picker = document.createElement("input");
        picker.type = "color";
        picker.className = "colorEditor__picker";
        picker.value = color;

        const hex = document.createElement("input");
        hex.type = "text";
        hex.className = "colorEditor__hex";
        hex.value = color.toUpperCase();

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "colorEditor__remove";
        remove.innerHTML = "×";

        picker.addEventListener("input", () => {
            state.colors[index] = picker.value.toUpperCase();
            hex.value = picker.value.toUpperCase();
        });

        hex.addEventListener("change", () => {
            const value = hex.value.trim().toUpperCase();

            if (!/^#[0-9A-F]{6}$/.test(value)) {
                hex.value = state.colors[index];
                return;
            }

            state.colors[index] = value;
            picker.value = value;
        });

        remove.addEventListener("click", () => {
            if (state.colors.length === 1) {
                return;
            }

            state.colors.splice(index, 1);
            renderColors();
        });

        item.append(picker, hex, remove);
        colorList.append(item);
    });
}

addColorButton.addEventListener("click", () => {
    if (state.colors.length >= 8) {
        showStatus("대표 색상은 최대 8개까지 등록할 수 있습니다.", true);
        return;
    }

    state.colors.push("#FFFFFF");
    renderColors();
});


/* ==========================================================
   VALIDATION
========================================================== */

function validateForm() {
    hideStatus();

    if (!archiveDate.value) {
        showStatus("날짜를 입력해주세요.", true);
        archiveDate.focus();
        return false;
    }

    if (!archiveMemo.value.trim()) {
        showStatus("메모를 입력해주세요.", true);
        archiveMemo.focus();
        return false;
    }

    if (state.originalPhotos.length === 0) {
        showStatus("손 사진을 등록해주세요.", true);
        return false;
    }

    if (!state.graphic) {
        showStatus("네일 그래픽을 업로드해주세요.", true);
        return false;
    }

    if (!archiveShape.value.trim()) {
        showStatus("Shape를 입력해주세요.", true);
        archiveShape.focus();
        return false;
    }

    if (!archiveFinish.value.trim()) {
        showStatus("Finish를 입력해주세요.", true);
        archiveFinish.focus();
        return false;
    }

    if (state.colors.length === 0) {
        showStatus("대표 색상을 등록해주세요.", true);
        return false;
    }

    return true;
}


/* ==========================================================
   THUMBNAIL CROP
   업로드된 네일 그래픽 이미지에서 정사각형 영역을 직접 골라
   썸네일을 만든다 — 별도 파일을 다시 올릴 필요가 없다.
========================================================== */

let cropDrag = null;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function getCropBoxSizePx() {
    const stageSize = Math.min(cropStage.clientWidth, cropStage.clientHeight);
    const percent = Number(cropSizeInput.value) / 100;
    return clamp(stageSize * percent, 40, stageSize);
}

function positionCropBox(left, top, size) {
    const maxLeft = Math.max(0, cropStage.clientWidth - size);
    const maxTop = Math.max(0, cropStage.clientHeight - size);

    cropBox.style.width = `${size}px`;
    cropBox.style.height = `${size}px`;
    cropBox.style.left = `${clamp(left, 0, maxLeft)}px`;
    cropBox.style.top = `${clamp(top, 0, maxTop)}px`;
}

function centerCropBox() {
    const size = getCropBoxSizePx();
    positionCropBox(
        (cropStage.clientWidth - size) / 2,
        (cropStage.clientHeight - size) / 2,
        size
    );
}

cropSizeInput.addEventListener("input", () => {
    const size = getCropBoxSizePx();
    const prevLeft = parseFloat(cropBox.style.left) || 0;
    const prevTop = parseFloat(cropBox.style.top) || 0;
    const prevSize = parseFloat(cropBox.style.width) || size;
    const centerX = prevLeft + prevSize / 2;
    const centerY = prevTop + prevSize / 2;

    positionCropBox(centerX - size / 2, centerY - size / 2, size);
});

cropBox.addEventListener("pointerdown", (e) => {
    e.preventDefault();

    cropDrag = {
        startX: e.clientX,
        startY: e.clientY,
        boxLeft: parseFloat(cropBox.style.left) || 0,
        boxTop: parseFloat(cropBox.style.top) || 0
    };

    cropBox.setPointerCapture(e.pointerId);
});

cropBox.addEventListener("pointermove", (e) => {
    if (!cropDrag) {
        return;
    }

    const size = parseFloat(cropBox.style.width) || getCropBoxSizePx();

    positionCropBox(
        cropDrag.boxLeft + (e.clientX - cropDrag.startX),
        cropDrag.boxTop + (e.clientY - cropDrag.startY),
        size
    );
});

function endCropDrag(e) {
    cropDrag = null;

    if (e && cropBox.hasPointerCapture && cropBox.hasPointerCapture(e.pointerId)) {
        cropBox.releasePointerCapture(e.pointerId);
    }
}

cropBox.addEventListener("pointerup", endCropDrag);
cropBox.addEventListener("pointercancel", endCropDrag);

pickThumbnailAreaButton.addEventListener("click", () => {
    if (!state.graphic || !graphicPreviewImage.src) {
        showStatus("먼저 네일 그래픽을 업로드해주세요.", true);
        return;
    }

    const openCropTool = () => {
        thumbnailCropDialog.showModal();
        centerCropBox();
    };

    cropImage.src = graphicPreviewImage.src;

    if (cropImage.complete && cropImage.naturalWidth) {
        openCropTool();
    } else {
        cropImage.onload = openCropTool;
    }
});

cancelCropButton.addEventListener("click", () => {
    thumbnailCropDialog.close();
});

confirmCropButton.addEventListener("click", () => {
    const scale = cropImage.naturalWidth / cropStage.clientWidth;
    const size = (parseFloat(cropBox.style.width) || getCropBoxSizePx()) * scale;
    const sx = (parseFloat(cropBox.style.left) || 0) * scale;
    const sy = (parseFloat(cropBox.style.top) || 0) * scale;

    const OUTPUT_SIZE = 900;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;

    const context = canvas.getContext("2d");
    context.drawImage(cropImage, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);

    state.thumbnail = {
        kind: "data",
        name: "thumbnail.jpg",
        type: "image/jpeg",
        size: 0,
        data: canvas.toDataURL("image/jpeg", 0.85)
    };

    renderThumbnail();
    thumbnailCropDialog.close();
});


/* ==========================================================
   JSON PAYLOAD
========================================================== */

async function createJSONPayload() {
    const graphic = await serializeSlot(state.graphic, 1800, 0.85);
    const inspiration = await serializeSlot(state.inspiration, 1600, 0.82);
    const thumbnail = await serializeSlot(state.thumbnail, 1000, 0.85);

    const photos = await Promise.all(
        state.originalPhotos.map((slot) => serializeSlot(slot, 1600, 0.82))
    );

    return {
        date: archiveDate.value,
        title: archiveTitle.value.trim(),
        memo: archiveMemo.value,
        shape: archiveShape.value.trim(),
        finish: archiveFinish.value
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean),
        colors: [...state.colors],
        graphic,
        inspiration,
        thumbnail,
        photos
    };
}


/* ==========================================================
   PROGRESS
========================================================== */

function setProgress(percent, label) {
    publishProgress.hidden = false;
    progressBar.style.width = `${percent}%`;
    progressValue.textContent = `${percent}%`;
    progressLabel.textContent = label;
}


/* ==========================================================
   PUBLISH
========================================================== */

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (state.publishing) {
        return;
    }

    if (!validateForm()) {
        return;
    }

    state.publishing = true;
    publishButton.disabled = true;

    try {
        const payload = await createJSONPayload();
        const payloadSize = new Blob([JSON.stringify(payload)]).size;

        if (payloadSize > 4 * 1024 * 1024) {
            throw new Error(
                `이미지 용량이 너무 큽니다 (${(payloadSize / 1024 / 1024).toFixed(1)}MB). 사진 수를 줄이거나 다시 시도해주세요.`
            );
        }

        setProgress(10, "Preparing...");

        const response = await fetch("/api/publish", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-admin-password": getPassword()
            },
            body: JSON.stringify(payload)
        });

        setProgress(70, "Publishing...");

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Publish failed.");
        }

        setProgress(100, "Completed");

        showPublishSuccess(result);
    } catch (error) {
        if (error.message.includes("관리자")) {
            clearPassword();
            showLogin("비밀번호가 올바르지 않습니다.");
        } else {
            showStatus(error.message, true);
        }
    } finally {
        state.publishing = false;
        publishButton.disabled = false;
        publishProgress.hidden = true;
    }
});


/* ==========================================================
   TOAST
========================================================== */

function showToast(message) {
    toastText.textContent = message;
    toast.hidden = false;

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.hidden = true;
    }, 3200);
}


/* ==========================================================
   SUCCESS
========================================================== */

function showPublishSuccess(result) {
    showToast(
        state.mode === "edit"
            ? "수정사항이 반영되었습니다!"
            : "새 기록이 등록되었습니다!"
    );

    resetToNewRecord();
    loadEntries();
}


/* ==========================================================
   ENTRY LIST (게시물 목록 + 수정 모드 진입)
========================================================== */

async function loadEntries() {
    try {
        const response = await fetch("/data/nails.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error("failed to load entries");
        }

        const entries = await response.json();
        state.entries = Array.isArray(entries) ? entries : [];
    } catch (error) {
        state.entries = [];
    }

    renderEntryList();
}

function renderEntryList() {
    entryListItems.innerHTML = "";

    if (!state.entries.length) {
        const empty = document.createElement("p");
        empty.className = "entryList__empty";
        empty.textContent = "등록된 기록이 없습니다.";
        entryListItems.appendChild(empty);
        return;
    }

    const sorted = [...state.entries].sort((a, b) =>
        String(b.date).localeCompare(String(a.date))
    );

    sorted.forEach((entry) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "entryList__item";

        if (state.mode === "edit" && state.editingDate === entry.date) {
            item.classList.add("is-active");
        }

        const title = document.createElement("span");
        title.textContent = entry.title || "Untitled Nail";

        const date = document.createElement("span");
        date.className = "entryList__itemDate";
        date.textContent = entry.date;

        item.append(title, date);

        item.addEventListener("click", () => {
            loadEntryForEdit(entry);
        });

        entryListItems.appendChild(item);
    });
}

function updateModeUI() {
    const editing = state.mode === "edit";

    newRecordButton.hidden = !editing;

    publishButton.textContent = editing ? "SAVE CHANGES" : "PUBLISH TO ARCHIVE";
}

function loadEntryForEdit(entry) {
    state.mode = "edit";
    state.editingDate = entry.date;

    archiveDate.value = entry.date || "";
    archiveDate.disabled = true;
    dateHelp.hidden = false;

    archiveTitle.value = entry.title || "";
    archiveMemo.value = entry.memo || "";
    $("#memoCount").textContent = `${archiveMemo.value.length} / 3000`;

    archiveShape.value = entry.shape || "";
    archiveFinish.value = Array.isArray(entry.finish)
        ? entry.finish.join(", ")
        : entry.finish || "";

    state.colors =
        Array.isArray(entry.colors) && entry.colors.length
            ? [...entry.colors]
            : ["#F7D4E2"];
    renderColors();

    state.graphic = entry.graphic
        ? { kind: "existing", path: stripLeadingPath(entry.graphic) }
        : null;

    state.inspiration = entry.inspiration
        ? { kind: "existing", path: stripLeadingPath(entry.inspiration) }
        : null;

    state.thumbnail = entry.thumbnail
        ? { kind: "existing", path: stripLeadingPath(entry.thumbnail) }
        : null;

    state.originalPhotos = Array.isArray(entry.photos)
        ? entry.photos.map((path) => ({ kind: "existing", path: stripLeadingPath(path) }))
        : [];

    renderGraphic();
    renderInspiration();
    renderThumbnail();
    renderOriginalPhotos();
    updateModeUI();
    renderEntryList();
    hideStatus();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetToNewRecord() {
    state.mode = "create";
    state.editingDate = null;

    archiveDate.value = "";
    archiveDate.disabled = false;
    dateHelp.hidden = true;

    archiveTitle.value = "";
    archiveMemo.value = "";
    $("#memoCount").textContent = "0 / 3000";

    archiveShape.value = "";
    archiveFinish.value = "";

    state.colors = ["#F7D4E2"];
    renderColors();

    state.graphic = null;
    state.inspiration = null;
    state.thumbnail = null;
    state.originalPhotos = [];

    renderGraphic();
    renderInspiration();
    renderThumbnail();
    renderOriginalPhotos();
    updateModeUI();
    renderEntryList();
    hideStatus();

    window.scrollTo({ top: 0, behavior: "smooth" });
}

newRecordButton.addEventListener("click", resetToNewRecord);


/* ==========================================================
   INIT UI
========================================================== */

renderColors();
hideStatus();
updateModeUI();
loadEntries();

if (getPassword()) {
    hideLogin();
} else {
    showLogin();
}
