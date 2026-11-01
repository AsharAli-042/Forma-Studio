import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Logo } from "@/components/logo";
import { InquiryForm } from "@/components/inquiry-form";
import { isConfigured } from "@/lib/config";

const projects = [
  { title: "The quiet residence", category: "OAK / LINEN / AFTERNOON LIGHT", location: "Residential · 2025", image: "/images/quiet-residence.jpg", alt: "Living room with natural wood furniture, warm textiles, and afternoon sunlight", detail: "A living and dining room built around an oak palette, generous seating, and the changing light. Linen curtains soften the windows; a low table keeps the room open." },
  { title: "Light & layers", category: "STONE / PLASTER / WARM NEUTRALS", location: "Apartment · 2025", image: "/images/light-and-layers.jpg", alt: "Light-filled interior with neutral colors and natural finishes", detail: "A restrained material palette connects the rooms of this apartment. Pale surfaces reflect daylight, while darker furniture gives each area a clear purpose." },
  { title: "A softer perspective", category: "TEXTURE / COLOR / FAMILIAR OBJECTS", location: "Room refresh · 2026", image: "/images/softer-perspective.jpg", alt: "Interior with organic forms and warm architectural details", detail: "The existing room needed a better layout and more useful light. We kept its strongest pieces and introduced warmer textiles, adjustable lighting, and a few curved forms." },
];

export default function Home() {
  return <>
    <SiteHeader />
    <main id="main-content">
      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow hero-eyebrow">FORMA STUDIO / INTERIOR DESIGN</div>
          <h1>Rooms to live in.<br /><em>For years to come.</em></h1>
          <p>We design homes around the people who use them.<br className="desktop-break" /> Honest materials, thoughtful layouts, and room for real life.</p>
          <a className="primary-link" href="#work">View selected work <span aria-hidden="true">↗</span></a>
          <div className="hero-caption"><span>RESIDENTIAL INTERIORS</span><span>Design. Detail. Everyday life.</span></div>
        </div>
        <div className="hero-visual">
          <Image className="hero-photo" src="/images/quiet-residence.jpg" alt="Sunlit living room with oak furniture, houseplants, and tall windows" loading="eager" fetchPriority="high" sizes="(max-width: 620px) 100vw, 50vw" width={1000} height={1200} />
          <div className="hero-photo-label"><span>THE QUIET RESIDENCE</span><span>01 / 03</span></div>
        </div>
      </section>

      <section className="approach-section shell section-space" id="approach">
        <div className="section-kicker"><span className="eyebrow">01 / THE STUDIO</span><span className="small-note">A home, considered from the inside out.</span></div>
        <div className="approach-grid">
          <h2>Start with the way<br />you <em>live.</em></h2>
          <div className="approach-copy">
            <p>The morning routine. The long dinners. The corner everyone ends up in. These are the things a good room makes space for.</p>
            <p>We begin with your brief and work through layout, materials, lighting, and furniture together. Every decision has a practical reason and a place in the wider design.</p>
            <a className="text-link" href="#services">How we work</a>
          </div>
        </div>
      </section>

      <section className="work-section shell section-space" id="work">
        <div className="section-kicker"><span className="eyebrow">02 / SELECTED WORK</span><span className="small-note">Three studies in living well.</span></div>
        <div className="section-title-row"><h2>Different rooms.<br /><em>A considered approach.</em></h2><a className="text-link" href="#contact">Discuss your project</a></div>
        <div className="project-grid">{projects.map((project, index) =>
          <article className="project-card" key={project.title}>
            <a className="project-image" href={"#project-" + (index + 1)} aria-label={"Read about " + project.title}>
              <Image src={project.image} alt={project.alt} sizes="(max-width: 620px) 100vw, 33vw" width={800} height={900} />
              <span className="project-number">0{index + 1}</span>
            </a>
            <div className="project-info"><span className="eyebrow">{project.category}</span><h3>{project.title}</h3><span>{project.location}</span></div>
            <details id={"project-" + (index + 1)} className="project-details"><summary>Project notes <span aria-hidden="true">+</span></summary><p>{project.detail}</p><a href="#contact">Discuss a similar project</a></details>
          </article>
        )}</div>
      </section>

      <section className="services-section" id="services"><div className="shell section-space">
        <div className="section-kicker"><span className="eyebrow">03 / SERVICES</span><span className="small-note">The right level of support for your project.</span></div>
        <div className="services-layout">
          <div><h2>A whole home.<br />A single room.<br /><em>A second opinion.</em></h2><p className="services-intro">Choose where you need us.<br />We’ll work out the details together.</p><a className="text-link" href="#contact">Talk through your brief</a></div>
          <div className="service-list">{[
            { name: "Full-service interiors", number: "01", text: "Layout planning, material selection, lighting, furniture, and installation. A complete design process, from the first drawings to the finished rooms.", tag: "FROM CONCEPT TO COMPLETION" },
            { name: "Room refresh", number: "02", text: "A focused redesign of an existing room. We work with what’s worth keeping and plan the furniture, finishes, and lighting around it.", tag: "WORKING WITH WHAT’S THERE" },
            { name: "Design consultation", number: "03", text: "A working session to review your space and answer specific questions. Leave with a clear direction and a practical list of next steps.", tag: "A FOCUSED WORKING SESSION" },
          ].map(service => <a href="#contact" className="service-row" key={service.number}><span className="service-num">{service.number}</span><div><span className="eyebrow">{service.tag}</span><h3>{service.name}</h3><p>{service.text}</p></div></a>)}</div>
        </div>
      </div></section>

      <section className="material-note shell"><span className="eyebrow">MATERIALS MATTER</span><p>Wood that shows its grain. Linen that softens with use.<br className="desktop-break" /> Finishes chosen to <em>age well.</em></p></section>

      <section className="contact-section" id="contact"><div className="shell contact-grid">
        <div className="contact-copy"><span className="eyebrow">04 / PROJECT INQUIRIES</span><h2>Tell us about<br /><em>your space.</em></h2><p>A few details about the rooms, your priorities, and your budget help us understand where to start.</p><dl className="contact-process"><div><dt>01</dt><dd>Send your brief</dd></div><div><dt>02</dt><dd>We review the details</dd></div><div><dt>03</dt><dd>Arrange an initial conversation</dd></div></dl></div>
        <InquiryForm demo={!isConfigured} />
      </div></section>
    </main>
    <footer className="site-footer"><div className="shell footer-main"><Logo /><p>Residential interiors.<br />Made for daily life.</p><div><a href="#work">Selected work</a><a href="#contact">Project inquiries</a><Link href="/studio">Studio portal</Link></div></div><div className="shell footer-bottom"><span>© {new Date().getFullYear()} Forma Studio.</span><span>Portfolio concept · sample projects · photography via Unsplash</span><a href="#">Back to top ↑</a></div></footer>
  </>;
}
