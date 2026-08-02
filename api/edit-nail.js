import OpenAI from "openai";


/* ==========================================================
   OPENAI
========================================================== */

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const MODEL =
    process.env.OPENAI_VISION_MODEL ||
    "gpt-5";


/* ==========================================================
   CONSTANTS
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


const EDIT_SCHEMA = {
    type: "object",

    additionalProperties: false,

    properties: {
        replacementGroup: {
            type: "string",

            description:
                "선택한 손톱 하나를 표현하는 완전한 SVG g 요소"
        }
    },

    required: [
        "replacementGroup"
    ]
};


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
            "ADMIN_PASSWORD가 설정되지 않았습니다."
        );
    }

    return expected === received;
}


/* ==========================================================
   ESCAPE
========================================================== */

function escapeRegExp(value) {
    return String(value).replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );
}


/* ==========================================================
   SVG SANITIZATION
========================================================== */

function removeUnsafeSVGContent(value) {
    let cleaned =
        String(value || "").trim();

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

    return cleaned;
}


function sanitizeSVGDocument(svg) {
    let cleaned =
        removeUnsafeSVGContent(svg)
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
        cleaned.lastIndexOf("</svg>");

    if (
        start === -1 ||
        end === -1
    ) {
        throw new Error(
            "기존 SVG 형식이 올바르지 않습니다."
        );
    }

    cleaned = cleaned.slice(
        start,
        end + 6
    );

    if (cleaned.length > 300000) {
        throw new Error(
            "SVG 파일이 너무 큽니다."
        );
    }

    return cleaned;
}


function sanitizeReplacementGroup(group) {
    let cleaned =
        removeUnsafeSVGContent(group)
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
        cleaned.indexOf("<g");

    const end =
        cleaned.lastIndexOf("</g>");

    if (
        start === -1 ||
        end === -1
    ) {
        throw new Error(
            "수정된 손톱 그룹이 올바른 g 요소가 아닙니다."
        );
    }

    cleaned = cleaned.slice(
        start,
        end + 4
    );

    if (cleaned.length > 80000) {
        throw new Error(
            "수정된 손톱 그룹이 너무 큽니다."
        );
    }

    if (/<svg\b/i.test(cleaned)) {
        throw new Error(
            "교체 그룹 안에는 별도의 svg 요소를 넣을 수 없습니다."
        );
    }

    return cleaned;
}


/* ==========================================================
   GROUP ATTRIBUTE READING
========================================================== */

function getOpeningGroupTag(group) {
    const match =
        String(group).match(
            /^<g\b[^>]*>/i
        );

    if (!match) {
        throw new Error(
            "g 요소의 시작 태그를 찾지 못했습니다."
        );
    }

    return match[0];
}


function getAttribute(tag, name) {
    const escapedName =
        escapeRegExp(name);

    const pattern =
        new RegExp(
            `\\b${escapedName}\\s*=\\s*["']([^"']+)["']`,
            "i"
        );

    return tag.match(pattern)?.[1] || "";
}


/* ==========================================================
   GROUP RANGE PARSER
========================================================== */

function findFingerGroupRange(
    svg,
    fingerId
) {
    const escapedId =
        escapeRegExp(fingerId);

    const openingPattern =
        new RegExp(
            `<g\\b(?=[^>]*\\bid\\s*=\\s*["']${escapedId}["'])(?=[^>]*\\bdata-finger\\s*=\\s*["']${escapedId}["'])[^>]*>`,
            "i"
        );

    const openingMatch =
        openingPattern.exec(svg);

    if (!openingMatch) {
        throw new Error(
            `SVG에서 ${fingerId} 그룹을 찾지 못했습니다.`
        );
    }

    const start =
        openingMatch.index;

    const tagPattern =
        /<\/?g\b[^>]*>/gi;

    tagPattern.lastIndex =
        start;

    let depth = 0;
    let firstTagFound = false;
    let match;

    while (
        (
            match =
                tagPattern.exec(svg)
        )
    ) {
        const tag =
            match[0];

        const isClosing =
            /^<\/g/i.test(tag);

        if (!firstTagFound) {
            if (match.index !== start) {
                throw new Error(
                    `${fingerId} 그룹의 시작 위치를 확인하지 못했습니다.`
                );
            }

            firstTagFound = true;
        }

        if (isClosing) {
            depth -= 1;
        } else {
            depth += 1;
        }

        if (
            firstTagFound &&
            depth === 0
        ) {
            return {
                start,

                end:
                    tagPattern.lastIndex,

                content:
                    svg.slice(
                        start,
                        tagPattern.lastIndex
                    )
            };
        }
    }

    throw new Error(
        `${fingerId} 그룹의 닫는 태그를 찾지 못했습니다.`
    );
}


/* ==========================================================
   SVG STRUCTURE VALIDATION
========================================================== */

function validateFingerGroups(svg) {
    const seenRanges = [];

    for (
        const fingerId
        of REQUIRED_FINGER_IDS
    ) {
        const range =
            findFingerGroupRange(
                svg,
                fingerId
            );

        seenRanges.push({
            fingerId,
            start: range.start,
            end: range.end
        });
    }

    const sorted =
        [...seenRanges].sort(
            (a, b) =>
                a.start - b.start
        );

    for (
        let index = 1;
        index < sorted.length;
        index += 1
    ) {
        const previous =
            sorted[index - 1];

        const current =
            sorted[index];

        if (
            current.start <
            previous.end
        ) {
            throw new Error(
                "손가락 그룹이 서로 중첩되어 있습니다."
            );
        }
    }

    const attributes =
        svg.match(
            /\bdata-finger\s*=\s*["'][^"']+["']/gi
        ) || [];

    if (
        attributes.length !==
        REQUIRED_FINGER_IDS.length
    ) {
        throw new Error(
            "SVG에는 data-finger 그룹이 정확히 10개 있어야 합니다."
        );
    }

    return svg;
}


/* ==========================================================
   REPLACEMENT GROUP VALIDATION
========================================================== */

function validateReplacementGroup(
    group,
    selectedFinger
) {
    const cleaned =
        sanitizeReplacementGroup(
            group
        );

    const openingTag =
        getOpeningGroupTag(
            cleaned
        );

    const id =
        getAttribute(
            openingTag,
            "id"
        );

    const dataFinger =
        getAttribute(
            openingTag,
            "data-finger"
        );

    if (
        id !== selectedFinger ||
        dataFinger !== selectedFinger
    ) {
        throw new Error(
            `수정 그룹의 id와 data-finger는 모두 ${selectedFinger}이어야 합니다.`
        );
    }

    const fingerAttributes =
        cleaned.match(
            /\bdata-finger\s*=\s*["'][^"']+["']/gi
        ) || [];

    if (
        fingerAttributes.length !== 1
    ) {
        throw new Error(
            "수정 그룹 안에는 data-finger 속성이 하나만 있어야 합니다."
        );
    }

    const idMatches =
        cleaned.match(
            /\bid\s*=\s*["'][^"']+["']/gi
        ) || [];

    /*
     * 내부 gradient, filter, clipPath 등의 id는 허용한다.
     * 단, 다른 손가락 이름을 id로 사용하는 것은 금지한다.
     */

    for (
        const fingerId
        of REQUIRED_FINGER_IDS
    ) {
        if (
            fingerId ===
            selectedFinger
        ) {
            continue;
        }

        const forbiddenId =
            new RegExp(
                `\\bid\\s*=\\s*["']${escapeRegExp(fingerId)}["']`,
                "i"
            );

        const forbiddenFinger =
            new RegExp(
                `\\bdata-finger\\s*=\\s*["']${escapeRegExp(fingerId)}["']`,
                "i"
            );

        if (
            forbiddenId.test(cleaned) ||
            forbiddenFinger.test(cleaned)
        ) {
            throw new Error(
                "수정 그룹에 다른 손가락의 식별자가 포함되어 있습니다."
            );
        }
    }

    if (!idMatches.length) {
        throw new Error(
            "수정 그룹에 id가 없습니다."
        );
    }

    return cleaned;
}


/* ==========================================================
   REPLACE ONLY SELECTED GROUP
========================================================== */

function replaceFingerGroup(
    originalSVG,
    selectedFinger,
    replacementGroup
) {
    const originalRange =
        findFingerGroupRange(
            originalSVG,
            selectedFinger
        );

    return (
        originalSVG.slice(
            0,
            originalRange.start
        ) +
        replacementGroup +
        originalSVG.slice(
            originalRange.end
        )
    );
}


/* ==========================================================
   PRESERVATION CHECK
========================================================== */

function assertOtherFingersPreserved({
    before,
    after,
    selectedFinger
}) {
    for (
        const fingerId
        of REQUIRED_FINGER_IDS
    ) {
        if (
            fingerId ===
            selectedFinger
        ) {
            continue;
        }

        const beforeGroup =
            findFingerGroupRange(
                before,
                fingerId
            ).content;

        const afterGroup =
            findFingerGroupRange(
                after,
                fingerId
            ).content;

        if (
            beforeGroup !==
            afterGroup
        ) {
            throw new Error(
                `${fingerId} 그룹이 예상과 다르게 변경되었습니다.`
            );
        }
    }
}


/* ==========================================================
   REQUEST VALIDATION
========================================================== */

function validateImageDataURL(value) {
    return (
        typeof value === "string" &&
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(
            value
        ) &&
        value.length <=
            12 * 1024 * 1024
    );
}


function validateRequest(body) {
    if (!body) {
        throw new Error(
            "요청 데이터가 없습니다."
        );
    }

    const finger =
        String(
            body.finger || ""
        ).trim();

    if (
        !REQUIRED_FINGER_IDS.includes(
            finger
        )
    ) {
        throw new Error(
            "수정할 손가락 값이 올바르지 않습니다."
        );
    }

    const instruction =
        String(
            body.instruction || ""
        ).trim();

    if (!instruction) {
        throw new Error(
            "수정 요청을 입력해 주세요."
        );
    }

    if (
        instruction.length >
        1000
    ) {
        throw new Error(
            "수정 요청은 1000자 이하여야 합니다."
        );
    }

    const graphic =
        validateFingerGroups(
            sanitizeSVGDocument(
                body.graphic
            )
        );

    const photos =
        Array.isArray(body.photos)
            ? body.photos
                .filter(
                    validateImageDataURL
                )
                .slice(0, 6)
            : [];

    return {
        finger,
        instruction,
        graphic,
        photos
    };
}


/* ==========================================================
   PROMPT
========================================================== */

function buildPrompt(data) {
    const originalGroup =
        findFingerGroupRange(
            data.graphic,
            data.finger
        ).content;

    return `
당신은 개인 네일 아카이브용 SVG를 수정하는 전문 일러스트레이터다.

선택된 손톱:
${data.finger}

사용자의 수정 요청:
${data.instruction}

현재 선택 손톱의 SVG 그룹:
${originalGroup}

수정 규칙:

1. 선택된 손톱 한 개의 g 요소만 반환한다.
2. SVG 문서 전체를 반환하지 않는다.
3. 최상위 요소는 반드시 g여야 한다.
4. 최상위 g의 id는 정확히 "${data.finger}"여야 한다.
5. 최상위 g의 data-finger도 정확히 "${data.finger}"여야 한다.
6. 기존 그룹의 위치를 결정하는 transform 속성은 유지한다.
7. 원본 사진과 수정 요청을 반영한다.
8. 다른 아홉 손톱은 출력하지 않는다.
9. 손, 피부, 손가락, 배경, 문구를 추가하지 않는다.
10. 외부 이미지 URL이나 base64 이미지를 넣지 않는다.
11. script, foreignObject, iframe, object, embed 및 이벤트 속성을 넣지 않는다.
12. 순수한 SVG 도형, gradient, filter, clipPath만 사용한다.
13. 서버에서 지정한 JSON Schema를 정확히 따른다.
`.trim();
}


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
                    `원본 네일 사진 ${index + 1}`
            });

            content.push({
                type: "input_image",
                image_url: photo,
                detail: "high"
            });
        }
    );

    return content;
}


/* ==========================================================
   STRUCTURED RESPONSE
========================================================== */

function parseStructuredResponse(result) {
    if (!result) {
        throw new Error(
            "AI 응답이 없습니다."
        );
    }

    if (
        result.status ===
        "incomplete"
    ) {
        const reason =
            result
                .incomplete_details
                ?.reason ||
            "unknown";

        throw new Error(
            `AI 응답이 완료되지 않았습니다. (${reason})`
        );
    }

    if (
        result.status ===
        "failed"
    ) {
        throw new Error(
            result.error?.message ||
            "AI 요청에 실패했습니다."
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

        throw new Error(
            refusal?.refusal ||
            "AI 수정 결과가 비어 있습니다."
        );
    }

    try {
        return JSON.parse(
            outputText
        );
    } catch {
        throw new Error(
            "AI 수정 결과를 JSON으로 읽지 못했습니다."
        );
    }
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
                    MODEL,

                store:
                    false,

                input: [
                    {
                        role:
                            "user",

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
                            "nail_group_edit",

                        description:
                            "선택된 손톱 하나를 수정한 SVG g 요소",

                        strict:
                            true,

                        schema:
                            EDIT_SCHEMA
                    }
                },

                max_output_tokens:
                    12000
            });

        const parsed =
            parseStructuredResponse(
                result
            );

        const replacementGroup =
            validateReplacementGroup(
                parsed.replacementGroup,
                data.finger
            );

        const updatedSVG =
            replaceFingerGroup(
                data.graphic,
                data.finger,
                replacementGroup
            );

        validateFingerGroups(
            updatedSVG
        );

        assertOtherFingersPreserved({
            before:
                data.graphic,

            after:
                updatedSVG,

            selectedFinger:
                data.finger
        });

        sendJSON(
            response,
            200,
            {
                graphicSvg:
                    updatedSVG,

                editedFinger:
                    data.finger
            }
        );
    } catch (error) {
        console.error(
            "Edit nail API error:",
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
                  "손톱 그래픽 수정 중 오류가 발생했습니다.";

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
