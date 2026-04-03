from flask import Flask, request, Response, stream_with_context
from flask_cors import CORS
import json
import os
import re
from dotenv import load_dotenv
import requests

load_dotenv()

app = Flask(__name__)
CORS(app)

PRODUCT_CATALOG = """
=== MAISON PRODUCT CATALOG ===

DRESSES
- Silk Wrap Dress — ₹7,499 — flattering silhouette, all skin types
- Floral Midi Dress — ₹5,499 — day to evening, all skin types
- Linen Shirt Dress — ₹4,999 — belted waist, relaxed fit
- Velvet Evening Gown — ₹15,999 — special occasions

BLAZERS
- Linen Blazer — ₹10,799 — effortless sophistication
- Plaid Oversized Blazer — ₹8,999 — statement look
- Velvet Blazer — ₹13,499 — jewel tones

SWEATERS
- Cashmere Sweater — ₹12,499 — ultra-soft, timeless
- Ribbed Turtleneck — ₹3,999 — cozy elegance
- Cable Knit Cardigan — ₹6,799 — layered looks

TOPS
- Satin Camisole — ₹3,799 — lace detail
- Cropped Linen Blouse — ₹2,999 — flutter sleeves
- Silk Button-Down — ₹5,499 — ivory, luxe

TROUSERS
- Wide Leg Trousers — ₹6,499 — high-waisted cream
- Tailored Cigarette Pants — ₹5,299 — charcoal slim
- Pleated Palazzo Pants — ₹4,799 — flowing, effortless

SKIRTS
- Pleated Midi Skirt — ₹3,999 — soft pastels
- Leather Mini Skirt — ₹6,299 — bold, edgy
- Flowy Wrap Skirt — ₹2,999 — tropical floral

ACCESSORIES
- Pearl Hair Clip Set — ₹1,299 — set of 3
- Leather Belt — ₹2,499 — gold buckle
- Silk Scarf — ₹3,499 — hand-painted, vibrant

BEAUTY
- Rose Lip Tint — ₹1,999 — sensitive skin
- Hydrating Serum — ₹4,599 — dry skin, hyaluronic acid
- Glow Foundation — ₹3,199 — oily skin, luminous
- Matte Nude Lipstick — ₹1,799 — all skin types
- Vitamin C Brightening Cream — ₹3,999 — dry skin
- Eyeshadow Palette — ₹2,899 — sensitive skin, 12 shades
- SPF 50 Sunscreen — ₹1,599 — oily skin, non-greasy
- Micellar Cleansing Water — ₹1,299 — sensitive skin

=== SITE PAGES ===
- Shop all products: [Browse Shop](/products)
- Virtual Try-On room: [Try on with your webcam](/trial-room)
- Beauty & skin tools: [Beauty Guide](/beautify)
- Customer reviews: [Read Reviews](/reviews)
"""

SYSTEM_PROMPT = f"""You are MAISON's warm and knowledgeable personal styling assistant. You help customers discover the perfect clothing, accessories, and beauty products.

{PRODUCT_CATALOG}

## Your Personality
- Warm, elegant, and concise — like a luxury personal shopper
- Use markdown formatting (bold for product names, bullet lists for options)
- Keep responses to 3-5 sentences or a short list

## Your Capabilities
1. Recommend products by occasion, style, season, budget, or skin type
2. Suggest complete outfits combining clothing + accessories
3. Match beauty products to skin type (sensitive, dry, oily, all)
4. Include markdown links like [Browse dresses](/products) when recommending categories
5. Guide users to the [Virtual Trial Room](/trial-room) for try-on
6. Give basic skin care tips and product pairings

## Rules
- ALWAYS include relevant page links when recommending products
- Never make up products not in the catalog
- If outside catalog, suggest the closest available alternative"""


def build_prompt(messages):
    prompt_parts = []
    for message in messages:
        role = message.get("role", "user")
        content = message.get("content", "")
        if role == "assistant":
            prompt_parts.append(f"Assistant: {content}")
        else:
            prompt_parts.append(f"User: {content}")
    return SYSTEM_PROMPT + "\n\n" + "\n".join(prompt_parts)


def extract_output_text(payload):
    candidates = payload.get("candidates", [])
    if not candidates:
        return ""

    content = candidates[0].get("content", {})
    parts = content.get("parts", [])
    text_parts = []
    for part in parts:
        text = part.get("text")
        if text:
            text_parts.append(text)

    return "".join(text_parts).strip()


def ensure_navigation_links(text):
    reply = (text or "").strip()
    lower = reply.lower()
    has_markdown_link = "](" in reply

    links = []
    if any(k in lower for k in ["dress", "blazer", "sweater", "top", "trouser", "skirt", "outfit", "wedding", "shop", "product"]):
        links.append("[Browse Shop](/products)")
    if any(k in lower for k in ["try-on", "try on", "trial room", "webcam", "look"]):
        links.append("[Virtual Trial Room](/trial-room)")
    if any(k in lower for k in ["skin", "beauty", "serum", "foundation", "lip", "sunscreen", "cleanser", "makeup"]):
        links.append("[Beauty Guide](/beautify)")
    if any(k in lower for k in ["review", "feedback", "rating"]):
        links.append("[Read Reviews](/reviews)")

    if not links:
        links = ["[Browse Shop](/products)", "[Virtual Trial Room](/trial-room)"]

    # If the model already added links, keep the reply unchanged.
    if has_markdown_link:
        return reply

    link_line = "Explore: " + " | ".join(links)
    if reply:
        return f"{reply}\n\n{link_line}"
    return link_line


PRODUCT_LINKS = {
    "Silk Wrap Dress": "1",
    "Floral Midi Dress": "21",
    "Linen Shirt Dress": "22",
    "Velvet Evening Gown": "23",
    "Linen Blazer": "2",
    "Plaid Oversized Blazer": "24",
    "Velvet Blazer": "25",
    "Cashmere Sweater": "3",
    "Ribbed Turtleneck": "26",
    "Cable Knit Cardigan": "27",
    "Satin Camisole": "7",
    "Cropped Linen Blouse": "28",
    "Silk Button-Down": "29",
    "Wide Leg Trousers": "6",
    "Tailored Cigarette Pants": "30",
    "Pleated Palazzo Pants": "31",
    "Pleated Midi Skirt": "32",
    "Leather Mini Skirt": "33",
    "Flowy Wrap Skirt": "34",
    "Pearl Hair Clip Set": "35",
    "Leather Belt": "36",
    "Silk Scarf": "37",
    "Rose Lip Tint": "4",
    "Hydrating Serum": "5",
    "Glow Foundation": "8",
    "Matte Nude Lipstick": "38",
    "Vitamin C Brightening Cream": "39",
    "Eyeshadow Palette": "40",
    "SPF 50 Sunscreen": "41",
    "Micellar Cleansing Water": "42",
}


def linkify_product_mentions(text):
    linked = text or ""
    for product_name, product_id in sorted(PRODUCT_LINKS.items(), key=lambda kv: len(kv[0]), reverse=True):
        url = f"/products?product={product_id}"
        linked_token = f"]({url})"
        if linked_token in linked:
            continue

        bold_plain = f"**{product_name}**"
        bold_link = f"**[{product_name}]({url})**"
        linked = linked.replace(bold_plain, bold_link)

        pattern = re.compile(rf"(?<!\[)\b{re.escape(product_name)}\b(?!\]\()")
        linked = pattern.sub(f"[{product_name}]({url})", linked)
    return linked


def local_fallback_reply(user_text):
    t = (user_text or "").lower()
    if any(k in t for k in ["dry skin", "oily skin", "sensitive", "skin"]):
        return (
            "I can still help while live AI is temporarily unavailable.\n\n"
            "For skin-focused picks:\n"
            "- **Dry skin**: **Hydrating Serum**, **Vitamin C Brightening Cream**\n"
            "- **Oily skin**: **Glow Foundation**, **SPF 50 Sunscreen**\n"
            "- **Sensitive skin**: **Rose Lip Tint**, **Micellar Cleansing Water**\n\n"
            "Explore more in [Beauty Guide](/beautify) or [Browse Shop](/products)."
        )
    if any(k in t for k in ["wedding", "party", "outfit", "dress", "look"]):
        return (
            "I can still suggest outfits while live AI is temporarily unavailable.\n\n"
            "Try this look:\n"
            "- **Velvet Evening Gown**\n"
            "- **Leather Belt**\n"
            "- **Silk Scarf**\n\n"
            "Want to test the style? Open [Virtual Trial Room](/trial-room) or [Browse Shop](/products)."
        )
    return (
        "Live AI is temporarily unavailable due to API quota limits, but I can still guide you.\n\n"
        "You can:\n"
        "- Browse curated picks in [Browse Shop](/products)\n"
        "- Try looks in [Virtual Trial Room](/trial-room)\n"
        "- Get skin help in [Beauty Guide](/beautify)\n\n"
        "Tell me your occasion, budget, or skin type and I’ll suggest products from our catalog."
    )


def model_candidates():
    configured = os.environ.get("GEMINI_MODEL", "").strip()
    if configured:
        return [configured]

    # Try modern defaults first; keys/projects can have different model availability.
    return [
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "gemini-1.5-pro",
    ]


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    if request.method == "OPTIONS":
        return Response(status=200)

    try:
        data = request.get_json()
        messages = data.get("messages", [])

        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            return Response(
                json.dumps({"error": "GEMINI_API_KEY not set in environment"}),
                status=500,
                mimetype="application/json"
            )

        prompt_text = build_prompt(messages)

        def call_endpoint(model_name: str):
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
            return requests.post(
                url,
                params={"key": api_key},
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"role": "user", "parts": [{"text": prompt_text}]}],
                    "generationConfig": {
                        "temperature": 0.7,
                        "maxOutputTokens": 1024,
                    },
                },
                timeout=30,
            )

        response = None
        selected_model = None
        errors = []
        for candidate in model_candidates():
            attempt = call_endpoint(candidate)
            if attempt.ok:
                response = attempt
                selected_model = candidate
                break

            # Keep trying on "not found" and similar model-access errors.
            if attempt.status_code in (400, 403, 404):
                errors.append(f"{candidate}: {attempt.status_code} - {attempt.text}")
                continue

            response = attempt
            selected_model = candidate
            break

        if response is None:
            return Response(
                json.dumps({"error": "No Gemini model candidates configured."}),
                status=500,
                mimetype="application/json"
            )

        if not response.ok:
            error_text = response.text
            if errors:
                error_text = " | ".join(errors)
            if response.status_code == 429:
                last_user_text = ""
                for m in reversed(messages):
                    if m.get("role") == "user":
                        last_user_text = m.get("content", "")
                        break
                output_text = ensure_navigation_links(linkify_product_mentions(local_fallback_reply(last_user_text)))
                def generate_fallback():
                    chunk = {"choices": [{"delta": {"content": output_text}}]}
                    yield f"data: {json.dumps(chunk)}\n\n"
                    yield "data: [DONE]\n\n"
                return Response(
                    stream_with_context(generate_fallback()),
                    mimetype="text/event-stream",
                    headers={
                        "Cache-Control": "no-cache",
                        "X-Accel-Buffering": "no",
                    }
                )
            return Response(
                json.dumps({"error": f"Gemini request failed: {response.status_code} - {error_text}"}),
                status=500,
                mimetype="application/json"
            )

        result = response.json()
        output_text = ""
        if isinstance(result, dict):
            output_text = extract_output_text(result)

        if not output_text:
            return Response(
                json.dumps({"error": f"Gemini model '{selected_model}' returned no text output: {json.dumps(result)}"}),
                status=500,
                mimetype="application/json"
            )
        output_text = ensure_navigation_links(linkify_product_mentions(output_text))
        
        def generate():
            chunk = {
                "choices": [{"delta": {"content": output_text}}]
            }
            yield f"data: {json.dumps(chunk)}\n\n"
            yield "data: [DONE]\n\n"

        return Response(
            stream_with_context(generate()),
            mimetype="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )

    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}),
            status=500,
            mimetype="application/json"
        )


if __name__ == "__main__":
    print("✅ MAISON chatbot server running at http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
