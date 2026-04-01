export default function CoffeeIcon() {
    return (
      <svg viewBox="0 0 680 260" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(340, 130)">

          {/* Cup */}
          <path d="M-58 -78 Q-64 -10 -58 38 Q-46 72 0 74 Q46 72 58 38 Q64 -10 58 -78 Z" fill="#C45B3A"/>
          <ellipse cx="0" cy="-78" rx="58" ry="14" fill="#E8896A"/>
          <ellipse cx="0" cy="-67" rx="46" ry="10" fill="#7A3520"/>
          <ellipse cx="0" cy="-70" rx="34" ry="7" fill="#C87941"/>
          <path d="M-54 -50 Q-60 0 -54 32" fill="none" stroke="#E8896A" strokeWidth="6" strokeLinecap="round" opacity="0.4"/>
  
          {/* Handle */}
          <path d="M58 -18 Q90 -18 90 12 Q90 42 58 42" fill="none" stroke="#B04E30" strokeWidth="9" strokeLinecap="round"/>
  
          {/* Eyes */}
          <circle cx="-16" cy="-28" r="5" fill="white"/>
          <circle cx="-14" cy="-26" r="3" fill="#7A3520"/>
          <circle cx="16"  cy="-28" r="5" fill="white"/>
          <circle cx="18"  cy="-26" r="3" fill="#7A3520"/>
  
          {/* Cheeks */}
          <ellipse cx="-22" cy="-14" rx="8" ry="5" fill="#F2B49A" opacity="0.7"/>
          <ellipse cx="22"  cy="-14" rx="8" ry="5" fill="#F2B49A" opacity="0.7"/>
  
          {/* Smile */}
          <path d="M-14 -6 Q0 10 14 -6" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"/>
        </g>
      </svg>
    );
  }