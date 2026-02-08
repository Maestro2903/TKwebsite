"use client";

import "./music-portfolio.css";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import { gsap } from "gsap";

export interface ProjectData {
  id: number;
  artist: string;
  album: string;
  category: string;
  label: string;
  year: string;
  image: string;
}

export interface MusicPortfolioConfig {
  timeZone?: string;
  timeUpdateInterval?: number;
  idleDelay?: number;
  debounceDelay?: number;
}

export interface MusicPortfolioProps {
  PROJECTS_DATA: ProjectData[];
  CONFIG?: MusicPortfolioConfig;
  SOCIAL_LINKS?: { spotify?: string; email?: string; x?: string };
  LOCATION?: { latitude?: string; longitude?: string; display?: boolean };
  CALLBACKS?: Record<string, (arg?: unknown) => void>;
}

const defaultConfig: MusicPortfolioConfig = {
  timeZone: "Asia/Kolkata",
  timeUpdateInterval: 1000,
  idleDelay: 4000,
  debounceDelay: 100,
};

// Time Display Component
const TimeDisplay = ({
  CONFIG = {},
}: {
  CONFIG: MusicPortfolioConfig;
}) => {
  const [time, setTime] = useState({
    hours: "",
    minutes: "",
    dayPeriod: "",
  });
  const cfg = { ...defaultConfig, ...CONFIG };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = {
        timeZone: cfg.timeZone,
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      const formatter = new Intl.DateTimeFormat("en-US", options);
      const parts = formatter.formatToParts(now);

      setTime({
        hours: parts.find((p) => p.type === "hour")?.value ?? "",
        minutes: parts.find((p) => p.type === "minute")?.value ?? "",
        dayPeriod: parts.find((p) => p.type === "dayPeriod")?.value ?? "",
      });
    };

    updateTime();
    const interval = setInterval(
      updateTime,
      cfg.timeUpdateInterval ?? 1000
    );
    return () => clearInterval(interval);
  }, [cfg.timeZone, cfg.timeUpdateInterval]);

  return (
    <time
      className="sana-music-portfolio__corner-item sana-music-portfolio__corner-item--bottom-right"
      id="current-time"
    >
      {time.hours}
      <span className="sana-music-portfolio__time-blink">:</span>
      {time.minutes} {time.dayPeriod}
    </time>
  );
};

// Project Item Component (forwardRef for idle animation targets)
const ProjectItem = forwardRef<
  HTMLLIElement,
  {
    project: ProjectData;
    index: number;
    onMouseEnter: (index: number, imageUrl: string) => void;
    onMouseLeave: () => void;
    isActive: boolean;
    isIdle: boolean;
  }
>(function ProjectItem(
  { project, index, onMouseEnter, onMouseLeave, isActive },
  ref
) {
  const textRefs = {
    artist: useRef<HTMLSpanElement>(null),
    album: useRef<HTMLSpanElement>(null),
    category: useRef<HTMLSpanElement>(null),
    label: useRef<HTMLSpanElement>(null),
    year: useRef<HTMLSpanElement>(null),
  };

  useEffect(() => {
    const entries: [string, string][] = [
      ["artist", project.artist],
      ["album", project.album],
      ["category", project.category],
      ["label", project.label],
      ["year", project.year],
    ];

    entries.forEach(([key, value]) => {
      const el = textRefs[key as keyof typeof textRefs].current;
      if (!el) return;
      gsap.killTweensOf(el);
      if (isActive) {
        gsap.fromTo(
          el,
          { opacity: 0.3 },
          { opacity: 1, duration: 0.4, ease: "power2.out" }
        );
      }
      el.textContent = value;
    });
  }, [isActive, project]);

  return (
    <li
      ref={ref}
      className={`sana-music-portfolio__project-item ${isActive ? "sana-music-portfolio__project-item--active" : ""}`}
      onMouseEnter={() => onMouseEnter(index, project.image)}
      onMouseLeave={onMouseLeave}
      data-image={project.image}
    >
      <span
        ref={textRefs.artist}
        className="sana-music-portfolio__project-data sana-music-portfolio__project-data--artist"
      >
        {project.artist}
      </span>
      <span
        ref={textRefs.album}
        className="sana-music-portfolio__project-data sana-music-portfolio__project-data--album"
      >
        {project.album}
      </span>
      <span
        ref={textRefs.category}
        className="sana-music-portfolio__project-data sana-music-portfolio__project-data--category"
      >
        {project.category}
      </span>
      <span
        ref={textRefs.label}
        className="sana-music-portfolio__project-data sana-music-portfolio__project-data--label"
      >
        {project.label}
      </span>
      <span
        ref={textRefs.year}
        className="sana-music-portfolio__project-data sana-music-portfolio__project-data--year"
      >
        {project.year}
      </span>
    </li>
  );
});

// Main Portfolio Component
const MusicPortfolio = ({
  PROJECTS_DATA = [],
  CONFIG = {},
  SOCIAL_LINKS = {},
  LOCATION = {},
}: MusicPortfolioProps) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isIdle, setIsIdle] = useState(true);

  const backgroundRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idleAnimationRef = useRef<gsap.core.Timeline | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const projectItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  const cfg = { ...defaultConfig, ...CONFIG };

  // Preload images
  useEffect(() => {
    PROJECTS_DATA.forEach((project) => {
      if (project.image) {
        const img = new Image();
        img.src = project.image;
      }
    });
  }, [PROJECTS_DATA]);

  const startIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) return;

    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 2,
    });

    projectItemsRef.current.forEach((item, index) => {
      if (!item) return;

      const hideTime = 0 + index * 0.05;
      const showTime =
        0 + PROJECTS_DATA.length * 0.05 * 0.5 + index * 0.05;

      timeline.to(
        item,
        {
          opacity: 0.05,
          duration: 0.1,
          ease: "power2.inOut",
        },
        hideTime
      );

      timeline.to(
        item,
        {
          opacity: 1,
          duration: 0.1,
          ease: "power2.inOut",
        },
        showTime
      );
    });

    idleAnimationRef.current = timeline;
  }, [PROJECTS_DATA.length]);

  const stopIdleAnimation = useCallback(() => {
    if (idleAnimationRef.current) {
      idleAnimationRef.current.kill();
      idleAnimationRef.current = null;

      projectItemsRef.current.forEach((item) => {
        if (item) {
          gsap.set(item, { opacity: 1 });
        }
      });
    }
  }, []);

  const startIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    idleTimerRef.current = setTimeout(() => {
      setIsIdle(true);
      startIdleAnimation();
    }, cfg.idleDelay ?? 4000);
  }, [cfg.idleDelay, startIdleAnimation]);

  const stopIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
  }, []);

  const handleProjectMouseEnter = useCallback(
    (index: number, imageUrl: string) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      stopIdleAnimation();
      stopIdleTimer();
      setIsIdle(false);

      if (activeIndex === index) return;

      setActiveIndex(index);

      if (imageUrl && backgroundRef.current) {
        const bg = backgroundRef.current;
        bg.style.transition = "none";
        bg.style.transform = "translate(-50%, -50%) scale(1.2)";
        bg.style.backgroundImage = `url(${imageUrl})`;
        bg.style.opacity = "1";

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bg.style.transition =
              "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
            bg.style.transform = "translate(-50%, -50%) scale(1.0)";
          });
        });
      }
    },
    [activeIndex, stopIdleAnimation, stopIdleTimer]
  );

  const handleProjectMouseLeave = useCallback(() => {
    debounceRef.current = setTimeout(() => {}, cfg.debounceDelay ?? 50);
  }, [cfg.debounceDelay]);

  const handleContainerMouseLeave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    setActiveIndex(-1);

    if (backgroundRef.current) {
      backgroundRef.current.style.opacity = "0";
    }

    startIdleTimer();
  }, [startIdleTimer]);

  useEffect(() => {
    startIdleTimer();
    return () => {
      stopIdleTimer();
      stopIdleAnimation();
    };
  }, [startIdleTimer, stopIdleTimer, stopIdleAnimation]);

  const locationDisplay =
    LOCATION.latitude && LOCATION.longitude && LOCATION.display !== false
      ? `${LOCATION.latitude}, ${LOCATION.longitude}`
      : null;

  return (
    <div className="sana-music-portfolio">
      <main
        ref={containerRef}
        className={`sana-music-portfolio__container-inner ${activeIndex !== -1 ? "sana-music-portfolio__container-inner--has-active" : ""}`}
        onMouseLeave={handleContainerMouseLeave}
      >
        <h1 className="sr-only">Music Portfolio</h1>
        <ul className="sana-music-portfolio__project-list" role="list">
          {PROJECTS_DATA.map((project, index) => (
            <ProjectItem
              key={project.id}
              ref={(el) => {
                projectItemsRef.current[index] = el;
              }}
              project={project}
              index={index}
              onMouseEnter={handleProjectMouseEnter}
              onMouseLeave={handleProjectMouseLeave}
              isActive={activeIndex === index}
              isIdle={isIdle}
            />
          ))}
        </ul>
      </main>

      <div
        ref={backgroundRef}
        className="sana-music-portfolio__background-image"
        id="backgroundImage"
        role="img"
        aria-hidden="true"
      />

      <aside className="sana-music-portfolio__corner-elements">
        <div className="sana-music-portfolio__corner-item sana-music-portfolio__corner-item--top-left">
          <div
            className="sana-music-portfolio__corner-square"
            aria-hidden="true"
          />
        </div>
        <nav className="sana-music-portfolio__corner-item sana-music-portfolio__corner-item--top-right">
          {SOCIAL_LINKS.spotify && (
            <>
              <a
                href={SOCIAL_LINKS.spotify}
                target="_blank"
                rel="noopener noreferrer"
              >
                Spotify
              </a>
              {" | "}
            </>
          )}
          {SOCIAL_LINKS.email && (
            <>
              <a href={SOCIAL_LINKS.email}>Email</a>
              {" | "}
            </>
          )}
          {SOCIAL_LINKS.x && (
            <a
              href={SOCIAL_LINKS.x}
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          )}
          {!SOCIAL_LINKS.spotify && !SOCIAL_LINKS.email && !SOCIAL_LINKS.x && (
            <span className="sana-music-portfolio__corner-placeholder">
              Links
            </span>
          )}
        </nav>
        {locationDisplay && (
          <div className="sana-music-portfolio__corner-item sana-music-portfolio__corner-item--bottom-left">
            {locationDisplay}
          </div>
        )}
        <TimeDisplay CONFIG={cfg} />
      </aside>
    </div>
  );
};

export default MusicPortfolio;
