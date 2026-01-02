import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface PinLockProps {
  correctPin: string;
  onUnlock: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ correctPin, onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleNumClick = (num: string) => {
    if (input.length < 4) {
      const newInput = input + num;
      setInput(newInput);
      setError(false);
      
      if (newInput.length === 4) {
        if (newInput === correctPin) {
          setTimeout(onUnlock, 200);
        } else {
          setError(true);
          setTimeout(() => setInput(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setInput(input.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 bg-rose-600 z-50 flex flex-col items-center justify-center text-white p-4">
      <div className="mb-8 flex flex-col items-center">
        <div className="bg-white/20 p-4 rounded-full mb-4">
          <Lock size={48} />
        </div>
        <h1 className="text-2xl font-bold">Ghar Kharch Manager</h1>
        <p className="text-rose-100 mt-2">Enter PIN to unlock</p>
      </div>

      <div className="flex gap-4 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 border-white transition-all duration-200 ${
              i < input.length ? 'bg-white' : 'bg-transparent'
            } ${error ? 'border-red-300 bg-red-300' : ''}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => handleNumClick(num.toString())}
            className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-2xl font-semibold active:bg-white/20 transition-colors"
          >
            {num}
          </button>
        ))}
        <div />
        <button
          onClick={() => handleNumClick('0')}
          className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center text-2xl font-semibold active:bg-white/20 transition-colors"
        >
          0
        </button>
        <button
          onClick={handleDelete}
          className="w-16 h-16 flex items-center justify-center text-sm font-semibold active:bg-white/20 transition-colors"
        >
          DELETE
        </button>
      </div>
    </div>
  );
};
