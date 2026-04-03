document.addEventListener('DOMContentLoaded', () => {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  const consentKey = 'develop4us_cookie_consent';
  const consentBanner = document.getElementById('cookieConsent');
  const acceptButton = document.getElementById('acceptCookies');

  if (consentBanner && !localStorage.getItem(consentKey)) {
    consentBanner.hidden = false;
  }

  if (acceptButton && consentBanner) {
    acceptButton.addEventListener('click', () => {
      localStorage.setItem(consentKey, 'accepted');
      consentBanner.hidden = true;
    });
  }
});
