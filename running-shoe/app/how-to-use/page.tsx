import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "../site-footer";

export const metadata: Metadata = {
  title: "이용 방법 · 러닝화 계급도",
  description:
    "러닝화 계급도 보는 법과 등급 기준 안내. 데일리(입문·맥스쿠션·안정·올라운더·경량)부터 슈퍼 트레이너, 카본 레이싱까지 등급별 특징을 정리했습니다.",
  alternates: { canonical: "/how-to-use" },
};

const STEPS = [
  {
    title: "브랜드로 좁혀 보기",
    body: "상단 브랜드 칩에서 원하는 브랜드를 누르면 해당 브랜드 러닝화만 등급별로 볼 수 있어요. '전체'를 누르면 모든 브랜드를 한 표에서 비교합니다.",
  },
  {
    title: "등급(계급)에서 위치 확인",
    body: "표의 세로축은 등급입니다. 입문화·맥스쿠션·안정화 같은 데일리부터 카본 레이싱까지, 용도에 맞는 줄을 보세요.",
  },
  {
    title: "신발을 눌러 상세 보기",
    body: "칸 안의 신발 이름을 누르면 참고가, 특징 설명, 구매 링크가 나옵니다.",
  },
  {
    title: "쿠팡에서 최저가 확인",
    body: "상세 창의 '쿠팡에서 최저가 확인' 버튼으로 실제 판매 가격과 재고를 확인하고 구매할 수 있어요.",
  },
];

const TIERS_GUIDE = [
  {
    group: "데일리",
    items: [
      ["입문화", "처음 러닝을 시작하거나 가볍게 뛰는 사람을 위한 무난한 쿠션·내구성 모델."],
      ["맥스 쿠션화", "미드솔이 두꺼워 장거리·회복주에서 발을 푹신하게 받쳐주는 신발."],
      ["안정화", "발이 안쪽으로 무너지는 과내전을 잡아줘 부상 위험을 줄이는 구조."],
      ["올라운더", "조깅부터 템포런까지 하나로 두루 소화하는 균형형 데일리화."],
      ["경량 트레이너", "가벼워서 스피드 훈련·인터벌에 잘 맞는 트레이너."],
    ],
  },
  {
    group: "슈퍼 트레이너",
    items: [
      ["논 플레이트", "플레이트 없이 반발 폼만으로 경쾌하게 밀어주는 고급 데일리·템포화."],
      ["라이트 플레이트", "부드러운 플레이트로 데일리와 템포런을 모두 커버."],
      ["카본 플레이트", "카본을 넣어 훈련에서도 강한 반발을 주는 슈퍼 트레이너."],
    ],
  },
  {
    group: "레이싱",
    items: [
      ["중거리", "5~10km 등 짧은 레이스에 맞춘 경량 카본 레이싱화."],
      ["장거리", "하프·풀 마라톤 기록 단축을 위한 최상위 카본 레이싱화."],
    ],
  },
];

export default function HowToUsePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 antialiased">
      <main className="mx-auto w-full max-w-[640px] px-5 py-10 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          <span aria-hidden>←</span> 홈으로
        </Link>

        <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
          러닝화 계급도 이용 방법
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-500">
          네 단계면 내게 맞는 러닝화를 찾을 수 있어요.
        </p>

        <ol className="mt-8 space-y-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: "#4f46e5" }}
              >
                {i + 1}
              </span>
              <div className="pt-1">
                <h2 className="text-base font-bold text-zinc-900">
                  {step.title}
                </h2>
                <p className="mt-1 text-[15px] leading-relaxed text-zinc-600">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <section className="mt-10">
          <h2 className="text-lg font-bold text-zinc-900">등급 기준 한눈에</h2>
          <div className="mt-4 space-y-6">
            {TIERS_GUIDE.map((g) => (
              <div key={g.group}>
                <h3 className="text-sm font-bold text-indigo-600">{g.group}</h3>
                <dl className="mt-2 space-y-2">
                  {g.items.map(([name, desc]) => (
                    <div
                      key={name}
                      className="rounded-xl bg-zinc-50 px-4 py-3 text-[15px] leading-relaxed"
                    >
                      <dt className="font-bold text-zinc-800">{name}</dt>
                      <dd className="mt-0.5 text-zinc-600">{desc}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl bg-indigo-50 px-5 py-4 text-[15px] leading-relaxed text-indigo-900">
          <h2 className="mb-2 font-bold">알아두면 좋은 점</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>등급은 절대적인 순위가 아니라 용도·특성 분류에 가깝습니다.</li>
            <li>발 형태, 주력 거리, 훈련 목적에 따라 최적의 신발은 달라집니다.</li>
            <li>가격은 참고용이며, 실제 최저가는 쿠팡 링크에서 확인하세요.</li>
          </ul>
        </section>

        <footer className="mt-12 border-t border-zinc-100 pt-6 pb-10 text-center text-xs text-zinc-400">
          <p>© 2026 러닝화 계급도</p>
          <SiteFooter />
        </footer>
      </main>
    </div>
  );
}
