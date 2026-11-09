import React from "react";

export function SimovisLogoIcon({ className = "w-12 h-12", ...props }) {
  return (
    <svg
      width="76"
      height="83"
      viewBox="0 0 76 83"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M15.7869 40.8313C10.4373 61.9657 26.0677 70.4154 34.5515 71.9985C33.7981 81.0532 41.4632 82.7541 45.7115 78.2367L73.5364 28.4589C74.3544 19.2888 65.5831 18.6064 62.3765 22.2207C45.8555 6.15229 31.2572 16.2382 25.6949 23.1062C13.4139 26.5803 13.9724 36.3705 15.7869 40.8313Z"
        fill="#4D0077"
      />
      <g filter="url(#filter0_d_1_941)">
        <path
          d="M37.9603 68.0181L61.4453 26.0043"
          stroke="white"
          strokeWidth="2.64136"
          strokeLinecap="round"
        />
      </g>
      <mask
        id="mask0_1_941"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="14"
        y="13"
        width="60"
        height="68"
      >
        <path
          d="M15.7869 40.8314C10.4373 61.9658 26.0677 70.4156 34.5515 71.9986C33.7981 81.0533 41.4632 82.7542 45.7115 78.2368L73.5364 28.4591C74.3544 19.2889 65.5831 18.6066 62.3765 22.2209C45.8555 6.15242 31.2572 16.2383 25.6949 23.1063C13.4139 26.5805 13.9724 36.3706 15.7869 40.8314Z"
          fill="#4D0077"
        />
      </mask>
      <g mask="url(#mask0_1_941)">
        <path
          d="M27.6188 49.0284C28.1019 49.3027 28.7106 49.1305 28.9784 48.6438C29.2462 48.1571 29.0717 47.5401 28.5886 47.2658L28.1037 48.1471L27.6188 49.0284ZM15.2865 40.8693L14.8016 41.7506L27.6188 49.0284L28.1037 48.1471L28.5886 47.2658L15.7714 39.988L15.2865 40.8693Z"
          fill="white"
        />
        <path
          d="M37.7152 30.6776C38.1983 30.9519 38.807 30.7797 39.0748 30.2929C39.3426 29.8062 39.1681 29.1893 38.685 28.915L38.2001 29.7963L37.7152 30.6776ZM25.3829 22.5184L24.898 23.3997L37.7152 30.6776L38.2001 29.7963L38.685 28.915L25.8678 21.6371L25.3829 22.5184Z"
          fill="white"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1_941"
          x="30.1426"
          y="19.8108"
          width="39.1204"
          height="57.6492"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy="1.62419" />
          <feGaussianBlur stdDeviation="3.24838" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.56 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_1_941"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1_941"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
