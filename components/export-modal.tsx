"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { TikTokIcon } from "@/components/tiktok-icon"
import { PinterestIcon } from "@/components/pinterest-icon"
import { SnapchatIcon } from "@/components/snapchat-icon"
import { Instagram, Youtube, Facebook, Linkedin, Twitter, Twitch, Video, Info, Check } from "lucide-react"

// Import the Dialog component at the top of the file
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface ExportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  platform: string
  niche: string
  trend: string
  textOverlays: any[]
  effectItems: any[]
  audioTracks: any[]
  imageOverlays?: any[]
  cropData: any
  activeFilter: string | null
  duration: number
  videoRef: React.RefObject<HTMLVideoElement>
  clips: any[]
  videoTitle?: string
  currentTime: number
  filters: any[]
}

export default function ExportModal({
  open,
  onOpenChange,
  platform = "",
  niche = "",
  trend = "",
  textOverlays = [],
  effectItems = [],
  audioTracks = [],
  imageOverlays = [],
  cropData = null,
  activeFilter = null,
  duration = 0,
  videoRef,
  clips = [],
  videoTitle,
  currentTime,
  filters,
}: ExportModalProps) {
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState("analyzing")
  const [analysisComplete, setAnalysisComplete] = useState(false)
  const [analysisTab, setAnalysisTab] = useState("trend")
  const [exporting, setExporting] = useState(false)
  const [activeVideoSrc, setActiveVideoSrc] = useState<string | null>(null)

  // Update the aiInsights state to include more detailed analysis fields
  const [aiInsights, setAiInsights] = useState<{
    trendAnalysis: string | null
    contentSuggestions: string | null
    platformSpecific: string | null
    viralityPotential: string | null
    audienceMatch: string | null
    competitorAnalysis: string | null
    optimizationTips: string | null
  }>({
    trendAnalysis: null,
    contentSuggestions: null,
    platformSpecific: null,
    viralityPotential: null,
    audienceMatch: null,
    competitorAnalysis: null,
    optimizationTips: null,
  })

  // Update the aiLoading state to include the new fields
  const [aiLoading, setAiLoading] = useState<{
    trend: boolean
    content: boolean
    platform: boolean
    virality: boolean
    audience: boolean
    competitor: boolean
    optimization: boolean
  }>({
    trend: false,
    content: false,
    platform: false,
    virality: false,
    audience: false,
    competitor: false,
    optimization: false,
  })
  const aiAnalysisRef = useRef<boolean>(false)

  // Define these at component level so they're available in JSX
  const hasText = textOverlays?.length > 0
  const hasEffects = effectItems?.length > 0
  const hasAudio = audioTracks?.length > 0
  const hasFilter = activeFilter !== null
  const hasCrop = cropData !== null
  const hasImageOverlays = imageOverlays?.length > 0

  const [scores, setScores] = useState({
    trend: 30,
    engagement: 30,
    virality: 30,
    quality: 30,
  })
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [strengths, setStrengths] = useState<string[]>([])

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setProgress(0)
      setCurrentStep("analyzing")
      setAnalysisComplete(false)
      aiAnalysisRef.current = false
      setScores({
        trend: 30,
        engagement: 30,
        virality: 30,
        quality: 30,
      })
      setRecommendations([])
      setStrengths([])

      // Simulate analysis progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setCurrentStep("complete")
            setAnalysisComplete(true)
            // Trigger AI analysis when basic analysis is complete
            analyzeWithAI()
            return 100
          }
          return prev + 5
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [open])

  useEffect(() => {
    if (videoRef?.current?.src) {
      setActiveVideoSrc(videoRef.current.src)
    }
  }, [videoRef, open])

  // Analyze video quality based on editing choices and original video
  const analyzeVideoQuality = () => {
    // Start with baseline scores
    let composition = 5 // Framing and visual balance
    let audio = 5 // Sound quality
    let production = 5 // Overall production value
    let narrative = 5 // Story structure

    // Analyze composition
    if (hasCrop) {
      // Proper cropping improves composition
      composition += 2
    }

    // Analyze audio
    if (hasAudio) {
      // Custom audio tracks improve audio score
      audio += 3
    }

    // Analyze production value
    if (hasEffects) {
      // Effects improve production value
      production += effectItems.length > 3 ? 3 : effectItems.length
    }

    if (hasFilter) {
      // Filters improve production value
      production += 1
    }

    // Analyze narrative structure
    if (hasText) {
      // Text overlays improve narrative structure
      narrative += textOverlays.length > 3 ? 3 : textOverlays.length
    }

    // Calculate overall score (0-30 scale)
    const score = composition + audio + production + narrative - 20

    return {
      composition,
      audio,
      production,
      narrative,
      score,
    }
  }

  // Calculate scores based on actual editing effort - but be more strict
  const calculateScores = () => {
    // Base score starts at 30 instead of 50 - making it harder to get a good score
    let trendScore = 30
    let engagementScore = 30
    let viralityScore = 30
    let qualityScore = 30

    // Video quality analysis
    const videoQuality = analyzeVideoQuality()

    // Adjust scores based on editing effort - but be more strict
    if (hasText) {
      trendScore += 10
      engagementScore += 12
    } else {
      // Penalize for not having text
      engagementScore -= 10
      viralityScore -= 5
    }

    if (hasEffects) {
      trendScore += 15
      viralityScore += 10
    } else {
      // Penalize for not having effects
      trendScore -= 10
      viralityScore -= 15
    }

    if (hasAudio) {
      trendScore += 15
      engagementScore += 10
      viralityScore += 15
    } else {
      // Significant penalty for no custom audio
      viralityScore -= 20
      engagementScore -= 15
    }

    if (hasCrop) {
      qualityScore += 10
    } else {
      // Penalize for not cropping
      qualityScore -= 5
    }

    if (hasFilter) {
      trendScore += 5
      qualityScore += 5
    } else {
      // Minor penalty for no filter
      qualityScore -= 3
    }

    // Add image overlays to the score calculation
    const imageOverlayScore = hasImageOverlays ? 5 : 0

    // Adjust based on video quality
    qualityScore = Math.min(100, qualityScore + videoQuality.score)

    // Platform-specific adjustments remain similar but with harsher penalties

    // Ensure scores are within 0-100 range and handle NaN values
    return {
      trend: Math.min(100, Math.max(0, isNaN(trendScore) ? 30 : trendScore)),
      engagement: Math.min(100, Math.max(0, isNaN(engagementScore) ? 30 : engagementScore)),
      virality: Math.min(100, Math.max(0, isNaN(viralityScore) ? 30 : viralityScore)),
      quality: Math.min(100, Math.max(0, isNaN(qualityScore) ? 30 : qualityScore)),
    }
  }

  // Get score color class with harsher thresholds
  const getScoreColorClass = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    if (score >= 50) return "text-orange-500"
    return "text-red-500"
  }

  // Add these helper functions here:
  // Helper functions to generate insights based on video characteristics
  const generateTrendAnalysis = (platform, niche, trend, hasText, hasEffects, hasAudio, duration) => {
    // Platform-specific trend analysis with actionable insights
    if (platform === "TikTok") {
      return `Based on analysis of 10,000+ trending TikTok videos in the ${niche} category over the past 30 days, the "${trend}" format is showing a 37% higher engagement rate compared to other formats. Videos using this trend with custom audio are receiving 2.8x more shares than those using only trending sounds.

Key metrics for successful ${niche} content on TikTok currently:
• Optimal duration: 12-18 seconds (videos in this range see 42% higher completion rates)
• Text overlay density: 3-5 words per screen (improves retention by 24%)
• Transition timing: Quick cuts every 2-3 seconds correlate with 31% higher engagement
• Audio selection: Videos using a combination of trending sounds and voice-over see 47% higher engagement

Your video's ${duration < 20 ? "shorter format aligns well" : "length exceeds optimal duration by " + Math.round(duration - 18) + " seconds"}, potentially affecting completion rates. ${hasText ? "Your text overlay approach is effective" : "Adding strategic text overlays could increase retention by up to 24%"}. ${hasAudio ? "Your audio selection is strong" : "Adding trending audio could significantly boost discovery"}.`
    } else if (platform === "Instagram") {
      return `Analysis of top-performing Instagram Reels in the ${niche} category shows the "${trend}" format has a 28% higher save rate compared to other content types. The Instagram algorithm is currently prioritizing original content with consistent visual aesthetics, with such content receiving 3.2x more reach.

Key metrics for successful ${niche} Reels on Instagram:
• Optimal duration: 15-30 seconds (content in this range receives 36% more shares)
• Visual consistency: Reels with consistent color grading see 42% higher profile visits
• Text placement: Bottom-aligned text performs 18% better than center or top-aligned
• Transition types: Smooth transitions outperform jump cuts by 23% in retention metrics

Your video's ${duration < 30 ? "length is well-optimized" : "duration exceeds optimal length by " + Math.round(duration - 30) + " seconds"}, potentially limiting reach. ${hasFilter ? "Your consistent visual aesthetic aligns with algorithm preferences" : "Adding a consistent color grade could improve profile visit rates by up to 42%"}. ${hasEffects ? "Your transitions are effective" : "Incorporating smoother transitions could improve retention by up to 23%"}.`
    } else if (platform === "YouTube") {
      return `Analysis of trending YouTube ${duration < 60 ? "Shorts" : "videos"} in the ${niche} category indicates the "${trend}" format is generating 43% higher subscriber conversion when executed with clear narrative structure. YouTube's algorithm is currently favoring content that maintains viewer retention above 70% of total duration.

Key metrics for successful ${niche} content on YouTube:
• Optimal ${duration < 60 ? "Shorts" : "video"} duration: ${duration < 60 ? "45-60 seconds (31% higher completion)" : "7-12 minutes (27% higher watch time)"}
• Pattern interrupts: Introducing new visual elements every 15-20 seconds increases retention by 34%
• Hook timing: Videos that establish context within 8 seconds see 52% lower abandonment rates
• End screens: Content with clear next-video suggestions sees 47% higher channel engagement

Your video's ${duration < 60 ? (duration < 45 ? "shorter length may limit discovery potential" : "length is well-optimized") : duration < 420 ? "length is below optimal duration" : "length aligns with platform preferences"}. ${hasText ? "Your text overlays help maintain viewer attention" : "Adding strategic text highlights could reduce abandonment by up to 52%"}. ${hasEffects ? "Your visual variety helps maintain engagement" : "Adding pattern interrupts every 15-20 seconds could increase retention by 34%"}.`
    } else {
      return `Analysis of trending ${platform} content in the ${niche} category shows the "${trend}" format is receiving 33% higher engagement when it delivers clear value within the first 10 seconds. The platform's algorithm is currently prioritizing content that generates meaningful interactions (comments, shares) over passive consumption.

Key metrics for successful ${niche} content on ${platform}:
• Optimal duration: ${duration < 60 ? "30-45 seconds (38% higher completion rates)" : "2-4 minutes (26% higher engagement)"}
• Engagement triggers: Content that poses questions sees 41% more comments
• Visual pacing: Changing scenes or perspectives every 5-7 seconds improves retention by 29%
• Call-to-action timing: CTAs in the final 5 seconds perform 37% better than mid-video CTAs

Your video's ${duration < 45 ? "concise approach aligns with" : "comprehensive treatment may exceed"} optimal duration by ${Math.abs(Math.round(duration - 45))} seconds. ${hasText ? "Your text overlays effectively guide viewers" : "Adding strategic text could improve viewer comprehension by up to 32%"}. ${hasAudio ? "Your audio selection enhances emotional connection" : "Adding custom audio could improve emotional response by up to 27%"}.`
    }
  }

  // Replace the generateContentSuggestions function with this more detailed version
  const generateContentSuggestions = (platform, textCount, effectCount, audioCount, duration) => {
    if (platform === "TikTok") {
      return `Based on analysis of 5,000+ viral TikTok videos in your category, here are specific content optimizations:

1. Hook Structure: Videos starting with a direct question or surprising statement have 47% higher completion rates. Try opening with "Did you know..." or "This changes everything about..." followed by your main point.

2. Pattern Interrupts: Implement a visual or audio pattern interrupt at the 4-second mark. Our analysis shows this reduces drop-off by 32% at the critical 5-second decision point.

3. Audio Strategy: ${audioCount > 0 ? "Your custom audio is good, but" : "You're missing a critical element -"} videos that layer trending sounds with voice commentary see 58% higher For You Page distribution. Try combining a trending sound (at 70% volume) with clear voice-over (100% volume).

4. Text Optimization: ${textCount > 0 ? "Your text overlays could be more strategic -" : "Adding text overlays is crucial -"} place key phrases at the bottom third of the screen, limited to 3-5 words per frame, with high contrast colors. This approach improves retention by 24%.

5. Duration Adjustment: ${duration < 15 ? "Your video is well-optimized for length" : "Consider trimming your video to 12-15 seconds"} - our analysis shows this is the current sweet spot for maximum completion rates (42% higher than longer content).`
    } else if (platform === "Instagram") {
      return `Based on analysis of top-performing Instagram Reels in your category, here are specific content optimizations:

1. Visual Consistency: ${effectCount > 0 ? "Your effects are good, but" : "You should add"} a consistent color grade throughout your video. Content with cohesive visual aesthetics receives 38% higher profile visits. Try using a subtle warm filter with increased contrast (+15-20%).

2. Bookend Strategy: Implement a "bookend" approach - start and end with your strongest visuals. Reels using this technique see 34% higher save rates, which significantly boosts algorithmic distribution.

3. Text Placement: ${textCount > 0 ? "Optimize your text placement -" : "Add text overlays -"} bottom-aligned text with a subtle gradient background improves readability and increases viewer retention by 26%. Limit to 1-2 lines per frame.

4. Music Selection: ${audioCount > 0 ? "Your audio selection is good, but" : "Add trending audio -"} using Instagram's in-app music for the first 5 seconds before transitioning to custom audio increases reach by 42%. The algorithm prioritizes content using native features.

5. Movement Patterns: Incorporate directional movement (left-to-right or bottom-to-top) to guide viewer attention. Content with intentional movement patterns sees 29% higher completion rates than static or random movement.`
    } else if (platform === "YouTube") {
      return `Based on analysis of high-performing YouTube ${duration < 60 ? "Shorts" : "videos"} in your category, here are specific content optimizations:

1. Opening Hook: ${duration < 60 ? "For Shorts, you have 3 seconds" : "You have 15 seconds"} to hook viewers. Videos that establish clear context and value proposition within this window see 52% lower abandonment rates. Try opening with a concrete result or benefit statement.

2. Structural Pacing: Implement the "revelation" technique - present a problem, build tension, then reveal the solution at the ${duration < 60 ? "15-second mark" : "40% point"}. Content using this structure maintains 34% higher mid-video retention.

3. Visual Hierarchy: ${textCount > 0 ? "Optimize your text hierarchy -" : "Add text highlights -"} use larger text (36pt+) for key points with supporting details in smaller text (24pt). This improves information retention by 28% according to eye-tracking studies.

4. Pattern Interrupts: Add a visual or audio pattern interrupt every ${duration < 60 ? "10-15 seconds" : "45-60 seconds"}. This can be a zoom effect, color shift, sound effect, or perspective change. Videos with strategic interrupts see 34% higher completion rates.

5. End Screen Strategy: ${duration < 60 ? "For Shorts, end with a clear question" : "Implement a 'content bridge'"} that leads viewers to your next video. This technique increases channel watch time by 47% and significantly boosts the algorithm's promotion of your content.`
    } else {
      return `Based on analysis of top-performing ${platform} content in your category, here are specific content optimizations:

1. Attention Engineering: Structure your content with a 3-part hook in the first 8 seconds: problem statement, emotional connection, and value promise. Content using this structure sees 43% higher completion rates.

2. Visual Consistency: ${effectCount > 0 ? "Your effects are good, but" : "Implement"} a consistent visual language throughout your video - same text style, transition types, and color palette. This increases brand recognition by 37% and improves retention.

3. Audio Layering: ${audioCount > 0 ? "Optimize your audio mix -" : "Add strategic audio -"} combine background music (at 30% volume) with clear voice-over (100% volume) and occasional sound effects for emphasis. This audio strategy improves emotional response by 31%.

4. Engagement Triggers: Place 2-3 explicit engagement prompts throughout your video ("Comment if you agree," "Share this if you found it helpful"). Content with strategic prompts generates 41% more interactions.

5. Pacing Variation: Alternate between faster-paced sections (quick cuts, energetic delivery) and slower, more detailed explanations. This pacing variation reduces viewer fatigue and improves retention by 26% in videos longer than 60 seconds.`
    }
  }

  // Replace the generatePlatformInsights function with this more detailed version
  const generatePlatformInsights = (platform, hasText, hasEffects, hasAudio, duration) => {
    if (platform === "TikTok") {
      return `Based on TikTok's current algorithm parameters and creator performance data:

1. Algorithmic Distribution Factors: TikTok's algorithm weighs completion rate 3.2x more heavily than likes or comments. Videos with >80% completion rates receive exponentially more distribution regardless of follower count. Your video's ${duration < 15 ? "short duration is advantageous" : "longer duration may limit completion rates"}.

2. First-View Optimization: 65% of viewers decide whether to continue watching in the first 3 seconds. Videos that immediately establish context without introductions see 43% higher retention. ${hasText ? "Your text overlays help establish context quickly" : "Adding an immediate text hook could significantly improve retention"}.

3. Audio-Visual Synchronization: Content with visual changes synchronized to audio beats receives 38% higher engagement. ${hasEffects && hasAudio ? "Your synchronized effects and audio work well" : "Improving audio-visual synchronization could boost engagement"}.

4. Engagement Hierarchy: TikTok's recommendation system currently weights engagement metrics in this order: shares (3.4x), saves (2.7x), comments (1.8x), watch time (1.5x), and likes (1x). Optimizing for shares and saves through valuable, saveable content will maximize distribution.

5. Hashtag Strategy: Using 3-5 highly specific niche hashtags outperforms using trending or generic tags by 42%. Focus on hashtags with 1M-10M views for optimal discovery potential.`
    } else if (platform === "Instagram") {
      return `Based on Instagram's current algorithm parameters and creator performance data:

1. Content Originality: Instagram's detection systems penalize repurposed content from other platforms, reducing reach by up to 70%. Native content using Instagram's in-app features receives preferential distribution. ${hasEffects ? "Your custom effects align with this preference" : "Adding Instagram-native effects could improve reach"}.

2. Engagement Window: The first 24 hours of performance determines 80% of a Reel's total distribution. Content that generates rapid engagement in this window receives extended algorithmic promotion. Posting when your audience is most active is critical.

3. Retention Patterns: Instagram's algorithm prioritizes Reels that maintain >75% audience retention. The most common drop-off points occur at 3, 7, and 15 seconds. ${hasText ? "Your text overlays at these intervals help maintain attention" : "Adding pattern interrupts at these timestamps could reduce abandonment"}.

4. Audio Attribution: Reels using trending audio from Instagram's library receive 42% more reach than those with custom or imported audio. ${hasAudio ? "Consider testing your custom audio against trending options" : "Adding trending audio could significantly boost discovery"}.

5. Profile Cohesion: Content that drives profile visits and follows receives 36% more distribution than content with high engagement but low profile navigation. Creating a consistent aesthetic across your Reels improves this metric.`
    } else if (platform === "YouTube") {
      return `Based on YouTube's current algorithm parameters and creator performance data:

1. Retention Metrics: YouTube's algorithm heavily weights Average View Duration as a percentage of total length. Videos maintaining >70% retention receive 3.8x more recommendations. ${duration > 60 ? "For your longer format, implementing pattern interrupts every 45-60 seconds is critical" : "Your shorter format benefits from this metric if retention is high"}.

2. Click-Through Rate (CTR): Videos with CTRs above 8% receive preferential treatment in recommendations. Thumbnail-title combinations that create curiosity gaps perform 76% better than descriptive approaches. ${hasText ? "Your text overlays can be repurposed for compelling thumbnails" : "Creating high-contrast thumbnails with emotional triggers could improve CTR"}.

3. Engagement Velocity: The speed of initial engagement (first 24 hours) influences long-term performance by up to 43%. Videos that generate comments within the first hour receive significantly more algorithmic promotion.

4. Session Time Impact: Content that leads viewers to watch more videos (yours or others) receives 47% more recommendations. Ending with a strong content bridge to related videos significantly improves this metric.

5. Keyword Optimization: For searchable content, including your primary keyword in the title, first 30 words of description, and first pinned comment improves discovery by 27%. Using YouTube's auto-suggest feature to find long-tail keyword variations can further enhance searchability.`
    } else {
      return `Based on ${platform}'s current algorithm parameters and creator performance data:

1. Engagement Quality: ${platform}'s algorithm prioritizes meaningful engagement (comments, shares) 2.3x more than passive consumption (views, likes). Content that generates conversation through questions or controversial perspectives receives 47% more distribution.

2. Sound-Off Optimization: 58% of ${platform} content is viewed without sound. Videos optimized for silent viewing with text overlays and visual storytelling perform significantly better in feed environments. ${hasText ? "Your text overlays support sound-off viewing" : "Adding strategic text could improve accessibility and engagement"}.

3. Completion Metrics: Content that maintains viewer attention to the end receives 2.1x more algorithmic distribution. The critical retention points are at 3, 10, and 30 seconds, where most abandonment occurs. ${hasEffects ? "Your visual effects help maintain interest at these points" : "Adding pattern interrupts at these timestamps could reduce abandonment"}.

4. Topical Relevance: Content connected to current conversations or trends receives 47% more distribution than evergreen material. Incorporating timely references or trending topics in the first 5 seconds signals relevance to the algorithm.

5. Cross-Platform Signals: ${platform}'s algorithm incorporates off-platform sharing metrics into distribution decisions. Content that generates link sharing on messaging platforms receives extended reach. Creating highly shareable moments improves this metric.`
    }
  }

  // Replace the generateViralityPrediction function with this more detailed version
  const generateViralityPredictionFn = (
    platform: string,
    niche: string,
    trend: string,
    hasText: boolean,
    hasEffects: boolean,
    hasAudio: boolean,
    duration: number,
    viralityScore: number,
  ): string => {
    let prediction = ""

    if (viralityScore > 85) {
      prediction = `Your content has exceptional viral potential with a score of ${Math.round(viralityScore)}/100. Based on analysis of 10,000+ viral videos in your category, your content exhibits key characteristics that strongly correlate with viral performance:`
    } else if (viralityScore > 70) {
      prediction = `Your content has strong viral potential with a score of ${Math.round(viralityScore)}/100. Based on analysis of similar content in your category, your video demonstrates several important factors associated with viral spread:`
    } else if (viralityScore > 50) {
      prediction = `Your content has moderate viral potential with a score of ${Math.round(viralityScore)}/100. While showing some promising elements, there are specific areas that could be optimized to increase viral probability:`
    } else {
      prediction = `Your content currently has limited viral potential with a score of ${Math.round(viralityScore)}/100. Based on comparative analysis with successful content in your category, several critical factors need improvement:`
    }

    prediction += `

1. Hook Strength: ${getLengthScore() > 7 ? "Strong" : getLengthScore() > 5 ? "Moderate" : "Weak"} (${getLengthScore()}/10)
   ${getLengthScore() > 7 ? "Your opening hook effectively captures attention within the critical first 3 seconds" : getLengthScore() > 5 ? "Your opening hook is adequate but could be more immediately compelling" : "Your opening lacks the immediate impact needed to prevent scrolling"}

2. Trend Alignment: ${scores.trend > 70 ? "Strong" : scores.trend > 50 ? "Moderate" : "Weak"} (${Math.round(scores.trend)}/100)
   ${scores.trend > 70 ? "Your content effectively leverages current platform trends and audience interests" : scores.trend > 50 ? "Your content partially aligns with current trends but could be more timely" : "Your content shows limited connection to current platform trends"}

3. Pattern Disruption: ${hasEffects && hasText ? "Strong" : (hasEffects || hasText) ? "Moderate" : "Weak"} (${hasEffects && hasText ? 8 : (hasEffects || hasText) ? 6 : 3}/10)
   ${hasEffects && hasText ? "Your combination of visual effects and text creates effective pattern interrupts" : (hasEffects || hasText) ? "You're using some pattern interruption techniques but could enhance this aspect" : "Your content lacks the pattern interrupts that typically drive viral sharing"}

4. Emotional Trigger: ${hasAudio && (hasText || hasEffects) ? "Strong" : (hasAudio || hasText || hasEffects) ? "Moderate" : "Weak"} (${hasAudio && (hasText || hasEffects) ? 9 : (hasAudio || hasText || hasEffects) ? 6 : 3}/10)
   ${hasAudio && (hasText || hasEffects) ? "Your content effectively triggers emotional response through combined audio-visual elements" : (hasAudio || hasText || hasEffects) ? "Your content has some emotional elements but could create stronger emotional impact" : "Your content lacks the emotional triggers that typically drive sharing behavior"}

5. Shareability Factor: ${viralityScore > 70 ? "High" : viralityScore > 50 ? "Moderate" : "Low"} (${Math.round(viralityScore * 0.8)}/100)
   ${viralityScore > 70 ? "Your content has clear share triggers that motivate viewers to distribute it" : viralityScore > 50 ? "Your content has some shareability but lacks strong share motivation" : "Your content currently lacks clear reasons for viewers to share it with others"}`

    if (platform === "TikTok") {
      prediction += `

Platform-Specific Factors: TikTok's algorithm currently favors ${duration < 15 ? "your shorter format" : "shorter content than yours"}, with videos under 15 seconds receiving 2.3x more initial distribution. ${hasAudio ? "Your audio selection aligns well with platform preferences" : "Adding trending audio would significantly increase discovery potential"}. The algorithm is currently prioritizing authentic, less-produced content with strong emotional hooks.`
    } else if (platform === "Instagram") {
      prediction += `

Platform-Specific Factors: Instagram's algorithm currently favors ${hasFilter ? "your consistent visual aesthetic" : "more visually consistent content"}, with cohesive color grading receiving 42% higher engagement. ${hasText ? "Your text overlay approach works well for Instagram" : "Adding strategic text would improve accessibility and engagement"}. The algorithm is currently prioritizing original content that drives profile exploration.`
    } else if (platform === "YouTube") {
      prediction += `

Platform-Specific Factors: YouTube's algorithm currently prioritizes ${duration > 60 ? "your longer format" : "longer content than yours"} that maintains high retention throughout. ${hasText ? "Your text highlights help maintain viewer attention" : "Adding text highlights would improve information retention"}. The algorithm is currently favoring content that drives channel subscription and extended watch sessions.`
    } else {
      prediction += `

Platform-Specific Factors: ${platform}'s algorithm currently favors content that generates meaningful engagement rather than passive views. ${hasText && hasAudio ? "Your combination of text and audio works well for this platform" : "Optimizing for both sound-on and sound-off viewing would improve performance"}. The algorithm is currently prioritizing content that feels timely and connected to current conversations.`
    }

    return prediction
  }

  // Add a new function for audience match analysis
  const generateAudienceMatchAnalysis = (platform, niche, trend, hasText, hasEffects, hasAudio) => {
    if (platform === "TikTok") {
      return `Based on demographic and behavioral analysis of the ${niche} audience on TikTok:

1. Demographic Alignment: Your content targets the core ${niche} audience on TikTok (primarily 16-24 age range, 62% female, 38% male). This audience shows 3.7x higher engagement with content that feels authentic and relatable rather than highly produced.

2. Consumption Patterns: The ${niche} audience on TikTok typically engages with content during peak hours (7-9 AM and 9-11 PM), with 78% viewing with sound on. ${hasAudio ? "Your audio approach aligns with this behavior" : "Adding strategic audio would better match consumption patterns"}.

3. Content Preferences: Based on engagement data from 5,000+ videos, this audience shows strong preference for:
   • Authentic, behind-the-scenes content (3.2x higher engagement)
   • Quick, practical takeaways (2.8x higher completion)
   • Relatable, emotion-driven narratives (3.5x higher share rate)
   ${hasText && !hasEffects ? "Your text-focused, authentic approach matches these preferences well" : !hasText && hasEffects ? "Your visual effects approach may be less effective than a more authentic style" : hasText && hasEffects ? "Your combination of text and effects creates good balance" : "Your content currently lacks the elements this audience prefers"}

4. Trend Resonance: The "${trend}" format currently has a 78% resonance rate with your target demographic, with highest performance among the 18-21 age segment. Content following this trend sees 2.3x higher engagement when it adds a unique perspective rather than exactly copying the format.

5. Attention Patterns: Eye-tracking studies show the ${niche} audience on TikTok focuses primarily on the center of the screen for the first 2 seconds, then scans for text overlays. ${hasText ? "Your text placement aligns with these attention patterns" : "Adding center-aligned text in the first 2 seconds would better match viewing patterns"}.`
    } else if (platform === "Instagram") {
      return `Based on demographic and behavioral analysis of the ${niche} audience on Instagram:

1. Demographic Alignment: Your content targets the core ${niche} audience on Instagram (primarily 18-34 age range, 57% female, 43% male). This audience shows 2.9x higher engagement with visually consistent content that maintains a cohesive aesthetic.

2. Consumption Patterns: The ${niche} audience on Instagram typically engages during midday and evening hours (12-2 PM and 8-10 PM), with 65% viewing with sound off initially. ${hasText ? "Your text overlays support this sound-off viewing behavior" : "Adding text would better accommodate sound-off viewing patterns"}.

3. Content Preferences: Based on engagement data from 5,000+ posts, this audience shows strong preference for:
   • Visually striking imagery with consistent color grading (3.4x higher saves)
   • Educational content with clear takeaways (2.7x higher shares)
   • Aspirational but achievable demonstrations (3.1x higher profile visits)
   ${hasFilter && hasText ? "Your combination of visual consistency and information aligns well" : !hasFilter && hasText ? "Your informational approach works but lacks visual consistency" : hasFilter && !hasText ? "Your visual approach is strong but lacks informational elements" : "Your content currently lacks the elements this audience prefers"}

4. Trend Resonance: The "${trend}" format currently has a 65% resonance rate with your target demographic, performing best with the 25-34 age segment. Content following this trend sees 2.1x higher engagement when it maintains visual consistency throughout.

5. Attention Patterns: Heat map analysis shows the ${niche} audience on Instagram focuses on the lower third of the screen for text information while scanning the center for visual elements. ${hasText ? "Your text placement should align with these viewing patterns" : "Adding bottom-aligned text would better match attention patterns"}.`
    } else if (platform === "YouTube") {
      return `Based on demographic and behavioral analysis of the ${niche} audience on YouTube:

1. Demographic Alignment: Your content targets the core ${niche} audience on YouTube (broader 18-45 age range, 52% male, 48% female). This audience shows 2.5x higher engagement with content that provides clear value and detailed information.

2. Consumption Patterns: The ${niche} audience on YouTube typically engages during evening hours (6-11 PM), with 82% viewing with sound on and expecting high-quality audio. ${hasAudio ? "Your audio quality aligns with these expectations" : "Improving audio quality would better meet audience expectations"}.

3. Content Preferences: Based on engagement data from 3,000+ videos, this audience shows strong preference for:
   • Structured, information-rich content (3.3x higher retention)
   • Clear demonstrations with detailed explanation (2.9x higher subscription rate)
   • Content that balances entertainment with educational value (2.7x higher share rate)
   ${hasText && duration > 60 ? "Your informational approach with adequate length aligns well" : !hasText && duration > 60 ? "Your longer format works but needs more information structure" : hasText && duration < 60 ? "Your informational approach is good but may be too brief" : "Your content currently lacks the elements this audience prefers"}

4. Trend Resonance: The "${trend}" format currently has a 54% resonance rate with your target demographic, performing best with the 25-34 age segment. Content following this trend sees 1.9x higher engagement when it adds depth and detail beyond the basic format.

5. Attention Patterns: Retention analysis shows the ${niche} audience on YouTube expects a clear introduction (first 15 seconds), followed by structured information, with key points highlighted visually. ${hasText ? "Your text highlights support this viewing pattern" : "Adding text highlights for key points would better match viewing expectations"}.`
    } else {
      return `Based on demographic and behavioral analysis of the ${niche} audience on ${platform}:

1. Demographic Alignment: Your content targets the core ${niche} audience on ${platform} (varies by platform but generally 18-40 age range with balanced gender distribution). This audience shows higher engagement with content that balances information with entertainment value.

2. Consumption Patterns: The ${niche} audience on ${platform} typically engages throughout the day with peaks during commute hours and evening relaxation time. ${hasText ? "Your text overlays support flexible viewing contexts" : "Adding text would accommodate varied viewing situations"}.

3. Content Preferences: Based on engagement data from platform-specific analysis, this audience shows strong preference for:
   • Content that quickly establishes relevance and value (2.8x higher completion)
   • Visually engaging presentation with clear information (2.5x higher engagement)
   • Content that feels timely and connected to current interests (3.0x higher share rate)
   ${hasText && hasEffects ? "Your balanced approach aligns well with these preferences" : !hasText && hasEffects ? "Your visual approach is strong but needs informational elements" : hasText && !hasEffects ? "Your informational approach works but could be more visually engaging" : "Your content currently lacks the elements this audience prefers"}

4. Trend Resonance: The "${trend}" format currently has moderate resonance with your target demographic, with performance varying by specific audience segments. Content following this trend performs best when it adds unique perspective while maintaining recognizable format elements.

5. Attention Patterns: Cross-platform analysis shows the ${niche} audience expects clear value proposition within the first 8-10 seconds, followed by structured delivery of promised content. ${hasText ? "Your text approach supports this expectation" : "Adding an early text hook would better set viewer expectations"}.`
    }
  }

  // Add a new function for competitor analysis
  const generateCompetitorAnalysis = (platform, niche, trend) => {
    if (platform === "TikTok") {
      return `Analysis of top-performing creators in the ${platform} ${niche} space reveals key competitive differentiators:

1. Content Structure: The most successful creators (averaging 2.3M+ views) are using a 3-part structure:
   • 0-3 seconds: Immediate hook with surprising statement or visual
   • 3-7 seconds: Context establishment with problem framing
   • 7-15 seconds: Solution reveal with clear takeaway
   This structure achieves 87% average completion rates compared to 42% for traditional narrative approaches.

2. Audio Strategy: Top performers are using a dual-layer audio approach:
   • Primary: Trending sound (first 3 seconds to trigger algorithm recognition)
   • Secondary: Voice-over with clear, energetic delivery
   This combination receives 3.1x more shares than single-layer audio approaches.

3. Visual Techniques: Leading creators are implementing:
   • Zoom transitions at key information points (increases retention by 27%)
   • Text that appears synchronously with speech (improves information retention by 32%)
   • Quick-cut editing with 1.5-2 second scene duration (maintains attention 41% better)

4. Engagement Tactics: Most successful competitors use:
   • Direct questions to viewers in the first 5 seconds (increases comment rate by 78%)
   • "Duet this" or "Stitch this" calls-to-action (generates 3.4x more derivative content)
   • Controversial or surprising statements that drive debate (increases share rate by 43%)

5. Differentiation Opportunities: Based on competitive analysis, these approaches are currently underutilized:
   • Behind-the-scenes authenticity in highly produced niches (stands out from polished content)
   • Data-backed claims with visual representation (builds authority in opinion-heavy spaces)
   • Pattern interruption through unexpected format breaks (captures attention in saturated trends)`
    } else if (platform === "Instagram") {
      return `Analysis of top-performing creators in the ${platform} ${niche} space reveals key competitive differentiators:

1. Content Structure: The most successful creators (averaging 1.8M+ views) are using a 4-part structure:
   • 0-3 seconds: Visual hook with strong aesthetic appeal
   • 3-8 seconds: Context establishment with clear subject identification
   • 8-20 seconds: Value delivery with educational or entertainment content
   • Final 5 seconds: Call-to-action with profile direction
   This structure achieves 76% average completion rates compared to 38% for traditional approaches.

2. Visual Strategy: Top performers are implementing:
   • Consistent color grading across all content (increases profile visits by 42%)
   • Smooth transitions between scenes (improves retention by 31%)
   • Text placement in the lower third of the screen (improves readability by 28%)
   • High-contrast visuals that stand out in feeds (increases initial engagement by 37%)

3. Audio Techniques: Leading creators are using:
   • Trending audio for the first 5 seconds (triggers algorithm recognition)
   • Clear voice-over with minimal background noise (improves message retention)
   • Audio cues that signal important information (increases attention by 24%)

4. Engagement Tactics: Most successful competitors use:
   • Question prompts at the end of Reels (increases comment rate by 63%)
   • "Save this for later" suggestions for valuable content (increases save rate by 81%)
   • Teasing additional content on their profile (increases profile visits by 47%)

5. Differentiation Opportunities: Based on competitive analysis, these approaches are currently underutilized:
   • Carousel-to-Reel strategy (teasing longer content in carousels)
   • Behind-the-scenes content that builds creator authenticity
   • Collaborative content that leverages multiple creator audiences
   • Data visualization techniques that simplify complex information`
    } else if (platform === "YouTube") {
      return `Analysis of top-performing creators in the ${platform} ${niche} space reveals key competitive differentiators:

1. Content Structure: The most successful creators (averaging 1.2M+ views) are using a 5-part structure:
   • 0-15 seconds: Hook with problem statement or surprising claim
   • 15-30 seconds: Context establishment with background information
   • 30-60 seconds: Solution presentation with step-by-step guidance
   • 60-90 seconds: Demonstration with real-world examples
   • Final 30 seconds: Call-to-action with content bridge
   This structure achieves 72% average retention rates compared to 35% for traditional approaches.

2. Visual Techniques: Leading creators are implementing:
   • Custom thumbnails with high-contrast text and emotional triggers (increases CTR by 76%)
   • B-roll footage that visually supports spoken information (improves retention by 34%)
   • Text highlights that emphasize key points (improves information retention by 28%)
   • End screens that promote related content (increases session time by 47%)

3. Audio Techniques: Top performers are using:
   • Clear voice-over with professional-grade microphone (improves perceived authority)
   • Background music that matches the video's emotional tone (enhances viewer engagement)
   • Sound effects that emphasize key moments (increases attention by 24%)

4. Engagement Tactics: Most successful competitors use:
   • Asking viewers to subscribe at the beginning of the video (increases subscription rate)
   • Responding to comments and questions (builds community and loyalty)
   • Creating polls and quizzes to engage viewers (increases interaction rate)

5. Differentiation Opportunities: Based on competitive analysis, these approaches are currently underutilized:
   • Data-driven content that cites credible sources (builds trust and authority)
   • Interactive content that involves viewers in the video (increases engagement)
   • Behind-the-scenes content that reveals the creator's process (builds authenticity)`
    } else {
      return `Analysis of top-performing creators in the ${platform} ${niche} space reveals key competitive differentiators:

1. Content Structure: The most successful creators (averaging 800K+ views) are using a 3-part structure:
   • 0-8 seconds: Hook with problem statement or surprising claim
   • 8-30 seconds: Solution presentation with step-by-step guidance
   • Final 5 seconds: Call-to-action with clear next steps
   This structure achieves 68% average completion rates compared to 32% for traditional approaches.

2. Visual Techniques: Leading creators are implementing:
   • Text overlays that summarize key points (improves information retention)
   • Data visualizations that simplify complex information (increases share rate)
   • Consistent branding with logo and color palette (improves brand recognition)

3. Audio Techniques: Top performers are using:
   • Clear voice-over with professional-grade microphone (improves perceived authority)
   • Background music that matches the video's emotional tone (enhances viewer engagement)

4. Engagement Tactics: Most successful competitors use:
   • Asking viewers to comment with their opinions (increases comment rate)
   • Responding to comments and questions (builds community and loyalty)
   • Creating polls and quizzes to engage viewers (increases interaction rate)

5. Differentiation Opportunities: Based on competitive analysis, these approaches are currently underutilized:
   • Data-driven content that cites credible sources (builds trust and authority)
   • Interactive content that involves viewers in the video (increases engagement)
   • Behind-the-scenes content that reveals the creator's process (builds authenticity)`
    }
  }

  // Add a new function for optimization tips
  const generateOptimizationTips = (platform, hasText, hasEffects, hasAudio, duration) => {
    const tips = []

    if (platform === "TikTok") {
      tips.push(
        "Front-load your hook in the first 2 seconds - TikTok's algorithm makes distribution decisions within the first 3 seconds based on viewer retention",
      )
      tips.push(
        "Use text overlays strategically to emphasize key points - place 3-5 words maximum per frame in high-contrast colors at the bottom third of the screen",
      )
      tips.push(
        "Incorporate trending sounds for the first 3-5 seconds, then transition to voice-over for maximum algorithmic recognition while maintaining your message",
      )
      tips.push(
        "Implement pattern interrupts (zoom, color shift, quick movement) every 3-4 seconds to maintain attention throughout the video",
      )
      tips.push(
        "End with a clear, specific call-to-action that drives profile visits - this signals quality content to the algorithm",
      )
    } else if (platform === "Instagram") {
      tips.push(
        "Maintain consistent visual branding with a signature color palette and filter across all your Reels for stronger profile cohesion and recognition",
      )
      tips.push(
        "Use Instagram's native effects and features - the algorithm gives 42% more distribution to content using in-app tools",
      )
      tips.push(
        "Structure your Reels with a strong visual hook in the first frame - this thumbnail is critical for feed performance",
      )
      tips.push(
        "Implement the 'bookend technique' - start and end with your strongest visuals to improve completion rates and repeat views",
      )
      tips.push(
        "End with a question prompt to drive comments, which boosts reach significantly more than likes or views",
      )
    } else if (platform === "YouTube") {
      tips.push(
        "Create a custom thumbnail with text overlay that creates curiosity - CTR is the first metric that determines video distribution",
      )
      tips.push(
        "Structure your content with clear chapters or segments - this improves retention and makes your content more referenceable",
      )
      tips.push(
        "Include a pattern interrupt every 15-20 seconds (perspective change, tone shift, visual element) to maintain viewer attention",
      )
      tips.push(
        "Optimize your title with both search terms and curiosity triggers - the ideal formula is [Keyword] + [Intrigue Element] + [Benefit]",
      )
      tips.push(
        "End with a content bridge to your other videos - this significantly improves session time, which is YouTube's primary ranking factor",
      )
    } else {
      tips.push(
        `Optimize your ${platform} content by focusing on platform-native features and formats that signal quality to the algorithm`,
      )
      tips.push(
        "Create content that works well both with and without sound - use text overlays strategically to convey key information",
      )
      tips.push(
        "Implement a 3-part structure: hook (problem), body (solution process), conclusion (result and benefit)",
      )
      tips.push(
        "Use data visualization techniques to simplify complex information - this increases share rates by making content more valuable",
      )
      tips.push(
        "End with a clear call-to-action that aligns with platform-specific engagement metrics - different platforms prioritize different interaction types",
      )
    }

    // Add specific tips based on content elements
    if (!hasText) {
      tips.push(
        "Add strategic text overlays to improve accessibility and emphasize key points - this increases information retention by up to 32%",
      )
    }
    if (!hasAudio) {
      tips.push(
        "Incorporate trending audio to significantly boost discovery potential - algorithm recognition of popular sounds increases initial distribution by up to 43%",
      )
    }
    if (duration > 60 && (platform === "TikTok" || platform === "Instagram")) {
      tips.push(
        `Consider creating a shorter version (15-30 seconds) for ${platform} - shorter content currently receives 37% higher completion rates on this platform`,
      )
    }
    if (!hasEffects && (platform === "TikTok" || platform === "Instagram")) {
      tips.push(
        "Add subtle visual effects or transitions to maintain viewer attention - pattern interrupts reduce abandonment rates by up to 28%",
      )
    }

    return tips.join(". ") + "."
  }

  // Update the analyzeWithAI function to include the new analysis types
  const analyzeWithAI = async () => {
    if (aiAnalysisRef.current) return
    aiAnalysisRef.current = true

    setAiLoading({
      trend: true,
      content: true,
      platform: true,
      virality: true,
      audience: true,
      competitor: true,
      optimization: true,
    })

    try {
      const calculatedScores = calculateScores()
      setScores(calculatedScores)
      const platformRecommendations = getPlatformRecommendations()
      setRecommendations(platformRecommendations)
      const platformStrengths = getPlatformStrengths()
      setStrengths(platformStrengths)

      // Simulate AI analysis with setTimeout
      setTimeout(() => {
        setAiInsights({
          trendAnalysis: generateTrendAnalysis(platform, niche, trend, hasText, hasEffects, hasAudio, duration),
          contentSuggestions: generateContentSuggestions(
            platform,
            textOverlays.length,
            effectItems.length,
            audioTracks.length,
            duration,
          ),
          platformSpecific: generatePlatformInsights(platform, hasText, hasEffects, hasAudio, duration),
          viralityPotential: generateViralityPredictionFn(
            platform,
            niche,
            trend,
            hasText,
            hasEffects,
            hasAudio,
            duration,
            calculatedScores.virality,
          ),
          audienceMatch: generateAudienceMatchAnalysis(platform, niche, trend, hasText, hasEffects, hasAudio),
          competitorAnalysis: generateCompetitorAnalysis(platform, niche, trend),
          optimizationTips: generateOptimizationTips(platform, hasText, hasEffects, hasAudio, duration),
        })
        setAiLoading({
          trend: false,
          content: false,
          platform: false,
          virality: false,
          audience: false,
          competitor: false,
          optimization: false,
        })
      }, 2000) // Simulate 2 seconds of AI analysis
    } catch (error) {
      console.error("Error during AI analysis:", error)
      setAiInsights({
        trendAnalysis: "Error analyzing trends. Please try again.",
        contentSuggestions: "Error generating content suggestions. Please try again.",
        platformSpecific: "Error analyzing platform insights. Please try again.",
        viralityPotential: "Error predicting virality. Please try again.",
        audienceMatch: "Error analyzing audience match. Please try again.",
        competitorAnalysis: "Error analyzing competitors. Please try again.",
        optimizationTips: "Error generating optimization tips. Please try again.",
      })
      setAiLoading({
        trend: false,
        content: false,
        platform: false,
        virality: false,
        audience: false,
        competitor: false,
        optimization: false,
      })
    }
  }

  const generateViralityPrediction = (
    platform: string,
    niche: string,
    trend: string,
    hasText: boolean,
    hasEffects: boolean,
    hasAudio: boolean,
    duration: number,
    viralityScore: number,
  ): string => {
    let prediction = `Based on current trends and your video's characteristics, the virality potential is moderate. `

    if (viralityScore > 70) {
      prediction = `With a virality score of ${Math.round(viralityScore)}, your video has a high chance of going viral! `
    } else if (viralityScore > 50) {
      prediction = `With a virality score of ${Math.round(viralityScore)}, your video has a good chance of reaching a wide audience. `
    } else {
      prediction = `With a virality score of ${Math.round(viralityScore)}, your video may need some improvements to increase its virality potential. `
    }

    prediction += `Factors like the use of trending audio, engaging visuals, and a clear message contribute to its potential reach. `

    if (platform === "TikTok") {
      prediction += `TikTok's algorithm favors short, attention-grabbing content, so keeping your video concise is key. `
    } else if (platform === "Instagram") {
      prediction += `Instagram rewards visually appealing content, so make sure your video stands out. `
    } else if (platform === "YouTube") {
      prediction += `YouTube prioritizes watch time, so aim to keep viewers engaged throughout the video. `
    }

    return prediction
  }

  const getLengthScore = () => {
    if (duration < 15) return 9
    if (duration < 30) return 7
    if (duration < 60) return 5
    return 3
  }

  const getPlatformIcon = () => {
    switch (platform) {
      case "TikTok":
        return <TikTokIcon className="w-5 h-5" />
      case "Instagram":
        return <Instagram className="w-5 h-5" />
      case "YouTube":
        return <Youtube className="w-5 h-5" />
      case "Facebook":
        return <Facebook className="w-5 h-5" />
      case "Linkedin":
        return <Linkedin className="w-5 h-5" />
      case "Twitter":
        return <Twitter className="w-5 h-5" />
      case "Twitch":
        return <Twitch className="w-5 h-5" />
      case "Pinterest":
        return <PinterestIcon className="w-5 h-5" />
      case "Snapchat":
        return <SnapchatIcon className="w-5 h-5" />
      default:
        return <Video className="w-5 h-5" />
    }
  }

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const getPlatformRecommendations = () => {
    const recommendations: string[] = []

    if (scores.trend < 50) {
      recommendations.push("Improve trend alignment by incorporating current trending sounds or formats.")
    }
    if (scores.engagement < 50) {
      recommendations.push("Increase engagement by adding interactive elements like questions or polls.")
    }
    if (scores.virality < 50) {
      recommendations.push(
        "Boost virality potential by creating content that evokes strong emotions or is highly shareable.",
      )
    }
    if (scores.quality < 50) {
      recommendations.push("Enhance video quality by improving lighting, audio, or editing techniques.")
    }

    return recommendations
  }

  const getPlatformStrengths = () => {
    const strengths: string[] = []

    if (scores.trend >= 70) {
      strengths.push("Strong trend alignment indicates good potential for discovery.")
    }
    if (scores.engagement >= 70) {
      strengths.push("High engagement score suggests viewers find your content interesting and interactive.")
    }
    if (scores.virality >= 70) {
      strengths.push("Excellent virality potential means your content is likely to be shared widely.")
    }
    if (scores.quality >= 70) {
      strengths.push("Good video quality enhances the viewing experience and increases credibility.")
    }

    return strengths
  }

  // Update the return JSX to include the new tabs and improved UI

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Update the DialogContent styling to make it more visually appealing */}
      <DialogContent className="sm:max-w-5xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border-zinc-800 p-0 shadow-xl">
        <div className="bg-zinc-900 text-white rounded-lg overflow-hidden">
          {/* Analysis Progress */}
          {currentStep === "analyzing" && (
            <div className="p-6 space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-xl font-bold">Analyzing Your Video</h2>
                <p className="text-zinc-400">We're analyzing your video to provide platform-specific insights</p>

                <div className="w-full bg-zinc-800 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>

                <p className="text-sm text-zinc-500">{progress}% complete</p>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {currentStep === "complete" && (
            <div className="flex flex-col max-h-[80vh]">
              {/* Header */}
              <div className="p-6 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 to-zinc-950 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlatformIcon()}
                  <div>
                    <h2 className="text-xl font-bold">{platform} Video Analysis</h2>
                    <p className="text-sm text-zinc-400">AI-powered insights for maximum engagement</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-zinc-400">Video length</div>
                    <div className="font-medium">{formatDuration(duration)}</div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Video className="h-5 w-5 text-zinc-400" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-6 border-b border-zinc-800 bg-gradient-to-br from-zinc-900/50 to-zinc-900/30">
                  <h3 className="text-lg font-medium mb-4">Performance Score</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50 shadow-lg">
                      <div className="text-sm text-zinc-400 mb-1">Trend Alignment</div>
                      <div className={`text-3xl font-bold ${getScoreColorClass(scores.trend)}`}>{scores.trend}</div>
                      <div className="w-full bg-zinc-700/50 h-1 mt-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${scores.trend >= 85 ? "bg-green-500" : scores.trend >= 70 ? "bg-yellow-500" : scores.trend >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ width: `${scores.trend}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50 shadow-lg">
                      <div className="text-sm text-zinc-400 mb-1">Engagement</div>
                      <div className={`text-3xl font-bold ${getScoreColorClass(scores.engagement)}`}>
                        {scores.engagement}
                      </div>
                      <div className="w-full bg-zinc-700/50 h-1 mt-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${scores.engagement >= 85 ? "bg-green-500" : scores.engagement >= 70 ? "bg-yellow-500" : scores.engagement >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ width: `${scores.engagement}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50 shadow-lg">
                      <div className="text-sm text-zinc-400 mb-1">Virality Potential</div>
                      <div className={`text-3xl font-bold ${getScoreColorClass(scores.virality)}`}>
                        {scores.virality}
                      </div>
                      <div className="w-full bg-zinc-700/50 h-1 mt-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${scores.virality >= 85 ? "bg-green-500" : scores.virality >= 70 ? "bg-yellow-500" : scores.virality >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ width: `${scores.virality}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50 shadow-lg">
                      <div className="text-sm text-zinc-400 mb-1">Quality</div>
                      <div className={`text-3xl font-bold ${getScoreColorClass(scores.quality)}`}>{scores.quality}</div>
                      <div className="w-full bg-zinc-700/50 h-1 mt-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${scores.quality >= 85 ? "bg-green-500" : scores.quality >= 70 ? "bg-yellow-500" : scores.quality >= 50 ? "bg-orange-500" : "bg-red-500"}`}
                          style={{ width: `${scores.quality}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Add Virality Meter */}
                  <div className="mt-6 bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50 shadow-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Viral Potential</h4>
                      <span className={`text-lg font-bold ${getScoreColorClass(scores.virality)}`}>
                        {scores.virality}%
                      </span>
                    </div>

                    <div className="relative h-8 bg-zinc-700/50 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                        style={{ width: `${scores.virality}%` }}
                      ></div>

                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-3 text-xs font-medium">
                        <span>Low</span>
                        <span>Moderate</span>
                        <span>High</span>
                      </div>

                      <div
                        className="absolute top-0 h-full w-1 bg-white border-2 border-zinc-800 rounded-full transition-all duration-300"
                        style={{ left: `calc(${scores.virality}% - 2px)` }}
                      ></div>
                    </div>

                    <div className="mt-2 text-sm text-zinc-400">
                      {scores.virality >= 85
                        ? "Excellent viral potential! Your content has all the key elements for widespread sharing."
                        : scores.virality >= 70
                          ? "Strong viral potential. Your content has most elements needed for significant reach."
                          : scores.virality >= 50
                            ? "Moderate viral potential. With some improvements, your content could reach a wider audience."
                            : "Limited viral potential. Consider implementing the suggested optimizations to increase shareability."}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="p-6">
                  <div className="flex border-b border-zinc-800 mb-6 overflow-x-auto pb-1">
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "trend" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("trend")}
                    >
                      Trend Analysis
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "content" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("content")}
                    >
                      Content Suggestions
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "platform" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("platform")}
                    >
                      Platform Insights
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "virality" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("virality")}
                    >
                      Virality Prediction
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "audience" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("audience")}
                    >
                      Audience Match
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "competitor" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("competitor")}
                    >
                      Competitor Analysis
                    </button>
                    <button
                      className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${analysisTab === "optimization" ? "text-purple-500 border-b-2 border-purple-500" : "text-zinc-400"}`}
                      onClick={() => setAnalysisTab("optimization")}
                    >
                      Optimization Tips
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6">
                    {/* Trend Analysis */}
                    {analysisTab === "trend" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Trend Analysis</h3>

                        {aiLoading.trend ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6 whitespace-pre-line">
                              {aiInsights.trendAnalysis || "Analyzing your video's alignment with current trends..."}
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">Strengths</h4>
                              <ul className="space-y-2">
                                {strengths.map((strength, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span>{strength}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Content Suggestions */}
                    {analysisTab === "content" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Content Suggestions</h3>

                        {aiLoading.content ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6 whitespace-pre-line">
                              {aiInsights.contentSuggestions || "Generating content suggestions based on your video..."}
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">Areas for Improvement</h4>
                              <ul className="space-y-2">
                                {recommendations.map((recommendation, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <span>{recommendation}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Platform Insights */}
                    {analysisTab === "platform" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">{platform} Platform Insights</h3>

                        {aiLoading.platform ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6 whitespace-pre-line">
                              {aiInsights.platformSpecific || `Analyzing how your video will perform on ${platform}...`}
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">{platform} Algorithm Factors</h4>
                              <div className="space-y-3">
                                {aiInsights.platformSpecific
                                  ?.split(/\d+\./)
                                  .filter(Boolean)
                                  .map((insight, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <p>{insight.trim()}</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Virality Prediction */}
                    {analysisTab === "virality" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Virality Prediction</h3>

                        {aiLoading.virality ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6 whitespace-pre-line">
                              {aiInsights.viralityPotential || "Predicting your video's viral potential..."}
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">Virality Factors</h4>
                              <div className="space-y-4">
                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Hook Strength</span>
                                    <span className="text-sm text-zinc-400">{getLengthScore()}/10</span>
                                  </div>
                                  <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full"
                                      style={{ width: `${getLengthScore() * 10}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Trend Alignment</span>
                                    <span className="text-sm text-zinc-400">{Math.round(scores.trend / 10)}/10</span>
                                  </div>
                                  <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full"
                                      style={{ width: `${scores.trend}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Production Quality</span>
                                    <span className="text-sm text-zinc-400">{Math.round(scores.quality / 10)}/10</span>
                                  </div>
                                  <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full"
                                      style={{ width: `${scores.quality}%` }}
                                    ></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Pattern Disruption</span>
                                    <span className="text-sm text-zinc-400">
                                      {hasEffects && hasText ? 8 : hasEffects || hasText ? 6 : 3}/10
                                    </span>
                                  </div>
                                  <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full"
                                      style={{
                                        width: `${(hasEffects && hasText ? 8 : hasEffects || hasText ? 6 : 3) * 10}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                <div>
                                  <div className="flex justify-between mb-1">
                                    <span className="text-sm">Emotional Trigger</span>
                                    <span className="text-sm text-zinc-400">
                                      {hasAudio && (hasText || hasEffects)
                                        ? 9
                                        : hasAudio || hasText || hasEffects
                                          ? 6
                                          : 3}
                                      /10
                                    </span>
                                  </div>
                                  <div className="w-full bg-zinc-700/50 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-red-500 to-green-500 h-1.5 rounded-full"
                                      style={{
                                        width: `${(hasAudio && (hasText || hasEffects) ? 9 : hasAudio || hasText || hasEffects ? 6 : 3) * 10}%`,
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Audience Match */}
                    {analysisTab === "audience" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Audience Match Analysis</h3>

                        {aiLoading.audience ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6 whitespace-pre-line">
                              {aiInsights.audienceMatch ||
                                "Analyzing how well your content matches the target audience..."}
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">Audience Preferences</h4>
                              <div className="space-y-3">
                                {aiInsights.audienceMatch
                                  ?.split(/\d+\./)
                                  .filter(Boolean)
                                  .map((insight, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <p>{insight.trim()}</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Competitor Analysis */}
                    {analysisTab === "competitor" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Competitor Analysis</h3>

                        {aiLoading.competitor ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6 whitespace-pre-line">
                              {aiInsights.competitorAnalysis || "Analyzing top performers in your content category..."}
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">Competitive Differentiators</h4>
                              <div className="space-y-3">
                                {aiInsights.competitorAnalysis
                                  ?.split(/\d+\./)
                                  .filter(Boolean)
                                  .map((insight, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <div className="h-5 w-5 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <p>{insight.trim()}</p>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Optimization Tips */}
                    {analysisTab === "optimization" && (
                      <div>
                        <h3 className="text-lg font-medium mb-4">Optimization Tips</h3>

                        {aiLoading.optimization ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin"></div>
                          </div>
                        ) : (
                          <>
                            <div className="text-zinc-300 mb-6">
                              <p className="mb-4">
                                Based on our analysis, here are specific optimizations to improve your content
                                performance:
                              </p>

                              <ul className="space-y-3">
                                {aiInsights.optimizationTips
                                  ?.split(". ")
                                  .filter(Boolean)
                                  .map((tip, index) => (
                                    <li key={index} className="flex items-start gap-2 bg-zinc-800/40 p-3 rounded-lg">
                                      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                        {index + 1}
                                      </div>
                                      <span>{tip.endsWith(".") ? tip : `${tip}.`}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>

                            <div className="bg-zinc-800/80 p-4 rounded-lg border border-zinc-700/50">
                              <h4 className="font-medium mb-3">Implementation Priority</h4>
                              <p className="text-sm text-zinc-300 mb-3">
                                For maximum impact, implement these optimizations in the following order:
                              </p>
                              <ol className="space-y-2 list-decimal list-inside text-zinc-300">
                                <li>Focus on hook strength in the first 3 seconds</li>
                                <li>Optimize audio selection and synchronization</li>
                                <li>Add strategic text overlays at key points</li>
                                <li>Implement pattern interrupts to maintain attention</li>
                                <li>End with a clear, platform-specific call-to-action</li>
                              </ol>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-zinc-800 flex justify-between">
                <button
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-sm font-medium"
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </button>

                <button
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-md text-sm font-medium"
                  onClick={() => {
                    setExporting(true)
                    // Simulate export process
                    setTimeout(() => {
                      setExporting(false)
                      alert("Video exported successfully!")
                      onOpenChange(false)
                    }, 2000)
                  }}
                  disabled={exporting}
                >
                  {exporting ? "Exporting..." : "Export Video"}
                </button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
