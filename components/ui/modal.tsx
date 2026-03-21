"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export function Modal({ isOpen, onClose, title, children, className, ...props }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Dialog */}
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg rounded-lg border border-ivory-cream bg-ivory-light p-6 shadow-lg sm:max-w-[500px]",
          className
        )}
        {...props}
      >
        <div className="flex flex-col space-y-1.5 mb-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {title && <h2 className="text-md font-semibold text-text-primary">{title}</h2>}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-ivory-cream data-[state=open]:text-text-secondary"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
