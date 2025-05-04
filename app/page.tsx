"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  Instagram,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Search,
  Clock,
  TrendingUp,
  Star,
  X,
  Zap,
  Sparkles,
  HelpCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TikTokIcon } from "@/components/tiktok-icon"
import { PinterestIcon } from "@/components/pinterest-icon"
import { SnapchatIcon } from "@/components/snapchat-icon"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Twitch } from "lucide-react"

// Define types for our data structures
type TrendItem = {
  name: string
  updated: string
  description?: string
  popularity?: number // 1-10 scale
  difficulty?: number // 1-10 scale
  tags?: string[]
}

type TrendsData = {
  [platform: string]: {
    [niche: string]: TrendItem[]
  }
}

type PlatformInfo = {
  name: string
  icon: JSX.Element
  color: string
  description: string
}

export default function Home() {
  const router = useRouter()
  const [step, setStep] = useState<number>(1)
  const [socialMedia, setSocialMedia] = useState<string>("")
  const [niche, setNiche] = useState<string>("")
  const [trend, setTrend] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [hasVideos, setHasVideos] = useState(false)
  const [showOverview, setShowOverview] = useState(false)
  const [nicheDescription, setNicheDescription] = useState<string>("")
  const [trendDescription, setTrendDescription] = useState<string>("")
  const [isAnalyzingNiche, setIsAnalyzingNiche] = useState(false)
  const [isAnalyzingTrend, setIsAnalyzingTrend] = useState(false)
  const [showNichePrompt, setShowNichePrompt] = useState(false)
  const [showTrendPrompt, setShowTrendPrompt] = useState(false)
  const [isScanningSocialMedia, setIsScanningSocialMedia] = useState(false)
  const [discoveredTrends, setDiscoveredTrends] = useState<TrendItem[]>([])
  const [showDiscoveredTrends, setShowDiscoveredTrends] = useState(false)

  // References for scroll handling
  const platformsContainerRef = useRef<HTMLDivElement>(null)
  const nichesContainerRef = useRef<HTMLDivElement>(null)
  const trendsContainerRef = useRef<HTMLDivElement>(null)

  // Platform data with visual styling
  const platforms: Record<string, PlatformInfo> = {
    TikTok: {
      name: "TikTok",
      icon: <TikTokIcon className="h-6 w-6" />,
      color: "bg-gradient-to-r from-pink-500 to-cyan-500",
      description: "Create short-form, viral content with trending sounds and effects",
    },
    Instagram: {
      name: "Instagram",
      icon: <Instagram className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      description: "Design visually stunning reels with cohesive aesthetics for more followers",
    },
    YouTube: {
      name: "YouTube",
      icon: <Youtube className="h-6 w-6" />,
      color: "bg-gradient-to-r from-red-500 to-red-600",
      description: "Produce high-quality, longer videos with strong storytelling elements",
    },
    Twitter: {
      name: "Twitter",
      icon: <Twitter className="h-6 w-6" />,
      color: "bg-gradient-to-r from-blue-400 to-blue-500",
      description: "Create concise, impactful clips that grab attention in a fast-paced feed",
    },
    LinkedIn: {
      name: "LinkedIn",
      icon: <Linkedin className="h-6 w-6" />,
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      description: "Develop professional content that establishes thought leadership",
    },
    Pinterest: {
      name: "Pinterest",
      icon: <PinterestIcon className="h-6 w-6" />,
      color: "bg-gradient-to-r from-red-600 to-red-700",
      description: "Create inspirational and instructional content with strong visual appeal",
    },
    Facebook: {
      name: "Facebook",
      icon: <Facebook className="h-6 w-6" />,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      description: "Build engaging videos that tell stories and foster community interaction",
    },
    Snapchat: {
      name: "Snapchat",
      icon: <SnapchatIcon className="h-6 w-6" />,
      color: "bg-gradient-to-r from-yellow-400 to-yellow-500",
      description: "Craft quick, playful content with creative filters and effects",
    },
    Twitch: {
      name: "Twitch",
      icon: <Twitch className="h-6 w-6" />,
      color: "bg-gradient-to-r from-purple-600 to-purple-700",
      description: "Produce engaging streaming highlights with clear audio and context",
    },
  }

  // Define niches for each platform with enhanced metadata
  const niches: Record<string, { name: string; description: string; icon: string }[]> = {
    TikTok: [
      { name: "Dance", description: "Choreography, challenges, and dance trends", icon: "🕺" },
      { name: "Comedy", description: "Skits, jokes, and humorous content", icon: "😂" },
      { name: "Education", description: "Facts, how-tos, and instructional content", icon: "🧠" },
      { name: "Food", description: "Recipes, reviews, and food challenges", icon: "🍔" },
      { name: "Fashion", description: "Style tips, hauls, and outfit inspirations", icon: "👗" },
      { name: "Fitness", description: "Workouts, transformations, and health tips", icon: "💪" },
      { name: "DIY & Crafts", description: "Crafting tutorials and creative projects", icon: "🛠️" },
      { name: "Beauty", description: "Makeup, skincare, and beauty product reviews", icon: "💄" },
      { name: "Tech", description: "Tech reviews, tips, and digital guides", icon: "📱" },
      { name: "Sports", description: "Sports highlights, tips, and challenges", icon: "⚽" },
      { name: "Pets", description: "Cute pet videos, tricks, and pet care", icon: "🐱" },
      { name: "Music", description: "Song covers, instrument performances, and music trends", icon: "🎵" },
      { name: "Challenges", description: "Viral challenges and collaborative trends", icon: "🏆" },
      { name: "Life Hacks", description: "Clever tips and time-saving tricks", icon: "💡" },
      { name: "Storytelling", description: "Personal anecdotes and narrative content", icon: "📖" },
      { name: "ASMR", description: "Satisfying sounds and sensory content", icon: "🎧" },
    ],
    Instagram: [
      { name: "Fashion", description: "Style showcases and outfit inspiration", icon: "👗" },
      { name: "Beauty", description: "Makeup tutorials and beauty trends", icon: "💄" },
      { name: "Travel", description: "Destination highlights and travel guides", icon: "✈️" },
      { name: "Food", description: "Food photography and recipe inspirations", icon: "🍔" },
      { name: "Fitness", description: "Workout routines and fitness journeys", icon: "💪" },
      { name: "Lifestyle", description: "Day-in-the-life content and lifestyle tips", icon: "🏠" },
      { name: "Art", description: "Creative processes and artistic showcases", icon: "🎨" },
      { name: "Photography", description: "Photography techniques and visual stories", icon: "📷" },
      { name: "Home Decor", description: "Interior design tips and home transformations", icon: "🛋️" },
      { name: "Wellness", description: "Self-care practices and wellness advice", icon: "🧘" },
      { name: "Parenting", description: "Family moments and parenting insights", icon: "👨‍👩‍👧" },
      { name: "Business", description: "Entrepreneurship and business growth", icon: "💼" },
      { name: "Motivation", description: "Inspirational content and success stories", icon: "⭐" },
      { name: "Nature", description: "Outdoor adventures and natural beauty", icon: "🌳" },
      { name: "Luxury", description: "High-end products and luxury experiences", icon: "💎" },
      { name: "Streetwear", description: "Urban fashion and street culture", icon: "👟" },
    ],
    YouTube: [
      { name: "Gaming", description: "Gameplay, reviews, and gaming commentary", icon: "🎮" },
      { name: "Education", description: "Educational content and academic subjects", icon: "🧠" },
      { name: "Entertainment", description: "Entertaining shows and creative content", icon: "🎭" },
      { name: "Tech Reviews", description: "Product evaluations and tech analysis", icon: "📱" },
      { name: "Vlogs", description: "Daily life documentation and experiences", icon: "🎥" },
      { name: "Cooking", description: "Recipe tutorials and culinary exploration", icon: "🍳" },
      { name: "Music", description: "Music performances, covers, and analysis", icon: "🎵" },
      { name: "DIY", description: "Do-it-yourself projects and home improvements", icon: "🛠️" },
      { name: "Science", description: "Scientific experiments and explanations", icon: "🔬" },
      { name: "History", description: "Historical events and cultural exploration", icon: "📜" },
      { name: "True Crime", description: "Crime investigations and case analyses", icon: "🔎" },
      { name: "Documentaries", description: "In-depth exploration of topics and stories", icon: "🎬" },
      { name: "Reactions", description: "Reaction videos to various content", icon: "😲" },
      { name: "Commentary", description: "Social and cultural commentary", icon: "💬" },
      { name: "Tutorials", description: "Step-by-step guides for various skills", icon: "📋" },
      { name: "Unboxing", description: "Product unboxing and first impressions", icon: "📦" },
    ],
    Twitter: [
      { name: "News", description: "Breaking news and current events", icon: "📰" },
      { name: "Politics", description: "Political analysis and commentary", icon: "🏛️" },
      { name: "Sports", description: "Sports highlights and commentary", icon: "⚽" },
      { name: "Tech", description: "Technology updates and digital trends", icon: "📱" },
      { name: "Entertainment", description: "Entertainment news and celebrity updates", icon: "🎭" },
      { name: "Business", description: "Market updates and business insights", icon: "💼" },
      { name: "Science", description: "Scientific discoveries and research", icon: "🔬" },
      { name: "Health", description: "Health updates and medical information", icon: "🏥" },
      { name: "Comedy", description: "Humorous takes and comedic content", icon: "😂" },
      { name: "Art", description: "Artistic showcases and creative content", icon: "🎨" },
      { name: "Literature", description: "Literary discussions and book content", icon: "📚" },
      { name: "Music", description: "Music news and artist updates", icon: "🎵" },
      { name: "Gaming", description: "Gaming news and community content", icon: "🎮" },
      { name: "Fashion", description: "Style trends and fashion commentary", icon: "👗" },
      { name: "Food", description: "Culinary content and food discussions", icon: "🍔" },
      { name: "Travel", description: "Travel destinations and experiences", icon: "✈️" },
    ],
    LinkedIn: [
      { name: "Professional Development", description: "Career growth and skill building", icon: "📈" },
      { name: "Career Advice", description: "Job search tips and career guidance", icon: "🧭" },
      { name: "Leadership", description: "Leadership strategies and insights", icon: "👑" },
      { name: "Entrepreneurship", description: "Startup stories and business journeys", icon: "🚀" },
      { name: "Marketing", description: "Marketing strategies and campaigns", icon: "📣" },
      { name: "Sales", description: "Sales techniques and client acquisition", icon: "💰" },
      { name: "HR & Recruiting", description: "Talent acquisition and HR practices", icon: "👥" },
      { name: "Technology", description: "Tech innovations and digital transformation", icon: "⚙️" },
      { name: "Finance", description: "Financial insights and investment strategies", icon: "💹" },
      { name: "Management", description: "Team management and organizational leadership", icon: "📊" },
      { name: "Workplace Culture", description: "Company culture and employee experience", icon: "🏢" },
      { name: "Industry Insights", description: "Sector-specific trends and analysis", icon: "📋" },
      { name: "Networking", description: "Professional connection strategies", icon: "🔗" },
      { name: "Personal Branding", description: "Building professional identity", icon: "🎯" },
      { name: "Remote Work", description: "Virtual collaboration and remote strategies", icon: "🏠" },
      { name: "Business Strategy", description: "Strategic planning and growth tactics", icon: "♟️" },
    ],
    Pinterest: [
      { name: "Home Decor", description: "Interior design inspiration and styling", icon: "🏠" },
      { name: "DIY & Crafts", description: "Craft projects and handmade creations", icon: "✂️" },
      { name: "Fashion", description: "Style inspiration and outfit ideas", icon: "👗" },
      { name: "Beauty", description: "Makeup looks and beauty routines", icon: "💄" },
      { name: "Food & Recipes", description: "Cooking inspiration and meal ideas", icon: "🍽️" },
      { name: "Travel", description: "Travel destinations and adventure ideas", icon: "✈️" },
      { name: "Wedding", description: "Wedding planning and decor inspiration", icon: "💍" },
      { name: "Health & Fitness", description: "Workout routines and healthy living", icon: "💪" },
      { name: "Parenting", description: "Family activities and parenting tips", icon: "👨‍👩‍👧" },
      { name: "Art", description: "Artistic inspiration and creative projects", icon: "🎨" },
      { name: "Photography", description: "Photo techniques and visual inspiration", icon: "📷" },
      { name: "Gardening", description: "Plant care and garden design", icon: "🌱" },
      { name: "Organization", description: "Storage solutions and tidying tips", icon: "📦" },
      { name: "Architecture", description: "Building design and structural inspiration", icon: "🏛️" },
      { name: "Education", description: "Learning resources and teaching materials", icon: "📚" },
      { name: "Holiday & Events", description: "Seasonal decor and celebration ideas", icon: "🎉" },
    ],
    Facebook: [
      { name: "Community Groups", description: "Group discussions and local communities", icon: "👥" },
      { name: "Family & Friends", description: "Personal updates and family moments", icon: "👨‍👩‍👧" },
      { name: "Events", description: "Event promotion and social gatherings", icon: "📅" },
      { name: "Marketplace", description: "Buy and sell items locally", icon: "🛒" },
      { name: "Entertainment", description: "Shareable entertaining content", icon: "🎬" },
      { name: "News", description: "Current events and information sharing", icon: "📰" },
      { name: "Business", description: "Business pages and promotional content", icon: "💼" },
      { name: "Gaming", description: "Game-related content and social play", icon: "🎮" },
      { name: "Food", description: "Recipes and culinary content", icon: "🍔" },
      { name: "Travel", description: "Travel experiences and destination sharing", icon: "✈️" },
      { name: "Fitness", description: "Workout videos and health journeys", icon: "💪" },
      { name: "Fashion", description: "Style inspiration and trends", icon: "👗" },
      { name: "Humor", description: "Funny content and shareable memes", icon: "😂" },
      { name: "Politics", description: "Political discussions and civic engagement", icon: "🏛️" },
      { name: "Education", description: "Learning resources and knowledge sharing", icon: "📚" },
      { name: "Causes", description: "Nonprofit organizations and fundraising", icon: "🤝" },
    ],
    Snapchat: [
      { name: "Daily Life", description: "Day-to-day moments and life updates", icon: "📱" },
      { name: "Behind-the-Scenes", description: "Unfiltered glimpses of activities", icon: "🎬" },
      { name: "Travel", description: "Travel moments and destination snaps", icon: "✈️" },
      { name: "Events", description: "Live event coverage and experiences", icon: "🎉" },
      { name: "Beauty", description: "Beauty looks and product showcases", icon: "💄" },
      { name: "Fashion", description: "Style showcases and outfit highlights", icon: "👗" },
      { name: "Food", description: "Food experiences and culinary moments", icon: "🍔" },
      { name: "Humor", description: "Funny moments and comedic content", icon: "😂" },
      { name: "Challenges", description: "Trending challenges and viral content", icon: "🏆" },
      { name: "Tutorials", description: "Quick how-tos and mini-guides", icon: "📋" },
      { name: "Product Reviews", description: "Brief product evaluations", icon: "📦" },
      { name: "Music", description: "Musical moments and song snippets", icon: "🎵" },
      { name: "Sports", description: "Athletic activities and sports moments", icon: "⚽" },
      { name: "Art", description: "Creative processes and artistic expression", icon: "🎨" },
      { name: "Storytelling", description: "Narrative content and story arcs", icon: "📖" },
      { name: "Reactions", description: "Reaction videos and response content", icon: "😲" },
      { name: "Twitch: Gaming", description: "Gameplay streams and gaming content", icon: "🎮" },
    ],
    Twitch: [
      { name: "Gaming", description: "Gameplay streams and gaming content", icon: "🎮" },
      { name: "Just Chatting", description: "Conversational streams and discussions", icon: "💬" },
      { name: "Music", description: "Musical performances and audio content", icon: "🎵" },
      { name: "Art", description: "Creative processes and artistic streams", icon: "🎨" },
      { name: "Sports", description: "Sports commentary and athletic content", icon: "⚽" },
      { name: "Talk Shows", description: "Structured discussions and interview formats", icon: "🎙️" },
      { name: "Food & Drink", description: "Cooking streams and culinary content", icon: "🍔" },
      { name: "Science & Technology", description: "Tech discussions and scientific content", icon: "🔬" },
      { name: "Travel & Outdoors", description: "Location-based streams and adventures", icon: "🏞️" },
      { name: "Tabletop RPG", description: "Role-playing game sessions and campaigns", icon: "🎲" },
      { name: "Fitness", description: "Workout streams and physical activities", icon: "💪" },
      { name: "ASMR", description: "Audio sensory content and relaxation", icon: "🎧" },
      { name: "Dance", description: "Dance performances and movement arts", icon: "💃" },
      { name: "Comedy", description: "Humorous streams and entertainment", icon: "😂" },
      { name: "Educational", description: "Learning content and instructional streams", icon: "📚" },
      { name: "Special Events", description: "Event coverage and special occasions", icon: "🎉" },
    ],
  }

  // Dynamic trends with enhanced metadata
  const trends: TrendsData = {
    TikTok: {
      Dance: [
        {
          name: "Sped-Up Dance Challenge",
          updated: "2 hours ago",
          description: "Fast-paced choreography to sped-up versions of popular songs",
          popularity: 9,
          difficulty: 6,
          tags: ["viral", "music", "choreography"],
        },
        {
          name: "Transition Dance",
          updated: "1 day ago",
          description: "Creative transitions between dance moves and outfit changes",
          popularity: 8,
          difficulty: 7,
          tags: ["editing", "visual", "creative"],
        },
        {
          name: "Duet Dance",
          updated: "3 days ago",
          description: "Side-by-side dance collaborations with other creators",
          popularity: 7,
          difficulty: 5,
          tags: ["collaborative", "community", "interactive"],
        },
        {
          name: "Slow Motion Effects",
          updated: "1 week ago",
          description: "Dramatic slow-motion dance sequences highlighting technique",
          popularity: 6,
          difficulty: 4,
          tags: ["technical", "artistic", "cinematic"],
        },
        {
          name: "Choreography Trends",
          updated: "5 hours ago",
          description: "Following popular choreography sequences by dance influencers",
          popularity: 9,
          difficulty: 7,
          tags: ["trending", "community", "skill"],
        },
        {
          name: "Dance Tutorial",
          updated: "2 days ago",
          description: "Step-by-step instructions for popular dance routines",
          popularity: 7,
          difficulty: 4,
          tags: ["educational", "instructional", "beginner-friendly"],
        },
      ],
      Comedy: [
        {
          name: "POV Skits",
          updated: "5 hours ago",
          popularity: 9,
          difficulty: 5,
          tags: ["acting", "storytelling", "relatable"],
        },
        {
          name: "Green Screen Challenges",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["editing", "creative", "technical"],
        },
        {
          name: "Lip Sync Battles",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 4,
          tags: ["music", "performance", "expression"],
        },
        {
          name: "Reaction Videos",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 3,
          tags: ["authentic", "relatable", "commentary"],
        },
        {
          name: "Comedic Storytimes",
          updated: "3 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["narrative", "personality", "engagement"],
        },
        {
          name: "Character Impressions",
          updated: "6 days ago",
          popularity: 7,
          difficulty: 8,
          tags: ["acting", "creativity", "skill"],
        },
      ],
      Education: [
        {
          name: "Quick Facts Series",
          updated: "3 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["informative", "concise", "educational"],
        },
        {
          name: "How-To Tutorials",
          updated: "1 day ago",
          popularity: 9,
          difficulty: 6,
          tags: ["instructional", "helpful", "skills"],
        },
        {
          name: "Life Hacks",
          updated: "2 days ago",
          popularity: 9,
          difficulty: 4,
          tags: ["useful", "practical", "tips"],
        },
        {
          name: "Explainer Videos",
          updated: "4 days ago",
          popularity: 7,
          difficulty: 7,
          tags: ["informative", "detailed", "educational"],
        },
        {
          name: "Language Learning",
          updated: "5 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["educational", "interactive", "skills"],
        },
        {
          name: "Science Experiments",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 6,
          tags: ["educational", "visual", "engaging"],
        },
      ],
      Food: [
        {
          name: "Recipe Shorts",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 5,
          tags: ["cooking", "quick", "visual"],
        },
        {
          name: "Food ASMR",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["satisfying", "sensory", "relaxing"],
        },
        {
          name: "Cooking Hacks",
          updated: "3 days ago",
          popularity: 9,
          difficulty: 3,
          tags: ["useful", "practical", "kitchen"],
        },
        {
          name: "Food Challenges",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 4,
          tags: ["entertaining", "competitive", "fun"],
        },
        {
          name: "Restaurant Reviews",
          updated: "4 hours ago",
          popularity: 7,
          difficulty: 5,
          tags: ["informative", "opinion", "local"],
        },
        {
          name: "Meal Prep Ideas",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 6,
          tags: ["practical", "healthy", "organized"],
        },
      ],
    },
    Instagram: {
      Fashion: [
        {
          name: "Outfit Transition Reels",
          updated: "3 hours ago",
          popularity: 9,
          difficulty: 6,
          tags: ["style", "creative", "visual"],
        },
        {
          name: "Fashion Hauls",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["shopping", "review", "trends"],
        },
        {
          name: "Style Tips",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["advice", "practical", "seasonal"],
        },
        {
          name: "Brand Collaborations",
          updated: "4 days ago",
          popularity: 7,
          difficulty: 7,
          tags: ["sponsored", "professional", "showcase"],
        },
        {
          name: "Seasonal Lookbooks",
          updated: "5 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["curated", "themed", "inspiration"],
        },
        {
          name: "Fashion Week Coverage",
          updated: "3 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["event", "trends", "industry"],
        },
      ],
      Beauty: [
        {
          name: "Makeup Transformations",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 7,
          tags: ["dramatic", "skills", "before-after"],
        },
        {
          name: "Product Reviews",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["honest", "detailed", "recommendations"],
        },
        {
          name: "Beauty Routines",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["step-by-step", "personal", "skincare"],
        },
        {
          name: "Skincare",
          updated: "2 days ago",
          popularity: 9,
          difficulty: 4,
          tags: ["self-care", "health", "routines"],
        },
        {
          name: "Hair Tutorials",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["styling", "techniques", "trends"],
        },
        {
          name: "Beauty Hacks",
          updated: "5 days ago",
          popularity: 9,
          difficulty: 3,
          tags: ["tips", "shortcuts", "creative"],
        },
      ],
      Travel: [
        {
          name: "Destination Highlights",
          updated: "3 hours ago",
          popularity: 9,
          difficulty: 6,
          tags: ["scenic", "adventure", "exploration"],
        },
        {
          name: "Travel Tips",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["practical", "advice", "planning"],
        },
        {
          name: "Hotel Reviews",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["accommodation", "luxury", "experience"],
        },
        {
          name: "Adventure Reels",
          updated: "4 days ago",
          popularity: 9,
          difficulty: 7,
          tags: ["exciting", "action", "outdoors"],
        },
        {
          name: "Hidden Gems",
          updated: "5 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["discovery", "local", "unique"],
        },
        {
          name: "Travel Guides",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["informative", "comprehensive", "useful"],
        },
      ],
    },
    YouTube: {
      Gaming: [
        {
          name: "Let's Play Series",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["gameplay", "commentary", "series"],
        },
        {
          name: "Game Reviews",
          updated: "1 day ago",
          popularity: 7,
          difficulty: 6,
          tags: ["critique", "analysis", "recommendation"],
        },
        {
          name: "Tutorials",
          updated: "3 days ago",
          popularity: 9,
          difficulty: 7,
          tags: ["helpful", "skills", "strategies"],
        },
        {
          name: "Streaming Highlights",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["entertaining", "compilation", "best-moments"],
        },
        {
          name: "Game Challenges",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["creative", "difficult", "entertaining"],
        },
        {
          name: "Esports Coverage",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["competitive", "professional", "analysis"],
        },
      ],
      Education: [
        {
          name: "Explainer Videos",
          updated: "3 hours ago",
          popularity: 8,
          difficulty: 7,
          tags: ["informative", "detailed", "visual"],
        },
        {
          name: "Tutorials",
          updated: "1 day ago",
          popularity: 9,
          difficulty: 6,
          tags: ["step-by-step", "skills", "learning"],
        },
        {
          name: "Documentary Style",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 8,
          tags: ["in-depth", "research", "storytelling"],
        },
        {
          name: "Educational Series",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["comprehensive", "structured", "curriculum"],
        },
        {
          name: "Study Tips",
          updated: "5 hours ago",
          popularity: 8,
          difficulty: 4,
          tags: ["practical", "academic", "productivity"],
        },
        {
          name: "Academic Subjects",
          updated: "3 days ago",
          popularity: 7,
          difficulty: 6,
          tags: ["specific", "detailed", "educational"],
        },
      ],
      Entertainment: [
        {
          name: "Challenges",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 5,
          tags: ["fun", "engaging", "trending"],
        },
        {
          name: "Reaction Videos",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["commentary", "authentic", "engaging"],
        },
        {
          name: "Comedy Skits",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["funny", "scripted", "creative"],
        },
        {
          name: "Storytimes",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["personal", "narrative", "engaging"],
        },
        {
          name: "Celebrity Interviews",
          updated: "4 hours ago",
          popularity: 7,
          difficulty: 8,
          tags: ["exclusive", "conversation", "insights"],
        },
        {
          name: "Variety Shows",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["diverse", "entertaining", "segments"],
        },
      ],
    },
    Twitter: {
      News: [
        {
          name: "Breaking News",
          updated: "1 hour ago",
          popularity: 9,
          difficulty: 5,
          tags: ["timely", "important", "current"],
        },
        {
          name: "News Analysis",
          updated: "1 day ago",
          popularity: 7,
          difficulty: 7,
          tags: ["insightful", "context", "perspective"],
        },
        {
          name: "Fact Checking",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 6,
          tags: ["accurate", "verification", "clarity"],
        },
        {
          name: "Live Updates",
          updated: "3 hours ago",
          popularity: 9,
          difficulty: 4,
          tags: ["real-time", "ongoing", "developments"],
        },
        {
          name: "Investigative Threads",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 8,
          tags: ["in-depth", "research", "exposé"],
        },
        {
          name: "News Summaries",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["concise", "overview", "digest"],
        },
      ],
      Politics: [
        {
          name: "Political Analysis",
          updated: "2 hours ago",
          popularity: 7,
          difficulty: 7,
          tags: ["insightful", "balanced", "context"],
        },
        {
          name: "Policy Discussions",
          updated: "1 day ago",
          popularity: 7,
          difficulty: 6,
          tags: ["detailed", "issues", "legislation"],
        },
        {
          name: "Election Coverage",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["voting", "candidates", "campaigns"],
        },
        {
          name: "Political Commentary",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["opinion", "perspective", "current"],
        },
        {
          name: "Legislative Updates",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["government", "laws", "policy"],
        },
        {
          name: "Political Debates",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["discussion", "opposing-views", "issues"],
        },
      ],
      Sports: [
        {
          name: "Game Highlights",
          updated: "3 hours ago",
          popularity: 9,
          difficulty: 4,
          tags: ["action", "key-moments", "recap"],
        },
        {
          name: "Sports Analysis",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["strategy", "performance", "insights"],
        },
        {
          name: "Athlete Spotlights",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["personal", "stories", "profiles"],
        },
        {
          name: "Live Game Updates",
          updated: "5 hours ago",
          popularity: 9,
          difficulty: 3,
          tags: ["real-time", "play-by-play", "scores"],
        },
        {
          name: "Sports News",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["current", "teams", "leagues"],
        },
        {
          name: "Fan Reactions",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 3,
          tags: ["community", "emotional", "authentic"],
        },
      ],
    },
    LinkedIn: {
      "Professional Development": [
        {
          name: "Skill Building",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["learning", "growth", "expertise"],
        },
        {
          name: "Professional Courses",
          updated: "1 day ago",
          popularity: 7,
          difficulty: 7,
          tags: ["education", "certification", "training"],
        },
        {
          name: "Career Growth",
          updated: "3 days ago",
          popularity: 9,
          difficulty: 5,
          tags: ["advancement", "strategy", "success"],
        },
        {
          name: "Certification Paths",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["credentials", "qualifications", "skills"],
        },
        {
          name: "Learning Resources",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 4,
          tags: ["tools", "materials", "education"],
        },
        {
          name: "Industry Skills",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 6,
          tags: ["specific", "relevant", "technical"],
        },
      ],
      "Career Advice": [
        {
          name: "Job Search Tips",
          updated: "1 hour ago",
          popularity: 9,
          difficulty: 4,
          tags: ["employment", "strategy", "opportunities"],
        },
        {
          name: "Interview Preparation",
          updated: "1 day ago",
          popularity: 9,
          difficulty: 5,
          tags: ["preparation", "questions", "success"],
        },
        {
          name: "Resume Building",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["document", "presentation", "skills"],
        },
        {
          name: "Career Transitions",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["change", "strategy", "new-path"],
        },
        {
          name: "Salary Negotiation",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["compensation", "discussion", "value"],
        },
        {
          name: "Professional Networking",
          updated: "5 days ago",
          popularity: 9,
          difficulty: 5,
          tags: ["connections", "relationships", "opportunities"],
        },
      ],
      Leadership: [
        {
          name: "Leadership Strategies",
          updated: "3 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["management", "direction", "vision"],
        },
        {
          name: "Team Management",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["coordination", "supervision", "collaboration"],
        },
        {
          name: "Executive Insights",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["perspective", "experience", "c-suite"],
        },
        {
          name: "Leadership Development",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 7,
          tags: ["growth", "skills", "potential"],
        },
        {
          name: "Crisis Leadership",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 8,
          tags: ["challenges", "resilience", "decision-making"],
        },
        {
          name: "Leadership Stories",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["examples", "inspiration", "lessons"],
        },
      ],
    },
    Pinterest: {
      "Home Decor": [
        {
          name: "Interior Design Inspiration",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 5,
          tags: ["style", "aesthetic", "spaces"],
        },
        {
          name: "Room Makeovers",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["transformation", "before-after", "design"],
        },
        {
          name: "Decorating Tips",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["advice", "practical", "styling"],
        },
        {
          name: "Home Styling",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["arrangement", "aesthetic", "decor"],
        },
        {
          name: "Seasonal Decor",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 4,
          tags: ["holiday", "themed", "festive"],
        },
        {
          name: "Budget Decorating",
          updated: "2 days ago",
          popularity: 9,
          difficulty: 5,
          tags: ["affordable", "diy", "value"],
        },
      ],
      "DIY & Crafts": [
        {
          name: "Craft Tutorials",
          updated: "1 hour ago",
          popularity: 9,
          difficulty: 5,
          tags: ["instructions", "creative", "handmade"],
        },
        {
          name: "DIY Projects",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["homemade", "creation", "practical"],
        },
        {
          name: "Handmade Items",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["crafts", "artisan", "unique"],
        },
        {
          name: "Upcycling Ideas",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["repurpose", "sustainable", "creative"],
        },
        {
          name: "Craft Supplies",
          updated: "4 days ago",
          popularity: 7,
          difficulty: 3,
          tags: ["materials", "tools", "resources"],
        },
        {
          name: "Seasonal Crafts",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["holiday", "themed", "decorative"],
        },
      ],
      Fashion: [
        {
          name: "Outfit Inspiration",
          updated: "3 hours ago",
          popularity: 9,
          difficulty: 4,
          tags: ["style", "clothing", "combinations"],
        },
        {
          name: "Fashion Trends",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 5,
          tags: ["current", "popular", "seasonal"],
        },
        {
          name: "Style Guides",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 6,
          tags: ["advice", "how-to", "fashion"],
        },
        {
          name: "Seasonal Fashion",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["weather", "appropriate", "trends"],
        },
        {
          name: "Accessory Styling",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 4,
          tags: ["jewelry", "bags", "details"],
        },
        {
          name: "Fashion Tips",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["advice", "tricks", "style"],
        },
      ],
    },
    Facebook: {
      "Community Groups": [
        {
          name: "Group Discussions",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 4,
          tags: ["conversation", "topics", "engagement"],
        },
        {
          name: "Community Events",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["gatherings", "local", "activities"],
        },
        {
          name: "Support Groups",
          updated: "3 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["help", "connection", "shared-experience"],
        },
        {
          name: "Local Communities",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["neighborhood", "area", "regional"],
        },
        {
          name: "Interest Groups",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["hobbies", "passions", "shared-interests"],
        },
        {
          name: "Group Challenges",
          updated: "2 days ago",
          popularity: 7,
          difficulty: 6,
          tags: ["participation", "activity", "engagement"],
        },
      ],
      "Family & Friends": [
        {
          name: "Family Updates",
          updated: "1 hour ago",
          popularity: 8,
          difficulty: 3,
          tags: ["personal", "life-events", "sharing"],
        },
        {
          name: "Life Milestones",
          updated: "1 day ago",
          popularity: 9,
          difficulty: 4,
          tags: ["celebrations", "achievements", "important-moments"],
        },
        {
          name: "Personal Stories",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["experiences", "narrative", "sharing"],
        },
        {
          name: "Photo Albums",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 4,
          tags: ["collections", "memories", "visual"],
        },
        {
          name: "Family Events",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["gatherings", "celebrations", "occasions"],
        },
        {
          name: "Reunion Planning",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 7,
          tags: ["organization", "gathering", "coordination"],
        },
      ],
      Events: [
        {
          name: "Event Planning",
          updated: "3 hours ago",
          popularity: 8,
          difficulty: 7,
          tags: ["organization", "coordination", "preparation"],
        },
        {
          name: "Virtual Events",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 6,
          tags: ["online", "remote", "digital"],
        },
        {
          name: "Event Promotion",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["marketing", "awareness", "attendance"],
        },
        {
          name: "Local Events",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 6,
          tags: ["community", "area", "gatherings"],
        },
        {
          name: "Event Recaps",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 4,
          tags: ["summary", "highlights", "coverage"],
        },
        {
          name: "Event Tickets",
          updated: "3 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["sales", "admission", "registration"],
        },
      ],
    },
    Snapchat: {
      "Daily Life": [
        {
          name: "Daily Life",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 3,
          tags: ["routine", "personal", "authentic"],
        },
        {
          name: "Daily Vlogs",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["video-diary", "personal", "regular"],
        },
        {
          name: "Morning Routines",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["habits", "start-day", "preparation"],
        },
        {
          name: "Life Updates",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 2,
          tags: ["news", "personal", "changes"],
        },
        {
          name: "Daily Moments",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 3,
          tags: ["snippets", "highlights", "everyday"],
        },
        {
          name: "Everyday Stories",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["narrative", "personal", "relatable"],
        },
      ],
      "Behind-the-Scenes": [
        {
          name: "Work BTS",
          updated: "1 hour ago",
          popularity: 8,
          difficulty: 4,
          tags: ["professional", "workplace", "insider"],
        },
        {
          name: "Creative Process",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 5,
          tags: ["making-of", "artistic", "development"],
        },
        {
          name: "Event Preparation",
          updated: "3 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["setup", "planning", "organization"],
        },
        {
          name: "Project BTS",
          updated: "2 hours ago",
          popularity: 8,
          difficulty: 5,
          tags: ["development", "creation", "process"],
        },
        {
          name: "Studio Tours",
          updated: "4 days ago",
          popularity: 7,
          difficulty: 6,
          tags: ["workspace", "environment", "setup"],
        },
        {
          name: "Production BTS",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 6,
          tags: ["filming", "creation", "making"],
        },
      ],
      Travel: [
        {
          name: "Travel Diaries",
          updated: "3 hours ago",
          popularity: 9,
          difficulty: 5,
          tags: ["journey", "documentation", "experience"],
        },
        {
          name: "Destination Snaps",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 4,
          tags: ["location", "sights", "places"],
        },
        {
          name: "Travel Adventures",
          updated: "2 days ago",
          popularity: 9,
          difficulty: 5,
          tags: ["exploration", "activities", "experiences"],
        },
        {
          name: "Trip Highlights",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 4,
          tags: ["best-moments", "memorable", "featured"],
        },
        {
          name: "Travel Moments",
          updated: "5 days ago",
          popularity: 8,
          difficulty: 3,
          tags: ["experiences", "journey", "memories"],
        },
        {
          name: "Vacation Stories",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["narrative", "holiday", "experiences"],
        },
      ],
    },
    Twitch: {
      Gaming: [
        {
          name: "Game Streaming",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 6,
          tags: ["live", "gameplay", "interactive"],
        },
        {
          name: "Speedruns",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 8,
          tags: ["fast", "skill", "completion"],
        },
        {
          name: "Gaming Commentary",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 5,
          tags: ["analysis", "reaction", "discussion"],
        },
        {
          name: "Competitive Gaming",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 7,
          tags: ["esports", "tournaments", "skill"],
        },
        {
          name: "Game Reviews",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 6,
          tags: ["critique", "analysis", "opinion"],
        },
        {
          name: "Gaming Challenges",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["difficult", "creative", "unique"],
        },
      ],
      "Just Chatting": [
        {
          name: "Talk Shows",
          updated: "1 hour ago",
          popularity: 8,
          difficulty: 6,
          tags: ["conversation", "topics", "hosting"],
        },
        {
          name: "Live Discussions",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 5,
          tags: ["conversation", "interactive", "topics"],
        },
        {
          name: "Q&A Sessions",
          updated: "3 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["questions", "answers", "interactive"],
        },
        {
          name: "Community Engagement",
          updated: "2 hours ago",
          popularity: 9,
          difficulty: 5,
          tags: ["interaction", "audience", "connection"],
        },
        {
          name: "Reaction Content",
          updated: "4 days ago",
          popularity: 8,
          difficulty: 4,
          tags: ["response", "commentary", "viewing"],
        },
        {
          name: "Life Updates",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 3,
          tags: ["personal", "news", "sharing"],
        },
      ],
      Music: [
        {
          name: "Live Music",
          updated: "3 hours ago",
          popularity: 8,
          difficulty: 7,
          tags: ["performance", "concert", "playing"],
        },
        {
          name: "Music Production",
          updated: "1 day ago",
          popularity: 8,
          difficulty: 8,
          tags: ["creation", "composition", "technical"],
        },
        {
          name: "DJ Sets",
          updated: "2 days ago",
          popularity: 8,
          difficulty: 7,
          tags: ["mixing", "playlist", "performance"],
        },
        {
          name: "Music Performances",
          updated: "4 hours ago",
          popularity: 8,
          difficulty: 7,
          tags: ["live", "playing", "concert"],
        },
        {
          name: "Music Creation",
          updated: "5 days ago",
          popularity: 7,
          difficulty: 8,
          tags: ["composition", "songwriting", "production"],
        },
        {
          name: "Music Discussions",
          updated: "3 days ago",
          popularity: 7,
          difficulty: 5,
          tags: ["analysis", "conversation", "critique"],
        },
      ],
    },
  }

  // This is just a subset of all possible combinations
  // In a production environment, you would want to have trends for every niche in every platform
  // The code will now handle any platform-niche combination by providing at least some default trends if specific ones aren't defined

  // Add a fallback mechanism to ensure every niche has trends
  const getTrendsForNicheAndPlatform = (platform: string, niche: string) => {
    // If we have specific trends for this platform and niche, return them
    if (trends[platform]?.[niche]) {
      return trends[platform][niche]
    }

    // Otherwise, return some generic trends that could work for any niche
    return [
      {
        name: "Tutorial Series",
        updated: "2 hours ago",
        description: `Step-by-step guides for ${niche} content`,
        popularity: 8,
        difficulty: 5,
        tags: ["educational", "instructional", "helpful"],
      },
      {
        name: "Behind the Scenes",
        updated: "1 day ago",
        description: `Show the process behind your ${niche} content`,
        popularity: 7,
        difficulty: 4,
        tags: ["authentic", "process", "insider"],
      },
      {
        name: "Top Tips Format",
        updated: "3 days ago",
        description: `Share your best advice for ${niche}`,
        popularity: 9,
        difficulty: 3,
        tags: ["helpful", "listicle", "advice"],
      },
      {
        name: "Day in the Life",
        updated: "4 days ago",
        description: `Show what it's like in the ${niche} world`,
        popularity: 8,
        difficulty: 4,
        tags: ["personal", "authentic", "lifestyle"],
      },
      {
        name: "Review Format",
        updated: "5 hours ago",
        description: `Evaluate products or content related to ${niche}`,
        popularity: 7,
        difficulty: 5,
        tags: ["opinion", "analysis", "recommendations"],
      },
      {
        name: "Challenge Videos",
        updated: "2 days ago",
        description: `Fun challenges related to ${niche}`,
        popularity: 9,
        difficulty: 6,
        tags: ["entertaining", "engaging", "participatory"],
      },
    ]
  }

  // AI suggestion functions
  const suggestNiche = () => {
    setIsAnalyzingNiche(true)

    // Simulate AI processing
    setTimeout(() => {
      if (!socialMedia || !nicheDescription) {
        setIsAnalyzingNiche(false)
        return
      }

      // Simple keyword matching for demo purposes
      // In a real app, this would use a more sophisticated AI model
      const description = nicheDescription.toLowerCase()
      const availableNiches = niches[socialMedia] || []

      let bestMatch = ""
      let highestScore = 0

      availableNiches.forEach((nicheItem) => {
        let score = 0
        const nicheKeywords = [
          nicheItem.name.toLowerCase(),
          nicheItem.description.toLowerCase(),
          ...nicheItem.description.toLowerCase().split(" "),
        ]

        nicheKeywords.forEach((keyword) => {
          if (description.includes(keyword)) {
            score += 1
          }
        })

        if (score > highestScore) {
          highestScore = score
          bestMatch = nicheItem.name
        }
      })

      // If no good match found, pick the first niche
      if (highestScore === 0 && availableNiches.length > 0) {
        bestMatch = availableNiches[0].name
      }

      if (bestMatch) {
        setNiche(bestMatch)
        setShowNichePrompt(false)
      }

      setIsAnalyzingNiche(false)
    }, 1500)
  }

  const scanSocialMediaForTrends = () => {
    if (!socialMedia || !trendDescription.trim()) return

    setIsScanningSocialMedia(true)
    setShowDiscoveredTrends(false)
    setDiscoveredTrends([])

    // Simulate API call to social media platform
    setTimeout(() => {
      // Generate "discovered" trends based on the description
      const keywords = trendDescription.toLowerCase().split(/\s+/)

      // Create dynamic trend names based on keywords from user input
      const generatedTrends: TrendItem[] = []

      // Extract meaningful keywords (exclude common words)
      const meaningfulKeywords = keywords
        .filter(
          (word) =>
            word.length > 3 &&
            !["this", "that", "with", "from", "have", "what", "when", "where", "will", "about"].includes(word),
        )
        .slice(0, 3)

      if (meaningfulKeywords.length > 0) {
        // Create a trend based on the first keyword
        const mainKeyword = meaningfulKeywords[0]
        generatedTrends.push({
          name: `${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} Challenge`,
          updated: "Just now",
          description: `New trending format featuring creative ${mainKeyword} content`,
          popularity: 8 + Math.floor(Math.random() * 3),
          difficulty: 3 + Math.floor(Math.random() * 5),
          tags: ["trending", "viral", "new", mainKeyword],
        })

        // If we have more keywords, create a second trend
        if (meaningfulKeywords.length > 1) {
          const secondKeyword = meaningfulKeywords[1]
          generatedTrends.push({
            name: `${secondKeyword.charAt(0).toUpperCase() + secondKeyword.slice(1)} Transformation`,
            updated: "1 hour ago",
            description: `Show before and after ${secondKeyword} with creative transitions`,
            popularity: 7 + Math.floor(Math.random() * 3),
            difficulty: 4 + Math.floor(Math.random() * 4),
            tags: ["before-after", secondKeyword, "creative"],
          })
        }

        // If we have a third keyword, create another trend
        if (meaningfulKeywords.length > 2) {
          const thirdKeyword = meaningfulKeywords[2]
          generatedTrends.push({
            name: `${thirdKeyword.charAt(0).toUpperCase() + thirdKeyword.slice(1)} Series`,
            updated: "3 hours ago",
            description: `Multi-part content showcasing different aspects of ${thirdKeyword}`,
            popularity: 6 + Math.floor(Math.random() * 4),
            difficulty: 5 + Math.floor(Math.random() * 3),
            tags: ["series", "multi-part", thirdKeyword],
          })
        }
      }

      // Add some platform-specific trends
      if (socialMedia === "TikTok") {
        generatedTrends.push({
          name: "POV: " + trendDescription.split(" ").slice(0, 3).join(" ") + "...",
          updated: "2 hours ago",
          description: "Point-of-view format that puts viewers in a specific scenario",
          popularity: 9,
          difficulty: 6,
          tags: ["pov", "acting", "scenario"],
        })
      } else if (socialMedia === "Instagram") {
        generatedTrends.push({
          name: "Aesthetic " + (meaningfulKeywords[0] || "Transition"),
          updated: "5 hours ago",
          description: "Visually cohesive content with smooth transitions",
          popularity: 8,
          difficulty: 7,
          tags: ["aesthetic", "visual", "transitions"],
        })
      } else if (socialMedia === "YouTube") {
        generatedTrends.push({
          name: (meaningfulKeywords[0] || "Content") + " Deep Dive",
          updated: "1 day ago",
          description: "In-depth exploration of a specific topic",
          popularity: 7,
          difficulty: 8,
          tags: ["educational", "detailed", "comprehensive"],
        })
      }

      // If we couldn't generate any trends, add some generic ones
      if (generatedTrends.length === 0) {
        generatedTrends.push({
          name: "Quick Tips Format",
          updated: "Just now",
          description: "Short, informative content with actionable advice",
          popularity: 9,
          difficulty: 4,
          tags: ["informative", "quick", "helpful"],
        })

        generatedTrends.push({
          name: "Day in the Life",
          updated: "2 hours ago",
          description: "Follow-along content showing daily activities",
          popularity: 8,
          difficulty: 3,
          tags: ["lifestyle", "authentic", "relatable"],
        })
      }

      setDiscoveredTrends(generatedTrends)
      setShowDiscoveredTrends(true)
      setIsScanningSocialMedia(false)
    }, 2500) // Simulate a 2.5 second API call
  }

  const suggestTrend = () => {
    setIsAnalyzingTrend(true)

    // First scan social media for real-time trends
    scanSocialMediaForTrends()

    // Then analyze and suggest the best trend
    setTimeout(() => {
      if (!socialMedia || !niche || !trendDescription) {
        setIsAnalyzingTrend(false)
        return
      }

      // If we have discovered trends, pick the first one
      if (discoveredTrends.length > 0) {
        setTrend(discoveredTrends[0].name)
        setShowTrendPrompt(false)
      } else {
        // Fall back to the original matching logic
        const description = trendDescription.toLowerCase()
        const availableTrends = trends[socialMedia]?.[niche] || getTrendsForNicheAndPlatform(socialMedia, niche)

        let bestMatch = ""
        let highestScore = 0

        availableTrends.forEach((trendItem) => {
          let score = 0
          const trendKeywords = [
            trendItem.name.toLowerCase(),
            trendItem.description ? trendItem.description.toLowerCase() : "",
            ...(trendItem.tags || []).map((tag) => tag.toLowerCase()),
          ]

          trendKeywords.forEach((keyword) => {
            if (description.includes(keyword)) {
              score += 1
            }
          })

          if (score > highestScore) {
            highestScore = score
            bestMatch = trendItem.name
          }
        })

        // If no good match found, pick the first trend
        if (highestScore === 0 && availableTrends.length > 0) {
          bestMatch = availableTrends[0].name
        }

        if (bestMatch) {
          setTrend(bestMatch)
          setShowTrendPrompt(false)
        }
      }

      setIsAnalyzingTrend(false)
    }, 3000)
  }

  // Update the filteredTrends logic to use this fallback mechanism
  const filteredTrends =
    searchQuery.length > 0 && socialMedia && niche
      ? (trends[socialMedia]?.[niche] || getTrendsForNicheAndPlatform(socialMedia, niche)).filter(
          (t) =>
            t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))),
        )
      : socialMedia && niche
        ? trends[socialMedia]?.[niche] || getTrendsForNicheAndPlatform(socialMedia, niche)
        : []

  // Also update the selectedTrendDetails logic to use the fallback
  const selectedTrendDetails =
    socialMedia && niche && trend
      ? (trends[socialMedia]?.[niche] || getTrendsForNicheAndPlatform(socialMedia, niche)).find((t) => t.name === trend)
      : null

  // Simplified version of trends data for all platforms
  // Expand as needed with more detailed trend information
  // This is the data structure already available in the original code

  // Filter niches by search query
  const filteredNiches =
    searchQuery.length > 0 && socialMedia
      ? niches[socialMedia].filter(
          (n) =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : socialMedia
        ? niches[socialMedia]
        : []

  // Filter trends by search query

  // Memoized handlers to prevent recreation on each render
  const handleNext = useCallback(() => {
    if (step < 4) {
      setStep(step + 1)
    } else {
      // Navigate to editor page with the selected parameters
      router.push(
        `/editor?platform=${encodeURIComponent(socialMedia)}&niche=${encodeURIComponent(niche)}&trend=${encodeURIComponent(trend)}`,
      )
    }
  }, [step, router, socialMedia, niche, trend])

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1)
    }
  }, [step])

  // Reset search when changing steps
  useEffect(() => {
    setSearchQuery("")
    setShowNichePrompt(false)
    setShowTrendPrompt(false)
  }, [step])

  // Get the selected trend details

  // Check if user has any saved videos
  useEffect(() => {
    try {
      const savedVideos = localStorage.getItem("trendall_videos")
      if (savedVideos) {
        const videos = JSON.parse(savedVideos)
        setHasVideos(videos.length > 0)
      }
    } catch (error) {
      console.error("Error checking saved videos:", error)
    }

    // Set loading to false after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 800)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-900">
        <div className="w-16 h-16 border-4 border-zinc-600 border-t-primary rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-800 to-slate-950 text-white">
      <div className="absolute top-4 left-4 z-10">
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500"
          >
            TrendAll
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm text-zinc-400"
          >
            Viral? We do that.
          </motion.div>
        </div>
      </div>

      {showOverview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-slate-800 rounded-xl p-6 max-w-2xl w-full relative"
          >
            <button
              onClick={() => setShowOverview(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4">Your Creative Journey</h2>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className={`${platforms[socialMedia]?.color || "bg-gray-600"} p-2 rounded-full`}>
                  {platforms[socialMedia]?.icon}
                </div>
                <div>
                  <h3 className="font-medium">Platform</h3>
                  <p className="text-xl">{socialMedia}</p>
                  <p className="text-sm text-gray-400 mt-1">{platforms[socialMedia]?.description}</p>
                </div>
              </div>

              {niche && (
                <div className="flex items-start space-x-4">
                  <div className="bg-indigo-600 p-2 rounded-full">
                    <span className="text-xl">{niches[socialMedia]?.find((n) => n.name === niche)?.icon || "🎯"}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">Niche</h3>
                    <p className="text-xl">{niche}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {niches[socialMedia]?.find((n) => n.name === niche)?.description}
                    </p>
                  </div>
                </div>
              )}

              {trend && (
                <div className="flex items-start space-x-4">
                  <div className="bg-pink-600 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Trend</h3>
                    <p className="text-xl">{trend}</p>
                    {selectedTrendDetails?.description && (
                      <p className="text-sm text-gray-400 mt-1">{selectedTrendDetails.description}</p>
                    )}
                    {selectedTrendDetails?.tags && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTrendDetails.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => setShowOverview(false)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <Card className="w-full max-w-4xl mx-auto backdrop-blur-sm bg-slate-900/70 border-slate-700 shadow-xl">
        <CardHeader>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <CardTitle className="text-2xl font-bold text-center text-white">Create Your Perfect Video</CardTitle>
            <CardDescription className="text-center text-gray-400">
              Customize your video editing experience with AI-assisted tools
            </CardDescription>
          </motion.div>
          <div className="flex justify-center mt-6">
            <div className="flex items-center">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    className={cn(
                      "rounded-full h-10 w-10 flex items-center justify-center border-2",
                      step > i
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-transparent"
                        : step === i
                          ? "border-purple-500 text-white"
                          : "border-slate-700 text-slate-400",
                    )}
                  >
                    {step > i ? <Check className="h-5 w-5" /> : i}
                  </motion.div>
                  {i < 3 && (
                    <div
                      className={cn(
                        "h-1 w-10",
                        step > i ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-slate-700",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Choose your platform</h3>
                  <div className="relative w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search platforms..."
                      className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div
                  ref={platformsContainerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                >
                  {Object.entries(platforms)
                    .filter(
                      ([platformName]) =>
                        searchQuery.length === 0 ||
                        platformName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        platforms[platformName].description.toLowerCase().includes(searchQuery.toLowerCase()),
                    )
                    .map(([platformName, platformInfo]) => (
                      <motion.div
                        key={platformName}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <button
                          className={cn(
                            "w-full h-28 rounded-xl border-2 transition-all flex flex-col items-center justify-center relative overflow-hidden group",
                            socialMedia === platformName
                              ? "border-transparent shadow-lg shadow-purple-500/20"
                              : "border-slate-700 hover:border-slate-600",
                          )}
                          onClick={() => setSocialMedia(platformName)}
                        >
                          <div
                            className={cn(
                              "absolute inset-0 opacity-0 transition-opacity",
                              socialMedia === platformName ? "opacity-100" : "group-hover:opacity-20",
                            )}
                          >
                            <div className={cn("w-full h-full", platformInfo.color)} />
                          </div>
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center mb-2",
                              socialMedia === platformName ? platformInfo.color : "bg-slate-800",
                            )}
                          >
                            {platformInfo.icon}
                          </div>
                          <span className="font-medium">{platformName}</span>
                          {socialMedia === platformName && (
                            <div className="absolute bottom-2 right-2">
                              <Check className="h-5 w-5 text-green-400" />
                            </div>
                          )}
                        </button>
                      </motion.div>
                    ))}
                </div>

                {socialMedia && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${platforms[socialMedia].color} p-3 rounded-full`}>
                        {platforms[socialMedia].icon}
                      </div>
                      <div>
                        <h4 className="text-lg font-medium">{socialMedia}</h4>
                        <p className="text-gray-400">{platforms[socialMedia].description}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Select your content niche</h3>
                  <div className="relative w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search niches..."
                      className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                    onClick={() => setShowNichePrompt(!showNichePrompt)}
                  >
                    <HelpCircle className="h-3.5 w-3.5 mr-1" />
                    Not sure? Let AI suggest
                  </Button>
                </div>

                {showNichePrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-800/80 border border-slate-700 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      Describe your video content
                    </h4>
                    <Textarea
                      placeholder="Example: I'm creating a video showing my morning workout routine with tips for beginners..."
                      className="bg-slate-900 border-slate-700 text-white placeholder-gray-500 mb-3 min-h-[80px]"
                      value={nicheDescription}
                      onChange={(e) => setNicheDescription(e.target.value)}
                    />
                    <Button
                      onClick={suggestNiche}
                      disabled={isAnalyzingNiche || !nicheDescription.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isAnalyzingNiche ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        "Get AI Suggestion"
                      )}
                    </Button>
                  </motion.div>
                )}

                {filteredNiches.length > 0 ? (
                  <div
                    ref={nichesContainerRef}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {filteredNiches.map((nicheItem) => (
                      <motion.div
                        key={nicheItem.name}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <button
                          className={cn(
                            "w-full p-4 rounded-lg border transition-all flex flex-col items-center justify-center gap-2 text-center",
                            niche === nicheItem.name
                              ? "border-purple-500 bg-purple-900/20"
                              : "border-slate-700 hover:border-slate-600 bg-slate-800/50",
                          )}
                          onClick={() => setNiche(nicheItem.name)}
                        >
                          <span className="text-2xl">{nicheItem.icon}</span>
                          <span className="font-medium">{nicheItem.name}</span>
                          <span className="text-xs text-gray-400 line-clamp-2">{nicheItem.description}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 mb-2">No niches found matching your search</p>
                    <p className="text-sm text-gray-500">Try a different search term or select a different platform</p>
                  </div>
                )}

                {niche && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-indigo-600 p-3 rounded-full flex items-center justify-center text-2xl">
                        {niches[socialMedia].find((n) => n.name === niche)?.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-medium">{niche}</h4>
                          <Badge className="bg-indigo-600">{socialMedia}</Badge>
                        </div>
                        <p className="text-gray-400">
                          {niches[socialMedia].find((n) => n.name === niche)?.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-white">Choose a trending format</h3>
                  <div className="relative w-1/3">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search trends..."
                      className="pl-10 bg-slate-800 border-slate-700 text-white placeholder-gray-400"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-slate-700 bg-slate-800/50 hover:bg-slate-700"
                    onClick={() => setShowTrendPrompt(!showTrendPrompt)}
                  >
                    <HelpCircle className="h-3.5 w-3.5 mr-1" />
                    Not sure? Describe your video
                  </Button>

                  <div className="flex items-center gap-2 text-sm text-gray-400 ml-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      Trending now in {niche} on {socialMedia}
                    </span>
                  </div>
                </div>

                {showTrendPrompt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-800/80 border border-slate-700 rounded-lg p-4"
                  >
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-pink-400" />
                      Tell us about your video content
                    </h4>
                    <Textarea
                      placeholder="Example: I want to create a video showing before and after transformations with quick transitions..."
                      className="bg-slate-900 border-slate-700 text-white placeholder-gray-500 mb-3 min-h-[80px]"
                      value={trendDescription}
                      onChange={(e) => setTrendDescription(e.target.value)}
                    />
                    <Alert className="mb-3 bg-slate-900/60 border-indigo-800/50">
                      <AlertCircle className="h-4 w-4 text-indigo-400" />
                      <AlertTitle className="text-sm font-medium text-indigo-300">Real-time trend scanning</AlertTitle>
                      <AlertDescription className="text-xs text-indigo-300/80">
                        We'll scan {socialMedia} for the latest trends that match your description
                      </AlertDescription>
                    </Alert>
                    <Button
                      onClick={suggestTrend}
                      disabled={isAnalyzingTrend || isScanningSocialMedia || !trendDescription.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isAnalyzingTrend || isScanningSocialMedia ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {isScanningSocialMedia ? `Scanning ${socialMedia} for trends...` : "Analyzing trends..."}
                        </>
                      ) : (
                        "Find Trending Formats"
                      )}
                    </Button>
                  </motion.div>
                )}

                {showDiscoveredTrends && discoveredTrends.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-4 rounded-lg border border-indigo-700/40"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-pink-400" />
                      <h4 className="text-sm font-medium text-pink-100">Discovered Trends on {socialMedia}</h4>
                    </div>

                    <div className="space-y-3">
                      {discoveredTrends.map((discoveredTrend, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={cn(
                            "p-3 rounded-md border transition-all cursor-pointer",
                            trend === discoveredTrend.name
                              ? "border-pink-500 bg-pink-900/20"
                              : "border-slate-700 hover:border-slate-600 bg-slate-800/50",
                          )}
                          onClick={() => setTrend(discoveredTrend.name)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">{discoveredTrend.name}</h4>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {discoveredTrend.updated}
                            </Badge>
                          </div>

                          {discoveredTrend.description && (
                            <p className="text-xs text-gray-400 mt-1">{discoveredTrend.description}</p>
                          )}

                          <div className="flex justify-between mt-2">
                            {discoveredTrend.popularity && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <TrendingUp className="h-3 w-3 text-green-400" />
                                <span>Popularity: {discoveredTrend.popularity}/10</span>
                              </div>
                            )}

                            {discoveredTrend.difficulty && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span>Difficulty: {discoveredTrend.difficulty}/10</span>
                              </div>
                            )}
                          </div>

                          {discoveredTrend.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {discoveredTrend.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {isScanningSocialMedia && (
                  <Alert className="w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Scanning Social Media...</AlertTitle>
                    <AlertDescription>
                      Analyzing real-time trends based on your description. This may take a few seconds.
                    </AlertDescription>
                  </Alert>
                )}

                {showDiscoveredTrends && discoveredTrends.length === 0 && (
                  <Alert variant="destructive" className="w-full">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Trends Discovered</AlertTitle>
                    <AlertDescription>
                      Unfortunately, we couldn't find any specific trends based on your description. Please try a
                      different description or select from the list below.
                    </AlertDescription>
                  </Alert>
                )}

                {filteredTrends.length > 0 || showDiscoveredTrends ? (
                  <div
                    ref={trendsContainerRef}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar"
                  >
                    {(showDiscoveredTrends ? discoveredTrends : filteredTrends).map((trendItem) => (
                      <motion.div
                        key={trendItem.name}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <button
                          className={cn(
                            "w-full p-4 rounded-lg border transition-all flex flex-col gap-2 text-left",
                            trend === trendItem.name
                              ? "border-pink-500 bg-pink-900/20"
                              : "border-slate-700 hover:border-slate-600 bg-slate-800/50",
                          )}
                          onClick={() => setTrend(trendItem.name)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">{trendItem.name}</h4>
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {trendItem.updated}
                            </Badge>
                          </div>

                          {trendItem.description && <p className="text-sm text-gray-400">{trendItem.description}</p>}

                          <div className="flex justify-between mt-1">
                            {trendItem.popularity && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <TrendingUp className="h-3 w-3 text-green-400" />
                                <span>Popularity: {trendItem.popularity}/10</span>
                              </div>
                            )}

                            {trendItem.difficulty && (
                              <div className="flex items-center gap-1 text-xs text-gray-400">
                                <Star className="h-3 w-3 text-yellow-400" />
                                <span>Difficulty: {trendItem.difficulty}/10</span>
                              </div>
                            )}
                          </div>

                          {trendItem.tags && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {trendItem.tags.map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-slate-800 p-4 rounded-full mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-400 mb-2">No trends found matching your search</p>
                    <p className="text-sm text-gray-500">Try a different search term or select a different niche</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-medium text-white text-center">Your Creative Blueprint</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col"
                  >
                    <div
                      className={`${platforms[socialMedia].color} w-12 h-12 rounded-full flex items-center justify-center mb-3`}
                    >
                      {platforms[socialMedia].icon}
                    </div>
                    <h4 className="text-lg font-medium mb-1">Platform</h4>
                    <p className="text-2xl font-bold text-white mb-2">{socialMedia}</p>
                    <p className="text-sm text-gray-400 flex-grow">{platforms[socialMedia].description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Audience: </span>
                        <Badge variant="outline">Global</Badge>
                        <Badge variant="outline">Diverse</Badge>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col"
                  >
                    <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mb-3 text-2xl">
                      {niches[socialMedia].find((n) => n.name === niche)?.icon}
                    </div>
                    <h4 className="text-lg font-medium mb-1">Niche</h4>
                    <p className="text-2xl font-bold text-white mb-2">{niche}</p>
                    <p className="text-sm text-gray-400 flex-grow">
                      {niches[socialMedia].find((n) => n.name === niche)?.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>Related: </span>
                        {niches[socialMedia]
                          .filter((n) => n.name !== niche)
                          .slice(0, 2)
                          .map((n) => (
                            <Badge key={n.name} variant="outline">
                              {n.name}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex flex-col"
                  >
                    <div className="bg-pink-600 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h4 className="text-lg font-medium mb-1">Trend</h4>
                    <p className="text-2xl font-bold text-white mb-2">{trend}</p>
                    <p className="text-sm text-gray-400 flex-grow">
                      {selectedTrendDetails?.description || "Create engaging content following this popular trend."}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      {selectedTrendDetails?.tags && (
                        <div className="flex flex-wrap gap-1">
                          {selectedTrendDetails.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-5 rounded-xl border border-indigo-700/50 mt-6"
                >
                  <h4 className="text-lg font-medium mb-3 flex items-center gap-2">
                    <span className="bg-indigo-600 p-1.5 rounded-full">
                      <Zap className="h-4 w-4" />
                    </span>
                    AI Recommendations
                  </h4>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">
                        {`Keep your ${trend} video under ${
                          socialMedia === "TikTok" || socialMedia === "Snapchat"
                            ? "30"
                            : socialMedia === "Instagram" || socialMedia === "Twitter"
                              ? "60"
                              : socialMedia === "YouTube" || socialMedia === "Twitch"
                                ? "engaging throughout its length"
                                : "90"
                        } seconds for optimal engagement.`}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">
                        {`Use ${
                          socialMedia === "TikTok" || socialMedia === "Snapchat"
                            ? "trending sounds and effects"
                            : socialMedia === "Instagram" || socialMedia === "Pinterest"
                              ? "consistent visual aesthetics"
                              : socialMedia === "YouTube" || socialMedia === "Twitch"
                                ? "high-quality production value"
                                : socialMedia === "LinkedIn"
                                  ? "professional presentation"
                                  : "engaging visuals and clear audio"
                        } to maximize your content's impact.`}
                      </p>
                    </div>

                    <div className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-300">
                        {`Incorporate text overlays to ${
                          socialMedia === "LinkedIn"
                            ? "highlight key professional insights"
                            : socialMedia === "Pinterest"
                              ? "provide clear instructions"
                              : socialMedia === "YouTube"
                                ? "emphasize important points"
                                : socialMedia === "Twitter" || socialMedia === "Facebook"
                                  ? "make your content accessible with sound off"
                                  : "improve engagement and accessibility"
                        }.`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex justify-between px-6 py-4 border-t border-slate-800">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="border-slate-700 text-white hover:bg-slate-800">
              Back
            </Button>
          ) : (
            <div></div>
          )}

          <div className="flex gap-2">
            {step === 4 && (
              <Button
                variant="outline"
                onClick={() => setShowOverview(true)}
                className="border-slate-700 text-white hover:bg-slate-800"
              >
                Review
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={handleNext}
              disabled={(step === 1 && !socialMedia) || (step === 2 && !niche) || (step === 3 && !trend)}
            >
              {step < 4 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                "Start Creating"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Credits Footer */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="flex flex-col gap-2 items-end">
          <div className="flex items-center gap-2 text-sm text-zinc-400 bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
            <span>Support:</span>
            <a
              href="mailto:samiso@limestone.on.ca"
              className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 hover:opacity-80 transition-opacity"
            >
              samiso@limestone.on.ca
            </a>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400 bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-700/50">
            <span>Created by</span>
            <span className="font-medium bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
              Olivia Samis
            </span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </main>
  )
}
