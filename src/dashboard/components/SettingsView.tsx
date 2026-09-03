import { useState, useEffect } from 'preact/hooks';
import { customTags, addCustomTag, deleteCustomTag, userName, setUserName } from '../store';
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
      setErrorMsg(`Tag "${trimmed}" already exists.`);
      return;
    }

    setNewTagName('');
    setSelectedColor(PRESET_COLORS[0]);
  };

  const handleDelete = async (name: string) => {
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

      {/* Tag Management Section */}
      <div class={styles.card}>
        <div class={styles.cardHeader}>
          <h2 class={styles.cardTitle}>Study Tags</h2>
        </div>

        {/* Existing Tags */}
        <div class={styles.tagList}>
          {customTags.value.map((tag) => (
            <div key={tag.name} class={styles.tagBadge}>
              <span class={styles.tagDot} style={{ backgroundColor: tag.color }} />
              <span class={styles.tagName}>{tag.name}</span>
              <button
                class={styles.deleteTagBtn}
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
              placeholder="Enter tag name..."
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
