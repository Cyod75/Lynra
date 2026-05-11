import { useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function InterstellarField() {
  const pointerX = useMotionValue(50);
  const pointerY = useMotionValue(50);
  const smoothX = useSpring(pointerX, { stiffness: 75, damping: 18, mass: 0.7 });
  const smoothY = useSpring(pointerY, { stiffness: 75, damping: 18, mass: 0.7 });
  const rotate = useTransform(smoothX, [0, 100], [-10, 10]);
  const background = useMotionTemplate`
    radial-gradient(circle at ${smoothX}% ${smoothY}%, rgba(59,130,246,0.34), transparent 13rem),
    radial-gradient(circle at calc(${smoothX}% + 14%) calc(${smoothY}% - 8%), rgba(20,184,166,0.18), transparent 18rem),
    radial-gradient(circle at calc(${smoothX}% - 18%) calc(${smoothY}% + 10%), rgba(236,72,153,0.15), transparent 16rem)
  `;

  useEffect(() => {
    const onPointerMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;
      pointerX.set(x);
      pointerY.set(y);
      document.documentElement.style.setProperty('--cursor-x', `${event.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [pointerX, pointerY]);

  return (
    <motion.div className="interstellar-field" style={{ background }}>
      <motion.div className="gravity-well" style={{ left: smoothX, top: smoothY, rotate }} />
      <motion.div className="gravity-ring ring-one" style={{ left: smoothX, top: smoothY }} />
      <motion.div className="gravity-ring ring-two" style={{ left: smoothX, top: smoothY }} />
      <motion.div className="gravity-ring ring-three" style={{ left: smoothX, top: smoothY }} />
      <div className="warp-grid" />
    </motion.div>
  );
}
