import { Card, CardContent } from "@/components/ui/card"
import { Users, Heart, MessageCircle, Star } from "lucide-react"

const highlights = [
  {
    icon: Users,
    title: "Diverse Community",
    description: "Connect with people from all walks of life, backgrounds, and experiences.",
    stat: "10K+ Members",
  },
  {
    icon: Heart,
    title: "Supportive Environment",
    description: "Find encouragement, advice, and genuine friendships in our welcoming space.",
    stat: "99% Positive",
  },
  {
    icon: MessageCircle,
    title: "Active Discussions",
    description: "Engage in meaningful conversations about topics that matter to you.",
    stat: "500+ Daily Posts",
  },
  {
    icon: Star,
    title: "Quality Content",
    description: "Discover valuable insights, resources, and inspiration from fellow members.",
    stat: "4.9/5 Rating",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Community Member",
    content:
      "This community has been a game-changer for me. The support and connections I've made here are invaluable.",
    avatar: "/professional-woman-smiling.png",
  },
  {
    name: "Marcus Johnson",
    role: "Active Contributor",
    content: "I love how inclusive and welcoming everyone is here. It truly feels like a second family.",
    avatar: "/friendly-man-with-glasses.jpg",
  },
  {
    name: "Elena Rodriguez",
    role: "New Member",
    content: "Just joined last month and already feel so welcomed. The onboarding process was seamless!",
    avatar: "/young-woman-curly-hair.png",
  },
]

export function CommunityHighlights() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 text-balance">Why Join Our Community?</h2>

        <div className="grid gap-4">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon
            return (
              <Card key={index} className="border-border hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-foreground">{highlight.title}</h3>
                        <span className="text-sm font-medium text-primary">{highlight.stat}</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-foreground mb-6">What Our Members Say</h3>
        <div className="space-y-4">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={`${testimonial.name} avatar`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">"{testimonial.content}"</p>
                    <div>
                      <p className="font-medium text-foreground text-sm">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
