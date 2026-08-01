"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import eleeveonIcon from "../public/favicon_io/android-chrome-192x192.png";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type BillingCycle = "monthly" | "termly" | "yearly";

type Plan = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  currency?: string | null;
  priceMonthly?: number;
  priceTermly?: number;
  priceYearly?: number;
  maxStudents?: number | null;
  maxBranches?: number | null;
  maxUsers?: number | null;
  schoolWebsites?: boolean;
  active?: boolean;
  features?: string[] | null;
  metadata?: {
    recommended?: boolean;
    badge?: string | null;
    displayOrder?: number | null;
    featureFlags?: Record<string, boolean>;
    featureKeys?: string[];
    [key: string]: unknown;
  } | null;
};

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

const FEATURES: Feature[] = [
  {
    icon: "🏫",
    title: "School identity",
    description:
      "Bring your school name, colours, logo, motto and branch information together in one polished public presence.",
  },
  {
    icon: "📰",
    title: "News and announcements",
    description:
      "Publish important updates from Eleeveon Schools and keep families informed without re-entering the same information.",
  },
  {
    icon: "📷",
    title: "Media and galleries",
    description:
      "Showcase ceremonies, projects, facilities and daily school life using the same managed media system.",
  },
  {
    icon: "📚",
    title: "Academic information",
    description:
      "Present programmes, subjects, curriculum pathways and other approved academic information clearly.",
  },
  {
    icon: "📅",
    title: "Calendar-aware",
    description:
      "Display reopening dates, closing dates, upcoming events and key school activities from one source of truth.",
  },
  {
    icon: "📱",
    title: "Built for every screen",
    description:
      "Responsive templates give parents, students and prospective families a dependable experience on phones and computers.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Manage the school",
    description:
      "Update school records, branding, announcements, events and approved public information inside Eleeveon Schools.",
  },
  {
    number: "02",
    title: "Choose the experience",
    description:
      "Select a website template, arrange the pages and sections, then control what should be public.",
  },
  {
    number: "03",
    title: "Publish instantly",
    description:
      "The school website becomes available on its Eleeveon subdomain and stays connected to current school information.",
  },
];

function normalizePlans(payload: unknown): Plan[] {
  if (Array.isArray(payload)) return payload as Plan[];

  if (payload && typeof payload === "object") {
    const value = payload as Record<string, unknown>;

    for (const key of ["plans", "data", "items", "results"]) {
      if (Array.isArray(value[key])) return value[key] as Plan[];
    }
  }

  return [];
}

function planPrice(plan: Plan, cycle: BillingCycle): number {
  if (cycle === "yearly") return Number(plan.priceYearly || 0);

  if (cycle === "termly") {
    const configured = Number(plan.priceTermly || 0);
    return configured > 0
      ? configured
      : Number(plan.priceMonthly || 0) * 4;
  }

  return Number(plan.priceMonthly || 0);
}

function billingCycleLabel(cycle: BillingCycle): string {
  if (cycle === "termly") return "4 months";
  if (cycle === "yearly") return "year";
  return "month";
}

function formatMoney(amount: number, currency = "GHS"): string {
  try {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  } catch {
    return `${currency} ${Number(amount || 0).toLocaleString()}`;
  }
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
    >
      <path
        d="M4 10h11M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridMark() {
  return (
    <span
      aria-hidden="true"
      className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10"
    >
      <Image
        src={eleeveonIcon}
        alt=""
        width={40}
        height={40}
        priority
        className="h-full w-full object-contain"
      />
    </span>
  );
}

export default function Home() {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState("");
  const [billingCycle, setBillingCycle] =
    useState<BillingCycle>("termly");
  const [pricingPage, setPricingPage] = useState(0);
  const [pricingCardsPerPage, setPricingCardsPerPage] = useState(1);

  useEffect(() => {
    const updatePricingLayout = () => {
      const width = window.innerWidth;

      setPricingCardsPerPage(
        width >= 1024 ? 3 : width >= 640 ? 2 : 1,
      );
    };

    updatePricingLayout();
    window.addEventListener("resize", updatePricingLayout);

    return () => {
      window.removeEventListener("resize", updatePricingLayout);
    };
  }, []);

  useEffect(() => {
    setPricingPage(0);
  }, [billingCycle, pricingCardsPerPage, plans.length]);

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError("");

        const response = await fetch(`${API_BASE_URL}/billing/plans`, {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        const text = await response.text();
        let payload: unknown = null;

        try {
          payload = text ? JSON.parse(text) : null;
        } catch {
          payload = text;
        }

        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            "message" in payload
              ? String(
                  (payload as { message?: unknown }).message || "",
                )
              : "";

          throw new Error(
            message || `Unable to load plans (${response.status}).`,
          );
        }

        const activePlans = normalizePlans(payload)
          .filter((plan) => plan.active !== false)
          .filter(
            (plan) =>
              plan.schoolWebsites === true ||
              plan.metadata?.featureFlags?.schoolWebsites === true ||
              plan.features?.includes("schoolWebsites") ||
              plan.metadata?.featureKeys?.includes("schoolWebsites"),
          )
          .sort((a, b) => {
            const aOrder = Number(
              a.metadata?.displayOrder ?? 999,
            );
            const bOrder = Number(
              b.metadata?.displayOrder ?? 999,
            );

            if (aOrder !== bOrder) return aOrder - bOrder;

            return (
              Number(a.priceMonthly || 0) -
              Number(b.priceMonthly || 0)
            );
          });

        if (!cancelled) {
          setPlans(activePlans);
        }
      } catch (error) {
        if (!cancelled) {
          setPlansError(
            error instanceof Error
              ? error.message
              : "Unable to load subscription plans.",
          );
        }
      } finally {
        if (!cancelled) {
          setPlansLoading(false);
        }
      }
    };

    void loadPlans();

    return () => {
      cancelled = true;
    };
  }, []);

  const pricingPageCount = Math.max(
    1,
    Math.ceil(plans.length / pricingCardsPerPage),
  );

  const safePricingPage = Math.min(
    pricingPage,
    pricingPageCount - 1,
  );

  const visiblePricingPlans = plans.slice(
    safePricingPage * pricingCardsPerPage,
    safePricingPage * pricingCardsPerPage +
      pricingCardsPerPage,
  );

  const goToPricingPage = (page: number) => {
    const normalized =
      (page + pricingPageCount) % pricingPageCount;

    setPricingPage(normalized);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-white text-zinc-950 selection:bg-zinc-950 selection:text-white dark:bg-zinc-950 dark:text-white dark:selection:bg-white dark:selection:text-zinc-950">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-195 overflow-hidden">
        <div className="absolute left-1/2 -top-85 h-170 w-170 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,111,237,0.18),rgba(47,111,237,0)_68%)]" />
        <div className="absolute -right-55 top-48 h-120 w-120 rounded-full bg-[radial-gradient(circle,rgba(138,92,246,0.12),rgba(138,92,246,0)_70%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(24,24,27,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.045)_1px,transparent_1px)] bg-size-[44px_44px] mask-[linear-gradient(to_bottom,black,transparent_82%)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)]" />
      </div>

      <header className="relative z-10 border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/75">
        <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:min-h-18 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <GridMark />
            <div>
              <div className="text-sm font-semibold tracking-tight">
                Eleeveon
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                School Websites
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm text-zinc-600 md:flex dark:text-zinc-300">
            <a href="#features" className="transition hover:text-zinc-950 dark:hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="transition hover:text-zinc-950 dark:hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="transition hover:text-zinc-950 dark:hover:text-white">
              Pricing
            </a>
            <a href="#platform" className="transition hover:text-zinc-950 dark:hover:text-white">
              Platform
            </a>
          </nav>

          <a
            href="https://schools.eleeveon.com"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-zinc-950 px-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-zinc-800 sm:px-4 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            <span className="hidden sm:inline">Open Eleeveon Schools</span>
            <span className="sm:hidden">Open</span>
            <ArrowIcon />
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-14 sm:gap-14 sm:px-8 sm:py-20 lg:min-h-180 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-zinc-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Connected to Eleeveon Schools
          </div>

          <h1 className="mt-6 max-w-3xl text-[2.55rem] font-semibold leading-[1.02] tracking-[-0.052em] sm:mt-7 sm:text-6xl lg:text-7xl">
            A living digital front door for every school.
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-7 text-zinc-600 sm:mt-7 sm:text-xl sm:leading-8 dark:text-zinc-300">
            Eleeveon School Websites turns approved school information into a
            professional, responsive public website—without making schools
            manage the same information twice.
          </p>

          <div className="mt-7 grid gap-3 sm:mt-9 sm:flex sm:flex-row">
            <a
              href="https://schools.eleeveon.com"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 text-sm font-semibold text-white shadow-lg shadow-zinc-950/10 transition hover:-translate-y-0.5 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              Visit Eleeveon Schools
              <ArrowIcon />
            </a>

            <a
              href="#how-it-works"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-800 transition hover:-translate-y-0.5 hover:bg-zinc-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              See how it works
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span>Automatic subdomains</span>
            <span>Template-based design</span>
            <span>Mobile responsive</span>
            <span>Shared school data</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-10 -z-10 rounded-[40px] bg-[radial-gradient(circle_at_top,rgba(47,111,237,0.16),transparent_65%)] blur-2xl" />

          <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10 sm:rounded-[30px] dark:border-white/10 dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
                your-school.eleeveon.com
              </div>
              <div className="w-12" />
            </div>

            <div className="border-b border-zinc-200 bg-linear-to-br from-[#173d8f] via-[#2f6fed] to-[#7a5cf5] px-5 py-9 text-white sm:px-7 sm:py-12 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-lg font-bold backdrop-blur">
                  EA
                </div>
                <div>
                  <div className="font-semibold">Eleeveon Academy</div>
                  <div className="text-xs text-white/70">
                    Knowledge · Character · Excellence
                  </div>
                </div>
              </div>

              <div className="mt-12 max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  Welcome
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Preparing confident learners for a changing world.
                </h2>
                <p className="mt-4 text-sm leading-6 text-white/80">
                  Explore our programmes, school life, announcements and
                  admissions information.
                </p>
              </div>
            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-3">
              {[
                ["Latest news", "Admissions for the new academic year are open."],
                ["Upcoming event", "Graduation and awards ceremony · 24 August"],
                ["School life", "View recent projects, activities and campus moments."],
              ].map(([title, description]) => (
                <div
                  key={title}
                  className="rounded-2xl border border-zinc-200 p-4 dark:border-white/10 dark:bg-white/3"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                    {title}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-zinc-700 dark:text-zinc-200">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 border-y border-zinc-200 bg-zinc-50/80 dark:border-white/10 dark:bg-white/2.5">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#2f6fed]">
              One connected school presence
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              More than a separate website builder.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              School websites can draw from the information already managed in
              Eleeveon Schools while still giving each institution control over
              what visitors see.
            </p>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-3xl border border-zinc-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-950/5 dark:border-white/10 dark:bg-zinc-900/70"
              >
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-100 text-xl transition group-hover:scale-105 dark:bg-white/10">
                  {feature.icon}
                </div>
                <h3 className="mt-6 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative z-10 mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold text-[#2f6fed]">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
              Update once. Publish with confidence.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Eleeveon keeps the internal school workspace and the public
              website connected while preserving clear publishing controls.
            </p>
          </div>

          <div className="space-y-4">
            {STEPS.map((step) => (
              <article
                key={step.number}
                className="grid gap-5 rounded-3xl border border-zinc-200 bg-white p-6 sm:grid-cols-[72px_1fr] dark:border-white/10 dark:bg-zinc-900/60"
              >
                <div className="text-3xl font-semibold tracking-tight text-zinc-300 dark:text-zinc-700">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="relative z-10 border-y border-zinc-200 bg-zinc-50/80 dark:border-white/10 dark:bg-white/2.5"
      >
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-[#2f6fed]">
                Pricing
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                The school website is part of the same Eleeveon package.
              </h2>
              <p className="mt-5 text-lg leading-8 text-zinc-600 dark:text-zinc-300">
                Choose a package that includes School Websites together with the
                connected Eleeveon Schools capabilities enabled for that plan.
              </p>
            </div>

            <div className="flex w-full overflow-x-auto rounded-full border border-zinc-200 bg-white p-1 shadow-sm [scrollbar-width:none] sm:w-auto [&::-webkit-scrollbar]:hidden dark:border-white/10 dark:bg-zinc-900">
              {(
                ["termly", "monthly", "yearly"] as BillingCycle[]
              ).map((cycle) => (
                <button
                  key={cycle}
                  type="button"
                  onClick={() => setBillingCycle(cycle)}
                  className={`min-w-max flex-1 rounded-full px-4 py-2.5 text-xs font-semibold capitalize transition sm:flex-none sm:px-5 sm:text-sm ${
                    billingCycle === cycle
                      ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                      : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                  }`}
                >
                  {cycle === "termly"
                    ? "Termly · 4 months"
                    : cycle}
                </button>
              ))}
            </div>
          </div>

          {plansLoading ? (
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({
                length: pricingCardsPerPage,
              }).map((_, item) => (
                <div
                  key={item}
                  className="h-135 animate-pulse rounded-4xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-900"
                />
              ))}
            </div>
          ) : plansError ? (
            <div className="mt-12 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
              <h3 className="font-semibold">
                Pricing is temporarily unavailable
              </h3>
              <p className="mt-2 text-sm leading-6 opacity-80">
                {plansError}
              </p>
            </div>
          ) : plans.length ? (
            <div className="mt-12">
              <div className="relative">
                {pricingPageCount > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        goToPricingPage(safePricingPage - 1)
                      }
                      aria-label="Show previous pricing packages"
                      className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-xl shadow-lg transition hover:bg-zinc-50 lg:grid dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                      ‹
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        goToPricingPage(safePricingPage + 1)
                      }
                      aria-label="Show next pricing packages"
                      className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-xl shadow-lg transition hover:bg-zinc-50 lg:grid dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                    >
                      ›
                    </button>
                  </>
                ) : null}

                <div
                  className={`grid items-stretch gap-5 transition-all duration-300 ${
                    pricingCardsPerPage === 3
                      ? "lg:grid-cols-3"
                      : pricingCardsPerPage === 2
                        ? "sm:grid-cols-2"
                        : "grid-cols-1"
                  }`}
                >
                  {visiblePricingPlans.map((plan) => {
                    const index = plans.findIndex(
                      (item) => item.id === plan.id,
                    );
                    const price = planPrice(plan, billingCycle);
                    const currency = plan.currency || "GHS";
                    const monthlyPrice = Number(
                      plan.priceMonthly || 0,
                    );
                    const termlyPrice = planPrice(
                      plan,
                      "termly",
                    );
                    const yearlyPrice = Number(
                      plan.priceYearly || 0,
                    );
                    const termlySaving =
                      monthlyPrice * 4 - termlyPrice;
                    const yearlySaving =
                      monthlyPrice * 12 - yearlyPrice;
                    const recommended =
                      plan.metadata?.recommended === true ||
                      index === Math.min(1, plans.length - 1);

                    const signupUrl = new URL(
                      "https://schools.eleeveon.com",
                    );
                    signupUrl.searchParams.set(
                      "planId",
                      plan.id,
                    );
                    signupUrl.searchParams.set(
                      "billingCycle",
                      billingCycle,
                    );
                    signupUrl.searchParams.set(
                      "source",
                      "school-websites-pricing",
                    );

                    return (
                      <article
                        key={plan.id}
                        className={`relative flex min-h-full flex-col overflow-hidden rounded-4xl border bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-zinc-950/8 dark:bg-zinc-900 ${
                          recommended
                            ? "border-[#2f6fed] shadow-xl shadow-[#2f6fed]/10"
                            : "border-zinc-200 dark:border-white/10"
                        }`}
                      >
                        {recommended ? (
                          <div className="absolute right-5 top-5 rounded-full bg-[#2f6fed] px-3 py-1 text-xs font-semibold text-white">
                            {plan.metadata?.badge || "Popular"}
                          </div>
                        ) : null}

                        <div className="pr-20">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2f6fed]">
                            {plan.code}
                          </p>
                          <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                            {plan.name}
                          </h3>
                        </div>

                        <p className="mt-4 min-h-18 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                          {plan.description ||
                            "An Eleeveon Schools package that includes a connected professional school website."}
                        </p>

                        <div className="mt-6">
                          <div className="flex items-end gap-2">
                            <strong className="text-4xl font-semibold tracking-tighter">
                              {formatMoney(price, currency)}
                            </strong>
                            <span className="pb-1 text-sm text-zinc-500 dark:text-zinc-400">
                              /{billingCycleLabel(billingCycle)}
                            </span>
                          </div>

                          {billingCycle === "termly" &&
                          termlySaving > 0 ? (
                            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Save{" "}
                              {formatMoney(
                                termlySaving,
                                currency,
                              )}{" "}
                              compared with four monthly payments.
                            </p>
                          ) : billingCycle === "yearly" &&
                            yearlySaving > 0 ? (
                            <p className="mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              Save{" "}
                              {formatMoney(
                                yearlySaving,
                                currency,
                              )}{" "}
                              compared with twelve monthly payments.
                            </p>
                          ) : (
                            <p className="mt-2 text-xs text-zinc-400">
                              Includes the connected school website
                              capability enabled for this package.
                            </p>
                          )}
                        </div>

                        <div className="mt-6 grid grid-cols-3 gap-2">
                          {[
                            [plan.maxStudents, "students"],
                            [plan.maxBranches, "branches"],
                            [plan.maxUsers, "users"],
                          ].map(([value, label]) => (
                            <div
                              key={String(label)}
                              className="rounded-2xl bg-zinc-50 px-3 py-3 dark:bg-white/5"
                            >
                              <strong className="block text-sm font-semibold">
                                {value == null
                                  ? "Flexible"
                                  : Number(
                                      value,
                                    ).toLocaleString()}
                              </strong>
                              <span className="mt-1 block text-xs text-zinc-500 dark:text-zinc-400">
                                {label}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="mt-7 border-t border-zinc-200 pt-6 dark:border-white/10">
                          <ul className="space-y-3">
                            {[
                              "Professional school website",
                              "Automatic Eleeveon subdomain",
                              "Connected school identity and content",
                              "Responsive templates",
                              "News, calendar and media publishing",
                            ].map((feature) => (
                              <li
                                key={feature}
                                className="flex gap-3 text-sm leading-5 text-zinc-700 dark:text-zinc-200"
                              >
                                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                                  ✓
                                </span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="mt-auto pt-7">
                          <a
                            href={signupUrl.toString()}
                            className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                              recommended
                                ? "bg-[#2f6fed] text-white hover:bg-[#245ed0]"
                                : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                            }`}
                          >
                            Create account with {plan.name}
                            <ArrowIcon />
                          </a>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              {pricingPageCount > 1 ? (
                <div className="mt-7 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      goToPricingPage(safePricingPage - 1)
                    }
                    aria-label="Previous pricing page"
                    className="mr-2 grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-lg shadow-sm transition hover:bg-zinc-50 lg:hidden dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    ‹
                  </button>

                  {Array.from({
                    length: pricingPageCount,
                  }).map((_, page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() =>
                        goToPricingPage(page)
                      }
                      aria-label={`Show pricing page ${page + 1}`}
                      aria-current={
                        safePricingPage === page
                          ? "true"
                          : undefined
                      }
                      className={`h-2.5 rounded-full transition-all ${
                        safePricingPage === page
                          ? "w-8 bg-[#2f6fed]"
                          : "w-2.5 bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                      }`}
                    />
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      goToPricingPage(safePricingPage + 1)
                    }
                    aria-label="Next pricing page"
                    className="ml-2 grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-lg shadow-sm transition hover:bg-zinc-50 lg:hidden dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    ›
                  </button>
                </div>
              ) : null}

              <p className="mt-3 text-center text-xs text-zinc-400">
                {pricingCardsPerPage === 1
                  ? "Use the dots or arrows to view each package."
                  : pricingCardsPerPage === 2
                    ? "Two packages are shown at a time."
                    : "Three packages are shown at a time."}
              </p>
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-white/15 dark:bg-zinc-900">
              <h3 className="font-semibold">
                Website-enabled packages are being prepared
              </h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                Packages that include School Websites will appear
                automatically when published from Eleeveon Schools.
              </p>
            </div>
          )}
        </div>
      </section>

      <section id="platform" className="relative z-10 px-4 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-zinc-950 px-5 py-12 text-white sm:rounded-4xl sm:px-10 sm:py-16 lg:px-16 dark:bg-white dark:text-zinc-950">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-semibold text-white/60 dark:text-zinc-500">
                Part of the Eleeveon platform
              </p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.045em] sm:text-5xl">
                Run the school. Serve the community. Build what comes next.
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/70 dark:text-zinc-600">
                Eleeveon School Websites extends the same school identity,
                information and digital infrastructure already used across the
                Eleeveon Schools platform.
              </p>
            </div>

            <a
              href="https://schools.eleeveon.com"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-zinc-950 transition hover:-translate-y-0.5 hover:bg-zinc-200 dark:bg-zinc-950 dark:text-white dark:hover:bg-zinc-800"
            >
              Open Schools
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-zinc-200 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <GridMark />
            <div>
              <p className="text-sm font-semibold">Eleeveon Systems</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Building thoughtful technology for education.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-zinc-500 dark:text-zinc-400">
            <a href="https://schools.eleeveon.com" className="hover:text-zinc-950 dark:hover:text-white">
              Schools
            </a>
            <span>Learn · Coming soon</span>
            <span>© {currentYear} Eleeveon Systems</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
