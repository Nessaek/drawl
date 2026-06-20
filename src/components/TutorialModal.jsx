import { useState, useEffect } from 'react';

export default function TutorialModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to DRAWL!',
      content: 'A multiplayer word game where you build words on a Scrabble-style board, but with a twist from Countdown.',
      icon: '✍️',
    },
    {
      title: 'Choose Your Letters',
      content: 'Unlike Scrabble, you select how many consonants and vowels you want (4-9 total). This gives you more control over your tiles!',
      icon: '🎯',
    },
    {
      title: 'Place Words',
      content: 'Type a word or drag tiles from your rack onto the board. Words must connect to existing tiles (except the first word, which must cover the center ★).',
      icon: '🎮',
    },
    {
      title: 'Premium Squares',
      content: 'Land on colored squares for bonus points: Triple Word (red), Double Word (pink), Triple Letter (blue), Double Letter (light blue).',
      icon: '⭐',
    },
    {
      title: 'Keyboard Shortcuts',
      content: 'Press Enter to place your word, Escape to clear. Click any empty cell to set your starting position.',
      icon: '⌨️',
    },
    {
      title: 'Ready to Play!',
      content: 'Create a game and share the link with a friend, or play solo to practice. Have fun!',
      icon: '🎉',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' && currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        setCurrentStep(currentStep - 1);
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  const handleClose = () => {
    localStorage.setItem('drawl_tutorial_seen', 'true');
    setCurrentStep(0);
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="auth-overlay animate-fade-in" onClick={(e) => e.target.className.includes('auth-overlay') && handleClose()}>
      <div className="auth-modal tutorial-modal">
        <button className="auth-modal__close" onClick={handleClose} aria-label="Close tutorial">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div className="tutorial-content">
          <div className="tutorial-icon">{step.icon}</div>
          <h2 className="tutorial-title">{step.title}</h2>
          <p className="tutorial-text">{step.content}</p>
        </div>

        <div className="tutorial-progress">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`tutorial-dot ${index === currentStep ? 'tutorial-dot--active' : ''} ${index < currentStep ? 'tutorial-dot--completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>

        <div className="tutorial-actions">
          {currentStep > 0 && (
            <button className="btn btn--ghost" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </button>
          )}
          {!isLastStep ? (
            <button className="btn btn--primary" onClick={() => setCurrentStep(currentStep + 1)} style={{ marginLeft: 'auto' }}>
              Next
            </button>
          ) : (
            <button className="btn btn--primary" onClick={handleClose} style={{ marginLeft: 'auto' }}>
              Get Started!
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
