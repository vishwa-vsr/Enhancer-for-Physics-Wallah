import styles from './Footer.module.css';

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
  </svg>
);

const FeedbackIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export const Footer = () => {
  const openLink = (url: string) => {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.create({ url });
    } else {
      window.open(url, '_blank');
    }
  };

  const getRateUsUrl = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Edg/')) {
      return 'https://microsoftedge.microsoft.com/addons/detail/pw-control/cnoboofnelihfmnjfbpbelpfdmogfaan';
    }
    if (userAgent.includes('Firefox/')) {
      return 'https://addons.mozilla.org/en-US/firefox/addon/pw-control/';
    }
    return 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj?authuser=0&hl=en-GB';
  };

  return (
    <footer class={styles.footer}>
      <a href="#" class={styles.link} onClick={(e) => { e.preventDefault(); openLink('https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah'); }}>
        <GithubIcon />
        GitHub
      </a>
      <a href="#" class={styles.link} onClick={(e) => { e.preventDefault(); openLink('https://github.com/vishwa-vsr/Enhancer-for-Physics-Wallah/issues'); }}>
        <FeedbackIcon />
        Feedback
      </a>
      <a href="#" class={styles.link} onClick={(e) => { e.preventDefault(); openLink(getRateUsUrl()); }}>
        <StarIcon />
        Rate Us
      </a>
      <span class={styles.version}>v1.0.8.2</span>
    </footer>
  );
};
