import { useState, useRef, useEffect } from 'preact/hooks';
import {
  customTags,
  addCustomTag,
  updateCustomTag,
  deleteCustomTag,
  tasks,
  subjects,
  chapters,
} from '../store';
import styles from './SettingsView.module.css';

import { PRESET_COLORS } from '@shared/colors';
import { ColorPicker } from '@shared/components/ColorPicker';
import { Toggle } from '@shared/components/Toggle';
import { ConfirmDeleteButton } from '@shared/components/ConfirmDeleteButton';
import { getAlphaColor } from '@shared/theme';
import {
  showDashboardScrollbars,
  showPopupScrollbar,
  toggleDashboardScrollbars,
  togglePopupScrollbar,
} from '@shared/scrollbars';

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
  <svg viewBox="0 0 24 24" width="18" height="18" fill="#FFFFFF">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
    />
  </svg>
);

const DiscussionIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
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
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
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
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
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
    width={18}
    height={18}
    style={{ borderRadius: '4px' }}
  />
);

const ChromeIcon = () => (
  <img src={getLogoSrc('chrome.png', chromeImg)} alt="Google Chrome" width={18} height={18} />
);

const FirefoxIcon = () => (
  <img src={getLogoSrc('firefox.png', firefoxImg)} alt="Mozilla Firefox" width={18} height={18} />
);

const EdgeIcon = () => (
  <img src={getLogoSrc('edge.png', edgeImg)} alt="Microsoft Edge" width={18} height={18} />
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
    width="11"
    height="11"
  >
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// ----------------- Link Item Definition -----------------

interface LinkItem {
  title: string;
  url: string;
  icon: () => preact.JSX.Element;
}

const COMMUNITY_AND_STORE_LINKS: LinkItem[] = [
  {
    title: 'GitHub',
    url: 'https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah',
    icon: GithubIcon,
  },
  {
    title: 'Discussions',
    url: 'https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/discussions/23',
    icon: DiscussionIcon,
  },
  {
    title: 'Feedback',
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSdquONSDYSILWZd-ubkmk9pi_TVNXa65b8G7fpbOCbO3UCHdg/viewform',
    icon: FeedbackIcon,
  },
  {
    title: 'Latest Release',
    url: 'https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/releases',
    icon: RocketIcon,
  },
  {
    title: 'Official Website',
    url: 'https://enhancerforpw.vercel.app/',
    icon: WebsiteAppIcon,
  },
  {
    title: 'Chrome Web Store',
    url: 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj',
    icon: ChromeIcon,
  },
  {
    title: 'Firefox Add-ons',
    url: 'https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/',
    icon: FirefoxIcon,
  },
  {
    title: 'Edge Add-ons',
    url: 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan',
    icon: EdgeIcon,
  },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const SettingsView = () => {
  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [labelError, setLabelError] = useState('');
  const [editingTag, setEditingTag] = useState<{ name: string; color: string } | null>(null);
  const [storageBytes, setStorageBytes] = useState<number | null>(null);
  const [storageQuota, setStorageQuota] = useState<number>(10 * 1024 * 1024);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const measureStorage = () => {
      if (typeof chrome !== 'undefined' && chrome.storage?.local?.getBytesInUse) {
        chrome.storage.local.getBytesInUse(null, (bytes) => {
          setStorageBytes(bytes || 0);
        });
        if (chrome.storage.local.QUOTA_BYTES) {
          setStorageQuota(chrome.storage.local.QUOTA_BYTES);
        }
      } else {
        try {
          const raw = localStorage.getItem('pw_study_planner_data') || '';
          const bytes = new Blob([raw]).size;
          setStorageBytes(bytes);
          setStorageQuota(5 * 1024 * 1024);
        } catch {
          setStorageBytes(0);
        }
      }
    };

    measureStorage();
  }, [tasks.value, subjects.value, chapters.value, customTags.value]);

  const handleStartEdit = (tag: { name: string; color: string }) => {
    setEditingTag(tag);
    setNewLabelName(tag.name);
    setSelectedColor(tag.color);
    setLabelError('');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, 50);
  };

  const handleCancelEdit = () => {
    setEditingTag(null);
    setNewLabelName('');
    setSelectedColor(PRESET_COLORS[0]);
    setLabelError('');
  };

  const handleFormSubmit = async (e: Event) => {
    e.preventDefault();
    setLabelError('');
    const trimmed = newLabelName.trim();
    if (!trimmed) {
      setLabelError('Please enter a label name.');
      return;
    }

    if (editingTag) {
      const success = await updateCustomTag(editingTag.name, trimmed, selectedColor);
      if (!success) {
        setLabelError(`Label '${trimmed}' already exists.`);
        return;
      }
      handleCancelEdit();
    } else {
      const success = await addCustomTag(trimmed, selectedColor);
      if (!success) {
        setLabelError(`Label '${trimmed}' already exists.`);
        return;
      }
      setNewLabelName('');
    }
  };

  const handleDeleteLabel = async (name: string) => {
    if (editingTag && editingTag.name.toLowerCase() === name.toLowerCase()) {
      handleCancelEdit();
    }
    await deleteCustomTag(name);
  };

  const openLink = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const usedBytes = storageBytes ?? 0;
  const usedPercent = storageQuota > 0 ? (usedBytes / storageQuota) * 100 : 0;
  const visualFillPercent = Math.min(100, Math.max(usedPercent, 2));

  const totalTasks = tasks.value.length;
  const totalSubjects = subjects.value.length;
  const totalChapters = chapters.value.length;
  const totalLabels = customTags.value.length;

  return (
    <div class={styles.container}>
      <div class={styles.columnsGrid}>
        {/* Left Column: Appearance (Top) + Study Labels (Bottom) */}
        <div class={styles.column}>
          {/* 1. Appearance Card (Compact) */}
          <div class={`${styles.card} ${styles.appearanceCard}`}>
            <div class={styles.cardHeader}>
              <div class={styles.cardTitleGroup}>
                <div class={styles.cardIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z" />
                    <path d="M12 2v20" />
                  </svg>
                </div>
                <h2 class={styles.cardTitle}>Appearance</h2>
              </div>
            </div>

            <div class={styles.appearanceRow}>
              <div class={styles.settingBox}>
                <span class={styles.settingLabel}>Dashboard Scrollbar</span>
                <Toggle
                  checked={showDashboardScrollbars.value}
                  onChange={(val) => toggleDashboardScrollbars(val)}
                  ariaLabel="Toggle Dashboard Scrollbar"
                />
              </div>

              <div class={styles.settingBox}>
                <span class={styles.settingLabel}>Popup Scrollbar</span>
                <Toggle
                  checked={showPopupScrollbar.value}
                  onChange={(val) => togglePopupScrollbar(val)}
                  ariaLabel="Toggle Popup Scrollbar"
                />
              </div>
            </div>
          </div>

          {/* 2. Study Labels Card */}
          <div class={styles.card}>
            <div class={styles.cardHeader}>
              <div class={styles.cardTitleGroup}>
                <div class={styles.cardIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <h2 class={styles.cardTitle}>Study Labels</h2>
              </div>
              <span class={styles.cardBadge}>{customTags.value.length} labels</span>
            </div>

            {/* Existing tags list */}
            <div class={styles.labelsGrid}>
              {customTags.value.map((tag) => {
                const isEditing = editingTag?.name.toLowerCase() === tag.name.toLowerCase();
                return (
                  <span
                    key={tag.name}
                    class={`${styles.labelChip} ${isEditing ? styles.labelChipEditing : ''}`}
                    style={{
                      backgroundColor: getAlphaColor(tag.color, 0.14),
                      borderColor: `${tag.color}45`,
                    }}
                    onClick={() => handleStartEdit(tag)}
                    title={`Click to edit or delete "${tag.name}"`}
                  >
                    <span class={styles.labelChipText}>{tag.name}</span>
                  </span>
                );
              })}
            </div>

            {/* Create / Edit label form */}
            <div class={styles.addLabelSection}>
              <form onSubmit={handleFormSubmit}>
                <div class={styles.formStack}>
                  <input
                    ref={inputRef}
                    type="text"
                    class={styles.tagInput}
                    placeholder={
                      editingTag
                        ? 'Update label name...'
                        : 'New label name (e.g. PYQs, Formula Sheet)...'
                    }
                    value={newLabelName}
                    onInput={(e) => {
                      setNewLabelName((e.target as HTMLInputElement).value);
                      if (labelError) setLabelError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape' && editingTag) {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <div class={styles.formActionsRow}>
                    <div class={styles.colorAndActionRow}>
                      <div class={styles.colorPickerWrap}>
                        <ColorPicker
                          value={selectedColor}
                          onChange={(c) => setSelectedColor(c)}
                          align="left"
                          size="sm"
                        />
                      </div>
                      {editingTag && (
                        <ConfirmDeleteButton
                          onConfirm={() => handleDeleteLabel(editingTag.name)}
                          label="Delete"
                          confirmLabel="Confirm?"
                          className={styles.deleteLabelBtn}
                        />
                      )}
                    </div>
                    <div class={styles.btnGroup}>
                      {editingTag && (
                        <button
                          type="button"
                          class={styles.cancelTagBtn}
                          onClick={handleCancelEdit}
                        >
                          Cancel
                        </button>
                      )}
                      <button type="submit" class={styles.addTagBtn}>
                        {editingTag ? 'Save Changes' : '+ Add Label'}
                      </button>
                    </div>
                  </div>
                </div>

                {labelError && <p class={styles.errorText}>{labelError}</p>}
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Storage & Data (Top) + Community & Stores (Bottom) */}
        <div class={styles.column}>
          {/* Storage & Data Card */}
          <div class={styles.card}>
            <div class={styles.cardHeader}>
              <div class={styles.cardTitleGroup}>
                <div class={styles.cardIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                  </svg>
                </div>
                <h2 class={styles.cardTitle}>Storage & Data</h2>
              </div>
              <div class={styles.storageUsageTitle}>
                <span class={styles.storageUsedText}>{formatBytes(usedBytes)}</span>
                <span class={styles.storageTotalText}>/ {formatBytes(storageQuota)}</span>
              </div>
            </div>

            <div
              class={styles.storageTrack}
              role="progressbar"
              aria-valuenow={usedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Storage Usage Meter"
            >
              <div class={styles.storageFill} style={{ width: `${visualFillPercent}%` }} />
            </div>

            <div class={styles.storageStatsGrid}>
              <div class={styles.storageStatCard}>
                <span class={styles.storageStatNumber}>{totalTasks}</span>
                <span class={styles.storageStatLabel}>Total Tasks</span>
              </div>
              <div class={styles.storageStatCard}>
                <span class={styles.storageStatNumber}>
                  {totalSubjects} Subjects • {totalChapters} Chapters
                </span>
                <span class={styles.storageStatLabel}>Course Structure</span>
              </div>
              <div class={styles.storageStatCard}>
                <span class={styles.storageStatNumber}>{totalLabels}</span>
                <span class={styles.storageStatLabel}>Study Labels</span>
              </div>
            </div>
          </div>

          {/* Community & Stores Card */}
          <div class={styles.card}>
            <div class={styles.cardHeader}>
              <div class={styles.cardTitleGroup}>
                <div class={styles.cardIcon}>
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <h2 class={styles.cardTitle}>Community & Stores</h2>
              </div>
            </div>

            <div class={styles.cardsGrid}>
              {COMMUNITY_AND_STORE_LINKS.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.url}
                    class={styles.linkCard}
                    title={item.title}
                    onClick={(e) => {
                      e.preventDefault();
                      openLink(item.url);
                    }}
                  >
                    <div class={styles.linkCardLeft}>
                      <div class={styles.iconBadge}>
                        <Icon />
                      </div>
                      <span class={styles.linkTitle}>{item.title}</span>
                    </div>
                    <ExternalArrowIcon />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
