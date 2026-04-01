import { useEffect, useRef } from "react";
import ContactForm from "../components/ContactForm";
import CoffeeIcon from "../components/CoffeeIcon";
import { FaLinkedin } from "react-icons/fa"


// ─── Hook ──────────────────────────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove("opacity-0", "translate-y-5");
          el.classList.add("opacity-100", "translate-y-0");
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

// ─── Icons ─────────────────────────────────────────────────────────────────────
function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <span className="text-xs font-medium tracking-widest uppercase text-[#7A8C6E]">
        {children}
      </span>
      <span className="block h-px w-9 bg-[#7A8C6E] opacity-50" />
    </div>
  );
}

function NoticeItem({ icon, text, border }) {
  return (
    <div className={`flex gap-4 items-start p-5 bg-[#FDFAF7] hover:bg-[#F9F5F0] transition-colors ${border ? "border-b border-[#DDD5CC]" : ""}`}>
      <div className="w-7 h-7 rounded-full bg-[#C45B3A] flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <p className="text-sm text-[#4A4037] leading-relaxed">{text}</p>
    </div>
  );
}

function FeatureCard({ tag, title, description }) {
  return (
    <div className="group relative bg-[#FDFAF7] border border-[#DDD5CC] rounded-2xl p-7 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-default">
      <div className="absolute top-0 left-0 w-0.5 h-full bg-[#C45B3A] scale-y-0 origin-top group-hover:scale-y-100 transition-transform duration-300" />
      <span className="inline-block text-[10px] font-medium tracking-widest uppercase text-[#C45B3A] bg-[#C45B3A]/10 px-2.5 py-1 rounded-full mb-3">
        {tag}
      </span>
      <h3 className="text-lg font-semibold text-[#1A1714] mb-2">{title}</h3>
      <p className="text-sm text-[#8C7B6B] leading-relaxed">{description}</p>
    </div>
  );
}


// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function AboutPage() {
  const fadeClass = "opacity-0 translate-y-5 transition-all duration-700";

  const overviewRef = useFadeIn();
  const featuresRef = useFadeIn();
  const aboutRef    = useFadeIn();
  const contactRef  = useFadeIn();

  return (
    <div className="text-[#1A1714] font-light min-h-screen">

      {/* OVERVIEW */}
      <section ref={overviewRef} className={`${fadeClass} px-[6vw] py-16`}>
        <SectionLabel>Overview</SectionLabel>
        <h2 className="text-2xl md:text-3xl font-semibold mb-5 leading-snug">
          What this platform is
        </h2>
        <p className="text-[#4A4037] max-w-2xl mb-3 leading-relaxed">
          Welcome! This platform is a personal project focused on providing insights into the New Zealand property market.
          Due to current resource constraints, the scope is intentionally focused on residential housing in Auckland only.
        </p>
        <p className="text-[#4A4037] max-w-2xl leading-relaxed">
          The goal is to deliver simple, accessible, and useful analytics to help users better understand market trends.
        </p>
        <div className="mt-8 max-w-2xl border border-[#DDD5CC] rounded-2xl overflow-hidden">
          <NoticeItem
            icon={<InfoIcon />}
            text="The data presented on this website is not owned by me. It is collected from publicly available real estate websites through automated processes."
            border
          />
          <NoticeItem
            icon={<ClockIcon />}
            text="Data updates are currently performed on a weekly basis due to limited server capacity. In the future, I aim to improve this to daily updates for more real-time insights."
          />
        </div>
      </section>

      <div className="mx-[6vw] h-px bg-[#DDD5CC]" />

      {/* FEATURES */}
      <section ref={featuresRef} className={`${fadeClass} px-[6vw] py-16`}>
        <SectionLabel>Roadmap</SectionLabel>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-snug">
          Upcoming features
        </h2>
        <p className="text-[#4A4037] max-w-2xl mb-8 leading-relaxed">
          I'm continuously working on enhancing the platform. Here's what's coming next:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          <FeatureCard
            tag="Coming soon"
            title="Mortgage Affordability"
            description="Compare your buying power across different banks to better understand your budget before committing."
          />
          <FeatureCard
            tag="In progress"
            title="Historical Price Analytics"
            description="Access deeper insights through historical property data and interactive dashboards over time."
          />
          <FeatureCard
            tag="Planned"
            title="AI Property Assistant"
            description="A chatbot that helps recommend suitable properties based on your preferences and needs."
          />
        </div>
      </section>

      <div className="mx-[6vw] h-px bg-[#DDD5CC]" />

      {/* ABOUT ME */}
      <section ref={aboutRef} className={`${fadeClass} px-[6vw] py-16`}>
        <SectionLabel>The maker</SectionLabel>
        <h2 className="text-2xl md:text-3xl font-semibold mb-6 leading-snug">
          About me
        </h2>
        <div className="flex flex-col sm:flex-row gap-8 items-start max-w-3xl bg-[#FDFAF7] border border-[#DDD5CC] rounded-2xl p-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C45B3A] to-[#E8896A] flex items-center justify-center text-3xl text-white flex-shrink-0">
            P
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Hi, I'm Paige 👋</h3>
            <p className="text-sm text-[#4A4037] leading-relaxed mb-3">
              I'm passionate about building products and exploring data-driven solutions. This website is a side project
              where I combine my interests in product development, data, and real estate.
            </p>
            <p className="text-sm text-[#4A4037] leading-relaxed">
              I created this platform purely out of curiosity and a desire to build something useful for others
              navigating the housing market.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-[6vw] h-px bg-[#DDD5CC]" />

      {/* CONTACT */}
      <section ref={contactRef} className={`${fadeClass} px-[6vw] py-16`}>
        <SectionLabel>Contact</SectionLabel>
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 leading-snug">
          Get in touch
        </h2>
        <p className="text-[#4A4037] max-w-2xl mb-10 leading-relaxed">
          I'd love to hear your feedback, ideas, or suggestions... just about anything ^^
        </p>

        {/* Full-width card */}
        <div className="max-w-4xl bg-[#FDFAF7] border border-[#DDD5CC] rounded-2xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* LEFT — LinkedIn + info */}
            <div className="flex flex-col justify-between p-10 border-b md:border-b-0 md:border-r border-[#DDD5CC]">
              <div>
                <p className="text-xs font-medium tracking-widest uppercase text-[#7A8C6E] mb-3">
                  Connect
                </p>
                <h3 className="text-xl font-semibold text-[#1A1714] mb-3">
                  Let's talk
                </h3>
                <p className="text-sm text-[#8C7B6B] leading-relaxed">
                  Whether it's feedback, a bug report, a feature idea, or just a friendly hello. I'd love to hear from you.
                  <CoffeeIcon />
                </p>
              </div>
                <a href="https://www.linkedin.com/in/phan-minh-phuong-813161277/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-white border border-[#DDD5CC] rounded-xl hover:border-[#C45B3A] hover:bg-[#FDF6F3] transition-all group no-underline">
              <div className="w-10 h-10 rounded-lg bg-[#C45B3A] flex items-center justify-center flex-shrink-0">
                  <FaLinkedin size={18} color="white" />
                </div>
                <div>
                  <p className="text-xs font-medium tracking-wider uppercase text-[#8C7B6B] mb-0.5">LinkedIn</p>
                  <p className="text-sm font-medium text-[#1A1714] group-hover:text-[#C45B3A] transition-colors">
                    Connect with Paige
                  </p>
                </div>
                <svg className="ml-auto w-4 h-4 text-[#DDD5CC] group-hover:text-[#C45B3A] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* RIGHT — Contact form */}
            <div className="p-10">
              <p className="text-xs font-medium tracking-widest uppercase text-[#7A8C6E] mb-6">
                Send a message
              </p>
              <ContactForm />
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-4 px-[6vw] py-7 border-t border-[#DDD5CC] flex items-center justify-between text-xs text-[#8C7B6B]">
        <span>© RealyticsNZ</span>
        <span>Built by Paige with ♥</span>
      </footer>

    </div>
  );
}
