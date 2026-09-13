"use client";

import React from "react";
import Image from "next/image";
import posthog from "posthog-js";

const Explorebtn = () => {
  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto"
      onClick={() => {
        posthog.capture("events_explored");
        console.log("Clicked");
      }}
    >
      <a href="#events">
        Explore events
        <Image
          src="/icons/arrow-down.svg"
          alt="arrow-down"
          width={24}
          height={24}
        />
      </a>
    </button>
  );
};

export default Explorebtn;
