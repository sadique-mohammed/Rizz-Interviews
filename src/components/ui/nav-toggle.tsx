"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const navLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/interview", label: "Start Interview" },
  { href: "/history", label: "History" },
];

export default function NavToggle() {
  const id = React.useId();
  const pathname = usePathname();
  const router = useRouter();
  const [selectedValue, setSelectedValue] = React.useState(pathname);

  React.useEffect(() => {
    setSelectedValue(pathname);
  }, [pathname]);

  const selectedIndex = navLinks.findIndex((l) => selectedValue.startsWith(l.href));

  const handleChange = (value: string) => {
    setSelectedValue(value);
    router.push(value);
  };

  return (
    <nav className="bg-input/50 md:inline-flex h-8 rounded-md p-0.5 hidden">
      <RadioGroup
        value={selectedValue}
        onValueChange={handleChange}
        className={`
    group relative inline-grid grid-cols-[repeat(3,1fr)] items-center gap-0 text-sm font-medium
    after:absolute after:inset-y-0 after:w-1/3 after:rounded-sm after:bg-background after:shadow-xs
    after:transition-transform after:duration-300 after:ease-[cubic-bezier(0.16,1,0.3,1)]
    ${
      selectedIndex === 1
        ? "after:translate-x-full"
        : selectedIndex === 2
        ? "after:translate-x-[200%]"
        : "after:translate-x-0"
    }
  `}
      >
        {navLinks.map((link, index) => (
          <label
            key={link.href}
            className="relative z-10 inline-flex h-full min-w-8 cursor-pointer items-center justify-center px-3 select-none transition-colors text-gray-700 hover:text-gray-900"
          >
            {link.label}
            <RadioGroupItem id={`${id}-${index}`} value={link.href} className="sr-only" />
          </label>
        ))}
      </RadioGroup>
    </nav>
  );
}
