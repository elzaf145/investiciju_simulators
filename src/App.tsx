import { useState, useEffect, useRef } from 'react';
import { TrendingUp } from 'lucide-react';

interface Investment {
  id: number;
  label: string;
  value: number;
}

const investments: Investment[] = [
  { id: 1, label: 'Vokālo pedagogu apmeklēšana', value: 15 },
  { id: 2, label: 'Tērpa kopšana', value: 8 },
  { id: 3, label: 'Individuālais laiks ar diriģentu', value: 20 },
  { id: 4, label: '100% mēģinājuma apmeklējums', value: 25 },
  { id: 5, label: 'Laicīga fonda naudas maksāšana', value: 10 },
  { id: 6, label: 'Kora influencēšana sociālajos tīklos', value: 12 },
  { id: 7, label: 'Talanta attīstīšana ārpus kora laika', value: 18 },
  { id: 8, label: 'Palīdzēt Jolantai pieskatīt bērnus', value: 22 },
];

function App() {
  const [selected, setSelected] = useState<number[]>([]);
  const [isInvested, setIsInvested] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [years, setYears] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const handleCheckbox = (id: number) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else if (selected.length < 3) {
      setSelected([...selected, id]);
    }
  };

  const calculateGrowthRate = () => {
    const totalValue = selected.reduce((sum, id) => {
      const investment = investments.find((inv) => inv.id === id);
      return sum + (investment?.value || 0);
    }, 0);
    return totalValue;
  };

  const drawChart = (progress: number, growthRate: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = padding + (i * (height - 2 * padding)) / 4;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    const points = 50;
    const effectivePoints = Math.floor(points * progress);

    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#10b981';

    ctx.beginPath();

    for (let i = 0; i <= effectivePoints; i++) {
      const x = padding + (i / points) * (width - 2 * padding);
      const normalizedGrowth = growthRate / 100;
      const baseY = height - padding - (i / points) * (height - 2 * padding) * 0.3;
      const growthY = baseY - ((i / points) ** 1.5) * (height - 2 * padding) * 0.5 * normalizedGrowth;
      const noise = Math.sin(i * 0.5) * 3;
      const y = growthY + noise;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  };

  const animateChart = (growthRate: number) => {
    const duration = Math.max(3000, 6000 - growthRate * 30);
    const startTime = Date.now();
    setIsAnimating(true);

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      drawChart(progress, growthRate);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
        const calculatedYears = Math.max(1, Math.min(10, Math.round(11 - growthRate / 10)));
        setYears(calculatedYears);
      }
    };

    animate();
  };

  const handleInvest = () => {
    const growthRate = calculateGrowthRate();
    setIsInvested(true);
    animateChart(growthRate);
  };

  const handleReset = () => {
    setSelected([]);
    setIsInvested(false);
    setYears(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    drawChart(0, 0);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      drawChart(0, 0);
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawChart(isInvested ? 1 : 0, isInvested ? calculateGrowthRate() : 0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <TrendingUp className="w-10 h-10 text-emerald-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Kora Investīciju Simulators
            </h1>
          </div>
          <p className="text-gray-400 text-lg">Investē gudri, dzīvo laimīgi</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-emerald-400">
              Izvēlies 3 investīcijas
            </h2>

            <div className="space-y-3 mb-8">
              {investments.map((investment) => (
                <label
                  key={investment.id}
                  className={`flex items-center gap-3 p-4 rounded-xl cursor-pointer transition-all ${
                    selected.includes(investment.id)
                      ? 'bg-emerald-500/20 border-2 border-emerald-500'
                      : 'bg-gray-700/50 border-2 border-transparent hover:bg-gray-700'
                  } ${
                    selected.length >= 3 && !selected.includes(investment.id)
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(investment.id)}
                    onChange={() => handleCheckbox(investment.id)}
                    disabled={selected.length >= 3 && !selected.includes(investment.id)}
                    className="w-5 h-5 accent-emerald-500"
                  />
                  <span className="text-base md:text-lg">{investment.label}</span>
                </label>
              ))}
            </div>

            {!isInvested ? (
              <button
                onClick={handleInvest}
                disabled={selected.length !== 3}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  selected.length === 3
                    ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/50'
                    : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
              >
                Investēt
              </button>
            ) : (
              <button
                onClick={handleReset}
                disabled={isAnimating}
                className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                Mēģināt vēlreiz
              </button>
            )}
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl border border-gray-700">
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-cyan-400">
              Investīciju Izaugsme
            </h2>
            <div className="bg-gray-900 rounded-xl p-4 relative" style={{ height: '400px' }}>
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
              />
            </div>

            {years !== null && (
              <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl border-2 border-emerald-500/50">
                <p className="text-xl md:text-2xl font-bold text-center">
                  Tu kļūsi par lielisku kora aktīvu pēc{' '}
                  <span className="text-3xl md:text-4xl text-emerald-400">{years}</span>{' '}
                  {years === 1 ? 'gada' : 'gadiem'}!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
