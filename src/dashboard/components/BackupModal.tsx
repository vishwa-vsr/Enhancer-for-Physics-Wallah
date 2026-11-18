import { useState, useEffect, useRef } from 'preact/hooks';
import { Modal } from '@shared/components/Modal';
import {
  exportSettings,
  validateSettingsString,
  importSettings,
  resetSettingsToDefault,
} from '@shared/storage';
import { PopupSettings } from '@shared/types';
import styles from './BackupModal.module.css';

// ----------------- Icons -----------------

const CopyIcon = () => (
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
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const DownloadIcon = () => (
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
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const UploadFileIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    class={styles.uploadIcon}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const AlertWarningIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// ----------------- Export Modal -----------------

export interface ExportModalProps {
  open: boolean;
  onClose: () => void;
}

export const ExportModal = ({ open, onClose }: ExportModalProps) => {
  const [jsonString, setJsonString] = useState('');
  const [copied, setCopied] = useState(false);
  const copyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      exportSettings().then((payload) => {
        setJsonString(JSON.stringify(payload, null, 2));
      });
      setCopied(false);
    }
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, [open]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonString);
      } else {
        const ta = document.createElement('textarea');
        ta.value = jsonString;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failure
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `enhancer-pw-settings-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore download failure
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Export Popup Settings" size="md">
      <div class={styles.modalBody}>
        <textarea
          class={styles.codeArea}
          readOnly
          value={jsonString}
          onClick={(e) => (e.target as HTMLTextAreaElement).select()}
        />

        <div class={styles.actionsRow}>
          <div class={styles.leftActions}>
            <button
              type="button"
              class={styles.btnSecondary}
              onClick={handleDownload}
              title="Download backup file"
            >
              <DownloadIcon />
              Download File
            </button>
            <button
              type="button"
              class={styles.btnSecondary}
              onClick={handleCopy}
              title="Copy code to clipboard"
            >
              {copied ? (
                <>
                  <CheckIcon />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon />
                  Copy Code
                </>
              )}
            </button>
          </div>
          <button type="button" class={styles.btnPrimary} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ----------------- Import Modal -----------------

export interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportModal = ({ open, onClose, onSuccess }: ImportModalProps) => {
  const [inputText, setInputText] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input');
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    settings?: Partial<PopupSettings>;
    error?: string;
    count?: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setInputText('');
      setStep('input');
      setValidationResult(null);
    }
  }, [open]);

  const handleTextChange = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setValidationResult(null);
      return;
    }
    const res = validateSettingsString(text);
    setValidationResult(res);
  };

  const handleFileUpload = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setValidationResult({
        valid: false,
        error: 'The selected file is too large (over 1MB). Please select a valid settings backup.',
      });
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
    input.value = '';
  };

  const handleProceedToConfirm = () => {
    if (validationResult?.valid && validationResult.settings) {
      setStep('confirm');
    }
  };

  const handleApplyImport = async () => {
    if (!validationResult?.valid || !validationResult.settings) return;

    await importSettings(validationResult.settings);
    setStep('success');
    if (onSuccess) onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        step === 'confirm'
          ? 'Confirm Settings Replace'
          : step === 'success'
            ? 'Import Successful'
            : 'Import Popup Settings'
      }
      size="md"
    >
      <div class={styles.modalBody}>
        {step === 'input' && (
          <>
            <label class={styles.uploadZone}>
              <UploadFileIcon />
              <span class={styles.uploadText}>Click to choose a backup file (.json)</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,text/plain"
                class={styles.fileInputHidden}
                onChange={handleFileUpload}
              />
            </label>

            <div class={styles.orDivider}>or paste code</div>

            <textarea
              class={styles.codeArea}
              placeholder="Paste your settings code here..."
              value={inputText}
              onInput={(e) => handleTextChange((e.target as HTMLTextAreaElement).value)}
            />

            {validationResult && !validationResult.valid && (
              <div class={`${styles.infoBanner} ${styles.infoError}`}>
                <span>{validationResult.error}</span>
              </div>
            )}

            {validationResult && validationResult.valid && (
              <div class={`${styles.infoBanner} ${styles.infoValid}`}>
                <span>
                  ✓ Valid settings code detected ({validationResult.count} options found).
                </span>
              </div>
            )}

            <div class={styles.actionsRow}>
              <button type="button" class={styles.btnSecondary} onClick={onClose}>
                Cancel
              </button>
              <button
                type="button"
                class={styles.btnPrimary}
                disabled={!validationResult?.valid}
                onClick={handleProceedToConfirm}
              >
                Review & Apply
              </button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div class={`${styles.infoBanner} ${styles.infoWarning}`}>
              <AlertWarningIcon />
              <div>
                <strong>Warning:</strong> Applying this backup will replace your current video
                speed, shortcuts, and focus settings with the imported ones. (Your Study Planner
                tasks and subjects will not be changed).
              </div>
            </div>

            <p class={styles.description}>
              Ready to update <strong>{validationResult?.count} settings</strong>. Are you sure you
              want to proceed?
            </p>

            <div class={styles.actionsRow}>
              <button type="button" class={styles.btnSecondary} onClick={() => setStep('input')}>
                Back
              </button>
              <button type="button" class={styles.btnDanger} onClick={handleApplyImport}>
                Yes, Replace Settings
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div class={styles.successBox}>
            <div class={styles.successIconWrap}>
              <CheckIcon />
            </div>
            <h3 class={styles.successTitle}>Settings Successfully Restored</h3>
            <p class={styles.successSubtitle}>
              All {validationResult?.count} settings have been applied to your extension.
            </p>
            <div class={styles.actionsRow} style={{ marginTop: '10px' }}>
              <button type="button" class={styles.btnPrimary} onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ----------------- Reset Defaults Confirmation Modal -----------------

export interface ResetModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetModal = ({ open, onClose, onSuccess }: ResetModalProps) => {
  const [success, setSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setIsConfirming(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open]);

  const handleResetClick = async () => {
    if (!isConfirming) {
      setIsConfirming(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        setIsConfirming(false);
      }, 3500);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setIsConfirming(false);
    await resetSettingsToDefault();
    setSuccess(true);
    if (onSuccess) onSuccess();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={success ? 'Settings Reset' : 'Reset Popup to Default Settings?'}
      size="sm"
    >
      <div class={styles.modalBody}>
        {!success ? (
          <>
            <div class={`${styles.infoBanner} ${styles.infoWarning}`}>
              <AlertWarningIcon />
              <div>
                This will reset all video speeds, focus toggles, hotkeys, and player preferences
                back to original factory defaults.
              </div>
            </div>
            <p class={styles.description}>
              Your Study Planner tasks, subjects, and study labels will <strong>not</strong> be
              touched.
            </p>
            <div class={styles.actionsRow}>
              <button
                type="button"
                class={styles.btnSecondary}
                onClick={() => {
                  setIsConfirming(false);
                  if (timerRef.current) clearTimeout(timerRef.current);
                  onClose();
                }}
              >
                Cancel
              </button>
              <button type="button" class={styles.btnDanger} onClick={handleResetClick}>
                {isConfirming ? 'Confirm?' : 'Reset to Defaults'}
              </button>
            </div>
          </>
        ) : (
          <div class={styles.successBox}>
            <div class={styles.successIconWrap}>
              <CheckIcon />
            </div>
            <h3 class={styles.successTitle}>Factory Defaults Restored</h3>
            <p class={styles.successSubtitle}>
              All extension player settings have been returned to their original defaults.
            </p>
            <div class={styles.actionsRow} style={{ marginTop: '10px' }}>
              <button type="button" class={styles.btnPrimary} onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
