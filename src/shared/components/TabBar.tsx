import { ComponentChildren } from 'preact';
import styles from './TabBar.module.css';

export interface Tab {
  id: string;
  label: string;
  icon: ComponentChildren;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabBar({ tabs, activeTab, onTabChange }: TabBarProps) {
  const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  
  return (
    <div class={styles.tabNavigation}>
      <div 
        class={styles.tabIndicator} 
        style={{ transform: `translateX(calc(${safeIndex * 100}% + ${safeIndex * 3}px))` }}
      />
      {tabs.map((tab) => (
        <button
          key={tab.id}
          class={`${styles.tabBtn} ${activeTab === tab.id ? styles.active : ''}`}
          onClick={() => onTabChange(tab.id)}
          type="button"
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          <span class={styles.tabIcon}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
}
