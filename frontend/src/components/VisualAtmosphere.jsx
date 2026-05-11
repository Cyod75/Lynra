export default function VisualAtmosphere() {
  const points = Array.from({ length: 28 }).map((_, index) => ({
    left: `${(index * 37) % 100}%`,
    top: `${(index * 71) % 100}%`,
    delay: `${index * -0.12}s`,
    duration: `${2.4 + (index % 6) * 0.45}s`,
    opacity: 0.18 + (index % 5) * 0.08,
  }));

  return (
    <div className="visual-atmosphere" aria-hidden="true">
      <div className="aurora aurora-one" />
      <div className="aurora aurora-two" />
      <div className="aurora aurora-three" />
      <div className="starfield">
        {points.map((point, index) => (
          <span
            key={index}
            style={{
              left: point.left,
              top: point.top,
              animationDelay: point.delay,
              animationDuration: point.duration,
              opacity: point.opacity,
            }}
          />
        ))}
      </div>
      <div className="scanline" />
    </div>
  );
}
