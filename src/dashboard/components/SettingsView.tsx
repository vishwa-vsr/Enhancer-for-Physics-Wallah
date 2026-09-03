import { useState, useEffect } from 'preact/hooks';
import { activeView, customTags, addCustomTag, deleteCustomTag, userName, setUserName } from '../store';
import { isLightTheme, toggleTheme } from '@shared/theme';
import { Toggle } from '@shared/components/Toggle';
import styles from './SettingsView.module.css';

const PRESET_COLORS = [
  '#6b7fd7', // Purple/Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#ef4444', // Red
];

export const SettingsView = () => {
  const [profileName, setProfileName] = useState(userName.value);
  const [nameSaved, setNameSaved] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    setProfileName(userName.value);
  }, [userName.value]);

  const handleSaveProfile = async (e: Event) => {
    e.preventDefault();
    await setUserName(profileName);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

  const handleAddTag = async (e: Event) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmed = newTagName.trim();
    if (!trimmed) return;

    const success = await addCustomTag(trimmed, selectedColor);
    if (!success) {
      setErrorMsg('A tag with this name already exists.');
      return;
    }

    setNewTagName('');
  };

  const handleDelete = async (name: string) => {
    await deleteCustomTag(name);
  };

  return (
    <div class={styles.container}>
      {/* Header */}
      <div class={styles.headerRow}>
        <h1 class={styles.title}>Settings</h1>
        <button
          class={styles.backBtn}
          onClick={() => {
            activeView.value = { type: 'today' };
          }}
        >
          ← Back to Study Tasks
        </button>
      </div>

      {/* Profile Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Profile</h2>
        </div>

        <form onSubmit={handleSaveProfile} class={styles.formRow}>
          <input
            type="text"
            class={styles.tagInput}
            placeholder="Enter your name (e.g. Vishal)..."
            value={profileName}
            onInput={(e) => setProfileName((e.target as HTMLInputElement).value)}
          />
          <button type="submit" class={styles.addTagBtn}>
            {nameSaved ? 'Saved! ✓' : 'Save Name'}
          </button>
        </form>
      </div>

      {/* Appearance Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Appearance</h2>
          <p class={styles.cardDesc}>Customize the look and feel of your study planner</p>
        </div>

        <div class={styles.settingRow}>
          <div class={styles.settingInfo}>
            <span class={styles.settingLabel}>Theme Mode</span>
            <span class={styles.settingSublabel}>
              {isLightTheme.value ? 'Light Theme' : 'AMOLED Pitch Black'}
            </span>
          </div>
          <Toggle
            checked={isLightTheme.value}
            onChange={() => toggleTheme()}
            ariaLabel="Toggle theme"
          />
        </div>
      </div>

      {/* Tag Management Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Study Tags</h2>
          <p class={styles.cardDesc}>
            Manage and customize the tags used to organize tasks across your chapters
          </p>
        </div>

        {/* Existing Tags */}
        <div class={styles.tagList}>
          {customTags.value.map((tag) => (
            <div key={tag.name} class={styles.tagBadge}>
              <span class={styles.tagDot} style={{ backgroundColor: tag.color }} />
              <span>{tag.name}</span>
              <button
                type="button"
                class={styles.deleteTagBtn}
                title={`Delete ${tag.name}`}
                onClick={() => handleDelete(tag.name)}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Add Tag Form */}
        <form onSubmit={handleAddTag} class={styles.addTagForm}>
          <div class={styles.formRow}>
            <input
              type="text"
              class={styles.tagInput}
              placeholder="Enter new tag name (e.g. Formula Sheet, PYQ, Mock Test)..."
              value={newTagName}
              onInput={(e) => {
                setNewTagName((e.target as HTMLInputElement).value);
                if (errorMsg) setErrorMsg('');
              }}
            />

            <div class={styles.colorPickerRow}>
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  class={`${styles.colorCircle} ${selectedColor === c ? styles.colorCircleSelected : ''}`}
                  onClick={() => setSelectedColor(c)}
                  title={`Color ${c}`}
                >
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      display: 'block',
                    }}
                  />
                </button>
              ))}
            </div>

            <button type="submit" class={styles.addTagBtn} disabled={!newTagName.trim()}>
              + Add Tag
            </button>
          </div>

          {errorMsg && <p class={styles.errorMsg}>{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
};
