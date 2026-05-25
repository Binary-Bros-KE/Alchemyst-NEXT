// src/data/packages.ts

import {
  AiOutlineCrown,
  AiOutlineStar,
  AiOutlineFire,
} from "react-icons/ai"
import { IconType } from "react-icons"

interface PackageTier {
  id: string
  name: string
  weeklyPrice: number
  icon: IconType
  features: string[]
  priority: number
  popular?: boolean
}

interface UserPackages {
  basic: PackageTier
  premium: PackageTier
  elite: PackageTier
}

interface PackageTiers {
  escort: UserPackages
  masseuse: UserPackages
  "of-model": UserPackages
  spa: UserPackages
  [key: string]: UserPackages
}

export const PACKAGE_TIERS: PackageTiers = {
  escort: {
    basic: {
      id: "basic",
      name: "Sweet Temptation",
      weeklyPrice: 100,
      icon: AiOutlineStar,
      features: [
        "Basic profile listing",
        "Appears in search results",
        "Standard visibility",
      ],
      priority: 1,
    },
    premium: {
      id: "premium",
      name: "Sensual Delight",
      weeklyPrice: 250,
      icon: AiOutlineFire,
      features: [
        "Premium profile listing",
        "Priority in search results",
        "Featured badge",
        "Boosted profile visibility",
        "Priority support",
        "Appear in Blog posts and featured sections",
        "Verified badge",
      ],
      priority: 2,
      popular: true,
    },
    elite: {
      id: "elite",
      name: "Ultimate Fantasy",
      weeklyPrice: 350,
      icon: AiOutlineCrown,
      features: [
        "VIP badge on profile",
        "Top priority placement (appear above everyone)",
        "Maximum algorithm boost",
        "Featured in Telegram promotions",
        "Verified badge",
        "24/7 priority support",
        "Appear in Blog posts and featured sections",
      ],
      priority: 3,
    },
  },
  masseuse: {
    basic: {
      id: "basic",
      name: "Relaxation Basic",
      weeklyPrice: 100,
      icon: AiOutlineStar,
      features: [
        "Basic profile listing",
        "Appears in search results",
        "Standard visibility",
      ],
      priority: 1,
    },
    premium: {
      id: "premium",
      name: "Premium Therapy",
      weeklyPrice: 250,
      icon: AiOutlineFire,
      features: [
        "Premium profile listing",
        "Priority in search results",
        "Featured badge",
        "Boosted profile visibility",
        "Priority support",
        "Appear in Blog posts and featured sections",
      ],
      priority: 2,
      popular: true,
    },
    elite: {
      id: "elite",
      name: "Elite Wellness",
      weeklyPrice: 350,
      icon: AiOutlineCrown,
      features: [
        "VIP badge on profile",
        "Top priority placement (appear above everyone)",
        "Maximum algorithm boost",
        "Featured in Telegram promotions",
        "Verified badge",
        "24/7 priority support",
        "Appear in Blog posts and featured sections",
      ],
      priority: 3,
    },
  },
  "of-model": {
    basic: {
      id: "basic",
      name: "Content Creator",
      weeklyPrice: 300,
      icon: AiOutlineStar,
      features: [
        "Basic profile listing",
        "Appears in search results",
        "Standard visibility",
      ],
      priority: 1,
    },
    premium: {
      id: "premium",
      name: "Premium Creator",
      weeklyPrice: 500,
      icon: AiOutlineFire,
      features: [
        "Premium profile listing",
        "Priority in search results",
        "Featured badge",
        "Boosted profile visibility",
        "Priority support",
        "Appear in Blog posts and featured sections",
      ],
      priority: 2,
      popular: true,
    },
    elite: {
      id: "elite",
      name: "Elite Influencer",
      weeklyPrice: 750,
      icon: AiOutlineCrown,
      features: [
        "VIP badge on profile",
        "Top priority placement (appear above everyone)",
        "Maximum algorithm boost",
        "Featured in Telegram promotions",
        "Verified badge",
        "24/7 priority support",
        "Appear in Blog posts and featured sections",
      ],
      priority: 3,
    },
  },
  spa: {
    basic: {
      id: "basic",
      name: "Business Basic",
      weeklyPrice: 350,
      icon: AiOutlineStar,
      features: [
        "Basic business listing",
        "Appears in search results",
        "Standard visibility",
      ],
      priority: 1,
    },
    premium: {
      id: "premium",
      name: "Business Premium",
      weeklyPrice: 500,
      icon: AiOutlineFire,
      features: [
        "Premium business listing",
        "Priority in search results",
        "Featured badge",
        "Boosted profile visibility",
        "Priority support",
        "Appear in Blog posts and featured sections",
      ],
      priority: 2,
      popular: true,
    },
    elite: {
      id: "elite",
      name: "Business Elite",
      weeklyPrice: 650,
      icon: AiOutlineCrown,
      features: [
        "VIP badge on profile",
        "Top priority placement (appear above everyone)",
        "Maximum algorithm boost",
        "Featured in Telegram promotions",
        "Dedicated account manager",
        "Appear in Blog posts and featured sections",
      ],
      priority: 3,
    },
  },
}
