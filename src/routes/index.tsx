import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import cardTemplate from "@/assets/card-template.jpg";
import logo from "@/assets/logo.png";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

function Index() {
  const [name, setName] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamic import of client-side utilities
      const { downloadCardAsPng } = await import("@/lib/client-utils");
      const { toast } = await import("sonner");

      const result = await downloadCardAsPng(
        cardRef.current,
        `appreciation-${name || "card"}.png`,
      );

      if (result.method === "ios-preview" && result.dataUrl) {
        setPreviewImage(result.dataUrl);
        setPreviewOpen(true);
        toast.success("تم تجهيز البطاقة بنجاح، يرجى حفظها من نافذة المعاينة");
      } else if (result.method === "share") {
        toast.success("تمت مشاركة وحفظ البطاقة بنجاح");
      } else {
        toast.success("تم تنزيل البطاقة كاملة والتحقق منها بجودة عالية");
      }
    } catch (e) {
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
            draggable={false}
          />
          {/* Name overlay - positioned where the original name appears in the template */}
          <div
            className="absolute left-0 right-0 flex items-center justify-center px-4"
            style={{ top: "80.5%" }}
          >
            <span
              data-card-name
              className="text-center leading-tight"
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(16px, 4.2vw, 23px)",
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

      {/* Dialog for iOS Save Card Preview */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-[440px] w-[90%] p-6 rounded-2xl bg-[#323C3A] border-[#CFC7C0]/20 text-[#E0DFDC] shadow-2xl flex flex-col items-center gap-4">
          <DialogHeader className="w-full text-center space-y-2">
            <DialogTitle className="text-xl font-bold text-[#E0DFDC] font-sans">
              حفظ بطاقة التهنئة
            </DialogTitle>
            <DialogDescription className="text-[#CFC7C0] text-sm leading-relaxed text-center flex flex-col gap-2">
              <span>
                تم تجهيز الصورة كاملة بنجاح! اضغط مطولاً على البطاقة بالأسفل ثم اختر{" "}
                <span className="font-semibold text-white">"حفظ في الصور"</span>.
              </span>
              <span className="text-xs border-t border-[#CFC7C0]/10 pt-2 opacity-90 block" dir="ltr">
                The complete image has been prepared successfully! Press and hold the card below, then select{" "}
                <span className="font-semibold text-white">"Save Image"</span>.
              </span>
            </DialogDescription>
          </DialogHeader>

          {previewImage && (
            <div className="relative w-full max-w-[280px] aspect-[9/16] mt-2 overflow-hidden rounded-xl shadow-lg border border-[#CFC7C0]/15">
              <img
                src={previewImage}
                alt="بطاقة التهنئة"
                className="w-full h-full object-cover pointer-events-auto select-auto"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => setPreviewOpen(false)}
            className="w-full mt-2 rounded-full py-3.5 text-base font-semibold transition-all duration-200 hover:brightness-95 active:scale-[0.98]"
            style={{
              backgroundColor: "#92BF55",
              color: "#323C3A",
              fontFamily: "'IBM Plex Sans Arabic', sans-serif",
            }}
          >
            إغلاق
          </button>
        </DialogContent>
      </Dialog>
    </main>
  );
}
