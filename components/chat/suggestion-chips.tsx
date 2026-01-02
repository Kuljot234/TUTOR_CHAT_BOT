'use client';

import { Badge } from '@/components/ui/badge';
import { SuggestionChip as SuggestionChipType } from '@/types';

interface SuggestionChipsProps {
  suggestions: SuggestionChipType[];
  onSelect: (suggestion: SuggestionChipType) => void;
  disabled?: boolean;
}

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4 border-t">
      {suggestions.map((suggestion, index) => (
        <Badge
          key={index}
          variant="outline"
          className="cursor-pointer hover:bg-accent transition-colors px-3 py-1.5"
          onClick={() => !disabled && onSelect(suggestion)}
        >
          {suggestion.label}
        </Badge>
      ))}
    </div>
  );
}
