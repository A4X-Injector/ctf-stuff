import { FLAGS } from "../../../flags.js";

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "content-type": "application/json; charset=utf-8",
        },
    });
}

function getAdminKey(request) {
    const url = new URL(request.url);
    return request.headers.get("x-admin-key") || url.searchParams.get("key") || "";
}

async function loadFlags(env) {
    if (env && env.FLAGS_KV) {
        const stored = await env.FLAGS_KV.get("flags");
        if (stored) {
            return JSON.parse(stored);
        }
    }
    return { ...FLAGS };
}

async function saveFlags(env, flags) {
    if (!env || !env.FLAGS_KV) return false;
    await env.FLAGS_KV.put("flags", JSON.stringify(flags));
    return true;
}

export async function onRequestGet(context) {
    const adminKey = getAdminKey(context.request);
    const required = context.env.ADMIN_KEY || "";
    if (!required || adminKey !== required) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }
    const flags = await loadFlags(context.env);
    return jsonResponse({ flags });
}

export async function onRequestPost(context) {
    const adminKey = getAdminKey(context.request);
    const required = context.env.ADMIN_KEY || "";
    if (!required || adminKey !== required) {
        return jsonResponse({ error: "Unauthorized" }, 401);
    }

    let data = {};
    try {
        data = await context.request.json();
    } catch (e) {
        return jsonResponse({ error: "Invalid JSON body." }, 400);
    }

    const incoming = data.flags || data || {};
    if (typeof incoming !== "object" || Array.isArray(incoming)) {
        return jsonResponse({ error: "Flags must be an object." }, 400);
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(incoming)) {
        if (typeof value !== "string") continue;
        sanitized[key] = value.trim();
    }

    const current = await loadFlags(context.env);
    const merged = { ...current, ...sanitized };
    const ok = await saveFlags(context.env, merged);
    if (!ok) {
        return jsonResponse({ error: "FLAGS_KV not configured." }, 500);
    }
    return jsonResponse({ ok: true, count: Object.keys(merged).length });
}
