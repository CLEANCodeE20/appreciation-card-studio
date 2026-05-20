import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import cardTemplate from "@/assets/card-template.jpg";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "بطاقة تهنئة الموظفين | Employee Appreciation Card" },
      {
        name: "description",
        content:
          "اصنع بطاقة تهنئة شخصية باسمك وحمّلها بجودة عالية. Generate a personalized appreciation card.",
      },
    ],
  }),
});

function isIOSDevice() {
  return (
    typeof navigator !== "undefined" &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1))
  );
}

function Index() {
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    const iosWindow = isIOSDevice() ? window.open("", "_blank") : null;
    setDownloading(true);
    try {
      // Dynamic import of client-side utilities
      const { downloadCardAsPng } = await import("@/lib/client-utils");
      const { toast } = await import("sonner");

      const result = await downloadCardAsPng(cardRef.current, `appreciation-${name || "card"}.png`, { iosWindow });
      toast.success(
        result.method === "ios-preview"
          ? "تم تجهيز البطاقة كاملة والتحقق منها، احفظها من النافذة الجديدة"
          : "تم تنزيل البطاقة كاملة والتحقق منها بجودة عالية",
      );
    } catch (e) {
      iosWindow?.close();
      console.error(e);
      const { toast } = await import("sonner");
      toast.error("تعذّر تنزيل البطاقة، حاول مرة أخرى");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: "#323C3A", color: "#E0DFDC" }}
    >
      {/* Header */}
      <header className="w-full py-8 flex justify-center">
        <img src={logo} alt="شعار الشركة" className="h-12 w-auto object-contain" />
      </header>

      {/* Hero */}
      <section className="px-6 text-center max-w-2xl">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug"
          style={{ color: "#E0DFDC" }}
        >
          عيد أضحى مبارك… شكرًا لجهودكم التي تصنع فرقنا
        </h1>
        <p className="mt-3 text-sm sm:text-base font-normal" style={{ color: "#CFC7C0" }}>
          اكتب اسمك واصنع بطاقتك المخصصة باسمك
        </p>
      </section>

      {/* Card Preview */}
      <section className="w-full px-4 mt-8 flex justify-center">
        <div
          ref={cardRef}
          className="relative w-full max-w-[420px] aspect-[9/16] overflow-hidden rounded-xl shadow-2xl"
          style={{ backgroundColor: "#E0DFDC" }}
        >
          <img
            src={cardTemplate}
            alt="قالب البطاقة"
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
            crossOrigin="anonymous"
            draggable={false}
          />
          {/* Name overlay - positioned where the original name appears in the template */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center px-4"
            style={{ top: "82%" }}
          >
            <span
              data-card-name
              className="text-center leading-tight"
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(14px, 3.8vw, 20px)",
                letterSpacing: "0.02em",
                textShadow: "0 1px 6px rgba(0,0,0,0.35)",
                fontFamily: "'IBM Plex Sans Arabic', sans-serif",
                fontWeight: 500,
              }}
            >
              {name || "\u00A0"}
            </span>
          </div>
        </div>
      </section>

      {/* Input */}
      <section className="w-full max-w-md px-6 mt-8">
        <label htmlFor="name" className="sr-only">
          اكتب اسمك
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="اكتب اسمك هنا"
          className="w-full rounded-full px-6 py-4 text-center text-lg outline-none transition focus:ring-2"
          style={{
            backgroundColor: "#CFC7C0",
            color: "#5E6465",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            fontWeight: 500,
          }}
        />
      </section>

      {/* Actions */}
      <section className="w-full max-w-md px-6 mt-6 mb-12 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={async () => {
            const { focusInputById } = await import("@/lib/client-utils");
            focusInputById("name");
          }}
          className="flex-1 rounded-full py-4 text-base font-semibold transition-all duration-200 hover:brightness-90 active:scale-[0.98]"
          style={{
            backgroundColor: "#92BF55",
            color: "#323C3A",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          إنشاء البطاقة
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="flex-1 rounded-full py-4 text-base font-semibold transition-all duration-200 hover:brightness-90 active:scale-[0.98] disabled:opacity-60"
          style={{
            backgroundColor: "#92BF55",
            color: "#323C3A",
            fontFamily: "'IBM Plex Sans Arabic', sans-serif",
          }}
        >
          {downloading ? "...جاري التحميل" : "تحميل البطاقة PNG"}
        </button>
      </section>
    </main>
  );
}
