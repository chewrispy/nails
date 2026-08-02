/* ==========================================================
   NAILS DONE.
   Admin Page
========================================================== */
/* ==========================================================
   01. STATE
========================================================== */
const state = {
    currentStep: 1,
    processingMode: "manual",
    originalFiles: [],
    inspirationFile: null,
    originalImages: [],
    inspirationImage: "",
    generated: {
        shape: "",
        finish: [],
        colors: [],
        graphic: ""
    },
    manual: {
        shape: "",
        finish: [],
        colors: [
            "#D7B0F5"
        ],
        graphic: ""
    },
    selectedFinger: "",
    fingerEditController: null,
    removeTarget: null,
    analysisController: null,
    publishController: null
};
/* ==========================================================
   02. DOM
========================================================== */
const archiveForm = document.querySelector("#archiveForm");
const progressItems = [
    ...document.querySelectorAll("[data-step-indicator]")
];
const formSteps = [
    ...document.querySelectorAll("[data-step]")
];
const statusMessage = document.querySelector("#statusMessage");
const statusMessageText = document.querySelector(
    ".statusMessage__text"
);
const statusMessageClose = document.querySelector(
    "#statusMessageClose"
);
/* STEP 1 */
const archiveDate = document.querySelector("#archiveDate");
const archiveTitle = document.querySelector("#archiveTitle");
const archiveMemo = document.querySelector("#archiveMemo");
const memoCount = document.querySelector("#memoCount");
const originalPhotos = document.querySelector("#originalPhotos");
const originalDropzone = document.querySelector(
    "#originalDropzone"
);
const originalPhotoPreview = document.querySelector(
    "#originalPhotoPreview"
);
const originalPhotoCount = document.querySelector(
    "#originalPhotoCount"
);
const inspirationImage = document.querySelector(
    "#inspirationImage"
);
const inspirationDropzone = document.querySelector(
    "#inspirationDropzone"
);
const inspirationPreview = document.querySelector(
    "#inspirationPreview"
);
const goToAnalyze = document.querySelector("#goToAnalyze");
/* STEP 2 */
const summaryDate = document.querySelector("#summaryDate");
const summaryTitle = document.querySelector("#summaryTitle");
const summaryPhotoCount = document.querySelector(
    "#summaryPhotoCount"
);
const backToInput = document.querySelector("#backToInput");
const startAnalyze = document.querySelector("#startAnalyze");
const cancelAnalyze = document.querySelector("#cancelAnalyze");
const analyzeOrb = document.querySelector("#analyzeOrb");
const analysisProgress = document.querySelector(
    "#analysisProgress"
);
const analysisProgressLabel = document.querySelector(
    "#analysisProgressLabel"
);
const analysisProgressValue = document.querySelector(
    "#analysisProgressValue"
);
const analysisProgressBar = document.querySelector(
    "#analysisProgressBar"
);
/* STEP 3 */
const generatedNailGraphic = document.querySelector(
    "#generatedNailGraphic"
);
const nailEditor =
    document.querySelector("#nailEditor");
const fingerSelector =
    document.querySelector("#fingerSelector");
const fingerButtons = [
    ...document.querySelectorAll(
        ".fingerSelector__button"
    )
];
const clearFingerSelection =
    document.querySelector(
        "#clearFingerSelection"
    );
const fingerEditInstruction =
    document.querySelector(
        "#fingerEditInstruction"
    );
const fingerEditHint =
    document.querySelector(
        "#fingerEditHint"
    );
const applyFingerEdit =
    document.querySelector(
        "#applyFingerEdit"
    );
const fingerEditProgress =
    document.querySelector(
        "#fingerEditProgress"
    );
const fingerEditProgressLabel =
    document.querySelector(
        "#fingerEditProgressLabel"
    );
const fingerEditProgressValue =
    document.querySelector(
        "#fingerEditProgressValue"
    );
const fingerEditProgressBar =
    document.querySelector(
        "#fingerEditProgressBar"
    );
const generatedShape = document.querySelector("#generatedShape");
const generatedFinish = document.querySelector(
    "#generatedFinish"
);
const generatedColors = document.querySelector(
    "#generatedColors"
);
const regenerateGraphic = document.querySelector(
    "#regenerateGraphic"
);
const addGeneratedColor = document.querySelector(
    "#addGeneratedColor"
);
const archivePreviewFrame = document.querySelector(
    "#archivePreviewFrame"
);
const backToAnalyze = document.querySelector("#backToAnalyze");
const goToPublish = document.querySelector("#goToPublish");
/* STEP 4 */
const publishGraphicPreview = document.querySelector(
    "#publishGraphicPreview"
);
const publishDate = document.querySelector("#publishDate");
const publishTitle = document.querySelector("#publishTitle");
const publishShape = document.querySelector("#publishShape");
const publishFinish = document.querySelector("#publishFinish");
const publishPhotoCount = document.querySelector(
    "#publishPhotoCount"
);
const confirmPublish = document.querySelector(
    "#confirmPublish"
);
const publishArchive = document.querySelector(
    "#publishArchive"
);
const backToPreview = document.querySelector(
    "#backToPreview"
);
const publishProgress = document.querySelector(
    "#publishProgress"
);
const publishProgressLabel = document.querySelector(
    "#publishProgressLabel"
);
const publishProgressValue = document.querySelector(
    "#publishProgressValue"
);
const publishProgressBar = document.querySelector(
    "#publishProgressBar"
);
/* SUCCESS */
const publishSuccess = document.querySelector(
    "#publishSuccess"
);
const publishSuccessCommit = document.querySelector(
    "#publishSuccessCommit"
);
const viewPublishedArchive = document.querySelector(
    "#viewPublishedArchive"
);
const createAnotherArchive = document.querySelector(
    "#createAnotherArchive"
);
/* REMOVE DIALOG */
const removeImageDialog = document.querySelector(
    "#removeImageDialog"
);
const cancelRemoveImage = document.querySelector(
    "#cancelRemoveImage"
);
const confirmRemoveImage = document.querySelector(
    "#confirmRemoveImage"
);
/* DIAGNOSTICS */
const openDiagnostics =
    document.querySelector(
        "#openDiagnostics"
    );
const diagnosticsDialog =
    document.querySelector(
        "#diagnosticsDialog"
    );
const closeDiagnostics =
    document.querySelector(
        "#closeDiagnostics"
    );
const doneDiagnostics =
    document.querySelector(
        "#doneDiagnostics"
    );
const refreshDiagnostics =
    document.querySelector(
        "#refreshDiagnostics"
    );
const diagnosticsLoading =
    document.querySelector(
        "#diagnosticsLoading"
    );
const diagnosticsResult =
    document.querySelector(
        "#diagnosticsResult"
    );
const diagnosticsStatusIcon =
    document.querySelector(
        "#diagnosticsStatusIcon"
    );
const diagnosticsStatusTitle =
    document.querySelector(
        "#diagnosticsStatusTitle"
    );
const diagnosticsStatusDescription =
    document.querySelector(
        "#diagnosticsStatusDescription"
    );
const diagnosticArchive =
    document.querySelector(
        "#diagnosticArchive"
    );
const diagnosticAI =
    document.querySelector(
        "#diagnosticAI"
    );
const diagnosticFingerEditor =
    document.querySelector(
        "#diagnosticFingerEditor"
    );
const diagnosticPublish =
    document.querySelector(
        "#diagnosticPublish"
    );
const diagnosticRepository =
    document.querySelector(
        "#diagnosticRepository"
    );
const diagnosticBranch =
    document.querySelector(
        "#diagnosticBranch"
    );
const diagnosticEnvironment =
    document.querySelector(
        "#diagnosticEnvironment"
    );
const missingVariables =
    document.querySelector(
        "#missingVariables"
    );
const missingVariablesList =
    document.querySelector(
        "#missingVariablesList"
    );
const aiMode =
    document.querySelector("#aiMode");
const manualMode =
    document.querySelector("#manualMode");
const aiModePanel =
    document.querySelector("#aiModePanel");
const manualModePanel =
    document.querySelector("#manualModePanel");
const manualShape =
    document.querySelector("#manualShape");
const manualFinish =
    document.querySelector("#manualFinish");
const manualColors =
    document.querySelector("#manualColors");
const addManualColor =
    document.querySelector("#addManualColor");
const manualColorsError =
    document.querySelector("#manualColorsError");
const manualSvgFile =
    document.querySelector("#manualSvgFile");
const manualSvgDropzone =
    document.querySelector("#manualSvgDropzone");
const manualSvgCode =
    document.querySelector("#manualSvgCode");
const clearManualSvg =
    document.querySelector("#clearManualSvg");
const manualSvgError =
    document.querySelector("#manualSvgError");
const manualSvgPreview =
    document.querySelector("#manualSvgPreview");
const manualSvgStatus =
    document.querySelector("#manualSvgStatus");
const manualBackToInput =
    document.querySelector("#manualBackToInput");
const continueManualMode =
    document.querySelector("#continueManualMode");
/* ==========================================================
   03. CONSTANTS
========================================================== */
const MAX_ORIGINAL_FILES = 6;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif"
];
const ANALYZE_ENDPOINT = "/api/analyze";
const PUBLISH_ENDPOINT = "/api/publish";
const EDIT_NAIL_ENDPOINT = "/api/edit-nail";
const HEALTH_ENDPOINT = "/api/health";
const REQUIRED_FINGER_IDS = [
    "left-thumb",
    "left-index",
    "left-middle",
    "left-ring",
    "left-pinky",

    "right-thumb",
    "right-index",
    "right-middle",
    "right-ring",
    "right-pinky"
];
/* ==========================================================
   04. UTILITIES
========================================================== */
function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function wait(milliseconds) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });
}
function getAdminPassword() {
    const saved = sessionStorage.getItem(
        "nailsDoneAdminPassword"
    );
    if (saved) {
        return saved;
    }
    const entered = window.prompt(
        "관리자 비밀번호를 입력하세요."
    );
    if (!entered) {
        throw new Error(
            "관리자 비밀번호가 필요합니다."
        );
    }
    sessionStorage.setItem(
        "nailsDoneAdminPassword",
        entered
    );
    return entered;
}
function resetAdminPassword() {
    sessionStorage.removeItem(
        "nailsDoneAdminPassword"
    );
}
function validateFile(file) {
    if (!file) {
        return {
            valid: false,
            message: "파일이 없습니다."
        };
    }
    const isKnownImage =
        ALLOWED_TYPES.includes(file.type) ||
        /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
    if (!isKnownImage) {
        return {
            valid: false,
            message: `${file.name}: 지원하지 않는 이미지 형식입니다.`
        };
    }
    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            message: `${file.name}: 파일 크기는 15MB 이하여야 합니다.`
        };
    }
    return {
        valid: true,
        message: ""
    };
}
/* ==========================================================
   IMAGE PROCESSING
========================================================== */
const MAX_FUNCTION_PAYLOAD_BYTES = 4_200_000;
const TARGET_IMAGE_BYTES = 360_000;
function blobToDataURL(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = () => {
            reject(
                new Error(
                    "압축된 이미지를 읽지 못했습니다."
                )
            );
        };
        reader.readAsDataURL(blob);
    });
}
function fileToDataURL(file) {
    return blobToDataURL(file);
}
function canvasToBlob(
    canvas,
    type = "image/jpeg",
    quality = 0.8
) {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(
                        new Error(
                            "이미지 압축 결과를 만들지 못했습니다."
                        )
                    );
                    return;
                }
                resolve(blob);
            },
            type,
            quality
        );
    });
}
async function decodeImage(file) {
    try {
        const bitmap =
            await createImageBitmap(file);
        return {
            width: bitmap.width,
            height: bitmap.height,
            draw(context, width, height) {
                context.drawImage(
                    bitmap,
                    0,
                    0,
                    width,
                    height
                );
            },
            close() {
                bitmap.close();
            }
        };
    } catch {
        const objectURL =
            URL.createObjectURL(file);
        try {
            const image =
                await new Promise(
                    (resolve, reject) => {
                        const element =
                            new Image();
                        element.onload = () => {
                            resolve(element);
                        };
                        element.onerror = () => {
                            reject(
                                new Error(
                                    `${file.name} 이미지를 브라우저에서 해석하지 못했습니다. JPG 또는 PNG로 변환해 주세요.`
                                )
                            );
                        };
                        element.src = objectURL;
                    }
                );
            return {
                width:
                    image.naturalWidth,
                height:
                    image.naturalHeight,
                draw(context, width, height) {
                    context.drawImage(
                        image,
                        0,
                        0,
                        width,
                        height
                    );
                },
                close() {
                    URL.revokeObjectURL(
                        objectURL
                    );
                }
            };
        } catch (error) {
            URL.revokeObjectURL(
                objectURL
            );
            throw error;
        }
    }
}
async function compressImage(
    file,
    {
        maxDimension = 1200,
        targetBytes = TARGET_IMAGE_BYTES
    } = {}
) {
    const decoded =
        await decodeImage(file);
    try {
        const initialScale =
            Math.min(
                1,
                maxDimension /
                    Math.max(
                        decoded.width,
                        decoded.height
                    )
            );
        let width =
            Math.max(
                1,
                Math.round(
                    decoded.width *
                    initialScale
                )
            );
        let height =
            Math.max(
                1,
                Math.round(
                    decoded.height *
                    initialScale
                )
            );
        let quality = 0.8;
        let resultBlob = null;
        for (
            let attempt = 0;
            attempt < 8;
            attempt += 1
        ) {
            const canvas =
                document.createElement(
                    "canvas"
                );
            canvas.width = width;
            canvas.height = height;
            const context =
                canvas.getContext(
                    "2d",
                    {
                        alpha: false
                    }
                );
            if (!context) {
                throw new Error(
                    "이미지 압축용 Canvas를 만들지 못했습니다."
                );
            }
            context.fillStyle =
                "#ffffff";
            context.fillRect(
                0,
                0,
                width,
                height
            );
            decoded.draw(
                context,
                width,
                height
            );
            resultBlob =
                await canvasToBlob(
                    canvas,
                    "image/jpeg",
                    quality
                );
            if (
                resultBlob.size <=
                targetBytes
            ) {
                break;
            }
            if (quality > 0.58) {
                quality -= 0.08;
            } else {
                width =
                    Math.max(
                        640,
                        Math.round(
                            width * 0.84
                        )
                    );
                height =
                    Math.max(
                        640,
                        Math.round(
                            height * 0.84
                        )
                    );
            }
        }
        if (!resultBlob) {
            throw new Error(
                `${file.name} 이미지를 압축하지 못했습니다.`
            );
        }
        if (
            resultBlob.size >
            targetBytes * 1.25
        ) {
            throw new Error(
                `${file.name} 이미지의 압축 용량이 너무 큽니다. 다른 사진을 사용하거나 파일 크기를 줄여주세요.`
            );
        }
        return blobToDataURL(
            resultBlob
        );
    } finally {
        decoded.close();
    }
}
function getPayloadByteSize(payload) {
    return new Blob([
        JSON.stringify(payload)
    ]).size;
}
function assertPayloadSize(payload) {
    const size =
        getPayloadByteSize(payload);
    if (
        size >
        MAX_FUNCTION_PAYLOAD_BYTES
    ) {
        const sizeMB =
            (
                size /
                1024 /
                1024
            ).toFixed(2);
        throw new Error(
            `전송할 사진 용량이 ${sizeMB}MB로 너무 큽니다. 사진 수를 줄이거나 더 작은 사진을 사용해 주세요.`
        );
    }
}
function normalizeFinish(value) {
    if (Array.isArray(value)) {
        return value
            .map((item) => String(item).trim())
            .filter(Boolean);
    }
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}
function normalizeColors(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((color) => String(color).trim())
        .filter((color) => {
            return /^#[0-9a-f]{6}$/i.test(color);
        });
}
function getGraphicMarkup() {
    return state.generated.graphic || "";
}
function getFormData() {
    return {
        date: archiveDate.value,
        title: archiveTitle.value.trim(),
        memo: archiveMemo.value.trim(),
        photos: [...state.originalImages],
        reference:
            state.inspirationImage || "",
        graphic: getGraphicMarkup(),
        shape:
            generatedShape.value.trim() ||
            state.generated.shape,
        finish: normalizeFinish(
            generatedFinish.value
        ),
        colors: getGeneratedColorValues()
    };
}
/* ==========================================================
   05. STATUS
========================================================== */
function showStatus(
    message,
    type = "default"
) {
    statusMessage.hidden = false;
    statusMessage.classList.remove(
        "is-error",
        "is-success"
    );
    if (type === "error") {
        statusMessage.classList.add("is-error");
    }
    if (type === "success") {
        statusMessage.classList.add("is-success");
    }
    statusMessageText.textContent = message;
    statusMessage.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
}
function hideStatus() {
    statusMessage.hidden = true;
    statusMessageText.textContent = "";
    statusMessage.classList.remove(
        "is-error",
        "is-success"
    );
}
/* ==========================================================
   06. STEPS
========================================================== */
function setStep(stepNumber) {
    state.currentStep = stepNumber;
    formSteps.forEach((step) => {
        const stepValue = Number(step.dataset.step);
        const isCurrent = stepValue === stepNumber;
        step.hidden = !isCurrent;
        step.classList.toggle(
            "is-active",
            isCurrent
        );
    });
    progressItems.forEach((item) => {
        const indicator = Number(
            item.dataset.stepIndicator
        );
        item.classList.toggle(
            "is-active",
            indicator === stepNumber
        );
        item.classList.toggle(
            "is-complete",
            indicator < stepNumber
        );
    });
    hideStatus();
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
/* ==========================================================
   07. VALIDATION
========================================================== */
function setFieldError(input, message = "") {
    const field = input.closest(".field");
    if (!field) {
        return;
    }
    const error = field.querySelector(
        ".field__error"
    );
    field.classList.toggle(
        "is-invalid",
        Boolean(message)
    );
    if (error) {
        error.textContent = message;
    }
}
function validateInputStep() {
    let isValid = true;
    setFieldError(archiveDate);
    setFieldError(archiveMemo);
    setFieldError(originalPhotos);
    if (!archiveDate.value) {
        setFieldError(
            archiveDate,
            "날짜를 입력해 주세요."
        );
        isValid = false;
    }
    if (!archiveMemo.value.trim()) {
        setFieldError(
            archiveMemo,
            "메모를 입력해 주세요."
        );
        isValid = false;
    }
    if (!state.originalFiles.length) {
        setFieldError(
            originalPhotos,
            "손 사진을 한 장 이상 올려주세요."
        );
        isValid = false;
    }
    if (!isValid) {
        showStatus(
            "필수 입력 항목을 확인해 주세요.",
            "error"
        );
    }
    return isValid;
}
/* ==========================================================
   08. MEMO COUNTER
========================================================== */
function updateMemoCounter() {
    memoCount.textContent =
        `${archiveMemo.value.length} / 3000`;
}
/* ==========================================================
   09. DROPZONE
========================================================== */
function setupDropzone(
    dropzone,
    input,
    handler
) {
    dropzone.addEventListener(
        "click",
        () => {
            input.click();
        }
    );
    dropzone.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Enter" ||
                event.key === " "
            ) {
                event.preventDefault();
                input.click();
            }
        }
    );
    input.addEventListener(
        "click",
        (event) => {
            event.stopPropagation();
        }
    );
    input.addEventListener(
        "change",
        () => {
            handler([...input.files]);
            input.value = "";
        }
    );
    ["dragenter", "dragover"].forEach(
        (eventName) => {
            dropzone.addEventListener(
                eventName,
                (event) => {
                    event.preventDefault();
                    dropzone.classList.add(
                        "is-dragover"
                    );
                }
            );
        }
    );
    ["dragleave", "drop"].forEach(
        (eventName) => {
            dropzone.addEventListener(
                eventName,
                (event) => {
                    event.preventDefault();
                    dropzone.classList.remove(
                        "is-dragover"
                    );
                }
            );
        }
    );
    dropzone.addEventListener(
        "drop",
        (event) => {
            handler(
                [...event.dataTransfer.files]
            );
        }
    );
}
async function addOriginalFiles(files) {
    const availableSlots =
        MAX_ORIGINAL_FILES -
        state.originalFiles.length;
    if (availableSlots <= 0) {
        showStatus(
            "원본 사진은 최대 6장까지 등록할 수 있습니다.",
            "error"
        );
        return;
    }
    const selected = files.slice(
        0,
        availableSlots
    );
    for (const file of selected) {
        const validation = validateFile(file);
        if (!validation.valid) {
            showStatus(
                validation.message,
                "error"
            );
            continue;
        }
        const duplicate = state.originalFiles.some(
            (existing) => {
                return (
                    existing.name === file.name &&
                    existing.size === file.size &&
                    existing.lastModified ===
                        file.lastModified
                );
            }
        );
        if (duplicate) {
            continue;
        }
        state.originalFiles.push(file);
    }
    await refreshOriginalFiles();
}
async function setInspirationFile(files) {
    const file = files[0];
    if (!file) {
        return;
    }
    const validation = validateFile(file);
    if (!validation.valid) {
        showStatus(
            validation.message,
            "error"
        );
        return;
    }
    state.inspirationFile = file;
    state.inspirationImage =
        await fileToDataURL(file);
    renderInspirationPreview();
}
/* ==========================================================
   10. IMAGE PREVIEW
========================================================== */
async function refreshOriginalFiles() {
    state.originalImages =
        await Promise.all(
            state.originalFiles.map((file) => {
                return fileToDataURL(file);
            })
        );
    renderOriginalPreview();
    originalPhotoCount.textContent =
        `${state.originalFiles.length} / ${MAX_ORIGINAL_FILES}`;
    if (state.originalFiles.length) {
        setFieldError(originalPhotos);
    }
}
function renderOriginalPreview() {
    originalPhotoPreview.replaceChildren();
    state.originalImages.forEach(
        (imageSource, index) => {
            const item =
                document.createElement("article");
            item.className =
                "uploadPreview__item";
            const image =
                document.createElement("img");
            image.className =
                "uploadPreview__image";
            image.src = imageSource;
            image.alt =
                `원본 사진 미리보기 ${index + 1}`;
            const remove =
                document.createElement("button");
            remove.className =
                "uploadPreview__remove";
            remove.type = "button";
            remove.textContent = "×";
            remove.setAttribute(
                "aria-label",
                `원본 사진 ${index + 1} 제거`
            );
            remove.addEventListener(
                "click",
                () => {
                    requestImageRemoval(
                        "original",
                        index
                    );
                }
            );
            item.append(image, remove);
            originalPhotoPreview.append(item);
        }
    );
}
function renderInspirationPreview() {
    inspirationPreview.replaceChildren();
    if (!state.inspirationImage) {
        return;
    }
    const item =
        document.createElement("article");
    item.className = "uploadPreview__item";
    const image =
        document.createElement("img");
    image.className =
        "uploadPreview__image";
    image.src = state.inspirationImage;
    image.alt =
        "인스퍼레이션 이미지 미리보기";
    const remove =
        document.createElement("button");
    remove.className =
        "uploadPreview__remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute(
        "aria-label",
        "인스퍼레이션 이미지 제거"
    );
    remove.addEventListener(
        "click",
        () => {
            requestImageRemoval(
                "inspiration",
                0
            );
        }
    );
    item.append(image, remove);
    inspirationPreview.append(item);
}
/* ==========================================================
   11. IMAGE REMOVAL
========================================================== */
function requestImageRemoval(type, index) {
    state.removeTarget = {
        type,
        index
    };
    removeImageDialog.showModal();
}
function closeRemoveDialog() {
    state.removeTarget = null;
    removeImageDialog.close();
}
async function removeSelectedImage() {
    const target = state.removeTarget;
    if (!target) {
        return;
    }
    if (target.type === "original") {
        state.originalFiles.splice(
            target.index,
            1
        );
        await refreshOriginalFiles();
    }
    if (target.type === "inspiration") {
        state.inspirationFile = null;
        state.inspirationImage = "";
        renderInspirationPreview();
    }
    closeRemoveDialog();
}
/* ==========================================================
   12. SUMMARY
========================================================== */
function updateInputSummary() {
    summaryDate.textContent =
        archiveDate.value || "-";
    summaryTitle.textContent =
        archiveTitle.value.trim() ||
        "UNTITLED";
    summaryPhotoCount.textContent =
        `${state.originalFiles.length}장`;
}
/* ==========================================================
   13. PROGRESS CONTROLLER
========================================================== */
function createProgressController({
    container,
    label,
    value,
    bar,
    stages
}) {
    let timer = null;
    let currentValue = 0;
    let stageIndex = 0;
    function render() {
        value.textContent =
            `${Math.round(currentValue)}%`;
        bar.style.width =
            `${Math.min(currentValue, 100)}%`;
        const stage =
            stages[Math.min(
                stageIndex,
                stages.length - 1
            )];
        label.textContent = stage.label;
    }
    function start() {
        container.hidden = false;
        currentValue = 2;
        stageIndex = 0;
        render();
        timer = window.setInterval(() => {
            const stage =
                stages[Math.min(
                    stageIndex,
                    stages.length - 1
                )];
            const remaining =
                stage.until - currentValue;
            if (remaining <= 0) {
                stageIndex += 1;
                if (
                    stageIndex >=
                    stages.length
                ) {
                    return;
                }
            }
            const increment = Math.max(
                0.4,
                remaining * 0.055
            );
            currentValue = Math.min(
                stage.until,
                currentValue + increment
            );
            render();
        }, 220);
    }
    function complete(finalLabel) {
        if (timer) {
            window.clearInterval(timer);
        }
        currentValue = 100;
        if (finalLabel) {
            label.textContent = finalLabel;
        }
        value.textContent = "100%";
        bar.style.width = "100%";
    }
    function reset() {
        if (timer) {
            window.clearInterval(timer);
        }
        timer = null;
        currentValue = 0;
        stageIndex = 0;
        value.textContent = "0%";
        bar.style.width = "0%";
        container.hidden = true;
    }
    return {
        start,
        complete,
        reset
    };
}
const analysisProgressController =
    createProgressController({
        container: analysisProgress,
        label: analysisProgressLabel,
        value: analysisProgressValue,
        bar: analysisProgressBar,
        stages: [
            {
                until: 18,
                label: "사진을 준비하고 있습니다."
            },
            {
                until: 42,
                label: "손톱 영역을 분석하고 있습니다."
            },
            {
                until: 65,
                label: "쉐입과 마감 정보를 정리하고 있습니다."
            },
            {
                until: 88,
                label: "열 손가락 네일 그래픽을 생성하고 있습니다."
            },
            {
                until: 95,
                label: "결과를 마무리하고 있습니다."
            }
        ]
    });
const publishProgressController =
    createProgressController({
        container: publishProgress,
        label: publishProgressLabel,
        value: publishProgressValue,
        bar: publishProgressBar,
        stages: [
            {
                until: 20,
                label: "게시 데이터를 준비하고 있습니다."
            },
            {
                until: 45,
                label: "그래픽 파일을 업로드하고 있습니다."
            },
            {
                until: 70,
                label: "원본 사진을 업로드하고 있습니다."
            },
            {
                until: 90,
                label: "아카이브 데이터를 업데이트하고 있습니다."
            },
            {
                until: 96,
                label: "GitHub 커밋을 생성하고 있습니다."
            }
        ]
    });
const fingerEditProgressController =
    createProgressController({
        container:
            fingerEditProgress,
        label:
            fingerEditProgressLabel,
        value:
            fingerEditProgressValue,
        bar:
            fingerEditProgressBar,
        stages: [
            {
                until: 25,
                label:
                    "선택한 손톱과 원본 사진을 비교하고 있습니다."
            },
            {
                until: 52,
                label:
                    "수정 요청을 해석하고 있습니다."
            },
            {
                until: 78,
                label:
                    "선택한 손톱 그래픽을 다시 생성하고 있습니다."
            },
            {
                until: 95,
                label:
                    "나머지 손톱을 유지하며 결과를 정리하고 있습니다."
            }
        ]
    });
/* ==========================================================
   14. ANALYZE PAYLOAD
========================================================== */
async function buildAnalyzePayload() {
    const compressedPhotos =
        await Promise.all(
            state.originalFiles.map(
                (file) => {
                    return compressImage(
                        file,
                        {
                            maxDimension: 1200,
                            targetBytes:
                                TARGET_IMAGE_BYTES
                        }
                    );
                }
            )
        );
    let compressedReference = "";
    if (state.inspirationFile) {
        compressedReference =
            await compressImage(
                state.inspirationFile,
                {
                    maxDimension: 1200,
                    targetBytes:
                        TARGET_IMAGE_BYTES
                }
            );
    }
    const payload = {
        date:
            archiveDate.value,
        title:
            archiveTitle.value.trim(),
        memo:
            archiveMemo.value.trim(),
        photos:
            compressedPhotos,
        reference:
            compressedReference
    };
    assertPayloadSize(payload);
    return payload;
}
/* ==========================================================
   15. ANALYZE API
========================================================== */
async function analyzeArchive({
    regenerateOnly = false
} = {}) {
    const password = getAdminPassword();
    state.analysisController =
        new AbortController();
    startAnalyze.disabled = true;
    backToInput.disabled = true;
    cancelAnalyze.hidden = false;
    analyzeOrb.classList.add(
        "is-analyzing"
    );
    analysisProgressController.reset();
    analysisProgressController.start();
    try {
        const payload =
            await buildAnalyzePayload();
        if (regenerateOnly) {
            payload.regenerate = true;
            payload.shape =
                generatedShape.value.trim();
            payload.finish =
                normalizeFinish(
                    generatedFinish.value
                );
            payload.colors =
                getGeneratedColorValues();
        }
        const response = await fetch(
            ANALYZE_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "x-admin-password":
                        password
                },
                body: JSON.stringify(payload),
                signal:
                    state.analysisController.signal
            }
        );
        const result = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                resetAdminPassword();
            }
            throw new Error(
                result.error ||
                "AI 분석에 실패했습니다."
            );
        }
        state.generated = {
            shape:
                result.shape || "",
            finish:
                normalizeFinish(
                    result.finish
                ),
            colors:
                normalizeColors(
                    result.colors
                ),
            graphic:
                result.graphicSvg ||
                result.graphic ||
                ""
        };
        analysisProgressController.complete(
            "분석과 그래픽 생성이 완료되었습니다."
        );
        await wait(420);
        renderGeneratedResult();
        setStep(3);
    } catch (error) {
        if (error.name === "AbortError") {
            showStatus(
                "분석을 취소했습니다.",
                "error"
            );
            return;
        }
        console.error(error);
        showStatus(
            error.message,
            "error"
        );
    } finally {
        startAnalyze.disabled = false;
        backToInput.disabled = false;
        cancelAnalyze.hidden = true;
        analyzeOrb.classList.remove(
            "is-analyzing"
        );
        state.analysisController = null;
    }
}
function cancelAnalysis() {
    state.analysisController?.abort();
    analysisProgressController.reset();
    cancelAnalyze.hidden = true;
    startAnalyze.disabled = false;
}
/* ==========================================================
   16. GENERATED RESULT
========================================================== */
function renderGraphic(
    container,
    graphic
) {
    container.replaceChildren();
    if (!graphic) {
        container.textContent =
            "그래픽이 생성되지 않았습니다.";
        return;
    }
    if (
        graphic.trim().startsWith("<svg")
    ) {
        container.innerHTML = graphic;
        return;
    }
    const image =
        document.createElement("img");
    image.src = graphic;
    image.alt = "생성된 네일 그래픽";
    container.append(image);
}
function renderGeneratedResult() {
    generatedShape.value =
        state.generated.shape;
    generatedFinish.value =
        state.generated.finish.join(", ");
    renderGeneratedColors();
    renderGraphic(
        generatedNailGraphic,
        state.generated.graphic
    );
    clearSelectedFinger();
    bindGraphicFingerClick();
    updateArchivePreview();
}
/* ==========================================================
   FINGER EDITOR
========================================================== */
const fingerLabels = {
    "left-thumb": "왼손 엄지",
    "left-index": "왼손 검지",
    "left-middle": "왼손 중지",
    "left-ring": "왼손 약지",
    "left-pinky": "왼손 소지",
    "right-thumb": "오른손 엄지",
    "right-index": "오른손 검지",
    "right-middle": "오른손 중지",
    "right-ring": "오른손 약지",
    "right-pinky": "오른손 소지"
};
function selectFinger(finger) {
    state.selectedFinger = finger;
    fingerButtons.forEach((button) => {
        button.classList.toggle(
            "is-selected",
            button.dataset.finger === finger
        );
        button.setAttribute(
            "aria-pressed",
            String(
                button.dataset.finger === finger
            )
        );
    });
    clearFingerSelection.hidden = false;
    fingerEditInstruction.disabled = false;
    fingerEditInstruction.placeholder =
        `${fingerLabels[finger]} 수정 요청을 입력하세요.`;
    fingerEditHint.textContent =
        `${fingerLabels[finger]}만 수정하며 나머지 아홉 개 손톱은 유지합니다.`;
    updateFingerEditButton();
    highlightSelectedNail();
}
function clearSelectedFinger() {
    state.selectedFinger = "";
    fingerButtons.forEach((button) => {
        button.classList.remove(
            "is-selected"
        );
        button.setAttribute(
            "aria-pressed",
            "false"
        );
    });
    clearFingerSelection.hidden = true;
    fingerEditInstruction.value = "";
    fingerEditInstruction.disabled = true;
    fingerEditInstruction.placeholder =
        "먼저 수정할 손톱을 선택하세요.";
    fingerEditHint.textContent =
        "선택한 손톱만 수정하고 나머지 손톱은 유지합니다.";
    generatedNailGraphic.classList.remove(
        "has-finger-selection"
    );
    generatedNailGraphic
        .querySelectorAll("[data-finger]")
        .forEach((element) => {
            element.classList.remove(
                "is-selected"
            );
        });
    updateFingerEditButton();
}
function updateFingerEditButton() {
    applyFingerEdit.disabled =
        !state.selectedFinger ||
        !fingerEditInstruction.value.trim();
}
function highlightSelectedNail() {
    const graphic =
        generatedNailGraphic.querySelector(
            "svg"
        );
    if (!graphic) {
        return;
    }
    generatedNailGraphic.classList.add(
        "has-finger-selection"
    );
    graphic
        .querySelectorAll("[data-finger]")
        .forEach((element) => {
            element.classList.toggle(
                "is-selected",
                element.dataset.finger ===
                    state.selectedFinger
            );
        });
}
function bindGraphicFingerClick() {
    generatedNailGraphic
        .querySelectorAll("[data-finger]")
        .forEach((element) => {
            element.style.cursor = "pointer";
            element.addEventListener(
                "click",
                () => {
                    selectFinger(
                        element.dataset.finger
                    );
                }
            );
        });
}
async function editSelectedNail() {
    if (!state.selectedFinger) {
        showStatus(
            "수정할 손톱을 선택해 주세요.",
            "error"
        );
        return;
    }
    const instruction =
        fingerEditInstruction.value.trim();
    if (!instruction) {
        showStatus(
            "수정 요청을 입력해 주세요.",
            "error"
        );
        return;
    }
    if (
        !state.generated.graphic
            .trim()
            .startsWith("<svg")
    ) {
        showStatus(
            "손가락별 수정은 SVG 그래픽에서만 사용할 수 있습니다.",
            "error"
        );
        return;
    }
    const password =
        getAdminPassword();
    state.fingerEditController =
        new AbortController();
    applyFingerEdit.disabled = true;
    fingerButtons.forEach((button) => {
        button.disabled = true;
    });
    clearFingerSelection.disabled = true;
    fingerEditProgressController.reset();
    fingerEditProgressController.start();
    try {
        const compressedPhotos =
            await Promise.all(
                state.originalFiles.map(
                    (file) =>
                        compressImage(
                            file,
                            {
                                maxDimension: 1200,
                                targetBytes:
                                    TARGET_IMAGE_BYTES
                            }
                        )
                )
            );
        const response = await fetch(
            EDIT_NAIL_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "x-admin-password":
                        password
                },
                body: JSON.stringify({
                    graphic:
                        state.generated.graphic,
                    finger:
                        state.selectedFinger,
                    instruction,
                    photos:
                        compressedPhotos
                }),
                signal:
                    state.fingerEditController.signal
            }
        );
        const result =
            await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                resetAdminPassword();
            }
            throw new Error(
                result.error ||
                "손톱 그래픽 수정에 실패했습니다."
            );
        }
        state.generated.graphic =
            result.graphicSvg;
        fingerEditProgressController.complete(
            "선택한 손톱 수정이 완료되었습니다."
        );
        renderGraphic(
            generatedNailGraphic,
            state.generated.graphic
        );
        bindGraphicFingerClick();
        highlightSelectedNail();
        updateArchivePreview();
        await wait(350);
        showStatus(
            `${fingerLabels[state.selectedFinger]} 그래픽을 수정했습니다.`,
            "success"
        );
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }
        console.error(error);
        showStatus(
            error.message,
            "error"
        );
    } finally {
        state.fingerEditController = null;
        fingerButtons.forEach((button) => {
            button.disabled = false;
        });
        clearFingerSelection.disabled = false;
        fingerEditProgressController.reset();
        updateFingerEditButton();
    }
}
function getGeneratedColorValues() {
    return [
        ...generatedColors.querySelectorAll(
            ".generatedColor"
        )
    ]
        .map((item) => {
            return item.dataset.color;
        })
        .filter(Boolean);
}
function renderGeneratedColors() {
    generatedColors.replaceChildren();
    state.generated.colors.forEach(
        (color, index) => {
            const item =
                document.createElement("div");
            item.className = "generatedColor";
            item.dataset.color = color;
            item.style.background = color;
            const picker =
                document.createElement("input");
            picker.type = "color";
            picker.value = color;
            picker.setAttribute(
                "aria-label",
                `대표 컬러 ${index + 1}`
            );
            picker.addEventListener(
                "input",
                () => {
                    item.dataset.color =
                        picker.value;
                    item.style.background =
                        picker.value;
                    syncGeneratedState();
                    updateArchivePreview();
                }
            );
            const remove =
                document.createElement("button");
            remove.className =
                "generatedColor__remove";
            remove.type = "button";
            remove.textContent = "×";
            remove.setAttribute(
                "aria-label",
                `대표 컬러 ${index + 1} 삭제`
            );
            remove.addEventListener(
                "click",
                () => {
                    item.remove();
                    syncGeneratedState();
                    updateArchivePreview();
                }
            );
            item.append(picker, remove);
            generatedColors.append(item);
        }
    );
}
function addColor() {
    const current =
        getGeneratedColorValues();
    if (current.length >= 8) {
        showStatus(
            "대표 컬러는 최대 8개까지 등록할 수 있습니다.",
            "error"
        );
        return;
    }
    current.push("#D7B0F5");
    state.generated.colors = current;
    renderGeneratedColors();
    updateArchivePreview();
}
function syncGeneratedState() {
    state.generated.shape =
        generatedShape.value.trim();
    state.generated.finish =
        normalizeFinish(
            generatedFinish.value
        );
    state.generated.colors =
        getGeneratedColorValues();
}
/* ==========================================================
   17. ARCHIVE PREVIEW
========================================================== */
function createPreviewHTML() {
    const data = getFormData();
    const finishHTML = data.finish
        .map((item) => {
            return `
                <span class="tag">
                    ${escapeHTML(item)}
                </span>
            `;
        })
        .join("");
    const colorsHTML = data.colors
        .map((color) => {
            return `
                <i
                    class="color"
                    style="background:${escapeHTML(color)}"
                ></i>
            `;
        })
        .join("");
    const graphic = data.graphic.trim();
    const graphicHTML =
        graphic.startsWith("<svg")
            ? graphic
            : `
                <img
                    src="${escapeHTML(graphic)}"
                    alt=""
                >
            `;
    const referenceHTML =
        data.reference
            ? `
                <img
                    class="reference"
                    src="${data.reference}"
                    alt=""
                >
            `
            : "";
    const originalHTML =
        data.photos
            .slice(0, 3)
            .map((photo) => {
                return `
                    <img
                        src="${photo}"
                        alt=""
                    >
                `;
            })
            .join("");
    return `
        <!doctype html>
        <html lang="ko">
        <head>
            <meta charset="utf-8">
            <meta
                name="viewport"
                content="width=device-width,initial-scale=1"
            >
            <style>
                * {
                    box-sizing: border-box;
                }
                body {
                    margin: 0;
                    padding: 34px;
                    color: #1d1d1f;
                    background: #ffffff;
                    font-family:
                        -apple-system,
                        BlinkMacSystemFont,
                        "Apple SD Gothic Neo",
                        Arial,
                        sans-serif;
                }
                .date {
                    margin-bottom: 8px;
                    color: #888;
                    font-size: 11px;
                    font-weight: 700;
                }
                h1 {
                    margin: 0 0 36px;
                    font-size: clamp(38px,6vw,70px);
                    line-height: .92;
                    letter-spacing: -.07em;
                }
                section {
                    padding: 25px 0;
                    border-top: 1px solid #e9e9ee;
                }
                h2 {
                    margin: 0 0 18px;
                    color: #888;
                    font-size: 10px;
                    letter-spacing: .14em;
                }
                .graphic {
                    min-height: 280px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                    background: #fafafc;
                }
                .graphic svg,
                .graphic img {
                    width: 100%;
                    max-height: 280px;
                    object-fit: contain;
                }
                .meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 18px;
                    margin-top: 18px;
                }
                .meta > div {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .label {
                    color: #888;
                    font-size: 9px;
                    font-weight: 800;
                }
                .tag {
                    display: inline-block;
                    margin-right: 5px;
                    padding: 5px 8px;
                    border: 1px solid #ddd;
                    border-radius: 99px;
                    font-size: 9px;
                }
                .colors {
                    display: flex;
                    gap: 5px;
                }
                .color {
                    width: 22px;
                    height: 22px;
                    border-radius: 50%;
                }
                .story {
                    display: grid;
                    grid-template-columns:
                        minmax(100px,150px)
                        1fr;
                    gap: 20px;
                }
                .reference {
                    width: 100%;
                    aspect-ratio: 1;
                    object-fit: cover;
                    border-radius: 14px;
                }
                .memo {
                    margin: 0;
                    line-height: 1.75;
                    white-space: pre-line;
                }
                .photos {
                    display: grid;
                    grid-template-columns:
                        repeat(3,1fr);
                    gap: 8px;
                }
                .photos img {
                    width: 100%;
                    height: 180px;
                    object-fit: cover;
                    border-radius: 12px;
                }
                @media(max-width:560px) {
                    body {
                        padding: 20px;
                    }
                    .story {
                        grid-template-columns: 1fr;
                    }
                    .photos {
                        grid-template-columns:
                            repeat(2,1fr);
                    }
                }
            </style>
        </head>
        <body>
            <p class="date">
                ${escapeHTML(data.date)}
            </p>
            <h1>
                ${escapeHTML(data.title || "UNTITLED")}
            </h1>
            <section>
                <h2>NAIL GRAPHIC</h2>
                <div class="graphic">
                    ${graphicHTML}
                </div>
                <div class="meta">
                    <div>
                        <span class="label">
                            SHAPE
                        </span>
                        <strong>
                            ${escapeHTML(data.shape || "-")}
                        </strong>
                    </div>
                    <div>
                        <span class="label">
                            FINISH
                        </span>
                        <div>
                            ${finishHTML}
                        </div>
                    </div>
                    <div>
                        <span class="label">
                            COLOR
                        </span>
                        <div class="colors">
                            ${colorsHTML}
                        </div>
                    </div>
                </div>
            </section>
            <section>
                <h2>INSPIRATION</h2>
                <div class="story">
                    ${referenceHTML}
                    <p class="memo">
                        ${escapeHTML(data.memo)}
                    </p>
                </div>
            </section>
            <section>
                <h2>MY ORIGINAL PHOTO</h2>
                <div class="photos">
                    ${originalHTML}
                </div>
            </section>
        </body>
        </html>
    `;
}
function updateArchivePreview() {
    syncGeneratedState();
    archivePreviewFrame.srcdoc =
        createPreviewHTML();
}
/* ==========================================================
   18. PUBLISH SUMMARY
========================================================== */
function updatePublishSummary() {
    syncGeneratedState();
    const data = getFormData();
    renderGraphic(
        publishGraphicPreview,
        data.graphic
    );
    publishDate.textContent =
        data.date || "-";
    publishTitle.textContent =
        data.title || "UNTITLED";
    publishShape.textContent =
        data.shape || "-";
    publishFinish.textContent =
        data.finish.join(" · ") || "-";
    publishPhotoCount.textContent =
        `${data.photos.length}장`;
    confirmPublish.checked = false;
    publishArchive.disabled = true;
}
/* ==========================================================
   19. PUBLISH API
========================================================== */
async function publishToArchive() {
    if (!confirmPublish.checked) {
        showStatus(
            "게시 전 확인 항목에 체크해 주세요.",
            "error"
        );
        return;
    }
    const password = getAdminPassword();
    state.publishController =
        new AbortController();
    publishArchive.disabled = true;
    backToPreview.disabled = true;
    publishProgressController.reset();
    publishProgressController.start();
    try {
        const data = getFormData();
        const compressedPhotos =
            await Promise.all(
                state.originalFiles.map(
                    (file) => {
                        return compressImage(
                            file,
                            {
                                maxDimension: 1200,
                                targetBytes:
                                    TARGET_IMAGE_BYTES
                            }
                        );
                    }
                )
            );
        let compressedReference = "";
        if (state.inspirationFile) {
            compressedReference =
                await compressImage(
                    state.inspirationFile,
                    {
                        maxDimension: 1200,
                        targetBytes:
                            TARGET_IMAGE_BYTES
                    }
                );
        }
        const payload = {
            ...data,
            photos:
                compressedPhotos,
            reference:
                compressedReference
        };
        assertPayloadSize(payload);
        const response = await fetch(
            PUBLISH_ENDPOINT,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    "x-admin-password":
                        password
                },
                body: JSON.stringify(payload),
                signal:
                    state.publishController.signal
            }
        );
        const result = await response.json();
        if (!response.ok) {
            if (response.status === 401) {
                resetAdminPassword();
            }
            throw new Error(
                result.error ||
                "GitHub 게시에 실패했습니다."
            );
        }
        publishProgressController.complete(
            "아카이브 게시가 완료되었습니다."
        );
        await wait(500);
        showPublishSuccess(result);
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }
        console.error(error);
        showStatus(
            error.message,
            "error"
        );
        publishArchive.disabled = false;
        backToPreview.disabled = false;
    } finally {
        state.publishController = null;
    }
}
function showPublishSuccess(result) {
    archiveForm.hidden = true;
    publishSuccess.hidden = false;
    progressItems.forEach((item) => {
        item.classList.remove("is-active");
        item.classList.add("is-complete");
    });
    publishSuccessCommit.textContent =
        result.commit
            ? `Commit ${result.commit}`
            : "GitHub update completed";
    if (result.url) {
        viewPublishedArchive.href = result.url;
    }
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
/* ==========================================================
   20. RESET
========================================================== */
function resetForm() {
    archiveForm.reset();
    state.currentStep = 1;
    state.originalFiles = [];
    state.inspirationFile = null;
    state.originalImages = [];
    state.inspirationImage = "";
    state.generated = {
        shape: "",
        finish: [],
        colors: [],
        graphic: ""
    };
    state.removeTarget = null;
    state.selectedFinger = "";
    state.fingerEditController?.abort();
    state.fingerEditController = null;
    state.processingMode = "manual";
    state.manual = {
        shape: "",
        finish: [],
        colors: [
            "#D7B0F5"
        ],
        graphic: ""
    };
    originalPhotoPreview.replaceChildren();
    inspirationPreview.replaceChildren();
    generatedNailGraphic.replaceChildren();
    generatedColors.replaceChildren();
    originalPhotoCount.textContent =
        `0 / ${MAX_ORIGINAL_FILES}`;
    updateMemoCounter();
    analysisProgressController.reset();
    publishProgressController.reset();
    fingerEditProgressController.reset();
    clearSelectedFinger();
    manualShape.value = "";
    manualFinish.value = "";
    manualSvgCode.value = "";
    manualSvgPreview.replaceChildren();
    manualSvgError.textContent = "";
    manualColorsError.textContent = "";
    manualSvgStatus.textContent =
        "SVG 코드를 입력하세요.";
    manualSvgStatus.classList.remove(
        "is-valid",
        "is-error"
    );
    renderManualColors();
    setProcessingMode("manual");
    archiveForm.hidden = false;
    publishSuccess.hidden = true;
    setDefaultDate();
    setStep(1);
}
/* ==========================================================
   21. DEFAULT DATE
========================================================== */
function setDefaultDate() {
    if (archiveDate.value) {
        return;
    }
    const now = new Date();
    const offset =
        now.getTimezoneOffset() * 60 * 1000;
    const localDate =
        new Date(now.getTime() - offset);
    archiveDate.value =
        localDate
            .toISOString()
            .slice(0, 10);
}
/* ==========================================================
   SYSTEM DIAGNOSTICS
========================================================== */
function createDiagnosticStatus(
    enabled,
    enabledLabel = "READY",
    disabledLabel = "NOT CONFIGURED"
) {
    const status =
        document.createElement("span");
    status.className =
        "diagnosticStatus";
    if (!enabled) {
        status.classList.add(
            "is-disabled"
        );
    }
    status.textContent =
        enabled
            ? enabledLabel
            : disabledLabel;
    return status;
}
function setDiagnosticValue(
    element,
    value
) {
    element.replaceChildren();
    if (
        typeof value === "boolean"
    ) {
        element.append(
            createDiagnosticStatus(value)
        );
        return;
    }
    element.textContent =
        value || "-";
}
function renderDiagnostics(data) {
    diagnosticsLoading.hidden = true;
    diagnosticsResult.hidden = false;
    const summary =
        diagnosticsResult.querySelector(
            ".diagnosticsResult__summary"
        );
    summary.classList.toggle(
        "is-error",
        !data.ok
    );
    diagnosticsStatusIcon.textContent =
        data.ok
            ? "✓"
            : "!";
    diagnosticsStatusTitle.textContent =
        data.ok
            ? "시스템이 준비되었습니다."
            : "일부 설정이 필요합니다.";
    diagnosticsStatusDescription.textContent =
        data.ok
            ? "아카이브 분석과 GitHub 게시 기능을 사용할 수 있습니다."
            : "누락된 환경변수를 등록한 후 Vercel에서 다시 배포해 주세요.";
    setDiagnosticValue(
        diagnosticArchive,
        data.capabilities?.archive
    );
    setDiagnosticValue(
        diagnosticAI,
        data.capabilities?.aiAnalysis
    );
    setDiagnosticValue(
        diagnosticFingerEditor,
        data.capabilities?.fingerEditing
    );
    setDiagnosticValue(
        diagnosticPublish,
        data.capabilities?.githubPublishing
    );
    setDiagnosticValue(
        diagnosticRepository,
        data.repository
    );
    setDiagnosticValue(
        diagnosticBranch,
        data.branch
    );
    setDiagnosticValue(
        diagnosticEnvironment,
        data.environment
    );
    const missing =
        Array.isArray(data.missing)
            ? data.missing
            : [];
    missingVariables.hidden =
        !missing.length;
    missingVariablesList.replaceChildren();
    missing.forEach((name) => {
        const item =
            document.createElement("li");
        item.textContent = name;
        missingVariablesList.append(item);
    });
}
async function loadDiagnostics() {
    diagnosticsLoading.hidden = false;
    diagnosticsResult.hidden = true;
    try {
        const response =
            await fetch(
                HEALTH_ENDPOINT,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );
        const result =
            await response.json();
        renderDiagnostics(result);
    } catch (error) {
        console.error(error);
        renderDiagnostics({
            ok: false,
            capabilities: {
                archive: true,
                aiAnalysis: false,
                fingerEditing: false,
                githubPublishing: false
            },
            repository: "",
            branch: "",
            environment: "unknown",
            missing: [
                "HEALTH API UNAVAILABLE"
            ]
        });
    }
}
async function showDiagnostics() {
    diagnosticsDialog.showModal();
    document.body.classList.add(
        "is-locked"
    );
    await loadDiagnostics();
}
function hideDiagnostics() {
    diagnosticsDialog.close();
    document.body.classList.remove(
        "is-locked"
    );
}
/* ==========================================================
   MANUAL MODE
========================================================== */
function setProcessingMode(mode) {
    state.processingMode = mode;

    const isAI =
        mode === "ai";

    aiMode.checked = isAI;
    manualMode.checked = !isAI;

    aiModePanel.hidden = !isAI;
    manualModePanel.hidden = isAI;

    hideStatus();
}


function normalizeManualFinish(value) {
    return String(value || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8);
}


function getManualColorValues() {
    return [
        ...manualColors.querySelectorAll(
            ".generatedColor"
        )
    ]
        .map((item) => {
            return item.dataset.color;
        })
        .filter(Boolean);
}


function syncManualState() {
    state.manual.shape =
        manualShape.value.trim();

    state.manual.finish =
        normalizeManualFinish(
            manualFinish.value
        );

    state.manual.colors =
        getManualColorValues();

    state.manual.graphic =
        manualSvgCode.value.trim();
}


function renderManualColors() {
    manualColors.replaceChildren();

    state.manual.colors.forEach(
        (color, index) => {
            const item =
                document.createElement("div");

            item.className = "generatedColor";
            item.dataset.color = color;
            item.style.background = color;

            const picker =
                document.createElement("input");

            picker.type = "color";
            picker.value = color;

            picker.setAttribute(
                "aria-label",
                `수동 대표 컬러 ${index + 1}`
            );

            picker.addEventListener(
                "input",
                () => {
                    item.dataset.color =
                        picker.value;

                    item.style.background =
                        picker.value;

                    syncManualState();
                }
            );

            const remove =
                document.createElement("button");

            remove.className =
                "generatedColor__remove";

            remove.type = "button";
            remove.textContent = "×";

            remove.setAttribute(
                "aria-label",
                `수동 대표 컬러 ${index + 1} 삭제`
            );

            remove.addEventListener(
                "click",
                () => {
                    item.remove();

                    syncManualState();

                    manualColorsError.textContent =
                        "";
                }
            );

            item.append(
                picker,
                remove
            );

            manualColors.append(item);
        }
    );
}


function addManualColorChip() {
    const colors =
        getManualColorValues();

    if (colors.length >= 8) {
        manualColorsError.textContent =
            "대표 컬러는 최대 8개까지 등록할 수 있습니다.";

        return;
    }

    colors.push("#D7B0F5");

    state.manual.colors =
        colors;

    renderManualColors();

    manualColorsError.textContent = "";
}


function sanitizeManualSVG(svg) {
    let cleaned =
        String(svg || "")
            .trim()
            .replace(
                /^```(?:svg|xml)?\s*/i,
                ""
            )
            .replace(
                /```$/i,
                ""
            )
            .trim();

    const start =
        cleaned.indexOf("<svg");

    const end =
        cleaned.lastIndexOf(
            "</svg>"
        );

    if (
        start === -1 ||
        end === -1
    ) {
        throw new Error(
            "완전한 SVG 문서를 입력해 주세요."
        );
    }

    cleaned = cleaned.slice(
        start,
        end + 6
    );

    const forbiddenPatterns = [
        /<script[\s\S]*?<\/script>/gi,
        /<foreignObject[\s\S]*?<\/foreignObject>/gi,
        /<iframe[\s\S]*?<\/iframe>/gi,
        /<object[\s\S]*?<\/object>/gi,
        /<embed[\s\S]*?>/gi,

        /\son[a-z]+\s*=\s*"[^"]*"/gi,
        /\son[a-z]+\s*=\s*'[^']*'/gi,
        /\son[a-z]+\s*=\s*[^\s>]+/gi,

        /javascript:/gi,

        /\bhref\s*=\s*["']https?:[^"']*["']/gi,
        /\bxlink:href\s*=\s*["']https?:[^"']*["']/gi,

        /\bhref\s*=\s*["']data:[^"']*["']/gi,
        /\bxlink:href\s*=\s*["']data:[^"']*["']/gi
    ];

    forbiddenPatterns.forEach(
        (pattern) => {
            cleaned =
                cleaned.replace(
                    pattern,
                    ""
                );
        }
    );

    if (cleaned.length > 300000) {
        throw new Error(
            "SVG 코드가 너무 큽니다."
        );
    }

    return cleaned;
}


function validateManualFingerGroups(svg) {
    const missing = [];

    for (
        const fingerId
        of REQUIRED_FINGER_IDS
    ) {
        const escaped =
            fingerId.replace(
                /[-/\\^$*+?.()|[\]{}]/g,
                "\\$&"
            );

        const pattern =
            new RegExp(
                `<g\\b(?=[^>]*\\bid\\s*=\\s*["']${escaped}["'])(?=[^>]*\\bdata-finger\\s*=\\s*["']${escaped}["'])[^>]*>`,
                "i"
            );

        if (!pattern.test(svg)) {
            missing.push(fingerId);
        }
    }

    const attributes =
        svg.match(
            /\bdata-finger\s*=\s*["'][^"']+["']/gi
        ) || [];

    if (missing.length) {
        throw new Error(
            `손가락 그룹이 누락되었습니다: ${missing.join(", ")}`
        );
    }

    if (
        attributes.length !==
        REQUIRED_FINGER_IDS.length
    ) {
        throw new Error(
            "data-finger 그룹은 정확히 10개여야 합니다."
        );
    }

    return svg;
}


function renderManualSVGPreview() {
    manualSvgPreview.replaceChildren();

    manualSvgError.textContent = "";

    const rawSVG =
        manualSvgCode.value.trim();

    if (!rawSVG) {
        manualSvgStatus.textContent =
            "SVG 코드를 입력하세요.";

        manualSvgStatus.classList.remove(
            "is-valid",
            "is-error"
        );

        return false;
    }

    try {
        const sanitized =
            sanitizeManualSVG(
                rawSVG
            );

        validateManualFingerGroups(
            sanitized
        );

        manualSvgCode.value =
            sanitized;

        state.manual.graphic =
            sanitized;

        manualSvgPreview.innerHTML =
            sanitized;

        manualSvgStatus.textContent =
            "SVG 구조가 정상입니다.";

        manualSvgStatus.classList.remove(
            "is-error"
        );

        manualSvgStatus.classList.add(
            "is-valid"
        );

        return true;
    } catch (error) {
        manualSvgStatus.textContent =
            "SVG를 확인해 주세요.";

        manualSvgStatus.classList.remove(
            "is-valid"
        );

        manualSvgStatus.classList.add(
            "is-error"
        );

        manualSvgError.textContent =
            error.message;

        return false;
    }
}


function readTextFile(file) {
    return new Promise(
        (resolve, reject) => {
            const reader =
                new FileReader();

            reader.onload = () => {
                resolve(
                    String(
                        reader.result || ""
                    )
                );
            };

            reader.onerror = () => {
                reject(
                    new Error(
                        "SVG 파일을 읽지 못했습니다."
                    )
                );
            };

            reader.readAsText(file);
        }
    );
}


async function handleManualSVGFile(files) {
    const file = files[0];

    if (!file) {
        return;
    }

    const isSVG =
        file.type === "image/svg+xml" ||
        /\.svg$/i.test(file.name);

    if (!isSVG) {
        manualSvgError.textContent =
            "SVG 파일만 업로드할 수 있습니다.";

        return;
    }

    if (
        file.size >
        300000
    ) {
        manualSvgError.textContent =
            "SVG 파일은 300KB 이하여야 합니다.";

        return;
    }

    try {
        const content =
            await readTextFile(file);

        manualSvgCode.value =
            content;

        renderManualSVGPreview();
    } catch (error) {
        manualSvgError.textContent =
            error.message;
    }
}


function validateManualMode() {
    syncManualState();

    let valid = true;

    setFieldError(manualShape);
    setFieldError(manualFinish);

    manualColorsError.textContent = "";
    manualSvgError.textContent = "";

    if (!state.manual.shape) {
        setFieldError(
            manualShape,
            "Shape를 입력해 주세요."
        );

        valid = false;
    }

    if (!state.manual.finish.length) {
        setFieldError(
            manualFinish,
            "Finish를 한 개 이상 입력해 주세요."
        );

        valid = false;
    }

    if (!state.manual.colors.length) {
        manualColorsError.textContent =
            "대표 컬러를 한 개 이상 추가해 주세요.";

        valid = false;
    }

    if (!renderManualSVGPreview()) {
        valid = false;
    }

    if (!valid) {
        showStatus(
            "수동 입력 항목을 확인해 주세요.",
            "error"
        );
    }

    return valid;
}


function applyManualResult() {
    syncManualState();

    state.generated = {
        shape:
            state.manual.shape,

        finish:
            [...state.manual.finish],

        colors:
            [...state.manual.colors],

        graphic:
            state.manual.graphic
    };

    renderGeneratedResult();
    setStep(3);
}
/* ==========================================================
   22. EVENTS
========================================================== */
statusMessageClose.addEventListener(
    "click",
    hideStatus
);
archiveMemo.addEventListener(
    "input",
    updateMemoCounter
);
archiveDate.addEventListener(
    "input",
    () => setFieldError(archiveDate)
);
archiveMemo.addEventListener(
    "input",
    () => setFieldError(archiveMemo)
);
setupDropzone(
    originalDropzone,
    originalPhotos,
    addOriginalFiles
);
setupDropzone(
    inspirationDropzone,
    inspirationImage,
    setInspirationFile
);
goToAnalyze.addEventListener(
    "click",
    () => {
        if (!validateInputStep()) {
            return;
        }
        updateInputSummary();
        setStep(2);
    }
);
backToInput.addEventListener(
    "click",
    () => setStep(1)
);
startAnalyze.addEventListener(
    "click",
    () => analyzeArchive()
);
cancelAnalyze.addEventListener(
    "click",
    cancelAnalysis
);
regenerateGraphic.addEventListener(
    "click",
    async () => {
        setStep(2);
        await analyzeArchive({
            regenerateOnly: true
        });
    }
);
generatedShape.addEventListener(
    "input",
    () => {
        syncGeneratedState();
        updateArchivePreview();
    }
);
generatedFinish.addEventListener(
    "input",
    () => {
        syncGeneratedState();
        updateArchivePreview();
    }
);
addGeneratedColor.addEventListener(
    "click",
    addColor
);
backToAnalyze.addEventListener(
    "click",
    () => setStep(2)
);
goToPublish.addEventListener(
    "click",
    () => {
        updatePublishSummary();
        setStep(4);
    }
);
backToPreview.addEventListener(
    "click",
    () => setStep(3)
);
confirmPublish.addEventListener(
    "change",
    () => {
        publishArchive.disabled =
            !confirmPublish.checked;
    }
);
archiveForm.addEventListener(
    "submit",
    async (event) => {
        event.preventDefault();
        await publishToArchive();
    }
);
cancelRemoveImage.addEventListener(
    "click",
    closeRemoveDialog
);
confirmRemoveImage.addEventListener(
    "click",
    removeSelectedImage
);
removeImageDialog.addEventListener(
    "click",
    (event) => {
        if (
            event.target ===
            removeImageDialog
        ) {
            closeRemoveDialog();
        }
    }
);
createAnotherArchive.addEventListener(
    "click",
    resetForm
);
fingerButtons.forEach((button) => {
    button.setAttribute(
        "aria-pressed",
        "false"
    );
    button.addEventListener(
        "click",
        () => {
            selectFinger(
                button.dataset.finger
            );
        }
    );
});
clearFingerSelection.addEventListener(
    "click",
    clearSelectedFinger
);
fingerEditInstruction.addEventListener(
    "input",
    updateFingerEditButton
);
applyFingerEdit.addEventListener(
    "click",
    editSelectedNail
);
openDiagnostics.addEventListener(
    "click",
    showDiagnostics
);
closeDiagnostics.addEventListener(
    "click",
    hideDiagnostics
);
doneDiagnostics.addEventListener(
    "click",
    hideDiagnostics
);
refreshDiagnostics.addEventListener(
    "click",
    loadDiagnostics
);
diagnosticsDialog.addEventListener(
    "click",
    (event) => {
        if (
            event.target ===
            diagnosticsDialog
        ) {
            hideDiagnostics();
        }
    }
);
aiMode.addEventListener(
    "change",
    () => {
        if (aiMode.checked) {
            setProcessingMode("ai");
        }
    }
);
manualMode.addEventListener(
    "change",
    () => {
        if (manualMode.checked) {
            setProcessingMode("manual");
        }
    }
);
manualShape.addEventListener(
    "input",
    () => {
        syncManualState();
        setFieldError(manualShape);
    }
);
manualFinish.addEventListener(
    "input",
    () => {
        syncManualState();
        setFieldError(manualFinish);
    }
);
addManualColor.addEventListener(
    "click",
    addManualColorChip
);
manualSvgCode.addEventListener(
    "input",
    () => {
        state.manual.graphic =
            manualSvgCode.value.trim();

        manualSvgStatus.textContent =
            "변경사항을 확인하고 있습니다.";

        manualSvgStatus.classList.remove(
            "is-valid",
            "is-error"
        );

        window.clearTimeout(
            manualSvgCode.previewTimer
        );

        manualSvgCode.previewTimer =
            window.setTimeout(
                renderManualSVGPreview,
                350
            );
    }
);
clearManualSvg.addEventListener(
    "click",
    () => {
        manualSvgCode.value = "";
        state.manual.graphic = "";

        manualSvgPreview.replaceChildren();

        manualSvgError.textContent = "";

        manualSvgStatus.textContent =
            "SVG 코드를 입력하세요.";

        manualSvgStatus.classList.remove(
            "is-valid",
            "is-error"
        );
    }
);
setupDropzone(
    manualSvgDropzone,
    manualSvgFile,
    handleManualSVGFile
);
manualBackToInput.addEventListener(
    "click",
    () => setStep(1)
);
continueManualMode.addEventListener(
    "click",
    () => {
        if (!validateManualMode()) {
            return;
        }

        applyManualResult();
    }
);
/* ==========================================================
   23. INIT
========================================================== */
function initializeAdmin() {
    setDefaultDate();
    updateMemoCounter();

    renderManualColors();
    setProcessingMode("manual");

    setStep(1);
}
initializeAdmin();
