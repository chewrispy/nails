/* ==========================================================
   NAILS DONE.
   Atomic Delete API — nails.json에서 기록 하나를 제거한다.
   이미지 파일 자체는 저장소에 그대로 남겨둔다(다른 기록과
   경로가 얽혀 있을 수 있는 정리 로직을 서버에서 새로 만드는
   위험을 피하기 위함) — 필요하면 나중에 수동으로 정리한다.
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
   BLOB / TREE
========================================================== */
async function createTextBlob(text) {
    return githubRequest(
        `/repos/${REPOSITORY}/git/blobs`,
        {
            method: "POST",
            body:
                JSON.stringify({
                    content:
                        String(text),
                    encoding:
                        "utf-8"
                })
        }
    );
}
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
        const date =
            String(
                request.body?.date || ""
            ).trim();
        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                date
            )
        ) {
            throw new Error(
                "삭제할 기록의 날짜 형식이 올바르지 않습니다."
            );
        }
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
         * 2. 현재 nails.json에서 해당 날짜 기록을 제거한다.
         */
        const existingEntries =
            await loadNailEntries();
        const target =
            existingEntries.find(
                (entry) =>
                    entry.date === date
            );
        if (!target) {
            throw new Error(
                "해당 날짜의 기록을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다."
            );
        }
        const updatedEntries =
            existingEntries.filter(
                (entry) =>
                    entry.date !== date
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
        /*
         * 3. nails.json 하나만 바뀐 새 트리를 만든다.
         * 이미지 파일들은 건드리지 않는다.
         */
        const tree =
            await createTree({
                baseTreeSHA,
                entries: [
                    createTreeEntry(
                        "data/nails.json",
                        nailsJSONBlob.sha
                    )
                ]
            });
        /*
         * 4. 커밋을 만들고 브랜치를 이동시킨다.
         */
        const commit =
            await createGitCommit({
                treeSHA:
                    tree.sha,
                parentSHA:
                    parentCommitSHA,
                message:
                    `Delete nail archive entry ${date}`
            });
        await updateBranchReference(
            commit.sha
        );
        sendJSON(
            response,
            200,
            {
                ok: true,
                date,
                commit:
                    commit.sha
            }
        );
    } catch (error) {
        console.error(
            "Atomic delete API error:",
            error
        );
        let status = 500;
        let message =
            error?.message ||
            "기록 삭제 중 오류가 발생했습니다.";
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
                "삭제 도중 GitHub 저장소가 변경되었습니다. 페이지를 새로고침한 뒤 다시 시도해 주세요.";
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
