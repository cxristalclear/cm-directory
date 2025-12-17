import * as React from "react"
import { cn } from "@/components/utils"
import Link from "next/link"
import { Breadcrumbs, type BreadcrumbItem } from "@/components/Breadcrumbs"

export interface GradientHeroProps {
  /** Main heading text */
  title: string
  /** Subtitle/description text */
  subtitle?: string
  /** Badge text to display above title */
  badge?: string
  /** Badge icon (React node) */
  badgeIcon?: React.ReactNode
  /** Breadcrumb items for navigation */
  breadcrumbs?: BreadcrumbItem[]
  /** Icon or image to display alongside title */
  icon?: React.ReactNode
  /** Stats to display in a grid below content */
  stats?: Array<{
    value: string | number
    label: string
  }>
  /** Action buttons (React nodes) */
  actions?: React.ReactNode
  /** Custom content to render inside hero */
  children?: React.ReactNode
  /** Layout variant */
  variant?: "centered" | "left" | "with-icon"
  /** Show decorative glow effects */
  decorativeGlows?: boolean
  /** Additional className for the container */
  className?: string
  /** Padding variant */
  padding?: "sm" | "md" | "lg"
}

/**
 * GradientHero - Standardized gradient hero section component
 * 
 * Provides a consistent gradient background with flexible content options.
 * Uses the standardized `.gradient-bg` class for consistent styling.
 */
export function GradientHero({
  title,
  subtitle,
  badge,
  badgeIcon,
  breadcrumbs,
  icon,
  stats,
  actions,
  children,
  variant = "centered",
  decorativeGlows = true,
  className,
  padding = "md",
}: GradientHeroProps) {
  const paddingClasses = {
    sm: "py-4 md:py-6",
    md: "py-8 md:py-12",
    lg: "py-12 md:py-16",
  }

  const containerClasses = {
    centered: "text-center",
    left: "text-left",
    "with-icon": "text-left",
  }

  return (
    <div className={cn("relative overflow-hidden gradient-bg text-white", className)}>
      <div className={cn("relative z-10", paddingClasses[padding])}>
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          {breadcrumbs && (
            <Breadcrumbs
              className="mb-6 text-blue-100"
              items={breadcrumbs}
            />
          )}

          <div className={cn("mx-auto", containerClasses[variant], variant === "centered" ? "max-w-3xl" : "max-w-6xl")}>
            {/* Badge */}
            {badge && (
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                {badgeIcon && <span className="text-white">{badgeIcon}</span>}
                {badge}
              </div>
            )}

            {/* Title and Icon Layout */}
            {variant === "with-icon" && icon ? (
              <div className="flex flex-col gap-6 md:flex-row md:items-start">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-white/20 text-md font-semibold backdrop-blur-sm">
                  {icon}
                </div>
                <div className="flex-1">
                  <h1 className="heading-xl mb-3 !text-white">{title}</h1>
                  {subtitle && (
                    <p className="body-lg max-w-3xl !text-white">{subtitle}</p>
                  )}
                </div>
              </div>
            ) : (
              <>
                <h1 className={cn(
                  "heading-xl mb-3 !text-white",
                  variant === "centered" && "text-3xl md:text-5xl"
                )}>
                  {title}
                </h1>
                {subtitle && (
                  <p className={cn(
                    "body-lg mb-6 !text-white",
                    variant !== "centered" && "max-w-3xl"
                  )}>
                    {subtitle}
                  </p>
                )}
              </>
            )}

            {/* Actions */}
            {actions && (
              <div className={cn(
                "flex flex-wrap gap-4",
                variant === "centered" ? "justify-center" : "justify-start"
              )}>
                {actions}
              </div>
            )}

            {/* Stats Grid */}
            {stats && stats.length > 0 && (
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-3xl font-bold">{stat.value}</div>
                    <div className="text-sm text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Custom children content */}
            {children}
          </div>
        </div>
      </div>

      {/* Decorative Glows */}
      {decorativeGlows && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>
      )}
    </div>
  )
}

