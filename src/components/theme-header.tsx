"use client";

import React from 'react';
import { ThemeToggle } from './ui/theme-toggle';

export function ThemeHeader() {
  return (
    <div className="fixed top-0 right-0 p-4 z-50">
      <ThemeToggle />
    </div>
  );
}

