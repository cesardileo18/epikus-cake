import { motion } from 'framer-motion';

const UnderConstruction = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Burbujas de fondo animadas */}
      <motion.div
        className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl"
        animate={{ 
          x: [0, 40, -20, 0], 
          y: [0, -30, 20, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-32 -right-32 h-[32rem] w-[32rem] rounded-full bg-rose-300/25 blur-3xl"
        animate={{ 
          x: [0, -30, 15, 0], 
          y: [0, 40, -25, 0],
          scale: [1, 0.9, 1.1, 1]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative z-10 max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 border border-pink-100"
        >
          {/* Logo/Icono animado */}
          <motion.div 
            className="text-center mb-8"
            animate={{ 
              rotate: [0, -5, 5, -5, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="text-8xl md:text-9xl block select-none">🎂</span>
          </motion.div>

          {/* Título */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-light text-gray-900 text-center mb-4"
          >
            <span className="font-black text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              Epikus Cake
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lg md:text-xl text-gray-600 text-center mb-2"
          >
            Pastelería Premium
          </motion.p>

          {/* Mensaje principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-3xl"
              >
                🧁
              </motion.span>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">
                Estamos renovando nuestra tienda
              </h2>
              <motion.span
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-3xl"
              >
                🍰
              </motion.span>
            </div>
            
            <p className="text-center text-gray-600 text-lg leading-relaxed">
              Estamos trabajando para traerte una experiencia aún más <span className="font-semibold text-pink-600">dulce</span> y <span className="font-semibold text-pink-600">deliciosa</span>.
            </p>
          </motion.div>

          {/* Barra de progreso animada */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-8"
          >
            <div className="relative h-4 bg-pink-100 rounded-full overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500"
                initial={{ x: '-100%' }}
                animate={{ x: '0%' }}
                transition={{ 
                  duration: 2,
                  delay: 1,
                  ease: "easeOut"
                }}
                style={{ width: '75%' }}
              />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ['-100%', '200%'] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 3
                }}
              />
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">Casi lista... 75% completado</p>
          </motion.div>

          {/* Contacto */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 border border-pink-200"
          >
            <p className="text-center text-gray-700 mb-4 font-medium">
              Mientras tanto, podés contactarnos por:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <motion.a
                href="https://wa.me/5491158651170"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
              >
                <span className="text-xl">💬</span>
                WhatsApp
              </motion.a>
              
              <motion.a
                href="https://instagram.com/epikuscake"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all"
              >
                <span className="text-xl">📸</span>
                Instagram
              </motion.a>
            </div>
          </motion.div>

          {/* Footer con emojis flotantes */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="mt-8 text-center"
          >
            <div className="flex justify-center gap-3 mb-3">
              {['🍪', '🧁', '🎂', '🍰', '🍩'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {emoji}
                </motion.span>
              ))}
            </div>
            <p className="text-sm text-gray-500">
              Gracias por tu paciencia 💖
            </p>
          </motion.div>
        </motion.div>

        {/* Partículas flotantes decorativas */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-4xl pointer-events-none select-none opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          >
            {['🎂', '🧁', '🍰', '🍪', '🍩', '🎉'][i]}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default UnderConstruction;