import { Post } from '@/src/api/postService'
import TripCard from './TripCard'
import FoodPlaceCard from './FoodPlaceCard'
import HotelCard from './HotelCard'
import AttractionCard from './AttractionCard'

export function renderPostCard(
  post: Post,
  isWideWeb: boolean,
  isMobile: boolean
) {
  if (post.postType) {
    switch (post.postType) {
      case 'TRIP':
        return <TripCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      case 'LOCATION':
        return (
          <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
        )
      default:
        return (
          <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
        )
    }
  }

  switch (post.category) {
    case 'TRIP':
      return <TripCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    case 'FOOD_PLACE':
      return <FoodPlaceCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
    case 'HOTEL':
      return <HotelCard key={post.id} post={post} isWideWeb={isMobile} isMobile={isMobile} />
    case 'ATTRACTION':
      return (
        <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      )
    default:
      return (
        <AttractionCard key={post.id} post={post} isWideWeb={isWideWeb} isMobile={isMobile} />
      )
  }
}
