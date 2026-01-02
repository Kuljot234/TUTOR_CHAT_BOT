'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function MessageSkeleton() {
  return (
    <div className="mb-6 p-4 rounded-lg bg-card border border-border mr-8">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tutor
        </span>
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-4 bg-muted rounded"
            style={{ width: `${100 - i * 15}%` }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.1,
            }}
          />
        ))}
      </div>
    </div>
  );
}
