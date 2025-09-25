import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import Link from "next/link";

interface FooterProps {
  companyLinks?: Array<{ label: string; href: string }>;
  resourceLinks?: Array<{ label: string; href: string }>;
  legalLinks?: Array<{ label: string; href: string }>;
  socialLinks?: Array<{ icon: React.ReactNode; href: string }>;
}

const Footer = ({
  companyLinks = [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  resourceLinks = [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Community", href: "#" },
    { label: "Pricing", href: "#" },
  ],
  legalLinks = [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
  socialLinks = [
    { icon: <Facebook size={20} />, href: "#" },
    { icon: <Twitter size={20} />, href: "https://x.com/sadique982/" },
    {
      icon: <Instagram size={20} />,
      href: "https://www.instagram.com/_m.sadique/",
    },
    {
      icon: <Linkedin size={20} />,
      href: "https://www.linkedin.com/in/mohammed-sadique20/",
    },
    {
      icon: <Github size={20} />,
      href: "https://github.com/sadique-mohammed/nexus-ai-frontend",
    },
  ],
}: FooterProps) => {
  return (
    <footer className="bg-background w-full py-12 px-4 border-t">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Nexus AI</h2>
          <p className="text-muted-foreground">
            Developed by Mohammed Sadique <br /> <br />
            Your gateway to mastering coding interviews with AI-powered practice
          </p>
          <div className="flex space-x-4">
            {socialLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.icon}
              </Link>
            ))}
          </div>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="font-semibold mb-4">Company</h3>
          <ul className="space-y-2">
            {companyLinks.map((link, index) => (
              <li key={index}>
                <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                  {link.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Resource Links */}
        <div>
          <h3 className="font-semibold mb-4">Resources</h3>
          <ul className="space-y-2">
            {resourceLinks.map((link, index) => (
              <li key={index}>
                <span className="text-muted-foreground cursor-pointer hover:text-primary transition-colors">
                  {link.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div className="space-y-4">
          <h3 className="font-semibold">Stay Updated</h3>
          <p className="text-muted-foreground cursor-pointer">Subscribe to our newsletter</p>
          <div className="flex gap-2">
            <Input type="email" placeholder="Enter your email" className="max-w-[200px]" />
            <Button>Subscribe</Button>
          </div>
          <div className="pt-4">
            <ul className="flex flex-wrap gap-4">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <span className="text-sm cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                    {link.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Horizon. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
