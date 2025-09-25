import React, { useState, useEffect } from 'react';
import { Palette, X, RotateCcw } from 'lucide-react';

interface AdvancedColorPickerProps {
  currentColor: string | null;
  onColorChange: (color: string | null) => void;
  onClose: () => void;
  recentColors: string[];
  onAddToHistory: (color: string) => void;
}

const COLOR_PALETTES = {
  vibrant: ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#22C55E', '#A855F7', '#F97316', '#06B6D4', '#EAB308'],
  pastel: ['#FCA5A5', '#FDE68A', '#A7F3D0', '#93C5FD', '#C4B5FD', '#F9A8D4', '#67E8F9', '#86EFAC', '#DDD6FE', '#FED7AA', '#7DD3FC', '#FEF08A'],
  neutral: ['#6B7280', '#9CA3AF', '#D1D5DB', '#F3F4F6', '#374151', '#4B5563', '#9CA3AF', '#D1D5DB', '#F9FAFB', '#111827', '#1F2937', '#374151'],
  warm: ['#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A', '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB', '#7C3AED'],
  cool: ['#1E40AF', '#3730A3', '#6B21A8', '#86198F', '#BE185D', '#DC2626', '#EA580C', '#CA8A04', '#65A30D', '#16A34A', '#059669', '#0D9488']
};

export const AdvancedColorPicker: React.FC<AdvancedColorPickerProps> = ({
  currentColor,
  onColorChange,
  onClose,
  recentColors,
  onAddToHistory
}) => {
  const [activePalette, setActivePalette] = useState<keyof typeof COLOR_PALETTES>('vibrant');
  const [customColor, setCustomColor] = useState('#3B82F6');
  const [showRGB, setShowRGB] = useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    onAddToHistory(color);
  };

  const handleCustomColorChange = (color: string) => {
    setCustomColor(color);
    handleColorSelect(color);
  };

  const paletteNames = {
    vibrant: 'Vibrant',
    pastel: 'Pastel',
    neutral: 'Neutral',
    warm: 'Warm',
    cool: 'Cool'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0F141C] border border-[#1C2230] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Palette size={16} className="text-white" />
            </div>
            <h3 className="text-lg font-semibold text-white">Color Picker</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#1C2230] text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Current Color Display */}
        <div className="mb-6 p-4 rounded-xl bg-[#141922] border border-[#1C2230]">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-lg border-2 border-[#1C2230]"
              style={{ backgroundColor: currentColor || '#3f3f46' }}
            />
            <div>
              <p className="text-sm text-slate-400">Current Color</p>
              <p className="text-white font-mono text-sm">{currentColor || '#3f3f46'}</p>
            </div>
            <button
              onClick={() => onColorChange(null)}
              className="ml-auto px-3 py-1.5 text-xs rounded-lg bg-[#1C2230] hover:bg-[#2A3347] text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw size={14} className="inline mr-1" />
              Clear
            </button>
          </div>
        </div>

        {/* Palette Selector */}
        <div className="mb-4">
          <p className="text-sm text-slate-400 mb-3">Color Palettes</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {Object.entries(paletteNames).map(([key, name]) => (
              <button
                key={key}
                onClick={() => setActivePalette(key as keyof typeof COLOR_PALETTES)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  activePalette === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1C2230] text-slate-400 hover:bg-[#2A3347] hover:text-white'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        {/* Color Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-6 gap-2">
            {COLOR_PALETTES[activePalette].map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                  currentColor === color ? 'border-white' : 'border-[#1C2230] hover:border-slate-500'
                }`}
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>

        {/* Recent Colors */}
        {recentColors.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-slate-400 mb-3">Recent Colors</p>
            <div className="flex gap-2 flex-wrap">
              {recentColors.slice(0, 8).map((color, index) => (
                <button
                  key={index}
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-lg border-2 transition-all hover:scale-110 ${
                    currentColor === color ? 'border-white' : 'border-[#1C2230] hover:border-slate-500'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        )}

        {/* RGB Color Picker */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Custom Color</p>
            <button
              onClick={() => setShowRGB(!showRGB)}
              className="px-3 py-1.5 text-xs rounded-lg bg-[#1C2230] hover:bg-[#2A3347] text-slate-400 hover:text-white transition-colors"
            >
              {showRGB ? 'Hide' : 'Show'} RGB
            </button>
          </div>
          
          {showRGB && (
            <div className="space-y-3 p-4 rounded-xl bg-[#141922] border border-[#1C2230]">
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => handleCustomColorChange(e.target.value)}
                  className="w-12 h-12 rounded-lg border border-[#1C2230] cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={customColor}
                    onChange={(e) => {
                      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
                        handleCustomColorChange(e.target.value);
                      } else {
                        setCustomColor(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-[#0F141C] border border-[#1C2230] text-white font-mono text-sm focus:outline-none focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {['Red', 'Green', 'Blue'].map((color, index) => (
                  <div key={color}>
                    <label className="block text-xs text-slate-400 mb-1">{color}</label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={parseInt(customColor.slice(index * 2 + 1, index * 2 + 3), 16)}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        const hex = value.toString(16).padStart(2, '0');
                        const newColor = customColor.slice(0, index * 2 + 1) + hex + customColor.slice(index * 2 + 3);
                        handleCustomColorChange(newColor);
                      }}
                      className="w-full h-2 bg-[#1C2230] rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${color === 'Red' ? '#000' : color === 'Green' ? '#000' : '#000'} 0%, ${color === 'Red' ? '#f00' : color === 'Green' ? '#0f0' : '#00f'} 100%)`
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => onColorChange(null)}
            className="flex-1 px-4 py-2 rounded-lg bg-[#1C2230] hover:bg-[#2A3347] text-slate-400 hover:text-white transition-colors"
          >
            Remove Color
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            Apply Color
          </button>
        </div>
      </div>
    </div>
  );
};
