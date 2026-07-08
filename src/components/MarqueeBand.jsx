import './MarqueeBand.css'

const DEFAULT_ITEMS = ['자유롭게 이야기해요', '편하게 남겨주세요', '우리 팀의 자유게시판', '소통은 여기서 시작돼요']

export default function MarqueeBand({ items = DEFAULT_ITEMS, tone = 'white' }) {
  // Repeated 3x so translateX(-33.333%) always lands on an identical copy — seamless loop
  // regardless of how wide the content actually is.
  const track = [...items, ...items, ...items]

  return (
    <div className={`marquee-band marquee-band--${tone}`}>
      <div className="marquee-band__track">
        {track.map((text, index) => (
          <span className="marquee-band__item" key={`${text}-${index}`}>
            {text}
            <span className="marquee-band__star" aria-hidden="true">
              ★
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
