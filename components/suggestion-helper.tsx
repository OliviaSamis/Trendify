"use client"
import { HelpCircle, ChevronDown, Lightbulb, TrendingUp, Hash } from "lucide-react"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

type SuggestionHelperProps = {
  platform: string
  niche: string
  trend: string
}

export function SuggestionHelper({ platform, niche, trend }: SuggestionHelperProps) {
  // Generate platform-specific suggestions
  const getPlatformSuggestions = () => {
    switch (platform.toLowerCase()) {
      case "tiktok":
        return [
          "Keep videos between 15-60 seconds for optimal engagement",
          "Use trending sounds and music to increase discoverability",
          "Start with a hook in the first 3 seconds to grab attention",
          "Add text overlays to make content accessible with sound off",
          "Use quick cuts and transitions to maintain viewer interest",
        ]
      case "instagram":
        return [
          "Reels perform best at 15-30 seconds in length",
          "Use high-quality visuals with good lighting",
          "Include 3-5 relevant hashtags in your caption",
          "Create a cohesive visual style that matches your brand",
          "Add text overlays to explain concepts without sound",
        ]
      case "youtube":
        return [
          "Include a strong intro hook in the first 15 seconds",
          "Optimize for longer watch time with engaging content",
          "Add chapters/timestamps for longer videos",
          "Use end screens to promote related content",
          "Include clear calls-to-action for comments and subscriptions",
        ]
      case "snapchat":
        return [
          "Keep content vertical and full-screen",
          "Use native creative tools like filters and lenses",
          "Create quick, engaging stories with multiple snaps",
          "Add location tags to increase local discoverability",
          "Use bright, attention-grabbing visuals",
        ]
      case "pinterest":
        return [
          "Use vertical aspect ratio (2:3 or 9:16)",
          "Include text overlay that explains the content",
          "Use bright, clear imagery with minimal clutter",
          "Create content that solves a problem or teaches something",
          "Add your branding subtly in the corner",
        ]
      default:
        return [
          "Keep your video concise and focused on a single topic",
          "Start with a strong hook to grab viewer attention",
          "Add text overlays to emphasize key points",
          "Use transitions between scenes to maintain visual interest",
          "End with a clear call-to-action",
        ]
    }
  }

  // Generate niche-specific suggestions
  const getNicheSuggestions = () => {
    switch (niche.toLowerCase()) {
      case "fitness":
        return [
          "Demonstrate proper form for exercises",
          "Include before/after results when applicable",
          "Break down complex movements into simple steps",
          "Add text overlays for rep counts and instructions",
          "Show modifications for different fitness levels",
        ]
      case "cooking":
        return [
          "Show ingredients clearly at the beginning",
          "Use close-up shots of important techniques",
          "Add text overlays for measurements and temperatures",
          "Include the final result to build anticipation",
          "Speed up repetitive processes to maintain engagement",
        ]
      case "beauty":
        return [
          "Use good lighting to show products and techniques clearly",
          "Include before/after comparisons",
          "Add text overlays for product names and steps",
          "Zoom in on detailed techniques",
          "Show swatches or application on different skin tones when relevant",
        ]
      case "education":
        return [
          "Break complex topics into simple, digestible points",
          "Use visual aids like charts or diagrams",
          "Add text overlays to reinforce key concepts",
          "Speak clearly and at a moderate pace",
          "Include examples to illustrate abstract concepts",
        ]
      case "gaming":
        return [
          "Focus on exciting moments or achievements",
          "Add commentary to explain strategies or reactions",
          "Use text overlays to highlight key moments",
          "Include game audio but balance it with your voice",
          "Show your face in a corner for reaction videos",
        ]
      default:
        return [
          "Focus on providing value to your specific audience",
          "Showcase your unique perspective or expertise",
          "Use relevant hashtags to reach your target audience",
          "Study successful creators in your niche for inspiration",
          "Develop a consistent style that viewers will recognize",
        ]
    }
  }

  // Generate trend-specific suggestions
  const getTrendSuggestions = () => {
    // Base trends that work across platforms
    const baseTrends = [
      "Put your unique spin on the trend to stand out",
      "Post while the trend is still gaining momentum",
      "Use the exact trending sound or hashtag for discoverability",
      "Study successful examples of the trend before creating your version",
      "Combine multiple trends when it makes sense to do so",
    ]

    // Platform + niche specific trends
    if (platform && niche) {
      const key = `${platform.toLowerCase()}_${niche.toLowerCase()}`

      switch (key) {
        // TikTok specific trends by niche
        case "tiktok_fitness":
          return [
            "Try the '12-3-30' treadmill workout trend",
            "Create a 'What I Eat in a Day' video with calorie counts",
            "Show 'Before and After' transformations with a creative transition",
            "Do a 'Real-Time vs. Sped Up' workout comparison",
            "Demonstrate 'One Exercise, Multiple Variations' for a specific muscle group",
          ]
        case "tiktok_cooking":
          return [
            "Create a 'Tiny Food' cooking video with miniature ingredients",
            "Try the 'Tortilla Fold Hack' with creative fillings",
            "Make a 'Cloud Bread' recipe with a colorful twist",
            "Show a 'Feta Pasta Bake' with your unique ingredients",
            "Create a 'Food Illusion' that looks like one food but is actually another",
          ]
        case "tiktok_beauty":
          return [
            "Try the 'Lipstick Blush' application technique",
            "Demonstrate the 'Heatless Curls' overnight method",
            "Create a 'Makeup Transition' from everyday to glam",
            "Show a 'Foundation-Free' makeup routine",
            "Try the 'Graphic Liner' trend with bold colors",
          ]
        case "tiktok_gaming":
          return [
            "React to 'Impossible Game Moments' with split-screen",
            "Show 'Hidden Easter Eggs' in popular games",
            "Create a 'One Minute Game Review' series",
            "Demonstrate 'Pro Tips & Tricks' for competitive games",
            "Do a 'Controller Cam' showing your hands during difficult game moments",
          ]

        // Instagram specific trends by niche
        case "instagram_fitness":
          return [
            "Create a 'Reel vs. Reality' workout comparison",
            "Show a 'Workout Routine Transition' with outfit change",
            "Demonstrate 'Partner Workout Challenges' with creative moves",
            "Create a 'Fitness Hack' series for home workouts",
            "Show 'Day in the Life' of your fitness routine with timestamps",
          ]
        case "instagram_cooking":
          return [
            "Create 'Satisfying Food ASMR' with close-up shots",
            "Show 'Pantry to Plate' transformations in 15 seconds",
            "Demonstrate 'One Ingredient, Three Ways' recipes",
            "Create 'Color-Themed Meals' with aesthetic plating",
            "Show 'Recipe Fails vs. Wins' with humorous commentary",
          ]
        case "instagram_beauty":
          return [
            "Create a '5-Minute Face' makeup routine",
            "Show 'Product Empties vs. Replacements' with reviews",
            "Demonstrate 'Skincare Routine Transition' morning to night",
            "Create 'Makeup Looks Inspired By' series (movies, decades, etc.)",
            "Show 'Beauty Hack Tests' with honest results",
          ]

        // YouTube specific trends by niche
        case "youtube_gaming":
          return [
            "Create a 'Speedrun Challenge' with commentary",
            "Show 'Ranking Every [Game Item/Character]' with analysis",
            "Create a 'Playing [Game] But Every Time [X Happens] I [Y]' challenge",
            "Demonstrate 'Building Challenges' in sandbox games",
            "Create a 'Hardcore Mode' survival series",
          ]
        case "youtube_education":
          return [
            "Create 'Explained in 5 Levels of Difficulty' videos",
            "Show 'Common Misconceptions' about your subject area",
            "Create 'Day in the Life of a [Profession]' documentaries",
            "Demonstrate 'Visual History of [Subject]' with animations",
            "Create 'If You Only Learn 5 Things About [Subject]' summaries",
          ]

        // Default case for other combinations
        default:
          return baseTrends
      }
    }

    return baseTrends
  }

  const platformSuggestions = getPlatformSuggestions()
  const nicheSuggestions = getNicheSuggestions()
  const trendSuggestions = getTrendSuggestions()

  // Get quick tips (first suggestion from each category)
  const quickTips = [
    { category: "Platform", tip: platformSuggestions[0], icon: <Lightbulb className="h-4 w-4 text-yellow-500" /> },
    { category: "Niche", tip: nicheSuggestions[0], icon: <Hash className="h-4 w-4 text-purple-500" /> },
    { category: "Trend", tip: trendSuggestions[0], icon: <TrendingUp className="h-4 w-4 text-pink-500" /> },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white"
        >
          <HelpCircle className="h-4 w-4" />
          Tips
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <DropdownMenuLabel className="text-sm font-medium">Quick Suggestions</DropdownMenuLabel>
            {platform && (
              <Badge variant="outline" className="text-xs">
                {platform}
              </Badge>
            )}
          </div>

          {quickTips.map((item, index) => (
            <DropdownMenuItem key={index} className="flex items-start gap-2 py-2 cursor-default">
              <span className="mt-0.5">{item.icon}</span>
              <div>
                <div className="text-xs font-medium text-muted-foreground">{item.category}</div>
                <div className="text-sm">{item.tip}</div>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="w-full mt-1">
                View All Suggestions
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4 rounded-t-lg">
                <h3 className="font-bold text-white">Video Optimization Tips</h3>
                <p className="text-white/80 text-sm">Suggestions to improve your content</p>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-purple-500">{platform} Best Practices</h4>
                  <ul className="space-y-2">
                    {platformSuggestions.map((tip, i) => (
                      <li key={`platform-${i}`} className="text-sm flex items-start">
                        <span className="bg-purple-100 text-purple-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2 text-pink-500">{niche} Content Tips</h4>
                  <ul className="space-y-2">
                    {nicheSuggestions.map((tip, i) => (
                      <li key={`niche-${i}`} className="text-sm flex items-start">
                        <span className="bg-pink-100 text-pink-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-sm mb-2 text-indigo-500">Trend Optimization</h4>
                  <ul className="space-y-2">
                    {trendSuggestions.map((tip, i) => (
                      <li key={`trend-${i}`} className="text-sm flex items-start">
                        <span className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
