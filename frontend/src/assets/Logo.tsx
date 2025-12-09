type Props = {
  className?: string;
};

const LeasyLogo = ({ className }: Props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      fill="none"
      viewBox="0 0 32 32"
      className={className}
    >
      <g clipPath="url(#a)">
        <path
          fill="#7065F0"
          stroke="#7065F0"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="m25.333 11.613-7.11-5.53a3.555 3.555 0 0 0-4.366 0l-7.112 5.53a3.554 3.554 0 0 0-1.372 2.807v9.6a2.667 2.667 0 0 0 2.667 2.667h16a2.667 2.667 0 0 0 2.667-2.667v-9.6a3.554 3.554 0 0 0-1.374-2.807Z"
        />
        <circle cx="11.5" cy="15.5" r="1.5" fill="#fff" />
        <circle cx="20.5" cy="15.5" r="1.5" fill="#fff" />
        <path
          stroke="#F9FAFB"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M21.333 20c-2.946 1.777-7.722 1.777-10.666 0"
        />
      </g>
      <defs>
        <clipPath id="a">
          <path fill="#fff" d="M0 0h32v32H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default LeasyLogo;
