"use client"

import { SuggestionHelper } from "@/components/suggestion-helper"
import { CaptionGenerator } from "@/components/caption-generator"

type ContentSuggestionsProps = {
  platform: string
  niche: string
  trend: string
  videoTitle?: string
}

export function ContentSuggestions({ platform, niche, trend, videoTitle }: ContentSuggestionsProps) {
  return (
    <div className="flex items-center space-x-2">
      <SuggestionHelper platform={platform} niche={niche} trend={trend} />
      <CaptionGenerator platform={platform} niche={niche} trend={trend} videoTitle={videoTitle} />
    </div>
  )
}
