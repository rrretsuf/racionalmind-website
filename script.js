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
    joiningText: 'Tritt bei...', // Prevod za "Joining..."
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
    joiningText: 'Joining...', // Prevod za "Joining..."
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
      if (key === 'waitlistIncentive') {
        element.innerHTML = translation;
      }
      else if (element.tagName === 'INPUT' && key === 'emailPlaceholder') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.dataset.translateAriaKey) {
        const ariaKey = element.dataset.translateAriaKey;
        const ariaTranslation = translations[lang][ariaKey];
        if (ariaTranslation !== undefined) {
          element.setAttribute('aria-label', ariaTranslation);
        } else {
          console.warn(`ARIA translation key '${ariaKey}' not found for language '${lang}'. Element:`, element);
        }
      }
      else {
        element.textContent = translation;
      }
    } else {
      console.warn(`Translation key '${key}' not found for language '${lang}'. Element:`, element);
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

  const currentLang = localStorage.getItem('preferredLanguage') || 'en';
  const joiningText = translations[currentLang]?.joiningText || "Joining...";
  const submitBtnText = translations[currentLang]?.submitBtn || "Submit";

  submitButton.disabled = true;
  submitButton.innerText = joiningText;
  messageContainer.innerHTML = '';

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    showMessage(translations[currentLang]?.invalidEmail || "Invalid email.", 'error');
    emailInput.setCustomValidity(translations[currentLang]?.invalidEmail || "Invalid email.");
    emailInput.reportValidity();
    submitButton.disabled = false;
    submitButton.innerText = submitBtnText;
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

    const contentType = response.headers.get("content-type");
    if (!response.ok || !contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      let serverMessage = `Server error: ${response.status} ${response.statusText}.`;
      if (textResponse) {
         serverMessage += ` Response: ${textResponse.substring(0, 200)}${textResponse.length > 200 ? '...' : ''}`;
      }
      try {
         const errorResult = JSON.parse(textResponse);
         if (errorResult && errorResult.message) {
             serverMessage = errorResult.message;
         }
      } catch (e) {
      }
      throw new Error(serverMessage);
    }

    const result = await response.json();

    if (result.error || (result.message && !response.status.toString().startsWith('2'))) {
         throw new Error(result.message || translations[currentLang]?.errorMessage || "An error occurred.");
    }

    showToast(translations[currentLang]?.successMessage || "Success!");
    emailInput.value = '';

  } catch (error) {
    console.error('Error submitting email via API:', error);
    showMessage(error.message || translations[currentLang]?.errorMessage || "An error occurred.", 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerText = submitBtnText;
  }
});

emailInput.addEventListener('input', () => {
  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  submitButton.disabled = !isValid;
  if (isValid) {
     emailInput.setCustomValidity('');
  }
});

// Redundant event listener removed here

const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
setLanguage(preferredLanguage);