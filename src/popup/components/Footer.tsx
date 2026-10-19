import styles from './Footer.module.css';

const FeedbackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width="12"
    height="12"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    width="12"
    height="12"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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
    if (userAgent.includes('Firefox')) {
      return 'https://addons.mozilla.org/en-US/firefox/addon/enhancer-for-physics-wallah/';
    }
    return 'https://chromewebstore.google.com/detail/pw-control/ibepglcdcaanmkledmpgfapaffkhbadj?authuser=0&hl=en-GB';
  };

  return (
    <footer class={styles.footer}>
      <a
        href="#"
        class={styles.link}
        onClick={(e) => {
          e.preventDefault();
          openLink(
            'https://docs.google.com/forms/d/e/1FAIpQLSdquONSDYSILWZd-ubkmk9pi_TVNXa65b8G7fpbOCbO3UCHdg/viewform',
          );
        }}
      >
        <FeedbackIcon />
        Feedback
      </a>
      <a
        href="#"
        class={styles.link}
        onClick={(e) => {
          e.preventDefault();
          openLink(getRateUsUrl());
        }}
      >
        <StarIcon />
        Rate Us
      </a>
    </footer>
  );
};
