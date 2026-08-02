/* ==========================================================
   NAILY ADMIN v2
========================================================== */
 
 
/* ==========================================================
   STATE
========================================================== */
 
const state = {
 
    currentStep: 1,
 
    originalPhotos: [],
 
    inspiration: null,
 
    graphic: null,
 
    colors: [
        "#F7D4E2"
    ],
 
    previewData: null,
 
    publishing: false
 
};
 
 
/* ==========================================================
   CONSTANTS
========================================================== */
 
const PASSWORD_KEY =
    "naily-admin-password";
 
 
/* ==========================================================
   DOM
========================================================== */
 
const $ = (selector) =>
    document.querySelector(selector);
 
const $$ = (selector) =>
    [...document.querySelectorAll(selector)];
 
 
/* Login */
 
const loginOverlay =
    $("#loginOverlay");
 
const loginForm =
    $("#loginForm");
 
const loginPassword =
    $("#loginPassword");
 
const loginError =
    $("#loginError");
 
 
/* Form */
 
const form =
    $("#archiveForm");
 
const steps =
    $$(".formStep");
 
const indicators =
    $$("[data-step-indicator]");
 
 
/* Step Buttons */
 
const btnRecordNext =
    $("#goToGraphic");
 
const btnGraphicBack =
    $("#backToRecord");
 
const btnGraphicNext =
    $("#goToDetails");
 
const btnDetailBack =
    $("#backToGraphic");
 
const btnPreview =
    $("#goToPreview");
 
const btnPreviewBack =
    $("#backToDetails");
 
const btnPublishStep =
    $("#goToPublish");
 
const btnPublishBack =
    $("#backToPreview");
 
 
/* Inputs */
 
const archiveDate =
    $("#archiveDate");
 
const archiveTitle =
    $("#archiveTitle");
 
const archiveMemo =
    $("#archiveMemo");
 
const archiveShape =
    $("#archiveShape");
 
const archiveFinish =
    $("#archiveFinish");
 
 
/* Upload */
 
const originalInput =
    $("#originalPhotos");
 
const inspirationInput =
    $("#inspirationImage");
 
const graphicInput =
    $("#nailGraphic");
 
 
/* Preview */
 
const originalPreview =
    $("#originalPhotoPreview");
 
const inspirationPreview =
    $("#inspirationPreview");
 
const graphicPreviewSection =
    $("#graphicPreviewSection");
 
const graphicPreviewImage =
    $("#graphicPreviewImage");
 
 
/* Publish */
 
const publishCheck =
    $("#confirmPublish");
 
const publishButton =
    $("#publishArchive");
 
 
/* Progress */
 
const publishProgress =
    $("#publishProgress");
 
const progressBar =
    $("#publishProgressBar");
 
const progressValue =
    $("#publishProgressValue");
 
const progressLabel =
    $("#publishProgressLabel");
 
 
/* Status */
 
const statusMessage =
    $("#statusMessage");
 
const statusText =
    $("#statusMessageText");
 
 
/* Colors */
 
const colorList =
    $("#colorList");
 
const addColorButton =
    $("#addColor");
 
 
/* ==========================================================
   LOGIN
========================================================== */
 
function getPassword() {
 
    return sessionStorage.getItem(
        PASSWORD_KEY
    );
 
}
 
function savePassword(password) {
 
    sessionStorage.setItem(
        PASSWORD_KEY,
        password
    );
 
}
 
function clearPassword() {
 
    sessionStorage.removeItem(
        PASSWORD_KEY
    );
 
}
 
function showLogin(message = "") {
 
    loginOverlay.hidden = false;
 
    loginError.textContent = message;
 
    loginPassword.focus();
 
}
 
function hideLogin() {
 
    loginOverlay.hidden = true;
 
}
 
loginForm.addEventListener(
 
    "submit",
 
    (event) => {
 
        event.preventDefault();
 
        const password =
            loginPassword.value.trim();
 
        if (!password) {
 
            loginError.textContent =
                "비밀번호를 입력하세요.";
 
            return;
 
        }
 
        savePassword(password);
 
        loginPassword.value = "";
 
        loginError.textContent = "";
 
        hideLogin();
 
    }
 
);
 
 
/* ==========================================================
   STEP
========================================================== */
 
function setStep(step) {
 
    state.currentStep = step;
 
    steps.forEach((section) => {
 
        const current =
 
            Number(
                section.dataset.step
            ) === step;
 
        section.hidden =
            !current;
 
        section.classList.toggle(
            "is-active",
            current
        );
 
    });
 
    indicators.forEach((item) => {
 
        item.classList.toggle(
 
            "is-active",
 
            Number(
                item.dataset.stepIndicator
            ) === step
 
        );
 
    });
 
    window.scrollTo({
 
        top: 0,
 
        behavior: "smooth"
 
    });
 
}
 
 
/* ==========================================================
   STATUS
========================================================== */
 
function showStatus(
 
    message,
 
    error = false
 
) {
 
    statusMessage.hidden = false;
 
    statusText.textContent =
        message;
 
    statusMessage.style.borderColor =
 
        error
 
        ? "#d83d3d"
 
        : "";
 
}
 
function hideStatus() {
 
    statusMessage.hidden = true;
 
}
 
 
/* ==========================================================
   MEMO
========================================================== */
 
archiveMemo.addEventListener(
 
    "input",
 
    () => {
 
        $("#memoCount").textContent =
 
`${archiveMemo.value.length} / 3000`;
 
    }
 
);
 
 
/* ==========================================================
   FILE UTILITIES
========================================================== */
 
function fileToDataURL(file){
 
    return new Promise((resolve,reject)=>{
 
        if(!file){
 
            resolve(null);
            return;
 
        }
 
        const reader=new FileReader();
 
        reader.onload=()=>{
 
            resolve({
 
                name:file.name,
 
                type:file.type,
 
                size:file.size,
 
                data:reader.result
 
            });
 
        };
 
        reader.onerror=reject;
 
        reader.readAsDataURL(file);
 
    });
 
}
 
 
function revokeInput(input){
 
    input.value="";
 
}
 
 
function createImage(src,alt){
 
    const image=document.createElement("img");
 
    image.className="uploadPreview__image";
 
    image.src=src;
 
    image.alt=alt;
 
    return image;
 
}
 
 
function createRemoveButton(handler){
 
    const button=document.createElement("button");
 
    button.type="button";
 
    button.className="uploadPreview__remove";
 
    button.innerHTML="×";
 
    button.addEventListener("click",handler);
 
    return button;
 
}
 
 
/* ==========================================================
   PREVIEW CARD
========================================================== */
 
function createPreviewCard(
 
    file,
 
    onRemove
 
){
 
    const card=document.createElement("div");
 
    card.className="uploadPreview__item";
 
    const reader=new FileReader();
 
    reader.onload=e=>{
 
        card.appendChild(
 
            createImage(
 
                e.target.result,
 
                file.name
 
            )
 
        );
 
    };
 
    reader.readAsDataURL(file);
 
    card.appendChild(
 
        createRemoveButton(onRemove)
 
    );
 
    return card;
 
}
 
 
/* ==========================================================
   ORIGINAL PHOTO
========================================================== */
 
function renderOriginalPhotos(){
 
    originalPreview.innerHTML="";
 
    state.originalPhotos.forEach(
 
        (file,index)=>{
 
            originalPreview.appendChild(
 
                createPreviewCard(
 
                    file,
 
                    ()=>{
 
                        state.originalPhotos.splice(
 
                            index,
 
                            1
 
                        );
 
                        renderOriginalPhotos();
 
                    }
 
                )
 
            );
 
        }
 
    );
 
    $("#originalPhotoCount").textContent=
 
`${state.originalPhotos.length} / 8`;
 
}
 
 
/* ==========================================================
   INSPIRATION
========================================================== */
 
function renderInspiration(){
 
    inspirationPreview.innerHTML="";
 
    if(!state.inspiration){
 
        return;
 
    }
 
    inspirationPreview.appendChild(
 
        createPreviewCard(
 
            state.inspiration,
 
            ()=>{
 
                state.inspiration=null;
 
                revokeInput(
 
                    inspirationInput
 
                );
 
                renderInspiration();
 
            }
 
        )
 
    );
 
}
 
 
/* ==========================================================
   GRAPHIC
========================================================== */
 
function renderGraphic(){
 
    if(!state.graphic){
 
        graphicPreviewSection.hidden=true;
 
        graphicPreviewImage.removeAttribute(
 
            "src"
 
        );
 
        return;
 
    }
 
    const reader=new FileReader();
 
    reader.onload=e=>{
 
        graphicPreviewImage.src=
 
e.target.result;
 
    };
 
    reader.readAsDataURL(
 
        state.graphic
 
    );
 
    graphicPreviewSection.hidden=false;
 
}
 
 
/* ==========================================================
   FILE INPUT
========================================================== */
 
originalInput.addEventListener(
 
    "change",
 
    e=>{
 
        state.originalPhotos=
 
[
 
...e.target.files
 
].slice(0,8);
 
        renderOriginalPhotos();
 
    }
 
);
 
 
inspirationInput.addEventListener(
 
    "change",
 
    e=>{
 
        state.inspiration=
 
e.target.files[0]||null;
 
        renderInspiration();
 
    }
 
);
 
 
graphicInput.addEventListener(
 
    "change",
 
    e=>{
 
        state.graphic=
 
e.target.files[0]||null;
 
        renderGraphic();
 
    }
 
);
 
 
/* ==========================================================
   REMOVE GRAPHIC
========================================================== */
 
$("#removeGraphic")
 
.addEventListener(
 
"click",
 
()=>{
 
    state.graphic=null;
 
    revokeInput(
 
        graphicInput
 
    );
 
    renderGraphic();
 
}
 
);
 
 
/* ==========================================================
   DRAG & DROP
========================================================== */
 
function bindDropzone(
 
    zone,
 
    input,
 
    callback
 
){
 
    zone.addEventListener(
 
        "dragover",
 
        e=>{
 
            e.preventDefault();
 
            zone.classList.add(
 
                "is-dragover"
 
            );
 
        }
 
    );
 
    zone.addEventListener(
 
        "dragleave",
 
        ()=>{
 
            zone.classList.remove(
 
                "is-dragover"
 
            );
 
        }
 
    );
 
    zone.addEventListener(
 
        "drop",
 
        e=>{
 
            e.preventDefault();
 
            zone.classList.remove(
 
                "is-dragover"
 
            );
 
            callback(
 
                [
 
...e.dataTransfer.files
 
]
 
            );
 
        }
 
    );
 
}
 
 
bindDropzone(
 
    $("#originalDropzone"),
 
    originalInput,
 
    files=>{
 
        state.originalPhotos=
 
files.slice(0,8);
 
        renderOriginalPhotos();
 
    }
 
);
 
 
bindDropzone(
 
    $("#inspirationDropzone"),
 
    inspirationInput,
 
    files=>{
 
        state.inspiration=
 
files[0]||null;
 
        renderInspiration();
 
    }
 
);
 
 
bindDropzone(
 
    $("#graphicDropzone"),
 
    graphicInput,
 
    files=>{
 
        state.graphic=
 
files[0]||null;
 
        renderGraphic();
 
    }
 
);
 
 
/* ==========================================================
   COLOR EDITOR
========================================================== */
 
function renderColors(){
 
    colorList.innerHTML="";
 
    state.colors.forEach((color,index)=>{
 
        const item=document.createElement("div");
 
        item.className="colorEditor__item";
 
        const picker=document.createElement("input");
 
        picker.type="color";
 
        picker.className="colorEditor__picker";
 
        picker.value=color;
 
        const hex=document.createElement("input");
 
        hex.type="text";
 
        hex.className="colorEditor__hex";
 
        hex.value=color.toUpperCase();
 
        const remove=document.createElement("button");
 
        remove.type="button";
 
        remove.className="colorEditor__remove";
 
        remove.innerHTML="×";
 
        picker.addEventListener("input",()=>{
 
            state.colors[index]=picker.value.toUpperCase();
 
            hex.value=picker.value.toUpperCase();
 
        });
 
        hex.addEventListener("change",()=>{
 
            const value=hex.value.trim().toUpperCase();
 
            if(!/^#[0-9A-F]{6}$/.test(value)){
 
                hex.value=state.colors[index];
 
                return;
 
            }
 
            state.colors[index]=value;
 
            picker.value=value;
 
        });
 
        remove.addEventListener("click",()=>{
 
            if(state.colors.length===1){
 
                return;
 
            }
 
            state.colors.splice(index,1);
 
            renderColors();
 
        });
 
        item.append(
 
            picker,
 
            hex,
 
            remove
 
        );
 
        colorList.append(item);
 
    });
 
}
 
 
addColorButton.addEventListener(
 
    "click",
 
    ()=>{
 
        if(state.colors.length>=8){
 
            showStatus(
 
                "대표 색상은 최대 8개까지 등록할 수 있습니다.",
 
                true
 
            );
 
            return;
 
        }
 
        state.colors.push("#FFFFFF");
 
        renderColors();
 
    }
 
);
 
 
/* ==========================================================
   VALIDATION
========================================================== */
 
function validateStep(step){
 
    hideStatus();
 
    switch(step){
 
        case 1:
 
            if(!archiveDate.value){
 
                showStatus(
 
                    "날짜를 입력해주세요.",
 
                    true
 
                );
 
                archiveDate.focus();
 
                return false;
 
            }
 
            if(!archiveMemo.value.trim()){
 
                showStatus(
 
                    "메모를 입력해주세요.",
 
                    true
 
                );
 
                archiveMemo.focus();
 
                return false;
 
            }
 
            if(state.originalPhotos.length===0){
 
                showStatus(
 
                    "손 사진을 등록해주세요.",
 
                    true
 
                );
 
                return false;
 
            }
 
            return true;
 
 
        case 2:
 
            if(!state.graphic){
 
                showStatus(
 
                    "네일 그래픽을 업로드해주세요.",
 
                    true
 
                );
 
                return false;
 
            }
 
            return true;
 
 
        case 3:
 
            if(!archiveShape.value.trim()){
 
                showStatus(
 
                    "Shape를 입력해주세요.",
 
                    true
 
                );
 
                archiveShape.focus();
 
                return false;
 
            }
 
            if(!archiveFinish.value.trim()){
 
                showStatus(
 
                    "Finish를 입력해주세요.",
 
                    true
 
                );
 
                archiveFinish.focus();
 
                return false;
 
            }
 
            if(state.colors.length===0){
 
                showStatus(
 
                    "대표 색상을 등록해주세요.",
 
                    true
 
                );
 
                return false;
 
            }
 
            return true;
 
    }
 
    return true;
 
}
 
 
/* ==========================================================
   STEP EVENTS
========================================================== */
 
btnRecordNext.addEventListener(
 
    "click",
 
    ()=>{
 
        if(!validateStep(1)){
 
            return;
 
        }
 
        setStep(2);
 
    }
 
);
 
 
btnGraphicBack.addEventListener(
 
    "click",
 
    ()=>{
 
        setStep(1);
 
    }
 
);
 
 
btnGraphicNext.addEventListener(
 
    "click",
 
    ()=>{
 
        if(!validateStep(2)){
 
            return;
 
        }
 
        setStep(3);
 
    }
 
);
 
 
btnDetailBack.addEventListener(
 
    "click",
 
    ()=>{
 
        setStep(2);
 
    }
 
);
 
 
btnPreview.addEventListener(
 
    "click",
 
    ()=>{
 
        if(!validateStep(3)){
 
            return;
 
        }
 
        buildPreview();
 
        setStep(4);
 
    }
 
);
 
 
btnPreviewBack.addEventListener(
 
    "click",
 
    ()=>{
 
        setStep(3);
 
    }
 
);
 
 
btnPublishStep.addEventListener(
 
    "click",
 
    ()=>{
 
        fillPublishSummary();
 
        setStep(5);
 
    }
 
);
 
 
btnPublishBack.addEventListener(
 
    "click",
 
    ()=>{
 
        setStep(4);
 
    }
 
);
 
 
/* ==========================================================
   PUBLISH ENABLE
========================================================== */
 
publishCheck.addEventListener(
 
    "change",
 
    ()=>{
 
        publishButton.disabled=
 
            !publishCheck.checked ||
 
            state.publishing;
 
    }
 
);
 
 
/* ==========================================================
   PREVIEW
========================================================== */
 
function buildPreview() {
 
    state.previewData = {
 
        date: archiveDate.value,
 
        title:
            archiveTitle.value.trim() ||
            "Untitled Nail",
 
        memo:
            archiveMemo.value.trim(),
 
        shape:
            archiveShape.value.trim(),
 
        finish:
            archiveFinish.value
                .split(",")
                .map(v => v.trim())
                .filter(Boolean),
 
        colors:
            [...state.colors]
 
    };
 
    sessionStorage.setItem(
 
        "naily-preview",
 
        JSON.stringify(state.previewData)
 
    );
 
    const frame =
        $("#archivePreviewFrame");
 
    if (frame) {
 
        frame.src =
            "../preview.html?t=" +
            Date.now();
 
    }
 
}
 
 
/* ==========================================================
   PUBLISH SUMMARY
========================================================== */
 
function fillPublishSummary() {
 
    $("#publishDate").textContent =
        archiveDate.value;
 
    $("#publishTitle").textContent =
        archiveTitle.value.trim() ||
        "Untitled Nail";
 
    $("#publishShape").textContent =
        archiveShape.value;
 
    $("#publishFinish").textContent =
        archiveFinish.value;
 
    $("#publishPhotoCount").textContent =
        `${state.originalPhotos.length} Photos`;
 
    if (!state.graphic) {
 
        return;
 
    }
 
    const reader =
        new FileReader();
 
    reader.onload = e => {
 
        $("#publishGraphic").src =
            e.target.result;
 
    };
 
    reader.readAsDataURL(
        state.graphic
    );
 
}
 
 
/* ==========================================================
   JSON PAYLOAD
========================================================== */
 
async function createJSONPayload() {
 
    const graphic =
        await fileToDataURL(
            state.graphic
        );
 
    const inspiration =
        await fileToDataURL(
            state.inspiration
        );
 
    const photos =
        await Promise.all(
 
            state.originalPhotos.map(
                fileToDataURL
            )
 
        );
 
    return {
 
        date:
            archiveDate.value,
 
        title:
            archiveTitle.value.trim(),
 
        memo:
            archiveMemo.value,
 
        shape:
            archiveShape.value.trim(),
 
        finish:
            archiveFinish.value
                .split(",")
                .map(v => v.trim())
                .filter(Boolean),
 
        colors:
            [...state.colors],
 
        graphic,
 
        inspiration,
 
        photos
 
    };
 
}
 
 
/* ==========================================================
   PROGRESS
========================================================== */
 
function setProgress(percent,label){
 
    publishProgress.hidden=false;
 
    progressBar.style.width=
        `${percent}%`;
 
    progressValue.textContent=
        `${percent}%`;
 
    progressLabel.textContent=
        label;
 
}
 
 
/* ==========================================================
   PUBLISH
========================================================== */
 
form.addEventListener(
 
"submit",
 
async event=>{
 
    event.preventDefault();
 
    if(state.publishing){
 
        return;
 
    }
 
    state.publishing=true;
 
    publishButton.disabled=true;
 
    try{
 
        const payload=
 
            await createJSONPayload();
 
        setProgress(
 
            10,
 
            "Preparing..."
 
        );
 
        const response=
 
            await fetch(
 
                "/api/publish",
 
                {
 
                    method:"POST",
 
                    headers:{
 
                        "Content-Type":
 
                        "application/json",
 
                        "x-admin-password":
 
                        getPassword()
 
                    },
 
                    body:JSON.stringify(
 
                        payload
 
                    )
 
                }
 
            );
 
        setProgress(
 
            70,
 
            "Publishing..."
 
        );
 
        const result=
 
            await response.json();
 
        if(!response.ok){
 
            throw new Error(
 
                result.error ||
 
                "Publish failed."
 
            );
 
        }
 
        setProgress(
 
            100,
 
            "Completed"
 
        );
 
        showPublishSuccess(
 
            result
 
        );
 
    }
 
    catch(error){
 
        if(
 
            error.message.includes(
 
                "관리자"
 
            )
 
        ){
 
            clearPassword();
 
            showLogin(
 
                "비밀번호가 올바르지 않습니다."
 
            );
 
        }else{
 
            showStatus(
 
                error.message,
 
                true
 
            );
 
        }
 
    }
 
    finally{
 
        state.publishing=false;
 
        publishButton.disabled=
 
            !publishCheck.checked;
 
    }
 
}
 
);
 
 
/* ==========================================================
   SUCCESS
========================================================== */
 
function showPublishSuccess(result){
 
    form.hidden=true;
 
    $("#publishSuccess").hidden=false;
 
    $("#publishSuccessCommit").textContent=
 
        result.commit ||
 
        "Published successfully.";
 
}
 
 
/* ==========================================================
   RESET
========================================================== */
 
$("#createAnotherRecord")
 
.addEventListener(
 
"click",
 
()=>{
 
    sessionStorage.removeItem(
 
        "naily-preview"
 
    );
 
    location.reload();
 
}
 
);
 
 
/* ==========================================================
   INIT UI
========================================================== */
 
renderColors();
 
hideStatus();
 
setStep(1);
 
if(getPassword()){
 
    hideLogin();
 
}else{
 
    showLogin();
 
}
 
