import { useState, useEffect } from 'preact/hooks';
import { userName, setUserName } from '../store';
import styles from './SettingsView.module.css';

export const SettingsView = () => {
  const [profileName, setProfileName] = useState(userName.value);
  const [nameSaved, setNameSaved] = useState(false);

  useEffect(() => {
    setProfileName(userName.value);
  }, [userName.value]);

  const handleSaveProfile = async (e: Event) => {
    e.preventDefault();
    await setUserName(profileName);
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
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
    </div>
  );
};
