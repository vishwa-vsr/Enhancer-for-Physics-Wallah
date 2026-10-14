import { useState } from 'preact/hooks';
import { customTags, addCustomTag, deleteCustomTag } from '../store';
import styles from './SettingsView.module.css';

import { PRESET_COLORS } from '@shared/colors';

import pwLogoImg from '../../icons/icon48.png';
import chromeImg from '../../icons/chrome.png';
import firefoxImg from '../../icons/firefox.png';
import edgeImg from '../../icons/edge.png';

// ----------------- Brand & Action Icons -----------------

const getLogoSrc = (filename: string, bundledUrl: string) => {
  return typeof chrome !== 'undefined' && chrome.runtime?.getURL
    ? chrome.runtime.getURL(`icons/${filename}`)
    : bundledUrl;
};

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="#FFFFFF">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
    />
  </svg>
);

const DiscussionIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <path
      d="M17 18.5a6.5 6.5 0 0 0 1.8-4.6c0-3.6-3.4-6.5-7.5-6.5-4.1 0-7.5 2.9-7.5 6.5 0 2.2 1.3 4.1 3.2 5.2L6 21.5l3.5-1.2c.5.1 1.1.2 1.8.2 1.3 0 2.6-.3 3.7-.9l3.5 1.2-1.5-2.3Z"
      stroke="#a855f7"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(168, 85, 247, 0.2)"
    />
  </svg>
);

const FeedbackIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="4"
      fill="rgba(124, 58, 237, 0.2)"
      stroke="#8b5cf6"
      strokeWidth={2}
    />
    <path d="M7 8h10M7 12h10M7 16h6" stroke="#c4b5fd" strokeWidth={2} strokeLinecap="round" />
  </svg>
);

const RocketIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
    <path
      d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
      stroke="#0284c7"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="rgba(2, 132, 199, 0.2)"
    />
    <path
      d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
      stroke="#38bdf8"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
      stroke="#f59e0b"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
      stroke="#f59e0b"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WebsiteAppIcon = () => (
  <img
    src={getLogoSrc('icon48.png', pwLogoImg)}
    alt="Enhancer for PW"
    width={22}
    height={22}
    style={{ borderRadius: '5px' }}
  />
);

const ChromeIcon = () => (
  <img
    src={getLogoSrc('chrome.png', chromeImg)}
    alt="Google Chrome"
    width={22}
    height={22}
  />
);

const FirefoxIcon = () => (
  <img
    src={getLogoSrc('firefox.png', firefoxImg)}
    alt="Mozilla Firefox"
    width={22}
    height={22}
  />
);

const EdgeIcon = () => (
  <img
    src={getLogoSrc('edge.png', edgeImg)}
    alt="Microsoft Edge"
    width={22}
    height={22}
  />
);

const ExternalArrowIcon = () => (
  <svg
    class={styles.arrowIcon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width="14"
    height="14"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// ----------------- Link Item Definition -----------------

interface LinkItem {
  title: string;
  desc: string;
  url: string;
  icon: () => preact.JSX.Element;
}

const COMMUNITY_LINKS: LinkItem[] = [
  {
    title: 'GitHub',
    desc: 'Explore source code & star repository',
    url: 'https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah',
    icon: GithubIcon,
  },
  {
    title: 'Discussions',
    desc: 'Share ideas, ask questions & chat',
    url: 'https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/discussions/23',
    icon: DiscussionIcon,
  },
  {
    title: 'Feedback',
    desc: 'Suggest improvements & report bugs',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdquONSDYSILWZd-ubkmk9pi_TVNXa65b8G7fpbOCbO3UCHdg/viewform',
    icon: FeedbackIcon,
  },
  {
    title: 'Latest Release',
    desc: 'View latest update changelog & releases',
    url: 'https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/releases',
    icon: RocketIcon,
  },
];

const PLATFORM_LINKS: LinkItem[] = [
  {
    title: 'Official Website',
    desc: 'Features guide & official portal',
    url: 'https://enhancerforpw.vercel.app/',
    icon: WebsiteAppIcon,
  },
  {
    title: 'Chrome Web Store',
    desc: 'Rate & review on Google Chrome',
    url: 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj',
    icon: ChromeIcon,
  },
  {
    title: 'Firefox Add-ons',
    desc: 'Rate & review on Mozilla Firefox',
    url: 'https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/',
    icon: FirefoxIcon,
  },
  {
    title: 'Microsoft Edge Add-ons',
    desc: 'Rate & review on Microsoft Edge',
    url: 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan',
    icon: EdgeIcon,
  },
];

export const SettingsView = () => {
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [labelError, setLabelError] = useState('');

  const handleAddLabel = async (e: Event) => {
    e.preventDefault();
    setLabelError('');
    const trimmed = newLabelName.trim();
    if (!trimmed) {
      setLabelError('Please enter a label name.');
      return;
    }
    const success = await addCustomTag(trimmed, selectedColor);
    if (!success) {
      setLabelError(`Label '${trimmed}' already exists.`);
      return;
    }
    setNewLabelName('');
  };

  const handleDeleteLabel = async (name: string) => {
    await deleteCustomTag(name);
  };

  const openLink = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div class={styles.container}>
      {/* Header */}
      <div class={styles.headerRow}>
        <h1 class={styles.title}>Settings</h1>
      </div>

      {/* Study Labels Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Study Labels</h2>
          <p class={styles.cardDesc}>
            Manage labels used to organize and categorize your tasks.
          </p>
        </div>

        {/* Existing labels */}
        <div class={styles.labelsGrid}>
          {customTags.value.map((tag) => (
            <span
              key={tag.name}
              class={styles.labelChip}
              style={{ borderColor: `${tag.color}40` }}
            >
              <span class={styles.labelDot} style={{ backgroundColor: tag.color }} />
              <span>{tag.name}</span>
              <button
                type="button"
                class={styles.labelDeleteBtn}
                title={`Delete label "${tag.name}"`}
                onClick={() => handleDeleteLabel(tag.name)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} width="12" height="12">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>

        {/* Create new label */}
        <div class={styles.addLabelSection}>
          <form onSubmit={handleAddLabel}>
            <div class={styles.formRow}>
              <input
                type="text"
                class={styles.tagInput}
                placeholder="New label name (e.g. PYQs, Formula Sheet)..."
                value={newLabelName}
                onInput={(e) => {
                  setNewLabelName((e.target as HTMLInputElement).value);
                  if (labelError) setLabelError('');
                }}
              />
              <button type="submit" class={styles.addTagBtn}>
                + Add Label
              </button>
            </div>

            <div class={styles.colorPickerRow}>
              <span class={styles.colorPickerLabel}>Color:</span>
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  class={`${styles.colorDot} ${selectedColor === c ? styles.colorDotSelected : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setSelectedColor(c)}
                  title={c}
                />
              ))}
            </div>

            {labelError && <p class={styles.errorText}>{labelError}</p>}
          </form>
        </div>
      </div>

      {/* Community & Updates */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Community & Updates</h2>
        </div>
        <div class={styles.cardsGrid}>
          {COMMUNITY_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.url}
                class={styles.linkCard}
                onClick={(e) => {
                  e.preventDefault();
                  openLink(item.url);
                }}
              >
                <div class={styles.linkCardLeft}>
                  <div class={styles.iconBadge}>
                    <Icon />
                  </div>
                  <div class={styles.linkInfo}>
                    <span class={styles.linkTitle}>{item.title}</span>
                    <span class={styles.linkDesc}>{item.desc}</span>
                  </div>
                </div>
                <ExternalArrowIcon />
              </a>
            );
          })}
        </div>
      </div>

      {/* Platforms & Web Stores */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Platforms & Web Stores</h2>
        </div>
        <div class={styles.cardsGrid}>
          {PLATFORM_LINKS.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.title}
                href={item.url}
                class={styles.linkCard}
                onClick={(e) => {
                  e.preventDefault();
                  openLink(item.url);
                }}
              >
                <div class={styles.linkCardLeft}>
                  <div class={styles.iconBadge}>
                    <Icon />
                  </div>
                  <div class={styles.linkInfo}>
                    <span class={styles.linkTitle}>{item.title}</span>
                    <span class={styles.linkDesc}>{item.desc}</span>
                  </div>
                </div>
                <ExternalArrowIcon />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
