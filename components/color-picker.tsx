"use client"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  className?: string
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  // Basic color palette with common colors
  const basicColors = [
    "#ffffff",
    "#000000",
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4caf50",
    "#8bc34a",
    "#cddc39",
    "#ffeb3b",
    "#ffc107",
    "#ff9800",
    "#ff5722",
  ]

  // Extended color palette with shades
  const extendedColors = [
    // Reds
    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#e53935",
    "#d32f2f",
    "#c62828",
    "#b71c1c",
    // Pinks
    "#fce4ec",
    "#f8bbd0",
    "#f48fb1",
    "#f06292",
    "#ec407a",
    "#e91e63",
    "#d81b60",
    "#c2185b",
    "#ad1457",
    "#880e4f",
    // Purples
    "#f3e5f5",
    "#e1bee7",
    "#ce93d8",
    "#ba68c8",
    "#ab47bc",
    "#9c27b0",
    "#8e24aa",
    "#7b1fa2",
    "#6a1b9a",
    "#4a148c",
    // Deep Purples
    "#ede7f6",
    "#d1c4e9",
    "#b39ddb",
    "#9575cd",
    "#7e57c2",
    "#673ab7",
    "#5e35b1",
    "#512da8",
    "#4527a0",
    "#311b92",
    // Indigos
    "#e8eaf6",
    "#c5cae9",
    "#9fa8da",
    "#7986cb",
    "#5c6bc0",
    "#3f51b5",
    "#3949ab",
    "#303f9f",
    "#283593",
    "#1a237e",
    // Blues
    "#e3f2fd",
    "#bbdefb",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",
    "#1565c0",
    "#0d47a1",
    // Light Blues
    "#e1f5fe",
    "#b3e5fc",
    "#81d4fa",
    "#4fc3f7",
    "#29b6f6",
    "#03a9f4",
    "#039be5",
    "#0288d1",
    "#0277bd",
    "#01579b",
    // Cyans
    "#e0f7fa",
    "#b2ebf2",
    "#80deea",
    "#4dd0e1",
    "#26c6da",
    "#00bcd4",
    "#00acc1",
    "#0097a7",
    "#00838f",
    "#006064",
    // Teals
    "#e0f2f1",
    "#b2dfdb",
    "#80cbc4",
    "#4db6ac",
    "#26a69a",
    "#009688",
    "#00897b",
    "#00796b",
    "#00695c",
    "#004d40",
    // Greens
    "#e8f5e9",
    "#c8e6c9",
    "#a5d6a7",
    "#81c784",
    "#66bb6a",
    "#4caf50",
    "#43a047",
    "#388e3c",
    "#2e7d32",
    "#1b5e20",
    // Light Greens
    "#f1f8e9",
    "#dcedc8",
    "#c5e1a5",
    "#aed581",
    "#9ccc65",
    "#8bc34a",
    "#7cb342",
    "#689f38",
    "#558b2f",
    "#33691e",
    // Limes
    "#f9fbe7",
    "#f0f4c3",
    "#e6ee9c",
    "#dce775",
    "#d4e157",
    "#cddc39",
    "#c0ca33",
    "#afb42b",
    "#9e9d24",
    "#827717",
    // Yellows
    "#fffde7",
    "#fff9c4",
    "#fff59d",
    "#fff176",
    "#ffee58",
    "#ffeb3b",
    "#fdd835",
    "#fbc02d",
    "#f9a825",
    "#f57f17",
    // Ambers
    "#fff8e1",
    "#ffecb3",
    "#ffe082",
    "#ffd54f",
    "#ffca28",
    "#ffc107",
    "#ffb300",
    "#ffa000",
    "#ff8f00",
    "#ff6f00",
    // Oranges
    "#fff3e0",
    "#ffe0b2",
    "#ffcc80",
    "#ffb74d",
    "#ffa726",
    "#ff9800",
    "#fb8c00",
    "#f57c00",
    "#ef6c00",
    "#e65100",
    // Deep Oranges
    "#fbe9e7",
    "#ffccbc",
    "#ffab91",
    "#ff8a65",
    "#ff7043",
    "#ff5722",
    "#f4511e",
    "#e64a19",
    "#d84315",
    "#bf360c",
    // Browns
    "#efebe9",
    "#d7ccc8",
    "#bcaaa4",
    "#a1887f",
    "#8d6e63",
    "#795548",
    "#6d4c41",
    "#5d4037",
    "#4e342e",
    "#3e2723",
    // Greys
    "#fafafa",
    "#f5f5f5",
    "#eeeeee",
    "#e0e0e0",
    "#bdbdbd",
    "#9e9e9e",
    "#757575",
    "#616161",
    "#424242",
    "#212121",
    // Blue Greys
    "#eceff1",
    "#cfd8dc",
    "#b0bec5",
    "#90a4ae",
    "#78909c",
    "#607d8b",
    "#546e7a",
    "#455a64",
    "#37474f",
    "#263238",
  ]

  // Handle color selection
  const handleColorSelect = (newColor: string) => {
    onChange(newColor)
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Basic color palette */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Basic Colors</h4>
        <div className="grid grid-cols-9 gap-1">
          {basicColors.map((colorOption) => (
            <button
              key={colorOption}
              className={cn(
                "w-6 h-6 rounded border border-zinc-600 transition-all hover:scale-110",
                color === colorOption ? "ring-2 ring-white" : "",
              )}
              style={{ backgroundColor: colorOption }}
              onClick={() => handleColorSelect(colorOption)}
              aria-label={`Select color ${colorOption}`}
            />
          ))}
        </div>
      </div>

      {/* Extended color palette */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Extended Palette</h4>
        <div className="grid grid-cols-10 gap-1 max-h-48 overflow-y-auto p-1">
          {extendedColors.map((colorOption) => (
            <button
              key={colorOption}
              className={cn(
                "w-6 h-6 rounded border border-zinc-600 transition-all hover:scale-110",
                color === colorOption ? "ring-2 ring-white" : "",
              )}
              style={{ backgroundColor: colorOption }}
              onClick={() => handleColorSelect(colorOption)}
              aria-label={`Select color ${colorOption}`}
            />
          ))}
        </div>
      </div>

      {/* Color preview and hex input */}
      <div className="flex gap-2 mt-3">
        <div className="w-10 h-10 rounded border border-zinc-700" style={{ backgroundColor: color }} />
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 text-sm"
        />
      </div>
    </div>
  )
}
