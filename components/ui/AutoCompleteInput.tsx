'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronRight, Info } from 'lucide-react';

export interface AutoCompleteSuggestion {
  value: string;
  label: string;
  description?: string;
  category?: string;
  example?: string;
}

interface AutoCompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: AutoCompleteSuggestion) => void;
  suggestions: AutoCompleteSuggestion[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

export function AutoCompleteInput({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder = 'Type to search...',
  className = '',
  autoFocus = false,
}: AutoCompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState<AutoCompleteSuggestion[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim()) {
      const query = value.toLowerCase();
      const filtered = suggestions.filter(
        (s) =>
          s.value.toLowerCase().includes(query) ||
          s.label.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query))
      );
      
      // Sort by relevance (exact match first, then starts with, then contains)
      filtered.sort((a, b) => {
        const aValue = a.value.toLowerCase();
        const bValue = b.value.toLowerCase();
        const aLabel = a.label.toLowerCase();
        const bLabel = b.label.toLowerCase();
        
        // Exact matches first
        if (aValue === query) return -1;
        if (bValue === query) return 1;
        if (aLabel === query) return -1;
        if (bLabel === query) return 1;
        
        // Then starts with
        if (aValue.startsWith(query) && !bValue.startsWith(query)) return -1;
        if (!aValue.startsWith(query) && bValue.startsWith(query)) return 1;
        
        // Then alphabetical
        return aValue.localeCompare(bValue);
      });
      
      setFilteredSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
      setIsOpen(filtered.length > 0);
    } else {
      // Show popular suggestions when empty
      const popular = suggestions.filter(s => 
        ['PATH', 'HOME', 'USER', 'SHELL', 'EDITOR', 'LANG', 'NODE_ENV', 'JAVA_HOME'].includes(s.value)
      );
      setFilteredSuggestions(popular);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  }, [value, suggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          selectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
      case 'Tab':
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          e.preventDefault();
          selectSuggestion(filteredSuggestions[selectedIndex]);
        }
        break;
    }
  };

  const selectSuggestion = (suggestion: AutoCompleteSuggestion) => {
    onChange(suggestion.value);
    if (onSelect) {
      onSelect(suggestion);
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get category color
  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
    
    const colorMap: Record<string, string> = {
      '核心路径': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
      '用户与会话': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
      '本地化': 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
      'Shell 定制': 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300',
      '默认应用': 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300',
      'Zsh 生态': 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300',
      'Java 生态': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
      'Python 环境': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
      'Node.js 环境': 'bg-lime-100 dark:bg-lime-900 text-lime-700 dark:text-lime-300',
      'Go 环境': 'bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300',
      'Rust 工具链': 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
      '构建系统': 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300',
      '网络代理': 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300',
    };
    
    return colorMap[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value.toUpperCase());
          if (e.target.value.trim()) {
            setIsOpen(true);
          }
        }}
        onFocus={() => {
          if (filteredSuggestions.length > 0) {
            setIsOpen(true);
          }
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={`w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:text-gray-100 ${className}`}
        autoComplete="off"
        spellCheck={false}
      />

      {/* Popular suggestions hint when input is empty */}
      {!value && filteredSuggestions.length > 0 && (
        <div className="absolute top-full mt-1 text-xs text-gray-500 dark:text-gray-400">
          Popular: {filteredSuggestions.map(s => s.value).join(', ')}
        </div>
      )}

      {/* Dropdown */}
      {isOpen && filteredSuggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-1 w-full max-h-96 overflow-auto bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg z-50"
        >
          {filteredSuggestions.map((suggestion, index) => {
            const isSelected = index === selectedIndex;
            
            return (
              <div
                key={suggestion.value}
                onClick={() => selectSuggestion(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-3 py-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/10 dark:bg-primary/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-sm">
                        {suggestion.value}
                      </span>
                      {suggestion.category && (
                        <span className={`text-xs px-2 py-0.5 rounded ${getCategoryColor(suggestion.category)}`}>
                          {suggestion.category}
                        </span>
                      )}
                    </div>
                    {suggestion.description && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {suggestion.description}
                      </div>
                    )}
                    {suggestion.example && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 font-mono">
                        例: {suggestion.example}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            );
          })}
          
          {/* Help tip at bottom */}
          <div className="px-3 py-2 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Info className="h-3 w-3" />
              <span>使用 ↑↓ 导航，Enter 选择，Esc 关闭</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}