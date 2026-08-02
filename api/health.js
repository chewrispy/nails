/* ==========================================================
   NAILS DONE.
   Health Check API
========================================================== */

const REQUIRED_ENVIRONMENT_VARIABLES = [
    "ADMIN_PASSWORD",
    "GITHUB_TOKEN",
    "GITHUB_REPO",
    "GITHUB_BRANCH"
];

const OPTIONAL_ENVIRONMENT_VARIABLES = [
    "OPENAI_API_KEY"
];


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

    response.setHeader(
        "Cache-Control",
        "no-store"
    );

    response.end(
        JSON.stringify(payload)
    );
}


/* ==========================================================
   ENVIRONMENT
========================================================== */

function buildCheck(
    name,
    required
) {
    const value =
        process.env[name];

    return {
        name,

        required,

        configured:
            Boolean(
                value &&
                String(value).trim()
            )
    };
}


function getEnvironmentStatus() {
    return [
        ...REQUIRED_ENVIRONMENT_VARIABLES.map(
            (name) =>
                buildCheck(name, true)
        ),

        ...OPTIONAL_ENVIRONMENT_VARIABLES.map(
            (name) =>
                buildCheck(name, false)
        )
    ];
}


function getRepositoryLabel() {
    const repository =
        process.env.GITHUB_REPO || "";

    if (
        !repository.includes("/")
    ) {
        return "";
    }

    return repository;
}


/* ==========================================================
   HANDLER
========================================================== */

export default async function handler(
    request,
    response
) {
    if (
        request.method !== "GET"
    ) {
        response.setHeader(
            "Allow",
            "GET"
        );

        sendJSON(
            response,
            405,
            {
                ok: false,
                error:
                    "GET 요청만 허용됩니다."
            }
        );

        return;
    }

    const environment =
        getEnvironmentStatus();

    // Manual Mode 게시에는 OPENAI_API_KEY가 필요 없으므로,
    // 시스템 전체 상태(ok/missing)는 REQUIRED 변수만으로 판단한다.
    const missing =
        environment
            .filter(
                (item) =>
                    item.required &&
                    !item.configured
            )
            .map(
                (item) =>
                    item.name
            );

    const adminAuthEnabled =
        Boolean(
            process.env.ADMIN_PASSWORD
        );

    const openAIEnabled =
        Boolean(
            process.env.OPENAI_API_KEY
        );

    const githubPublishEnabled =
        Boolean(
            process.env.GITHUB_TOKEN &&
            process.env.GITHUB_REPO &&
            process.env.GITHUB_BRANCH
        );

    // Manual Mode는 AI 호출 없이 관리자 인증 + GitHub 게시 설정만으로 동작한다.
    const manualPublishEnabled =
        adminAuthEnabled &&
        githubPublishEnabled;

    sendJSON(
        response,
        missing.length
            ? 503
            : 200,
        {
            ok:
                missing.length === 0,

            service:
                "nails-done",

            timestamp:
                new Date().toISOString(),

            environment:
                process.env.VERCEL_ENV ||
                process.env.NODE_ENV ||
                "unknown",

            capabilities: {
                archive:
                    true,

                admin:
                    true,

                aiAnalysis:
                    openAIEnabled,

                fingerEditing:
                    openAIEnabled,

                githubPublishing:
                    githubPublishEnabled,

                manualPublish:
                    manualPublishEnabled
            },

            repository:
                getRepositoryLabel(),

            branch:
                process.env.GITHUB_BRANCH ||
                "",

            checks:
                environment,

            missing
        }
    );
}
