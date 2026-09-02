import { Toggle } from '@shared/components/Toggle';
import { FeatureRow } from '@shared/components/FeatureRow';
import { saveSetting } from '@shared/storage';
import {
  hideAskAI, hideDoubt, hideChat, hideNotes, hideNoteTimeline,
  hideSetting, hideTimeLine, hideTimeText, autoPauseOnHide
} from '@popup/store';
import styles from './FocusTab.module.css';

export function FocusTab() {
  return (
    <section>
      <h2 class={styles.sectionTitle}>Focus Toggles</h2>
      <div class={styles.settingsGroupCard}>
        <FeatureRow label="Hide 'Ask AI'">
          <Toggle checked={hideAskAI.value} onChange={(v) => { hideAskAI.value = v; saveSetting('hideAskAI', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Doubt Q&A">
          <Toggle checked={hideDoubt.value} onChange={(v) => { hideDoubt.value = v; saveSetting('hideDoubt', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Live Chat">
          <Toggle checked={hideChat.value} onChange={(v) => { hideChat.value = v; saveSetting('hideChat', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Study Notes">
          <Toggle checked={hideNotes.value} onChange={(v) => { hideNotes.value = v; saveSetting('hideNotes', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Note Timeline">
          <Toggle checked={hideNoteTimeline.value} onChange={(v) => { hideNoteTimeline.value = v; saveSetting('hideNoteTimeline', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Settings Icon">
          <Toggle checked={hideSetting.value} onChange={(v) => { hideSetting.value = v; saveSetting('hideSetting', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Timeline Line">
          <Toggle checked={hideTimeLine.value} onChange={(v) => { hideTimeLine.value = v; saveSetting('hideTimeLine', v); }} />
        </FeatureRow>
        <FeatureRow label="Hide Time Display">
          <Toggle checked={hideTimeText.value} onChange={(v) => { hideTimeText.value = v; saveSetting('hideTimeText', v); }} />
        </FeatureRow>
        <FeatureRow label="Auto-pause on Tab Switch">
          <Toggle checked={autoPauseOnHide.value} onChange={(v) => { autoPauseOnHide.value = v; saveSetting('autoPauseOnHide', v); }} />
        </FeatureRow>
      </div>
    </section>
  );
}
