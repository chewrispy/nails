/* ==========================================================
   NAILS DONE.
   app.js
========================================================== */
const state = {
    entries: [],
    currentIndex: 0,
    galleryImages: [],
    galleryIndex: 0
};
/* ==========================================================
   DOM
========================================================== */
const detailPage = document.querySelector("#detailPage");
const detailTemplate = document.querySelector("#detailTemplate");
const prevButton = document.querySelector("#prevButton");
const nextButton = document.querySelector("#nextButton");
const pageCounter = document.querySelector("#pageCounter");
const lightbox = document.querySelector("#lightbox");
const lightboxImage = document.querySelector("#lightboxImage");
const lightboxClose = document.querySelector("#lightboxClose");
/* ==========================================================
   UTILITIES
========================================================== */
function escapeHTML(value = "") {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
function formatEntryDate(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return {
            day: "",
            month: "",
            year: ""
        };
    }
    return {
        day: String(date.getDate()).padStart(2, "0"),
        month: date
            .toLocaleString("en-US", { month: "short" })
            .toUpperCase(),
        year: String(date.getFullYear())
    };
}
function normalizeImagePath(path = "") {
    return String(path).trim();
}
function createElement(tag, className = "") {
    const element = document.createElement(tag);
    if (className) {
        element.className = className;
    }
    return element;
}
/* ==========================================================
   DEFAULT NAIL SVG
========================================================== */
function createDefaultNailSVG(colors = []) {
    const palette = colors.length
        ? colors
        : [
            "#9B72FF",
            "#C69AFF",
            "#F1D7EA",
            "#A86CFF",
            "#E2B0F5"
        ];
    const nails = [];
    const nailWidth = 84;
    const nailHeight = 190;
    const gap = 24;
    const handGap = 100;
    let currentX = 0;
    for (let index = 0; index < 10; index += 1) {
        if (index === 5) {
            currentX += handGap;
        }
        const colorA = palette[index % palette.length];
        const colorB = palette[(index + 1) % palette.length];
        nails.push(`
            <g
                class="nailSvgItem"
                transform="translate(${currentX}, 0)"
            >
                <defs>
                    <linearGradient
                        id="nailGradient${index}"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stop-color="${escapeHTML(colorA)}"
                        />
                        <stop
                            offset="58%"
                            stop-color="${escapeHTML(colorB)}"
                        />
                        <stop
                            offset="100%"
                            stop-color="#F8EFF8"
                        />
                    </linearGradient>
                    <filter
                        id="nailShadow${index}"
                        x="-30%"
                        y="-30%"
                        width="160%"
                        height="180%"
                    >
                        <feDropShadow
                            dx="0"
                            dy="14"
                            stdDeviation="10"
                            flood-color="#3A294F"
                            flood-opacity="0.16"
                        />
                    </filter>
                </defs>
                <path
                    d="
                        M ${nailWidth / 2} 0
                        C ${nailWidth * 0.18} 0,
                          0 ${nailHeight * 0.18},
                          0 ${nailHeight * 0.42}
                        L 0 ${nailHeight * 0.76}
                        C 0 ${nailHeight * 0.92},
                          ${nailWidth * 0.18} ${nailHeight},
                          ${nailWidth / 2} ${nailHeight}
                        C ${nailWidth * 0.82} ${nailHeight},
                          ${nailWidth} ${nailHeight * 0.92},
                          ${nailWidth} ${nailHeight * 0.76}
                        L ${nailWidth} ${nailHeight * 0.42}
                        C ${nailWidth} ${nailHeight * 0.18},
                          ${nailWidth * 0.82} 0,
                          ${nailWidth / 2} 0
                        Z
                    "
                    fill="url(#nailGradient${index})"
                    filter="url(#nailShadow${index})"
                />
                <ellipse
                    cx="${nailWidth * 0.34}"
                    cy="${nailHeight * 0.20}"
                    rx="${nailWidth * 0.16}"
                    ry="${nailHeight * 0.15}"
                    fill="rgba(255,255,255,0.55)"
                />
                <circle
                    cx="${nailWidth * 0.30}"
                    cy="${nailHeight * 0.76}"
                    r="3"
                    fill="rgba(255,255,255,0.95)"
                />
                <circle
                    cx="${nailWidth * 0.52}"
                    cy="${nailHeight * 0.70}"
                    r="4"
                    fill="rgba(255,255,255,0.82)"
                />
                <circle
                    cx="${nailWidth * 0.72}"
                    cy="${nailHeight * 0.80}"
                    r="2.5"
                    fill="rgba(255,255,255,0.90)"
                />
            </g>
        `);
        currentX += nailWidth + gap;
    }
    const totalWidth =
        nailWidth * 10 +
        gap * 8 +
        handGap;
    return `
        <svg
            viewBox="0 0 ${totalWidth} ${nailHeight + 30}"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="왼손과 오른손 네일 그래픽"
        >
            ${nails.join("")}
        </svg>
    `;
}
/* ==========================================================
   DATA
========================================================== */
async function loadEntries() {
    const response = await fetch("./data/nails.json", {
        cache: "no-store"
    });
    if (!response.ok) {
        throw new Error(
            `네일 데이터를 불러오지 못했습니다. (${response.status})`
        );
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
        throw new Error(
            "nails.json 데이터 형식이 배열이 아닙니다."
        );
    }
    state.entries = data
        .filter((entry) => entry && entry.date)
        .sort((a, b) => {
            return String(b.date).localeCompare(
                String(a.date)
            );
        });
}
/* ==========================================================
   RENDER
========================================================== */
function renderEntry() {
    const entry = state.entries[state.currentIndex];
    if (!entry) {
        detailPage.innerHTML = `
            <p class="emptyState">
                아직 등록된 네일 기록이 없습니다.
            </p>
        `;
        pageCounter.textContent = "0 / 0";
        prevButton.disabled = true;
        nextButton.disabled = true;
        return;
    }
    const fragment = detailTemplate.content.cloneNode(true);
    const {
        day,
        month,
        year
    } = formatEntryDate(entry.date);
    const entryDate = fragment.querySelector(".entryDate");
    entryDate.dateTime = entry.date;
    fragment.querySelector(
        ".entryDate__day"
    ).textContent = day;
    fragment.querySelector(
        ".entryDate__month"
    ).textContent = month;
    fragment.querySelector(
        ".entryDate__year"
    ).textContent = year;
    fragment.querySelector(
        ".entryHeading__number"
    ).textContent = entry.number
        ? `#${String(entry.number).padStart(2, "0")}`
        : `#${String(
            state.entries.length - state.currentIndex
        ).padStart(2, "0")}`;
    fragment.querySelector(
        ".entryHeading__title"
    ).textContent = entry.title || "";
    renderNailGraphic(fragment, entry);
    renderMeta(fragment, entry);
    renderInspiration(fragment, entry);
    renderOriginalPhotos(fragment, entry);
    detailPage.replaceChildren(fragment);
    updateNavigation();
    bindEntryEvents();
}
function renderNailGraphic(fragment, entry) {
    const container = fragment.querySelector(".nailGraphic");
    if (entry.graphicSvg) {
        container.innerHTML = entry.graphicSvg;
        return;
    }
    if (entry.graphic) {
        const image = createElement(
            "img",
            "nailGraphic__image"
        );
        image.src = normalizeImagePath(entry.graphic);
        image.alt = `${entry.title || "네일"} 그래픽`;
        container.append(image);
        return;
    }
    container.innerHTML = createDefaultNailSVG(
        entry.colors || []
    );
}
function renderMeta(fragment, entry) {
    fragment.querySelector(
        ".nailMeta__shape"
    ).textContent = entry.shape || "-";
    const finishContainer = fragment.querySelector(
        ".nailMeta__finish"
    );
    const finishes = Array.isArray(entry.finish)
        ? entry.finish
        : [];
    if (!finishes.length) {
        finishContainer.textContent = "-";
    } else {
        finishes.forEach((finish) => {
            const tag = createElement(
                "span",
                "finishTag"
            );
            tag.textContent = finish;
            finishContainer.append(tag);
        });
    }
    const colorContainer = fragment.querySelector(
        ".nailMeta__colors"
    );
    const colors = Array.isArray(entry.colors)
        ? entry.colors
        : [];
    if (!colors.length) {
        colorContainer.textContent = "-";
    } else {
        colors.forEach((color) => {
            const chip = createElement(
                "span",
                "colorChip"
            );
            chip.style.background = color;
            chip.dataset.color = color;
            chip.setAttribute(
                "aria-label",
                `대표 컬러 ${color}`
            );
            colorContainer.append(chip);
        });
    }
}
function renderInspiration(fragment, entry) {
    const section = fragment.querySelector(
        ".inspirationSection"
    );
    const imageButton = fragment.querySelector(
        ".inspiration__imageButton"
    );
    const image = fragment.querySelector(
        ".inspiration__image"
    );
    const memo = fragment.querySelector(
        ".inspiration__memo"
    );
    memo.textContent = entry.memo || "";
    if (!entry.inspiration) {
        imageButton.remove();
        if (!entry.memo) {
            section.hidden = true;
        }
        return;
    }
    image.src = normalizeImagePath(entry.inspiration);
    image.alt = `${entry.title || "네일"} 인스퍼레이션 이미지`;
    imageButton.dataset.lightboxSrc = image.src;
    imageButton.dataset.lightboxAlt = image.alt;
}
function renderOriginalPhotos(fragment, entry) {
    const section = fragment.querySelector(
        ".originalSection"
    );
    const mainButton = fragment.querySelector(
        ".originalPhoto__main"
    );
    const mainImage = fragment.querySelector(
        ".originalPhoto__mainImage"
    );
    const previewContainer = fragment.querySelector(
        ".originalPhoto__preview"
    );
    const viewAllButton = fragment.querySelector(
        ".originalSection__more"
    );
    const photos = Array.isArray(entry.photos)
        ? entry.photos.filter(Boolean)
        : [];
    if (!photos.length) {
        section.hidden = true;
        return;
    }
    state.galleryImages = photos.map(
        normalizeImagePath
    );
    mainImage.src = state.galleryImages[0];
    mainImage.alt = `${entry.title || "네일"} 대표 원본 사진`;
    mainButton.dataset.lightboxSrc =
        state.galleryImages[0];
    mainButton.dataset.lightboxAlt =
        mainImage.alt;
    const previews = state.galleryImages.slice(1, 4);
    previews.forEach((photo, index) => {
        const button = createElement(
            "button",
            "originalPreview"
        );
        button.type = "button";
        button.dataset.lightboxSrc = photo;
        button.dataset.lightboxAlt =
            `${entry.title || "네일"} 원본 사진 ${index + 2}`;
        const image = createElement("img");
        image.src = photo;
        image.alt = button.dataset.lightboxAlt;
        button.append(image);
        const hiddenCount =
            state.galleryImages.length - 4;
        if (
            index === previews.length - 1 &&
            hiddenCount > 0
        ) {
            button.classList.add(
                "originalPreview--more"
            );
            button.dataset.more = hiddenCount;
        }
        previewContainer.append(button);
    });
    if (state.galleryImages.length > 1) {
        viewAllButton.hidden = false;
    } else {
        viewAllButton.remove();
    }
}
/* ==========================================================
   NAVIGATION
========================================================== */
function updateNavigation() {
    const total = state.entries.length;
    pageCounter.textContent =
        `${state.currentIndex + 1} / ${total}`;
    const shouldDisable = total <= 1;
    prevButton.disabled = shouldDisable;
    nextButton.disabled = shouldDisable;
    prevButton.setAttribute(
        "aria-disabled",
        String(shouldDisable)
    );
    nextButton.setAttribute(
        "aria-disabled",
        String(shouldDisable)
    );
}
function moveEntry(direction) {
    const total = state.entries.length;
    if (total <= 1) {
        return;
    }
    state.currentIndex =
        (
            state.currentIndex +
            direction +
            total
        ) % total;
    renderEntry();
    const archiveTop =
        document.querySelector(".archive").offsetTop;
    window.scrollTo({
        top: archiveTop,
        behavior: "smooth"
    });
}
/* ==========================================================
   LIGHTBOX
========================================================== */
function bindEntryEvents() {
    document
        .querySelectorAll("[data-lightbox-src]")
        .forEach((element) => {
            element.addEventListener(
                "click",
                () => {
                    const src =
                        element.dataset.lightboxSrc;
                    const alt =
                        element.dataset.lightboxAlt || "";
                    const galleryIndex =
                        state.galleryImages.indexOf(src);
                    state.galleryIndex =
                        galleryIndex >= 0
                            ? galleryIndex
                            : 0;
                    openLightbox(src, alt);
                }
            );
        });
    const viewAllButton = document.querySelector(
        ".originalSection__more"
    );
    if (viewAllButton) {
        viewAllButton.addEventListener(
            "click",
            () => {
                if (!state.galleryImages.length) {
                    return;
                }
                state.galleryIndex = 0;
                openLightbox(
                    state.galleryImages[0],
                    "원본 네일 사진"
                );
            }
        );
    }
}
function openLightbox(src, alt = "") {
    lightboxImage.src = src;
    lightboxImage.alt = alt;
    if (typeof lightbox.showModal === "function") {
        lightbox.showModal();
    } else {
        lightbox.setAttribute("open", "");
    }
    document.body.style.overflow = "hidden";
}
function closeLightboxDialog() {
    if (typeof lightbox.close === "function") {
        lightbox.close();
    } else {
        lightbox.removeAttribute("open");
    }
    lightboxImage.src = "";
    lightboxImage.alt = "";
    document.body.style.overflow = "";
}
function moveGallery(direction) {
    if (
        !lightbox.open ||
        state.galleryImages.length <= 1
    ) {
        return;
    }
    state.galleryIndex =
        (
            state.galleryIndex +
            direction +
            state.galleryImages.length
        ) % state.galleryImages.length;
    lightboxImage.src =
        state.galleryImages[state.galleryIndex];
    lightboxImage.alt =
        `원본 네일 사진 ${state.galleryIndex + 1}`;
}
/* ==========================================================
   EVENTS
========================================================== */
prevButton.addEventListener(
    "click",
    () => moveEntry(-1)
);
nextButton.addEventListener(
    "click",
    () => moveEntry(1)
);
lightboxClose.addEventListener(
    "click",
    closeLightboxDialog
);
lightbox.addEventListener(
    "click",
    (event) => {
        if (event.target === lightbox) {
            closeLightboxDialog();
        }
    }
);
document.addEventListener(
    "keydown",
    (event) => {
        if (lightbox.open) {
            if (event.key === "Escape") {
                closeLightboxDialog();
            }
            if (event.key === "ArrowLeft") {
                moveGallery(-1);
            }
            if (event.key === "ArrowRight") {
                moveGallery(1);
            }
            return;
        }
        if (event.key === "ArrowLeft") {
            moveEntry(-1);
        }
        if (event.key === "ArrowRight") {
            moveEntry(1);
        }
    }
);
/* ==========================================================
   INIT
========================================================== */
async function initializeArchive() {
    try {
        await loadEntries();
        renderEntry();
    } catch (error) {
        console.error(error);
        detailPage.innerHTML = `
            <section class="emptyState">
                <h2>데이터를 불러오지 못했습니다.</h2>
                <p>
                    ${escapeHTML(error.message)}
                </p>
            </section>
        `;
        pageCounter.textContent = "0 / 0";
        prevButton.disabled = true;
        nextButton.disabled = true;
    }
}
initializeArchive();
