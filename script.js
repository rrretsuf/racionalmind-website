const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const submitButton = document.getElementById('submit-btn');
const messageContainer = document.getElementById('message-container');

submitButton.disabled = true;

const langButtons = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-translate-key]');

const translations = {
  de: {
    appTitle: 'Rational Mind',
    headline: 'Stopp das Grübeln. Schaffe Klarheit. Entscheide Klug.',
    heroDescription: 'Quält dich ständiges Grübeln? Verloren im Labyrinth der "Was wäre wenns"? Rational Mind ist dein KI-Begleiter für eine ruhige, logische Perspektive. Erhalte Klarheit, genau dann, wenn du sie brauchst.',
    waitlistIncentive: 'Trag dich in die kostenlose Warteliste ein. <strong>Sei unter den Ersten, die Zugang erhalten und profitiere von exklusiven Vorteilen zum Start!</strong>',
    emailPlaceholder: 'E-Mail eintragen.',
    emailAriaLabel: 'E-Mail-Adresse für die Warteliste',
    submitBtn: 'Sichere dir frühen Zugang!',
    formSmallPrint: 'Start in 1 Monat; Kostenlos eintragen; Wir respektieren deine Privatsphäre.',
    successMessage: 'Erfolgreich eingetragen! Wir melden uns bald.',
    errorMessage: 'Fehler: Bitte versuche es erneut oder kontaktiere den Support.',
    invalidEmail: 'Bitte gib eine gültige E-Mail-Adresse ein.'
  },
  en: {
    appTitle: 'Rational Mind',
    headline: 'Stop Overthinking. Gain Clarity. Decide Wisely.',
    heroDescription: 'Are you plagued by constant overthinking? Lost in the maze of "what ifs"? Rational Mind is your AI companion for a calm, logical perspective. Gain clarity exactly when you need it.',
    waitlistIncentive: 'Join the free waitlist. <strong>Be among the first to get access and benefit from exclusive launch advantages!</strong>',
    emailPlaceholder: 'Enter your email.',
    emailAriaLabel: 'Email address for the waitlist',
    submitBtn: 'Secure early access!',
    formSmallPrint: 'Launch in 1 month; Join for free; We respect your privacy.',
    successMessage: 'Successfully registered! We will contact you soon.',
    errorMessage: 'Error: Please try again',
    invalidEmail: 'Please enter a valid email address.'
  }
};

function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Language ${lang} not found in translations.`);
    return;
  }

  translatableElements.forEach(element => {
    const key = element.dataset.translateKey;
    const translation = translations[lang][key];

    if (translation !== undefined) {
      if (key === 'waitlistIncentive' || key === 'heroCombinedDescription') {
        element.innerHTML = translation;
      } else if (element.tagName === 'INPUT' && key === 'emailPlaceholder') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.dataset.translateAriaKey) {
        const ariaKey = element.dataset.translateAriaKey;
        const ariaTranslation = translations[lang][ariaKey];
        if (ariaTranslation !== undefined) {
          element.setAttribute('aria-label', ariaTranslation);
        }
      } else {
        element.textContent = translation;
      }
    } else {
      console.warn(`Translation key '${key}' not found for language '${lang}'.`);
    }
  });

  langButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.lang === lang);
  });

  localStorage.setItem('preferredLanguage', lang);
  updateValidationMessages(lang);
}

langButtons.forEach(button => {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.lang);
  });
});

function showMessage(message, type) {
  messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

function updateValidationMessages(lang) {
  emailInput.setCustomValidity('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  submitButton.disabled = true;
  submitButton.innerText = 'Joining...';
  messageContainer.innerHTML = '';
  const currentLang = localStorage.getItem('preferredLanguage') || 'en';

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    showMessage(translations[currentLang].invalidEmail, 'error');
    emailInput.setCustomValidity(translations[currentLang].invalidEmail);
    emailInput.reportValidity();
    submitButton.disabled = false;
    submitButton.innerText = translations[currentLang].submitBtn;
    return;
  }
  emailInput.setCustomValidity('');

  try {
    const response = await fetch('/api/submit-waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }),
    });

    const result = await response.json();

    if (!response.ok) {
      let errorMessage = result.message;
      if (!errorMessage) {
        if (response.status === 409) {
          errorMessage = 'This email is already on the waitlist.';
        } else if (response.status === 400) {
          errorMessage = 'Please provide a valid email address.';
        } else {
          errorMessage = `Server error: ${response.status}`;
        }
      }
      throw new Error(errorMessage);
    }

    showToast(translations[currentLang].successMessage);
    emailInput.value = '';

  } catch (error) {
    console.error('Error submitting email via API:', error);
    showMessage(error.message || translations[currentLang].errorMessage, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerText = translations[currentLang].submitBtn;
  }
});

emailInput.addEventListener('input', () => {
  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  submitButton.disabled = !isValid;
});

const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
setLanguage(preferredLanguage);

emailInput.addEventListener('input', () => {
  emailInput.setCustomValidity('');
});