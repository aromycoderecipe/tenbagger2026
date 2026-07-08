import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'

// Swiper core + module styles — order matters, base css first
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import './BannerSlider.css'

const slides = [
  {
    id: 1,
    tone: 'coral',
    title: '프로토타입 속도로, 프로덕션 앱을.',
    description: '아이디어를 몇 시간 만에 실제로 동작하는 내부 도구로 바꾸세요.',
  },
  {
    id: 2,
    tone: 'forest',
    title: '팀 전체의 워크플로우를 한 곳에',
    description: '흩어진 업무를 하나의 보드에서 계획하고 실행하세요.',
  },
  {
    id: 3,
    tone: 'dark',
    title: '자동화로 반복 업무를 줄이세요',
    description: '규칙 기반 자동화로 팀의 시간을 되찾습니다.',
  },
]

export default function BannerSlider() {
  return (
    <Swiper
      className="banner-slider"
      modules={[Autoplay, Navigation, Pagination]}
      autoplay={{ delay: 4000, disableOnInteraction: false }}
      navigation
      pagination={{ clickable: true }}
      loop
      spaceBetween={24}
      slidesPerView={1}
    >
      {slides.map((slide) => (
        <SwiperSlide key={slide.id}>
          <div className={`banner-card banner-card--${slide.tone}`}>
            <div className="banner-card-text">
              <h2 className="banner-card-title">{slide.title}</h2>
              <p className="banner-card-description">{slide.description}</p>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
