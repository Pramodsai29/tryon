import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { Components } from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

const CHAT_URL = `http://localhost:5000/chat`;

// Map product keywords to internal page links
const QUICK_LINKS = [
  { label: "Shop All Products", href: "/products" },
  { label: "Virtual Trial Room", href: "/trial-room" },
  { label: "Beauty Tools", href: "/beautify" },
  { label: "Write a Review", href: "/reviews" },
];

const PRODUCT_LINKS: Record<string, string> = {
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
};

const linkifyProducts = (text: string) => {
  let out = text;
  const entries = Object.entries(PRODUCT_LINKS).sort((a, b) => b[0].length - a[0].length);
  for (const [name, id] of entries) {
    const url = `/products?product=${id}`;
    if (out.includes(`](${url})`)) continue;
    out = out.replaceAll(`**${name}**`, `**[${name}](${url})**`);
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`(?<!\\[)\\b${escaped}\\b(?!\\]\\()`, "g");
    out = out.replace(re, `[${name}](${url})`);
  }
  return out;
};

const markdownComponents: Components = {
  a: ({ href, children }) => (
    <a
      href={href}
      target={href?.startsWith("http") ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="underline text-accent hover:text-primary font-medium transition-colors"
    >
      {children}
    </a>
  ),
  p: ({ children }) => <p className="mb-1 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="list-disc pl-4 space-y-0.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal pl-4 space-y-0.5">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
};

const StyleChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Welcome to **MAISON**! ✨ I'm your personal styling assistant.\n\nI can help you find the perfect outfit, match beauty products to your skin type, or guide you through our [virtual trial room](/trial-room).\n\nTell me your style, occasion, or skin type — or just ask anything!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async (text?: string) => {
    const msgText = (text ?? input).trim();
    if (!msgText || isLoading) return;

    const userMsg: Msg = { role: "user", content: msgText };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const allMessages = [...messages.filter((m) => m !== messages[0]), userMsg];

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.json().catch(() => ({ error: "Something went wrong" }));
        setMessages((prev) => [...prev, { role: "assistant", content: err.error || "Sorry, something went wrong. Please try again." }]);
        setIsLoading(false);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              const snapshot = assistantSoFar;
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && last.content !== messages[0].content) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: snapshot } : m));
                }
                return [...prev, { role: "assistant", content: snapshot }];
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please check your connection." }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
          aria-label="Open style assistant"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[520px] w-[370px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-primary px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary-foreground" />
              <span className="font-display text-sm font-medium tracking-wide text-primary-foreground">
                Style Assistant
              </span>
              <span className="rounded-full bg-green-400 h-2 w-2 animate-pulse" title="Online" />
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Quick links */}
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-b border-border bg-secondary/50">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-accent transition-colors whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-foreground"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0">
                      <ReactMarkdown components={markdownComponents}>{linkifyProducts(m.content)}</ReactMarkdown>
                    </div>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-secondary px-4 py-2 text-sm text-muted-foreground">
                  <span className="animate-pulse">Styling for you...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggestion chips */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-1.5 px-3 pb-1">
              {["Suggest an outfit for a wedding", "Best products for dry skin", "How do I use the trial room?"].map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); send(); }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask for outfit ideas..."
                className="flex-1 rounded-full border border-border bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default StyleChatbot;
