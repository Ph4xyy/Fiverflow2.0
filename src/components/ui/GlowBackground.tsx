import { motion } from 'framer-motion';

// Generate random particles
const generateParticles = () => {
  const particles = [];
  for (let i = 0; i < 50; i++) {
    particles.push({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 5,
      duration: Math.random() * 10 + 10,
    });
  }
  return particles;
};

const particles = generateParticles();

export const GlowBackground = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-gradient-to-b from-black via-slate-950 to-black">
      {/* Radial gradient glows */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-[600px] h-[600px] bg-cyan-400/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-1/2 w-[900px] h-[900px] bg-purple-500/15 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[110px] animate-pulse" style={{ animationDelay: '0.5s' }} />

      {/* Animated floating orbs */}
      {[...Array(8)].map((_, i) => {
        const sizes = ['w-8 h-8', 'w-12 h-12', 'w-16 h-16'];
        const colors = [
          'bg-indigo-400/30',
          'bg-purple-400/30',
          'bg-cyan-400/30',
          'bg-teal-400/30'
        ];
        return (
          <motion.div
            key={`orb-${i}`}
            className={`absolute ${sizes[i % 3]} rounded-full ${colors[i % 4]}`}
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 30}%`,
            }}
            animate={{
              y: [0, -30 + Math.random() * 60, 0],
              x: [0, 20 - Math.random() * 40, 0],
              scale: [1, 1.2 + Math.random(), 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 8 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          />
        );
      })}

      {/* Animated particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20 backdrop-blur-sm"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 0.5, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: particle.delay,
          }}
        />
      ))}

      {/* Medium floating particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-gradient-to-r from-indigo-400/20 to-cyan-400/20"
          style={{
            width: 6 + Math.random() * 4,
            height: 6 + Math.random() * 4,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100 - Math.random() * 100, 0],
            x: [0, 50 - Math.random() * 100, 0],
            rotate: [0, 360],
            scale: [0.5, 1.2, 0.5],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 15 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}

      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Subtle animated grid */}
      <motion.div
        className="absolute inset-0 bg-grid-white/[0.02]"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

