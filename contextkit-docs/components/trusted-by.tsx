import { Atom, Triangle, Server, Code2, Cpu } from "lucide-react"

const stacks = [
  { icon: Atom, label: "React" },
  { icon: Triangle, label: "Vue" },
  { icon: Server, label: "Node.js" },
  { icon: Code2, label: "Python" },
  { icon: Cpu, label: "Rust" },
]

export function TrustedBy() {
  return (
    <section className="py-16 md:py-20 border-t border-border/40">
      <div className="container mx-auto max-w-screen-xl flex flex-col items-center gap-10">
        <p className="text-center text-lg font-semibold text-foreground/80">
          Trusted by developers building with
        </p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {stacks.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground">
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
