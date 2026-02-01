export function Footer() {
  const footerLinks = [
    { label: "About", href: "#about" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ]

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left: Logo & Copyright */}
          <div className="flex flex-col items-center sm:items-start gap-2">
            <span className="text-lg font-bold text-foreground">
              NexPath<span className="text-primary">.AI</span>
            </span>
            <span className="text-sm text-muted-foreground">
              © 2026 NexPath.AI. All rights reserved.
            </span>
          </div>

          {/* Right: Links */}
          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Tagline */}
        <div className="mt-8 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            AI-powered career guidance platform
          </p>
        </div>
      </div>
    </footer>
  )
}
