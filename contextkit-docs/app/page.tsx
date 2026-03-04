import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { StructuredContextFiles } from "@/components/structured-context-files"
import { TrustedBy } from "@/components/trusted-by"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Hero />
        <Features />
        <StructuredContextFiles />
        <TrustedBy />
      </main>
      <Footer />
    </div>
  )
}
