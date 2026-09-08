import { motion, type Transition } from 'motion/react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export interface VerticalCutRevealProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  reverse?: boolean;
  transition?: Transition;
  splitBy?: 'words' | 'characters' | 'lines' | string;
  staggerDuration?: number;
  staggerFrom?: 'first' | 'last' | 'center' | 'random' | number;
  containerClassName?: string;
  wordLevelClassName?: string;
  elementLevelClassName?: string;
  onClick?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

export interface VerticalCutRevealRef {
  startAnimation: () => void;
  reset: () => void;
  restart: () => void;
}

interface WordObject {
  characters: string[];
  needsSpace: boolean;
}

export const VerticalCutReveal = forwardRef<VerticalCutRevealRef, VerticalCutRevealProps>(
  (
    {
      children,
      reverse = false,
      transition = {
        type: 'spring',
        stiffness: 190,
        damping: 22,
      },
      splitBy = 'words',
      staggerDuration = 0.03,
      staggerFrom = 'first',
      containerClassName,
      wordLevelClassName,
      elementLevelClassName,
      onClick,
      onStart,
      onComplete,
      autoStart = true,
      ...props
    },
    ref
  ) => {
    const containerRef = useRef<HTMLSpanElement>(null);
    const text =
      typeof children === 'string' ? children : children?.toString() || '';
    const [isAnimating, setIsAnimating] = useState(false);

    // Split text into characters with support for unicode and emojis
    const splitIntoCharacters = (input: string): string[] => {
      if (typeof Intl !== 'undefined' && 'Segmenter' in (Intl as unknown as Record<string, unknown>)) {
        const segmenter = new (Intl as any).Segmenter('en', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(input), (item: any) => item.segment);
      }
      return Array.from(input);
    };

    // Split text based on splitBy parameter
    const elements = useMemo(() => {
      const words = text.split(' ');
      if (splitBy === 'characters') {
        return words.map((word, i) => ({
          characters: splitIntoCharacters(word),
          needsSpace: i !== words.length - 1,
        }));
      }
      return splitBy === 'words'
        ? text.split(' ')
        : splitBy === 'lines'
          ? text.split('\n')
          : text.split(splitBy);
    }, [text, splitBy]);

    // Calculate stagger delays based on staggerFrom
    const getStaggerDelay = useCallback(
      (index: number) => {
        const total =
          splitBy === 'characters'
            ? (elements as WordObject[]).reduce(
                (acc, word) =>
                  acc +
                  (typeof word === 'string'
                    ? 1
                    : word.characters.length + (word.needsSpace ? 1 : 0)),
                0
              )
            : elements.length;

        if (staggerFrom === 'first') return index * staggerDuration;
        if (staggerFrom === 'last') return (total - 1 - index) * staggerDuration;
        if (staggerFrom === 'center') {
          const center = Math.floor(total / 2);
          return Math.abs(center - index) * staggerDuration;
        }
        if (staggerFrom === 'random') {
          const randomIndex = Math.floor(Math.random() * total);
          return Math.abs(randomIndex - index) * staggerDuration;
        }
        return Math.abs((staggerFrom as number) - index) * staggerDuration;
      },
      [elements, staggerFrom, staggerDuration, splitBy]
    );

    const startAnimation = useCallback(() => {
      setIsAnimating(true);
      onStart?.();
    }, [onStart]);

    const isRestartingRef = useRef(false);

    const restart = useCallback(() => {
      if (isRestartingRef.current) return;
      isRestartingRef.current = true;
      setIsAnimating(false);
      const timer = setTimeout(() => {
        setIsAnimating(true);
        setTimeout(() => {
          isRestartingRef.current = false;
        }, 300);
      }, 40);
      return () => clearTimeout(timer);
    }, []);

    // Expose the startAnimation and restart functions via ref
    useImperativeHandle(ref, () => ({
      startAnimation,
      reset: () => setIsAnimating(false),
      restart,
    }));

    // Auto start animation
    useEffect(() => {
      if (autoStart) {
        startAnimation();
      }
    }, [autoStart, startAnimation]);

    const baseDelay = (transition && 'delay' in transition && typeof transition.delay === 'number')
      ? transition.delay
      : 0;

    const variants = {
      hidden: { y: reverse ? '-100%' : '100%' },
      visible: (i: number) => ({
        y: 0,
        transition: {
          ...transition,
          delay: baseDelay + getStaggerDelay(i),
        },
      }),
    };

    return (
      <span
        className={cn(
          'flex flex-wrap whitespace-pre-wrap',
          splitBy === 'lines' && 'flex-col',
          containerClassName
        )}
        onClick={onClick}
        ref={containerRef}
        {...props}
      >
        <span className="sr-only">{text}</span>

        {(splitBy === 'characters'
          ? (elements as WordObject[])
          : (elements as string[]).map((el, i) => ({
              characters: [el],
              needsSpace: i !== elements.length - 1,
            }))
        ).map((wordObj, wordIndex, array) => {
          const previousCharsCount = array
            .slice(0, wordIndex)
            .reduce((sum, word) => sum + word.characters.length, 0);

          return (
            <span
              key={wordIndex}
              aria-hidden="true"
              className={cn('inline-flex overflow-hidden', wordLevelClassName)}
            >
              {wordObj.characters.map((char, charIndex) => (
                <span
                  className={cn(
                    'whitespace-pre-wrap relative',
                    elementLevelClassName
                  )}
                  key={charIndex}
                >
                  <motion.span
                    custom={previousCharsCount + charIndex}
                    initial="hidden"
                    animate={isAnimating ? 'visible' : 'hidden'}
                    variants={variants}
                    onAnimationComplete={
                      wordIndex === elements.length - 1 &&
                      charIndex === wordObj.characters.length - 1
                        ? onComplete
                        : undefined
                    }
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                </span>
              ))}
              {wordObj.needsSpace && <span>&nbsp;</span>}
            </span>
          );
        })}
      </span>
    );
  }
);

VerticalCutReveal.displayName = 'VerticalCutReveal';
export default VerticalCutReveal;
