import OpenAI from "openai";
/* ==========================================================
   OPENAI CLIENT
========================================================== */
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
/* ==========================================================
   CONFIG
========================================================== */
const VISION_MODEL =
    process.env.OPENAI_VISION_MODEL ||
    "gpt-5";
const MAX_PHOTOS = 6;
const MAX_IMAGE_LENGTH =
    12 * 1024 * 1024;
/* ==========================================================
   STRUCTURED OUTPUT SCHEMA
========================================================== */
const ANALYSIS_SCHEMA = {
    type: "object",
    additionalProperties: false,
    properties: {
        shape: {
            type: "string",
            description:
                "사진에서 확인한 손톱 쉐입을 나타내는 한국어 단어"
        },
        finish: {
            type: "array",
            items: {
                type: "string"
            },
            minItems: 1,
            maxItems: 6,
            description:
                "자석, 시럽, 글리터, 그라데이션 등 네일 특징"
        },
        colors: {
            type: "array",
            items: {
                type: "string",
                pattern:
                    "^#[0-9A-Fa-f]{6}$"
            },
            minItems: 1,
            maxItems: 8,
            description:
                "네일 디자인의 대표 HEX 컬러"
        },
        graphicSvg: {
            type: "string",
            description:
                "왼손 5개와 오른손 5개의 네일을 일렬로 표현한 완전한 SVG 문자열"
        }
    },
    required: [
        "shape",
        "finish",
        "colors",
        "graphicSvg"
    ]
};
/* ==========================================================
   RESPONSE HELPERS
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
        request.headers[name.toLowerCase()];
    if (Array.isArray(value)) {
        return value[0];
    }
    return value || "";
}
/* ==========================================================
   AUTH
========================================================== */
function authenticate(request) {
    const expectedPassword =
        process.env.ADMIN_PASSWORD;
    const receivedPassword =
        getHeader(
            request,
            "x-admin-password"
        );
    if (!expectedPassword) {
        throw new Error(
            "서버에 ADMIN_PASSWORD가 설정되지 않았습니다."
        );
    }
    return (
        receivedPassword ===
        expectedPassword
    );
}
/* ==========================================================
   INPUT VALIDATION
========================================================== */
function validateDataURL(value) {
    if (
        typeof value !== "string" ||
        !value.startsWith("data:image/")
    ) {
        return false;
    }
    return (
        value.length <=
        MAX_IMAGE_LENGTH
    );
}
function validateRequest(body) {
    if (!body) {
        throw new Error(
            "요청 데이터가 없습니다."
        );
    }
    const photos = Array.isArray(
        body.photos
    )
        ? body.photos
        : [];
    if (!photos.length) {
        throw new Error(
            "손 사진을 한 장 이상 올려주세요."
        );
    }
    if (
        photos.length >
        MAX_PHOTOS
    ) {
        throw new Error(
            `손 사진은 최대 ${MAX_PHOTOS}장까지 분석할 수 있습니다.`
        );
    }
    const invalidPhoto =
        photos.find(
            (photo) =>
                !validateDataURL(photo)
        );
    if (invalidPhoto) {
        throw new Error(
            "올바르지 않거나 너무 큰 이미지가 포함되어 있습니다."
        );
    }
    if (
        body.reference &&
        !validateDataURL(body.reference)
    ) {
        throw new Error(
            "인스퍼레이션 이미지 형식이 올바르지 않습니다."
        );
    }
    if (
        typeof body.memo !== "string" ||
        !body.memo.trim()
    ) {
        throw new Error(
            "메모를 입력해 주세요."
        );
    }
    return {
        date:
            String(
                body.date || ""
            ).trim(),
        title:
            String(
                body.title || ""
            ).trim(),
        memo:
            body.memo.trim(),
        photos,
        reference:
            body.reference || "",
        regenerate:
            Boolean(
                body.regenerate
            ),
        shape:
            String(
                body.shape || ""
            ).trim(),
        finish:
            Array.isArray(
                body.finish
            )
                ? body.finish
                : [],
        colors:
            Array.isArray(
                body.colors
            )
                ? body.colors
                : []
    };
}
/* ==========================================================
   STRUCTURED RESPONSE PARSING
========================================================== */
function parseStructuredResponse(result) {
    if (!result) {
        throw new Error(
            "AI 응답이 없습니다."
        );
    }
    if (
        result.status === "incomplete"
    ) {
        const reason =
            result.incomplete_details?.reason ||
            "unknown";
        throw new Error(
            `AI 응답이 완료되지 않았습니다. (${reason})`
        );
    }
    if (
        result.status === "failed"
    ) {
        throw new Error(
            result.error?.message ||
            "AI 요청이 실패했습니다."
        );
    }
    const outputText =
        result.output_text?.trim();
    if (!outputText) {
        const refusal =
            result.output
                ?.flatMap(
                    (item) =>
                        item.content || []
                )
                ?.find(
                    (content) =>
                        content.type ===
                        "refusal"
                );
        if (refusal?.refusal) {
            throw new Error(
                refusal.refusal
            );
        }
        throw new Error(
            "AI 분석 결과가 비어 있습니다."
        );
    }
    try {
        return JSON.parse(
            outputText
        );
    } catch (error) {
        console.error(
            "Structured output parse error:",
            outputText
        );
        throw new Error(
            "AI 분석 결과를 JSON으로 읽지 못했습니다."
        );
    }
}
/* ==========================================================
   SVG SANITIZATION
========================================================== */
function sanitizeSVG(svg) {
    if (
        typeof svg !== "string"
    ) {
        throw new Error(
            "생성된 SVG 데이터가 없습니다."
        );
    }
    let cleaned =
        svg.trim();
    cleaned = cleaned
        .replace(
            /^```(?:svg|xml)?\s*/i,
            ""
        )
        .replace(
            /```$/i,
            ""
        )
        .trim();
    const svgStart =
        cleaned.indexOf("<svg");
    const svgEnd =
        cleaned.lastIndexOf(
            "</svg>"
        );
    if (
        svgStart === -1 ||
        svgEnd === -1
    ) {
        throw new Error(
            "올바른 SVG가 생성되지 않았습니다."
        );
    }
    cleaned = cleaned.slice(
        svgStart,
        svgEnd + 6
    );
    const forbiddenPatterns = [
        /<script[\s\S]*?<\/script>/gi,
        /<foreignObject[\s\S]*?<\/foreignObject>/gi,
        /\son[a-z]+\s*=\s*"[^"]*"/gi,
        /\son[a-z]+\s*=\s*'[^']*'/gi,
        /\son[a-z]+\s*=\s*[^\s>]+/gi,
        /javascript:/gi,
        /<iframe[\s\S]*?<\/iframe>/gi,
        /<object[\s\S]*?<\/object>/gi,
        /<embed[\s\S]*?>/gi
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
    if (
        cleaned.length >
        250000
    ) {
        throw new Error(
            "생성된 SVG가 너무 큽니다."
        );
    }
    return cleaned;
}
/* ==========================================================
   SVG STRUCTURE VALIDATION
========================================================== */
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
function validateFingerGroups(svg) {
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
        const groupPattern =
            new RegExp(
                `<g\\b(?=[^>]*\\bid=["']${escaped}["'])(?=[^>]*\\bdata-finger=["']${escaped}["'])[^>]*>`,
                "i"
            );
        if (
            !groupPattern.test(svg)
        ) {
            missing.push(
                fingerId
            );
        }
    }
    if (missing.length) {
        throw new Error(
            `SVG에 손가락 그룹이 누락되었습니다: ${missing.join(", ")}`
        );
    }
    const fingerAttributeMatches =
        svg.match(
            /\bdata-finger\s*=\s*["'][^"']+["']/gi
        ) || [];
    if (
        fingerAttributeMatches.length !==
        REQUIRED_FINGER_IDS.length
    ) {
        throw new Error(
            "SVG의 data-finger 그룹 수가 정확히 10개가 아닙니다."
        );
    }
    return svg;
}
/* ==========================================================
   RESULT NORMALIZATION
========================================================== */
function normalizeHexColor(color) {
    const value =
        String(color || "")
            .trim()
            .toUpperCase();
    if (
        /^#[0-9A-F]{6}$/.test(
            value
        )
    ) {
        return value;
    }
    if (
        /^#[0-9A-F]{3}$/.test(
            value
        )
    ) {
        return (
            "#" +
            value
                .slice(1)
                .split("")
                .map(
                    (character) =>
                        character +
                        character
                )
                .join("")
        );
    }
    return null;
}
function normalizeResult(raw) {
    const finish = Array.isArray(
        raw.finish
    )
        ? raw.finish
              .map(
                  (item) =>
                      String(item).trim()
              )
              .filter(Boolean)
              .slice(0, 6)
        : [];
    const colors = Array.isArray(
        raw.colors
    )
        ? raw.colors
              .map(
                  normalizeHexColor
              )
              .filter(Boolean)
              .slice(0, 8)
        : [];
    const sanitizedSVG =
        sanitizeSVG(
            raw.graphicSvg
        );
    const validatedSVG =
        validateFingerGroups(
            sanitizedSVG
        );
    return {
        shape:
            String(
                raw.shape || ""
            ).trim() ||
            "확인 필요",
        finish,
        colors,
        graphicSvg:
            validatedSVG
    };
}
/* ==========================================================
   PROMPT
========================================================== */
function buildPrompt(data) {
    const existingInstruction =
        data.regenerate
            ? `
기존 사용자가 수정한 메타데이터를 우선 반영해라.
기존 Shape:
${data.shape || "없음"}
기존 Finish:
${data.finish.join(", ") || "없음"}
기존 Colors:
${data.colors.join(", ") || "없음"}
`
            : "";
    return `
당신은 개인 네일 아카이브를 위한
전문 네일 디자인 분석가이자 SVG 일러스트레이터다.
사용자가 업로드한 사진을 보고
실제 손톱 디자인을 충실히 분석하라.
이 작업은 제품 판매용 이미지가 아니라
사용자가 실제로 받은 네일아트를 기록하는
개인 아카이브용 그래픽이다.
[기록 정보]
날짜:
${data.date || "미입력"}
제목:
${data.title || "미입력"}
사용자 메모:
${data.memo}
${existingInstruction}
[분석 규칙]
1. 사진에서 실제로 보이는 내용만 사용한다.
2. 확인되지 않는 파츠, 컬러, 패턴을 임의로 추가하지 않는다.
3. 여러 사진에서 같은 손톱이 중복되면 가장 잘 보이는 사진을 기준으로 한다.
4. 왼손과 오른손의 디자인이 다르면 정확히 구분한다.
5. 어떤 손가락인지 명확하지 않은 경우 전체 디자인 흐름을 보존하되 과도하게 추측하지 않는다.
6. 메모는 디자인 의도 파악에 활용하되 사진과 충돌하면 사진을 우선한다.
7. Shape는 한국어로 한 가지를 출력한다.
8. Finish는 한국어 키워드 2~6개를 출력한다.
9. Colors는 실제 디자인의 대표 HEX 컬러 4~8개를 출력한다.
[SVG 생성 규칙]
1. SVG viewBox는 "0 0 1240 280"으로 한다.
2. 정확히 열 개의 손톱을 만든다.
3. 왼손 다섯 개를 왼쪽에 일렬로 배치한다.
4. 가운데에 넓은 여백과 얇은 세로 구분선을 둔다.
5. 오른손 다섯 개를 오른쪽에 일렬로 배치한다.
6. LEFT HAND, RIGHT HAND 등의 텍스트는 넣지 않는다.
7. 손, 손가락, 피부, 배경, 패키지, 제품 설명은 넣지 않는다.
8. 손톱만 독립된 그래픽으로 표현한다.
9. 각 손톱은 실제 사진의 컬러 배치, 글리터, 자석광, 파츠, 프렌치 및 패턴 차이를 반영한다.
10. 모든 손톱을 같은 복사본으로 만들지 않는다.
11. 각 손가락별 차이를 유지한다.
12. 손톱 모양은 실제 사진의 쉐입을 반영한다.
13. 그림자와 하이라이트는 절제된 에디토리얼 스타일로 표현한다.
14. 배경은 투명하게 유지한다.
15. 외부 이미지 링크나 base64 이미지를 SVG 안에 넣지 않는다.
16. SVG 안에 script, foreignObject, iframe, object, embed, 이벤트 핸들러를 넣지 않는다.
17. SVG에는 순수한 path, rect, circle, ellipse, line, polygon, defs, gradient, filter, clipPath만 사용한다.
18. SVG 내부의 id는 해당 응답 안에서 중복되지 않게 만든다.
19. 각 손톱은 반드시 독립적인 g 그룹으로 만든다.
20. 각 그룹에는 다음 id와 data-finger 값을 정확히 사용한다.
left-thumb
left-index
left-middle
left-ring
left-pinky
right-thumb
right-index
right-middle
right-ring
right-pinky
21. 예시는 다음과 같다.
<g
  id="left-thumb"
  data-finger="left-thumb"
>
  ...
</g>
22. 동일한 id를 두 번 사용하지 않는다.
23. 열 개 그룹 밖의 장식 요소에는 data-finger 속성을 넣지 않는다.
[응답 규칙]
1. 응답은 서버에서 지정한 JSON Schema를 정확히 따른다.
2. 각 필드에 실제 사진에서 확인한 정보만 넣는다.
3. graphicSvg에는 완전한 SVG 문서 전체를 문자열로 넣는다.
4. graphicSvg 외부에는 SVG나 설명을 출력하지 않는다.
`.trim();
}
/* ==========================================================
   OPENAI CONTENT
========================================================== */
function buildInputContent(data) {
    const content = [
        {
            type: "input_text",
            text: buildPrompt(data)
        }
    ];
    data.photos.forEach(
        (photo, index) => {
            content.push({
                type: "input_text",
                text:
                    `원본 손 사진 ${index + 1}`
            });
            content.push({
                type: "input_image",
                image_url: photo,
                detail: "high"
            });
        }
    );
    if (data.reference) {
        content.push({
            type: "input_text",
            text:
                "아래 이미지는 완성 사진이 아니라 디자인의 영감이 된 인스퍼레이션 이미지다."
        });
        content.push({
            type: "input_image",
            image_url:
                data.reference,
            detail: "high"
        });
    }
    return content;
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
        const result =
            await openai.responses.create({
                model:
                    VISION_MODEL,
                store: false,
                input: [
                    {
                        role: "user",
                        content:
                            buildInputContent(
                                data
                            )
                    }
                ],
                text: {
                    format: {
                        type:
                            "json_schema",
                        name:
                            "nail_archive_analysis",
                        description:
                            "손 사진을 분석한 네일 메타데이터와 열 손가락 SVG 그래픽",
                        strict:
                            true,
                        schema:
                            ANALYSIS_SCHEMA
                    }
                },
                max_output_tokens:
                    30000
            });
        const parsed =
            parseStructuredResponse(
                result
            );
        const normalized =
            normalizeResult(
                parsed
            );
        sendJSON(
            response,
            200,
            normalized
        );
    } catch (error) {
        console.error(
            "Analyze API error:",
            error
        );
        const status =
            error?.status === 429
                ? 429
                : 500;
        const message =
            error?.status === 429
                ? "AI 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요."
                : error?.message ||
                  "사진 분석 중 오류가 발생했습니다.";
        sendJSON(
            response,
            status,
            {
                error: message
            }
        );
    }
}
