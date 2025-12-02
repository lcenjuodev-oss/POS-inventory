import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <section
      className={`glass-card p-5 md:p-6 bg-card/90 backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}


