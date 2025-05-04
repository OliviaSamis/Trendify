"use client"

import { useState, useEffect } from "react"
import { Copy, RefreshCw, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

type CaptionGeneratorProps = {
  platform: string
  niche: string
  trend: string
  videoTitle?: string
}

export function CaptionGenerator({ platform, niche, trend, videoTitle }: CaptionGeneratorProps) {
  const [caption, setCaption] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [copied, setCopied] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // Generate caption and title when component mounts or props change
  useEffect(() => {
    generateCaption()
  }, [platform, niche, trend, videoTitle])

  const generateCaption = () => {
    setLoading(true)

    // Simulate loading
    setTimeout(() => {
      const newCaption = generateCaptionByPlatform(platform, niche, trend, videoTitle)
      const newTitle = generateTitleByPlatform(platform, niche, trend, videoTitle)

      setCaption(newCaption)
      setTitle(newTitle)
      setLoading(false)
    }, 500)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Generate platform-specific captions
  const generateCaptionByPlatform = (platform: string, niche: string, trend: string, videoTitle?: string): string => {
    const defaultTitle = videoTitle || `My ${niche} video`
    const emojis = getEmojisForNiche(niche)
    const hashtags = getHashtagsForNiche(platform, niche, trend)

    switch (platform.toLowerCase()) {
      case "tiktok":
        return `${emojis[0]} ${defaultTitle} ${emojis[1]}\n\nTrying this trend out! Let me know what you think in the comments!\n\n${hashtags.join(" ")} #fyp #foryou #foryoupage #viral`

      case "instagram":
        return `${emojis[0]} ${defaultTitle} ${emojis[1]}\n\n${getRandomCaption(niche)}\n\n.\n.\n.\n${hashtags.join(" ")} #instagram #reels #trending`

      case "youtube":
        return `${defaultTitle} | ${trend} ${emojis[0]}\n\nThanks for watching! Don't forget to like and subscribe for more ${niche} content!\n\n${getRandomQuestion(niche)}\n\n${hashtags.join(" ")}`

      case "snapchat":
        return `${emojis[0]} ${defaultTitle} ${emojis[1]}\n\nCheck out my Spotlight! ${hashtags.slice(0, 3).join(" ")}`

      case "pinterest":
        return `${emojis[0]} ${defaultTitle} | ${niche} inspiration | ${trend} ${emojis[1]}\n\n${getRandomTip(niche)}\n\n${hashtags.join(" ")}`

      default:
        return `${emojis[0]} ${defaultTitle} ${emojis[1]}\n\n${getRandomCaption(niche)}\n\n${hashtags.join(" ")}`
    }
  }

  // Generate platform-specific titles
  const generateTitleByPlatform = (platform: string, niche: string, trend: string, videoTitle?: string): string => {
    const emojis = getEmojisForNiche(niche)
    const defaultTitle = videoTitle || `My ${niche} video`

    switch (platform.toLowerCase()) {
      case "tiktok":
        return `${emojis[0]} ${trend} | ${defaultTitle} ${emojis[1]}`

      case "instagram":
        return `${emojis[0]} ${defaultTitle} | ${trend} ${emojis[1]}`

      case "youtube":
        // YouTube titles tend to be more descriptive and keyword-rich
        return `${defaultTitle}: ${getTitleSuffix(niche, trend)} ${emojis[0]}`

      case "snapchat":
        return `${emojis[0]} ${defaultTitle} | Watch til the end! ${emojis[1]}`

      case "pinterest":
        return `${emojis[0]} ${niche.charAt(0).toUpperCase() + niche.slice(1)} Guide: ${defaultTitle} ${emojis[1]}`

      default:
        return `${emojis[0]} ${defaultTitle} | ${trend} ${emojis[1]}`
    }
  }

  // Helper functions to generate content
  const getEmojisForNiche = (niche: string): string[] => {
    switch (niche.toLowerCase()) {
      case "fitness":
        return ["💪", "🏋️‍♀️"]
      case "cooking":
        return ["🍳", "🥘"]
      case "beauty":
        return ["✨", "💄"]
      case "education":
        return ["📚", "🧠"]
      case "gaming":
        return ["🎮", "🕹️"]
      case "fashion":
        return ["👗", "👠"]
      case "travel":
        return ["✈️", "🌎"]
      case "music":
        return ["🎵", "🎧"]
      case "comedy":
        return ["😂", "🤣"]
      case "dance":
        return ["💃", "🕺"]
      default:
        return ["✨", "🔥"]
    }
  }

  const getHashtagsForNiche = (platform: string, niche: string, trend: string): string[] => {
    const baseHashtags = [`#${niche}`, `#${trend.replace(/\s+/g, "")}`]

    switch (niche.toLowerCase()) {
      case "fitness":
        return [...baseHashtags, "#workout", "#fitnessmotivation", "#healthylifestyle", "#gym", "#fitfam"]
      case "cooking":
        return [...baseHashtags, "#recipe", "#homemade", "#foodie", "#delicious", "#easyrecipe"]
      case "beauty":
        return [...baseHashtags, "#makeup", "#skincare", "#beautytips", "#glam", "#tutorial"]
      case "education":
        return [...baseHashtags, "#learning", "#study", "#knowledge", "#educational", "#facts"]
      case "gaming":
        return [...baseHashtags, "#gamer", "#videogames", "#gameplay", "#streamer", "#gamingcommunity"]
      case "fashion":
        return [...baseHashtags, "#style", "#outfit", "#fashiontips", "#ootd", "#trendy"]
      case "travel":
        return [...baseHashtags, "#wanderlust", "#travelgram", "#adventure", "#explore", "#vacation"]
      case "music":
        return [...baseHashtags, "#musician", "#newmusic", "#song", "#musiclover", "#artist"]
      case "comedy":
        return [...baseHashtags, "#funny", "#laugh", "#humor", "#comedian", "#jokes"]
      case "dance":
        return [...baseHashtags, "#dancer", "#choreography", "#dancevideo", "#dancechallenge", "#moves"]
      default:
        return [...baseHashtags, "#trending", "#content", "#creator", "#viral"]
    }
  }

  const getRandomCaption = (niche: string): string => {
    const captions = {
      fitness: [
        "Pushing my limits every day! 💪 Consistency is key.",
        "Another day, another workout! The grind never stops.",
        "Making progress one rep at a time. What's your fitness goal?",
        "Sweat now, shine later! Share your fitness journey below.",
        "Health is wealth! Investing in myself every day.",
      ],
      cooking: [
        "Homemade goodness that'll make your taste buds dance! Recipe in comments.",
        "Cooking up something special today! Who wants the recipe?",
        "Food is my love language. What's your favorite dish to make?",
        "Simple ingredients, maximum flavor! Try this at home.",
        "Nothing brings people together like good food. Enjoy!",
      ],
      beauty: [
        "Glow from within! ✨ This look took me only 10 minutes.",
        "Beauty is about enhancing what you already have. What's your go-to product?",
        "Trying out this new technique! What do you think?",
        "Your face is a canvas, make it a masterpiece! Products listed below.",
        "Confidence is your best accessory. Wear it with this look!",
      ],
      gaming: [
        "Level up your game with these pro tips! What games are you playing?",
        "Gaming is not just a hobby, it's a lifestyle! Who's with me?",
        "That moment when you finally beat the boss! What's your gaming achievement?",
        "Weekend vibes = gaming marathon! What's on your playlist?",
        "Streaming my favorite game! Drop your gamertag below.",
      ],
      default: [
        "Sharing what I love with all of you! Thanks for the support.",
        "Creating content that inspires me, hope it inspires you too!",
        "So excited to share this with you all! Let me know what you think.",
        "Your support means everything! What content do you want to see next?",
        "Putting my heart into everything I create. Hope you enjoy!",
      ],
    }

    const nicheSpecificCaptions = captions[niche.toLowerCase() as keyof typeof captions] || captions.default
    return nicheSpecificCaptions[Math.floor(Math.random() * nicheSpecificCaptions.length)]
  }

  const getRandomQuestion = (niche: string): string => {
    const questions = {
      fitness: [
        "What's your favorite workout routine?",
        "How do you stay motivated on tough days?",
        "What fitness goals are you working towards?",
        "Morning or evening workouts - which do you prefer?",
        "What's one exercise you can't live without?",
      ],
      cooking: [
        "What's your go-to weeknight dinner?",
        "What ingredient can you not live without?",
        "What recipe would you like me to make next?",
        "Homemade or takeout - what's your preference?",
        "What's the most challenging dish you've ever made?",
      ],
      beauty: [
        "What's your holy grail beauty product?",
        "What beauty trend should I try next?",
        "Morning or night skincare - which is more important to you?",
        "What's your biggest beauty challenge?",
        "What makeup look would you like to see next?",
      ],
      gaming: [
        "What game should I play next?",
        "PC or console gaming - which team are you on?",
        "What's your all-time favorite game?",
        "Solo or multiplayer - what's your preference?",
        "What gaming setup upgrades should I make next?",
      ],
      default: [
        "What content would you like to see next?",
        "How has your day been going?",
        "What questions do you have for me?",
        "What's one thing you learned from this video?",
        "How can I improve my content for you?",
      ],
    }

    const nicheSpecificQuestions = questions[niche.toLowerCase() as keyof typeof questions] || questions.default
    return nicheSpecificQuestions[Math.floor(Math.random() * nicheSpecificQuestions.length)]
  }

  const getRandomTip = (niche: string): string => {
    const tips = {
      fitness: [
        "Pro tip: Consistency over intensity for long-term results!",
        "Remember to hydrate before, during, and after your workout.",
        "Rest days are just as important as workout days for muscle growth.",
        "Focus on form first, then gradually increase weight or intensity.",
        "Track your progress to stay motivated and see how far you've come.",
      ],
      cooking: [
        "Pro tip: Taste as you go! Adjust seasonings gradually.",
        "Prep ingredients before you start cooking for a smoother process.",
        "Sharp knives are safer than dull ones - keep them maintained!",
        "Let meat rest after cooking for juicier results.",
        "Don't overcrowd the pan - cook in batches for better browning.",
      ],
      beauty: [
        "Pro tip: Apply skincare products from thinnest to thickest consistency.",
        "Always remove makeup before bed for healthier skin.",
        "Store nail polish in the refrigerator to extend its life.",
        "Use a primer before foundation for longer-lasting makeup.",
        "Clean makeup brushes regularly to prevent breakouts.",
      ],
      gaming: [
        "Pro tip: Take short breaks every hour to prevent eye strain.",
        "Customize your controls for maximum comfort and efficiency.",
        "Save often, especially in open-world games!",
        "Join online communities to learn advanced strategies.",
        "Invest in a good gaming chair for those long sessions.",
      ],
      default: [
        "Pro tip: Consistency is key to growing your audience.",
        "Engage with your community regularly to build stronger connections.",
        "Don't chase trends - focus on creating authentic content.",
        "Quality over quantity when it comes to posting schedule.",
        "Collaborate with others to reach new audiences.",
      ],
    }

    const nicheSpecificTips = tips[niche.toLowerCase() as keyof typeof tips] || tips.default
    return nicheSpecificTips[Math.floor(Math.random() * nicheSpecificTips.length)]
  }

  const getTitleSuffix = (niche: string, trend: string): string => {
    const suffixes = {
      fitness: [
        "Complete Workout Guide",
        "Transform Your Body With This Routine",
        "Fitness Challenge You Need To Try",
        "The Ultimate Workout Plan",
        "Get Fit Fast With These Exercises",
      ],
      cooking: [
        "Easy Recipe Anyone Can Make",
        "Delicious Meal In Under 30 Minutes",
        "The Perfect Recipe For Beginners",
        "Tasty Dish Your Family Will Love",
        "Secret Recipe Finally Revealed",
      ],
      beauty: [
        "Tutorial For Beginners",
        "Transform Your Look In Minutes",
        "Beauty Secrets Revealed",
        "Step-By-Step Makeup Guide",
        "Products You Need To Try",
      ],
      gaming: [
        "Pro Tips & Tricks",
        "Hidden Easter Eggs Found",
        "Ultimate Strategy Guide",
        "Gameplay Walkthrough",
        "How To Dominate Every Match",
      ],
      default: [
        "Everything You Need To Know",
        "Tips & Tricks For Success",
        "Complete Guide For Beginners",
        "What No One Tells You About",
        "How To Get Started Today",
      ],
    }

    const nicheSpecificSuffixes = suffixes[niche.toLowerCase() as keyof typeof suffixes] || suffixes.default
    return nicheSpecificSuffixes[Math.floor(Math.random() * nicheSpecificSuffixes.length)]
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white ml-2"
        >
          Caption Ideas
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 rounded-t-lg">
          <h3 className="font-bold text-white">Caption & Title Generator</h3>
          <p className="text-white/80 text-sm">Platform-optimized text for your content</p>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Suggested Title</h4>
            <Badge variant="outline" className="text-xs">
              {platform}
            </Badge>
          </div>

          <div className="bg-slate-100 p-3 rounded-md mb-4 relative">
            <p className="pr-8 text-black">{loading ? "Generating title..." : title}</p>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => copyToClipboard(title)}
              disabled={loading}
            >
              {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-sm">Suggested Caption</h4>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={generateCaption} disabled={loading}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>

          <div className="bg-slate-100 p-3 rounded-md relative">
            <p className="whitespace-pre-line pr-8 text-black" style={{ minHeight: "100px" }}>
              {loading ? "Generating caption..." : caption}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => copyToClipboard(caption)}
              disabled={loading}
            >
              {copied ? <CheckCheck className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          <div className="mt-4 text-xs text-slate-500">
            <p>Tips:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Customize the caption to make it more personal</li>
              <li>Add relevant hashtags to increase discoverability</li>
              <li>Include a call-to-action to boost engagement</li>
            </ul>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
