import { Nav } from "@/components/layout/nav";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { Hero } from "@/components/sections/hero";
import { Projects } from "@/components/sections/projects";

export default function HomePage() {
  return (
    <main>
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Contact />
    </main>
  );
}
