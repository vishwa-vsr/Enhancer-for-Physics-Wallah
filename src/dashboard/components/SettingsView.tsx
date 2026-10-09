import { useState, useEffect } from 'preact/hooks';
import { userName, setUserName, customTags, addCustomTag, deleteCustomTag } from '../store';
import styles from './SettingsView.module.css';

import { PRESET_COLORS } from '@shared/colors';

export const SettingsView = () => {
  const [profileName, setProfileName] = useState(userName.value);
  const [nameSaved, setNameSaved] = useState(false);

  const [newLabelName, setNewLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [labelError, setLabelError] = useState('');

  useEffect(() => {
    setProfileName(userName.value);
  }, [userName.value]);

  const handleSaveProfile = async (e: Event) => {
    e.preventDefault();
    await setUserName(profileName);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  };

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

  return (
    <div class={styles.container}>
      {/* Header */}
      <div class={styles.headerRow}>
        <h1 class={styles.title}>Settings</h1>
      </div>

      {/* Profile Name Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Profile Name</h2>
          <p class={styles.cardDesc}>Personalize your dashboard greeting.</p>
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

      {/* Study Labels Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Study Labels</h2>
          <p class={styles.cardDesc}>
            Manage labels used to organize tasks and generate your study chains.
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
    </div>
  );
};
