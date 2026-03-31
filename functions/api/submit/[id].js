import { FLAGS } from "../../../flags.js";

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
    });
}

async function readFlag(request) {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        const data = await request.json().catch(() => ({}));
        return (data.flag || "").toString().trim();
    }
    const form = await request.formData().catch(() => null);
    if (form) {
        return (form.get("flag") || "").toString().trim();
    }
    return "";
}

export async function onRequestPost(context) {
    const rawId = context.params.id || "";
    const id = rawId.replace(/\\.json$/i, "");
    const flag = await readFlag(context.request);

    if (!id) {
        return jsonResponse({ code: 1, message: "Missing challenge id." }, 400);
    }

    let expected = FLAGS[id];
    if (context.env && context.env.FLAGS_KV) {
        const stored = await context.env.FLAGS_KV.get("flags");
        if (stored) {
            try {
                const data = JSON.parse(stored);
                if (data && typeof data === "object") {
                    expected = data[id] || expected;
                }
            } catch (e) {}
        }
    }
    if (!expected) {
        return jsonResponse(
            {
                code: 1,
                message:
                    "No flag configured for this challenge. Add it to functions/flags.js or upload via /admin.",
            },
            404
        );
    }

    if (flag === expected) {
        return jsonResponse({ code: 0, solves: 1 });
    }

    return jsonResponse({ code: 1, message: "Incorrect flag." }, 200);
}
