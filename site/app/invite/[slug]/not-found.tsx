import Link from "next/link";

export default function InviteNotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-4 text-center">
      <p className="invite-eyebrow mb-4">TENEGTA</p>
      <h1 className="invite-section-title text-white">الدعوة غير موجودة</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/55">
        الرابط غير صالح أو انتهت صلاحيته. تواصل مع فريق TENEGTA إذا كنت تعتقد أن
        هذا خطأ.
      </p>
      <Link href="/ar" className="invite-cta-primary mt-10 min-w-[200px]">
        العودة إلى الموقع
      </Link>
    </div>
  );
}
