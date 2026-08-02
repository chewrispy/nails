/* ==========================================================
   NAILS DONE. v2
   Main Archive Application
========================================================== */


/* ==========================================================
   01. STATE
========================================================== */

const state = {
    entries: [],
    currentView: "grid",
    currentDetailIndex: 0,

    lightboxImages: [],
    lightboxIndex: 0
};


/* ==========================================================
   02. DOM
========================================================== */

const archiveCount =
    document.querySelector("#archiveCount");

const archivePeriod =
    document.querySelector("#archivePeriod");

const archiveCollection =
    document.querySelector("#archiveCollection");

const detailView =
    document.querySelector("#detailView");

const detailArticle =
    document.querySelector("#detailArticle");

const detailPrevious =
    document.querySelector("#detailPrevious");

const detailNext =
    document.querySelector("#detailNext");

const detailCounter =
    document.querySelector("#detailCounter");

const archiveMessage =
    document.querySelector("#archiveMessage");

const archiveMessageTitle =
    document.querySelector("#archiveMessageTitle");

const archiveMessageText =
    document.querySelector("#archiveMessageText");

const archiveCardTemplate =
    document.querySelector("#archiveCardTemplate");

const detailTemplate =
    document.querySelector("#detailTemplate");

const viewButtons = [
    ...document.querySelectorAll(
        ".viewSwitcher__button"
    )
];


/* LIGHTBOX */

const lightbox =
    document.querySelector("#lightbox");

const lightboxImage =
    document.querySelector("#lightboxImage");

const lightboxCaption =
    document.querySelector("#lightboxCaption");

const lightboxClose =
    document.querySelector("#lightboxClose");

const lightboxPrevious =
    document.querySelector("#lightboxPrevious");

const lightboxNext =
    document.querySelector("#lightboxNext");


/* ==========================================================
   03. UTILITIES
========================================================== */

function normalizePath(path = "") {
    return String(path).trim();
}


function createElement(
    tag,
    className = ""
) {
    const element =
        document.createElement(tag);

    if (className) {
        element.className =
            className;
    }

    return element;
}


function formatDate(
    dateString,
    locale = "ko-KR"
) {
    const date =
        new Date(
            `${dateString}T00:00:00`
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return dateString || "";
    }

    return new Intl.DateTimeFormat(
        locale,
        {
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    )
        .format(date)
        .replaceAll(". ", ".")
        .replace(/\.$/, "");
}


function getSortedEntries(entries) {
    return [...entries].sort(
        (a, b) =>
            String(b.date)
                .localeCompare(
                    String(a.date)
                )
    );
}


function getEntryTitle(entry) {
    return (
        String(entry.title || "")
            .trim() ||
        "Untitled Nail"
    );
}


function getEntryGraphic(entry) {
    return normalizePath(
        entry.graphic || ""
    );
}


function getEntryPhotos(entry) {
    return Array.isArray(entry.photos)
        ? entry.photos
            .map(normalizePath)
            .filter(Boolean)
        : [];
}


function getEntryFinish(entry) {
    if (
        Array.isArray(entry.finish)
    ) {
        return entry.finish
            .map((item) =>
                String(item).trim()
            )
            .filter(Boolean);
    }

    return String(
        entry.finish || ""
    )
        .split(",")
        .map((item) =>
            item.trim()
        )
        .filter(Boolean);
}


function getEntryColors(entry) {
    return Array.isArray(entry.colors)
        ? entry.colors
            .map((color) =>
                String(color).trim()
            )
            .filter((color) =>
                /^#[0-9a-f]{6}$/i.test(
                    color
                )
            )
        : [];
}


/* ==========================================================
   04. DATA
========================================================== */

async function loadEntries() {
    const response =
        await fetch(
            "./data/nails.json",
            {
                cache: "no-store"
            }
        );

    if (!response.ok) {
        throw new Error(
            `네일 데이터를 불러오지 못했습니다. (${response.status})`
        );
    }

    const data =
        await response.json();

    if (!Array.isArray(data)) {
        throw new Error(
            "data/nails.json은 배열 형식이어야 합니다."
        );
    }

    state.entries =
        getSortedEntries(
            data.filter(
                (entry) =>
                    entry &&
                    entry.date
            )
        );
}


/* ==========================================================
   05. ARCHIVE SUMMARY
========================================================== */

function renderArchiveSummary() {
    const total =
        state.entries.length;

    archiveCount.textContent =
        `${total} ${
            total === 1
                ? "RECORD"
                : "RECORDS"
        }`;

    if (!total) {
        archivePeriod.textContent = "";
        return;
    }

    const dates =
        state.entries
            .map((entry) =>
                entry.date
            )
            .filter(Boolean)
            .sort();

    const oldest =
        dates[0];

    const newest =
        dates[dates.length - 1];

    archivePeriod.textContent =
        oldest === newest
            ? formatDate(oldest)
            : `${formatDate(oldest)} — ${formatDate(newest)}`;
}


/* ==========================================================
   06. VIEW SWITCHER
========================================================== */

function setView(view) {
    state.currentView = view;

    viewButtons.forEach(
        (button) => {
            const isActive =
                button.dataset.view ===
                view;

            button.classList.toggle(
                "is-active",
                isActive
            );

            button.setAttribute(
                "aria-pressed",
                String(isActive)
            );
        }
    );

    if (view === "detail") {
        archiveCollection.hidden = true;
        detailView.hidden = false;

        renderDetail(
            state.currentDetailIndex
        );

        return;
    }

    detailView.hidden = true;
    archiveCollection.hidden = false;

    archiveCollection.classList.toggle(
        "archiveCollection--grid",
        view === "grid"
    );

    archiveCollection.classList.toggle(
        "archiveCollection--list",
        view === "list"
    );

    renderCollection();
}


/* ==========================================================
   07. COLLECTION
========================================================== */

function renderCollection() {
    archiveCollection.replaceChildren();

    state.entries.forEach(
        (entry, index) => {
            const fragment =
                archiveCardTemplate
                    .content
                    .cloneNode(true);

            const card =
                fragment.querySelector(
                    ".archiveCard"
                );

            const button =
                fragment.querySelector(
                    ".archiveCard__button"
                );

            const graphic =
                fragment.querySelector(
                    ".archiveCard__graphic"
                );

            const date =
                fragment.querySelector(
                    ".archiveCard__date"
                );

            const title =
                fragment.querySelector(
                    ".archiveCard__title"
                );

            const shape =
                fragment.querySelector(
                    ".archiveCard__shape"
                );

            const finish =
                fragment.querySelector(
                    ".archiveCard__finish"
                );

            card.style.animationDelay =
                `${Math.min(
                    index * 0.045,
                    0.4
                )}s`;

            const entryTitle =
                getEntryTitle(entry);

            const graphicPath =
                getEntryGraphic(entry);

            graphic.src =
                graphicPath ||
                "./assets/placeholder-nail-graphic.webp";

            graphic.alt =
                `${entryTitle} 네일 그래픽`;

            graphic.loading =
                index < 4
                    ? "eager"
                    : "lazy";

            date.dateTime =
                entry.date;

            date.textContent =
                formatDate(entry.date);

            title.textContent =
                entryTitle;

            shape.textContent =
                entry.shape || "";

            const finishes =
                getEntryFinish(entry);

            finish.textContent =
                finishes
                    .slice(0, 3)
                    .join(" · ");

            button.setAttribute(
                "aria-label",
                `${entryTitle} 상세 보기`
            );

            button.addEventListener(
                "click",
                () => {
                    state.currentDetailIndex =
                        index;

                    setView("detail");

                    scrollToArchiveTop();
                }
            );

            archiveCollection.append(
                fragment
            );
        }
    );
}


/* ==========================================================
   08. DETAIL
========================================================== */

function renderDetail(index) {
    const entry =
        state.entries[index];

    if (!entry) {
        return;
    }

    state.currentDetailIndex =
        index;

    const fragment =
        detailTemplate
            .content
            .cloneNode(true);

    const date =
        fragment.querySelector(
            ".nailDetail__date"
        );

    const title =
        fragment.querySelector(
            ".nailDetail__title"
        );

    const number =
        fragment.querySelector(
            ".nailDetail__number"
        );

    const graphicButton =
        fragment.querySelector(
            ".nailGraphicButton"
        );

    const graphicImage =
        fragment.querySelector(
            ".nailGraphicImage"
        );

    const shape =
        fragment.querySelector(
            ".nailMeta__shape"
        );

    const finish =
        fragment.querySelector(
            ".nailMeta__finish"
        );

    const colors =
        fragment.querySelector(
            ".nailMeta__colors"
        );

    const inspirationSection =
        fragment.querySelector(
            ".inspirationSection"
        );

    const inspirationImageButton =
        fragment.querySelector(
            ".inspiration__imageButton"
        );

    const inspirationImage =
        fragment.querySelector(
            ".inspiration__image"
        );

    const inspirationMemo =
        fragment.querySelector(
            ".inspiration__memo"
        );

    const originalSection =
        fragment.querySelector(
            ".originalSection"
        );

    const originalGallery =
        fragment.querySelector(
            ".originalGallery"
        );

    const entryTitle =
        getEntryTitle(entry);

    date.dateTime =
        entry.date;

    date.textContent =
        formatDate(entry.date);

    title.textContent =
        entryTitle;

    number.textContent =
        `#${String(
            entry.number ||
            state.entries.length - index
        ).padStart(2, "0")}`;


    /* GRAPHIC */

    const graphicPath =
        getEntryGraphic(entry);

    graphicImage.src =
        graphicPath ||
        "./assets/placeholder-nail-graphic.webp";

    graphicImage.alt =
        `${entryTitle} 네일 그래픽`;

    graphicButton.addEventListener(
        "click",
        () => {
            openLightbox(
                [
                    {
                        src:
                            graphicImage.src,

                        alt:
                            graphicImage.alt,

                        caption:
                            `${entryTitle} · Nail Graphic`
                    }
                ],
                0
            );
        }
    );


    /* META */

    shape.textContent =
        entry.shape || "-";

    const finishes =
        getEntryFinish(entry);

    if (!finishes.length) {
        finish.textContent = "-";
    } else {
        finishes.forEach(
            (item) => {
                const tag =
                    createElement(
                        "span",
                        "finishTag"
                    );

                tag.textContent =
                    item;

                finish.append(tag);
            }
        );
    }

    const colorValues =
        getEntryColors(entry);

    if (!colorValues.length) {
        colors.textContent = "-";
    } else {
        colorValues.forEach(
            (color) => {
                const chip =
                    createElement(
                        "span",
                        "colorChip"
                    );

                chip.style.background =
                    color;

                chip.dataset.color =
                    color.toUpperCase();

                chip.setAttribute(
                    "aria-label",
                    `대표 색상 ${color}`
                );

                colors.append(chip);
            }
        );
    }


    /* INSPIRATION */

    const inspirationPath =
        normalizePath(
            entry.inspiration || ""
        );

    const memo =
        String(entry.memo || "")
            .trim();

    if (
        !inspirationPath &&
        !memo
    ) {
        inspirationSection.remove();
    } else {
        inspirationMemo.textContent =
            memo;

        if (!inspirationPath) {
            inspirationImageButton.remove();

            fragment
                .querySelector(
                    ".inspiration"
                )
                .style.gridTemplateColumns =
                    "minmax(0, 760px)";
        } else {
            inspirationImage.src =
                inspirationPath;

            inspirationImage.alt =
                `${entryTitle} 인스퍼레이션`;

            inspirationImageButton.addEventListener(
                "click",
                () => {
                    openLightbox(
                        [
                            {
                                src:
                                    inspirationImage.src,

                                alt:
                                    inspirationImage.alt,

                                caption:
                                    `${entryTitle} · Inspiration`
                            }
                        ],
                        0
                    );
                }
            );
        }
    }


    /* ORIGINAL PHOTOS */

    const photos =
        getEntryPhotos(entry);

    if (!photos.length) {
        originalSection.remove();
    } else {
        const galleryItems =
            photos.map(
                (photo, photoIndex) => {
                    return {
                        src:
                            new URL(
                                photo,
                                window.location.href
                            ).href,

                        alt:
                            `${entryTitle} 실제 손 사진 ${photoIndex + 1}`,

                        caption:
                            `${entryTitle} · Original Photo ${photoIndex + 1}`
                    };
                }
            );

        galleryItems.forEach(
            (item, photoIndex) => {
                const button =
                    createElement(
                        "button",
                        "originalGallery__button"
                    );

                button.type =
                    "button";

                button.setAttribute(
                    "aria-label",
                    `${photoIndex + 1}번째 원본 사진 크게 보기`
                );

                const image =
                    createElement(
                        "img",
                        "originalGallery__image"
                    );

                image.src =
                    item.src;

                image.alt =
                    item.alt;

                image.loading =
                    photoIndex < 2
                        ? "eager"
                        : "lazy";

                button.append(image);

                button.addEventListener(
                    "click",
                    () => {
                        openLightbox(
                            galleryItems,
                            photoIndex
                        );
                    }
                );

                originalGallery.append(
                    button
                );
            }
        );
    }


    detailArticle.replaceChildren(
        fragment
    );

    detailCounter.textContent =
        `${index + 1} / ${state.entries.length}`;

    const disableNavigation =
        state.entries.length <= 1;

    detailPrevious.disabled =
        disableNavigation;

    detailNext.disabled =
        disableNavigation;
}


/* ==========================================================
   09. DETAIL NAVIGATION
========================================================== */

function moveDetail(direction) {
    const total =
        state.entries.length;

    if (total <= 1) {
        return;
    }

    state.currentDetailIndex =
        (
            state.currentDetailIndex +
            direction +
            total
        ) % total;

    renderDetail(
        state.currentDetailIndex
    );

    scrollToArchiveTop();
}


function scrollToArchiveTop() {
    const toolbar =
        document.querySelector(
            ".archiveToolbar"
        );

    const top =
        toolbar
            ? toolbar.offsetTop
            : 0;

    window.scrollTo({
        top,
        behavior: "smooth"
    });
}


/* ==========================================================
   10. LIGHTBOX
========================================================== */

function openLightbox(
    images,
    index = 0
) {
    state.lightboxImages =
        images;

    state.lightboxIndex =
        index;

    renderLightbox();

    if (
        typeof lightbox.showModal ===
        "function"
    ) {
        lightbox.showModal();
    } else {
        lightbox.setAttribute(
            "open",
            ""
        );
    }

    document.body.classList.add(
        "is-locked"
    );
}


function renderLightbox() {
    const item =
        state.lightboxImages[
            state.lightboxIndex
        ];

    if (!item) {
        return;
    }

    lightboxImage.src =
        item.src;

    lightboxImage.alt =
        item.alt || "";

    lightboxCaption.textContent =
        item.caption || "";

    const hasMultiple =
        state.lightboxImages.length > 1;

    lightboxPrevious.hidden =
        !hasMultiple;

    lightboxNext.hidden =
        !hasMultiple;
}


function moveLightbox(direction) {
    const total =
        state.lightboxImages.length;

    if (total <= 1) {
        return;
    }

    state.lightboxIndex =
        (
            state.lightboxIndex +
            direction +
            total
        ) % total;

    renderLightbox();
}


function closeLightbox() {
    if (
        typeof lightbox.close ===
        "function"
    ) {
        lightbox.close();
    } else {
        lightbox.removeAttribute(
            "open"
        );
    }

    lightboxImage.src = "";
    lightboxImage.alt = "";

    lightboxCaption.textContent = "";

    state.lightboxImages = [];
    state.lightboxIndex = 0;

    document.body.classList.remove(
        "is-locked"
    );
}


/* ==========================================================
   11. MESSAGE
========================================================== */

function showArchiveMessage(
    title,
    message
) {
    archiveCollection.hidden = true;
    detailView.hidden = true;

    archiveMessage.hidden = false;

    archiveMessageTitle.textContent =
        title;

    archiveMessageText.textContent =
        message;
}


function hideArchiveMessage() {
    archiveMessage.hidden = true;
}


/* ==========================================================
   12. EVENTS
========================================================== */

viewButtons.forEach(
    (button) => {
        button.addEventListener(
            "click",
            () => {
                setView(
                    button.dataset.view
                );
            }
        );
    }
);


detailPrevious.addEventListener(
    "click",
    () => moveDetail(-1)
);


detailNext.addEventListener(
    "click",
    () => moveDetail(1)
);


lightboxClose.addEventListener(
    "click",
    closeLightbox
);


lightboxPrevious.addEventListener(
    "click",
    () => moveLightbox(-1)
);


lightboxNext.addEventListener(
    "click",
    () => moveLightbox(1)
);


lightbox.addEventListener(
    "click",
    (event) => {
        if (
            event.target ===
            lightbox
        ) {
            closeLightbox();
        }
    }
);


document.addEventListener(
    "keydown",
    (event) => {
        if (lightbox.open) {
            if (
                event.key === "Escape"
            ) {
                closeLightbox();
            }

            if (
                event.key === "ArrowLeft"
            ) {
                moveLightbox(-1);
            }

            if (
                event.key === "ArrowRight"
            ) {
                moveLightbox(1);
            }

            return;
        }

        if (
            state.currentView ===
            "detail"
        ) {
            if (
                event.key === "ArrowLeft"
            ) {
                moveDetail(-1);
            }

            if (
                event.key === "ArrowRight"
            ) {
                moveDetail(1);
            }
        }
    }
);


/* ==========================================================
   13. INIT
========================================================== */

async function initializeArchive() {
    try {
        await loadEntries();

        if (!state.entries.length) {
            showArchiveMessage(
                "아직 기록이 없습니다.",
                "첫 번째 네일 기록을 관리자 페이지에서 추가해 주세요."
            );

            archiveCount.textContent =
                "0 RECORDS";

            return;
        }

        hideArchiveMessage();

        renderArchiveSummary();
        renderCollection();
        setView("grid");
    } catch (error) {
        console.error(error);

        showArchiveMessage(
            "아카이브를 불러오지 못했습니다.",
            error.message
        );

        archiveCount.textContent =
            "0 RECORDS";
    }
}


initializeArchive();
