/* ==========================================================
   NAILS DONE.
   Atomic Publish API (v2 — JSON / Base64)
========================================================== */
const GITHUB_API = "https://api.github.com";
const REPOSITORY =
    process.env.GITHUB_REPO ||
    "chewrispy/naily";
const BRANCH =
    process.env.GITHUB_BRANCH ||
    "main";
const GITHUB_TOKEN =
    process.env.GITHUB_TOKEN;
const MAX_PHOTOS = 8;
const MAX_IMAGE_LENGTH =
    12 * 1024 * 1024;
/* ==========================================================
   RESPONSE
========================================================== */
function sendJSON(
    response,
    status,
    payload
) {
    response.status(status);
    response.setHeader(
        "Content-Type",
        "application/json; charset=utf-8"
    );
    response.end(
        JSON.stringify(payload)
    );
}
function getHeader(request, name) {
    const value =
        request.headers[
            name.toLowerCase()
        ];
    return Array.isArray(value)
        ? value[0]
        : value || "";
}
/* ==========================================================
   AUTH
========================================================== */
function authenticate(request) {
    const expected =
        process.env.ADMIN_PASSWORD;
    const received =
        getHeader(
            request,
            "x-admin-password"
        );
    if (!expected) {
        throw new Error(
            "서버에 ADMIN_PASSWORD가 설정되지 않았습니다."
        );
    }
    return expected === received;
}
/* ==========================================================
   VALIDATION
========================================================== */
function isDataURL(value) {
    return (
        typeof value === "string" &&
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(
            value
        ) &&
        value.length <=
            MAX_IMAGE_LENGTH
    );
}
function validateImageFile(file, label) {
    if (
        !file ||
        typeof file !== "object" ||
        !isDataURL(file.data)
    ) {
        throw new Error(
            `${label} 이미지 데이터가 올바르지 않습니다.`
        );
    }
    return {
        name:
            String(
                file.name || ""
            ).trim(),
        data:
            file.data
    };
}
function normalizeFinish(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((item) =>
            String(item).trim()
        )
        .filter(Boolean)
        .slice(0, 8);
}
function normalizeColors(value) {
    if (!Array.isArray(value)) {
        return [];
    }
    return value
        .map((color) =>
            String(color)
                .trim()
                .toUpperCase()
        )
        .filter((color) =>
            /^#[0-9A-F]{6}$/.test(color)
        )
        .slice(0, 8);
}
function sanitizeFileSegment(value = "") {
    return String(value)
        .trim()
        .replace(
            /[^a-zA-Z0-9._-]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        )
        .slice(0, 100);
}
function validateRequest(body) {
    if (!body) {
        throw new Error(
            "요청 데이터가 없습니다."
        );
    }
    const date =
        String(body.date || "").trim();
    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(
            date
        )
    ) {
        throw new Error(
            "날짜 형식이 올바르지 않습니다."
        );
    }
    const memo =
        String(body.memo || "").trim();
    if (!memo) {
        throw new Error(
            "메모가 없습니다."
        );
    }
    const graphic =
        validateImageFile(
            body.graphic,
            "네일 그래픽"
        );
    const photosInput =
        Array.isArray(body.photos)
            ? body.photos
            : [];
    if (!photosInput.length) {
        throw new Error(
            "원본 손 사진이 필요합니다."
        );
    }
    if (
        photosInput.length >
        MAX_PHOTOS
    ) {
        throw new Error(
            `원본 사진은 최대 ${MAX_PHOTOS}장까지 게시할 수 있습니다.`
        );
    }
    const photos =
        photosInput.map(
            (file) =>
                validateImageFile(
                    file,
                    "원본 손 사진"
                )
        );
    const inspiration =
        body.inspiration
            ? validateImageFile(
                  body.inspiration,
                  "인스퍼레이션"
              )
            : null;
    return {
        date,
        title:
            String(
                body.title || ""
            ).trim(),
        memo,
        shape:
            String(
                body.shape || ""
            ).trim(),
        finish:
            normalizeFinish(
                body.finish
            ),
        colors:
            normalizeColors(
                body.colors
            ),
        graphic,
        photos,
        inspiration
    };
}
/* ==========================================================
   DATA URL
========================================================== */
function decodeDataURL(dataURL) {
    if (!dataURL) {
        return null;
    }
    const base64 =
        String(dataURL).replace(
            /^data:.*?;base64,/,
            ""
        );
    if (!base64) {
        throw new Error(
            "이미지 데이터가 비어 있습니다."
        );
    }
    return base64;
}
/* ==========================================================
   GITHUB API
========================================================== */
function githubHeaders() {
    if (!GITHUB_TOKEN) {
        throw new Error(
            "서버에 GITHUB_TOKEN이 설정되지 않았습니다."
        );
    }
    return {
        Authorization:
            `Bearer ${GITHUB_TOKEN}`,
        Accept:
            "application/vnd.github+json",
        "X-GitHub-Api-Version":
            "2022-11-28",
        "Content-Type":
            "application/json"
    };
}
async function githubRequest(
    path,
    options = {}
) {
    const response = await fetch(
        `${GITHUB_API}${path}`,
        {
            ...options,
            headers: {
                ...githubHeaders(),
                ...(options.headers || {})
            }
        }
    );
    const text =
        await response.text();
    let payload = null;
    if (text) {
        try {
            payload =
                JSON.parse(text);
        } catch {
            payload = text;
        }
    }
    if (!response.ok) {
        const error =
            new Error(
                payload?.message ||
                `GitHub API 오류 (${response.status})`
            );
        error.status =
            response.status;
        error.payload =
            payload;
        throw error;
    }
    return payload;
}
/* ==========================================================
   GIT REFERENCE / COMMIT
========================================================== */
async function getBranchReference() {
    return githubRequest(
        `/repos/${REPOSITORY}/git/ref/heads/${encodeURIComponent(BRANCH)}`,
        {
            method: "GET"
        }
    );
}
async function getGitCommit(commitSHA) {
    return githubRequest(
        `/repos/${REPOSITORY}/git/commits/${commitSHA}`,
        {
            method: "GET"
        }
    );
}
async function createGitCommit({
    treeSHA,
    parentSHA,
    message
}) {
    return githubRequest(
        `/repos/${REPOSITORY}/git/commits`,
        {
            method: "POST",
            body:
                JSON.stringify({
                    message,
                    tree:
                        treeSHA,
                    parents: [
                        parentSHA
                    ]
                })
        }
    );
}
async function updateBranchReference(
    commitSHA
) {
    return githubRequest(
        `/repos/${REPOSITORY}/git/refs/heads/${encodeURIComponent(BRANCH)}`,
        {
            method: "PATCH",
            body:
                JSON.stringify({
                    sha:
                        commitSHA,
                    force:
                        false
                })
        }
    );
}
/* ==========================================================
   BLOBS
========================================================== */
async function createBlob({
    content,
    encoding
}) {
    return githubRequest(
        `/repos/${REPOSITORY}/git/blobs`,
        {
            method: "POST",
            body:
                JSON.stringify({
                    content,
                    encoding
                })
        }
    );
}
async function createTextBlob(text) {
    return createBlob({
        content:
            String(text),
        encoding:
            "utf-8"
    });
}
async function createBase64Blob(
    base64
) {
    return createBlob({
        content:
            base64,
        encoding:
            "base64"
    });
}
/* ==========================================================
   TREE
========================================================== */
async function createTree({
    baseTreeSHA,
    entries
}) {
    return githubRequest(
        `/repos/${REPOSITORY}/git/trees`,
        {
            method: "POST",
            body:
                JSON.stringify({
                    base_tree:
                        baseTreeSHA,
                    tree:
                        entries
                })
        }
    );
}
function createTreeEntry(
    path,
    blobSHA
) {
    return {
        path,
        mode:
            "100644",
        type:
            "blob",
        sha:
            blobSHA
    };
}
/* ==========================================================
   EXISTING NAILS.JSON
========================================================== */
async function getRepositoryFile(
    path
) {
    try {
        return await githubRequest(
            `/repos/${REPOSITORY}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${encodeURIComponent(BRANCH)}`,
            {
                method: "GET"
            }
        );
    } catch (error) {
        if (
            error.status === 404
        ) {
            return null;
        }
        throw error;
    }
}
function decodeRepositoryContent(file) {
    if (!file?.content) {
        return "";
    }
    return Buffer
        .from(
            file.content.replace(
                /\n/g,
                ""
            ),
            "base64"
        )
        .toString("utf8");
}
async function loadNailEntries() {
    const file =
        await getRepositoryFile(
            "data/nails.json"
        );
    if (!file) {
        return [];
    }
    const decoded =
        decodeRepositoryContent(
            file
        );
    if (!decoded.trim()) {
        return [];
    }
    const parsed =
        JSON.parse(decoded);
    if (!Array.isArray(parsed)) {
        throw new Error(
            "data/nails.json 파일이 배열 형식이 아닙니다."
        );
    }
    return parsed;
}
/* ==========================================================
   ARCHIVE RECORD
========================================================== */
function determineArchiveNumber(
    entries,
    date
) {
    const existing =
        entries.find(
            (entry) =>
                entry.date === date
        );
    if (
        Number.isFinite(
            Number(existing?.number)
        )
    ) {
        return Number(
            existing.number
        );
    }
    const numbers =
        entries
            .map((entry) =>
                Number(entry.number)
            )
            .filter(
                Number.isFinite
            );
    return numbers.length
        ? Math.max(...numbers) + 1
        : entries.length + 1;
}
function mergeArchiveRecord(
    entries,
    record
) {
    const updated =
        entries.filter(
            (entry) =>
                entry.date !==
                record.date
        );
    updated.push(record);
    updated.sort(
        (a, b) =>
            String(b.date)
                .localeCompare(
                    String(a.date)
                )
    );
    return updated;
}
/* ==========================================================
   FILE PREPARATION
   이미지는 원본 확장자를 그대로 유지해서 저장한다.
   서버에 sharp 등 실제 포맷 변환 라이브러리가 없는 이상,
   파일명만 .webp로 바꾸면 내용물과 확장자가 불일치하는
   손상된 파일이 만들어지므로 이 방식은 쓰지 않는다.
========================================================== */
const KNOWN_IMAGE_EXTENSIONS = [
    "webp",
    "png",
    "jpg",
    "jpeg",
    "heic",
    "heif",
    "gif"
];
function extensionFromMime(dataURL) {
    const match =
        String(dataURL).match(
            /^data:image\/([a-zA-Z0-9.+-]+);base64,/
        );
    if (!match) {
        return "";
    }
    const mime =
        match[1].toLowerCase();
    if (mime === "jpeg") {
        return "jpg";
    }
    return mime;
}
function extensionFromFile(file) {
    const fromName =
        String(file.name || "")
            .split(".")
            .pop()
            ?.toLowerCase();
    if (
        fromName &&
        KNOWN_IMAGE_EXTENSIONS.includes(
            fromName
        )
    ) {
        return fromName;
    }
    const fromMime =
        extensionFromMime(file.data);
    return fromMime || "webp";
}
async function uploadImageBlob(
    path,
    file,
    treeEntries
) {
    const base64 =
        decodeDataURL(file.data);
    const blob =
        await createBase64Blob(
            base64
        );
    treeEntries.push(
        createTreeEntry(
            path,
            blob.sha
        )
    );
    return path;
}
async function prepareBlobs(data) {
    const folder =
        `assets/nails/${sanitizeFileSegment(data.date)}`;
    const treeEntries = [];
    const graphicPath =
        `${folder}/nail-graphic.${extensionFromFile(data.graphic)}`;
    await uploadImageBlob(
        graphicPath,
        data.graphic,
        treeEntries
    );
    let inspirationPath = "";
    if (data.inspiration) {
        inspirationPath =
            `${folder}/inspiration.${extensionFromFile(data.inspiration)}`;
        await uploadImageBlob(
            inspirationPath,
            data.inspiration,
            treeEntries
        );
    }
    const photoPaths = [];
    for (
        let index = 0;
        index < data.photos.length;
        index += 1
    ) {
        const number =
            String(index + 1)
                .padStart(2, "0");
        const path =
            `${folder}/original-${number}.${extensionFromFile(data.photos[index])}`;
        await uploadImageBlob(
            path,
            data.photos[index],
            treeEntries
        );
        photoPaths.push(path);
    }
    return {
        folder,
        graphicPath,
        inspirationPath,
        photoPaths,
        treeEntries
    };
}
/* ==========================================================
   PUBLIC URL
========================================================== */
function buildArchiveURL() {
    if (
        process.env.PUBLIC_ARCHIVE_URL
    ) {
        return (
            process.env.PUBLIC_ARCHIVE_URL
        );
    }
    const [
        owner,
        repository
    ] = REPOSITORY.split("/");
    if (
        owner &&
        repository
    ) {
        return (
            `https://${owner}.github.io/${repository}/`
        );
    }
    return "";
}
/* ==========================================================
   HANDLER
========================================================== */
export default async function handler(
    request,
    response
) {
    if (
        request.method !== "POST"
    ) {
        response.setHeader(
            "Allow",
            "POST"
        );
        sendJSON(
            response,
            405,
            {
                error:
                    "POST 요청만 허용됩니다."
            }
        );
        return;
    }
    try {
        if (!authenticate(request)) {
            sendJSON(
                response,
                401,
                {
                    error:
                        "관리자 비밀번호가 올바르지 않습니다."
                }
            );
            return;
        }
        const data =
            validateRequest(
                request.body
            );
        /*
         * 1. 게시 시작 시점의 브랜치 HEAD를 읽는다.
         */
        const branchReference =
            await getBranchReference();
        const parentCommitSHA =
            branchReference.object?.sha;
        if (!parentCommitSHA) {
            throw new Error(
                "GitHub 브랜치의 현재 커밋을 찾지 못했습니다."
            );
        }
        const parentCommit =
            await getGitCommit(
                parentCommitSHA
            );
        const baseTreeSHA =
            parentCommit.tree?.sha;
        if (!baseTreeSHA) {
            throw new Error(
                "GitHub 브랜치의 현재 트리를 찾지 못했습니다."
            );
        }
        /*
         * 2. 현재 nails.json을 읽고 새 기록을 만든다.
         */
        const existingEntries =
            await loadNailEntries();
        const number =
            determineArchiveNumber(
                existingEntries,
                data.date
            );
        /*
         * 3. 이미지 blob을 만든다.
         * 이 시점에는 아직 브랜치에 노출되지 않는다.
         */
        const prepared =
            await prepareBlobs(data);
        const record = {
            number,
            date:
                data.date,
            title:
                data.title,
            shape:
                data.shape,
            finish:
                data.finish,
            colors:
                data.colors,
            memo:
                data.memo,
            inspiration:
                prepared.inspirationPath
                    ? `./${prepared.inspirationPath}`
                    : "",
            photos:
                prepared.photoPaths.map(
                    (path) =>
                        `./${path}`
                ),
            graphic:
                `./${prepared.graphicPath}`
        };
        const updatedEntries =
            mergeArchiveRecord(
                existingEntries,
                record
            );
        const nailsJSON =
            `${JSON.stringify(
                updatedEntries,
                null,
                2
            )}\n`;
        const nailsJSONBlob =
            await createTextBlob(
                nailsJSON
            );
        prepared.treeEntries.push(
            createTreeEntry(
                "data/nails.json",
                nailsJSONBlob.sha
            )
        );
        /*
         * 4. 기존 트리를 기반으로 모든 파일이 포함된 새 트리를 만든다.
         */
        const tree =
            await createTree({
                baseTreeSHA,
                entries:
                    prepared.treeEntries
            });
        /*
         * 5. 파일 전체를 포함한 커밋을 하나 만든다.
         */
        const commit =
            await createGitCommit({
                treeSHA:
                    tree.sha,
                parentSHA:
                    parentCommitSHA,
                message:
                    `Publish nail archive entry ${data.date}`
            });
        /*
         * 6. 브랜치가 게시 도중 변경되지 않았을 때만
         * 새 커밋으로 이동시킨다.
         */
        await updateBranchReference(
            commit.sha
        );
        sendJSON(
            response,
            200,
            {
                ok: true,
                date:
                    data.date,
                number,
                commit:
                    commit.sha,
                commitUrl:
                    commit.html_url ||
                    `https://github.com/${REPOSITORY}/commit/${commit.sha}`,
                url:
                    buildArchiveURL(),
                record
            }
        );
    } catch (error) {
        console.error(
            "Atomic publish API error:",
            error
        );
        let status = 500;
        let message =
            error?.message ||
            "아카이브 게시 중 오류가 발생했습니다.";
        if (
            error.status === 401 ||
            error.status === 403
        ) {
            status = 502;
            message =
                "GitHub 토큰에 저장소 쓰기 권한이 없거나 토큰이 유효하지 않습니다.";
        }
        if (
            error.status === 409 ||
            error.status === 422
        ) {
            status = 409;
            message =
                "게시 도중 GitHub 저장소가 변경되었습니다. 페이지를 새로고침한 뒤 다시 게시해 주세요.";
        }
        sendJSON(
            response,
            status,
            {
                error:
                    message
            }
        );
    }
}
