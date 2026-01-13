import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-xs text-zinc-500 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-3 h-3 text-zinc-600" />}
          {item.href ? (
            <Link
              to={item.href}
              className="hover:text-zinc-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-zinc-400">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
