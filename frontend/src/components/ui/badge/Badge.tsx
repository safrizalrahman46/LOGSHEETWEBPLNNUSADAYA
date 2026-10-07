import React from "react";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1.5 rounded-full font-semibold";

  const sizeStyles = {
    sm: "text-[11px] py-0.5 px-2",
    md: "text-xs py-1 px-3",
  };

  const variants = {
    light: {
      primary: "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400 border border-brand-200/50 dark:border-brand-500/20",
      success: "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400 border border-success-200/50 dark:border-success-500/20",
      error: "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400 border border-error-200/50 dark:border-error-500/20",
      warning: "bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-warning-400 border border-warning-200/50 dark:border-warning-500/20",
      info: "bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20",
      light: "bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80 border border-gray-200 dark:border-gray-700",
      dark: "bg-gray-800 text-white dark:bg-white/10 dark:text-white border border-gray-700",
    },
    solid: {
      primary: "bg-brand-500 text-white",
      success: "bg-success-500 text-white",
      error: "bg-error-500 text-white",
      warning: "bg-warning-500 text-white",
      info: "bg-blue-600 text-white",
      light: "bg-gray-200 text-gray-800 dark:bg-white/10 dark:text-white",
      dark: "bg-gray-900 text-white dark:bg-white dark:text-gray-900",
    },
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant][color]} ${className}`}
    >
      {startIcon && <span className="flex items-center">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center">{endIcon}</span>}
    </span>
  );
};
