// Supabase configuration - REMOVED
// const SUPABASE_URL = '...';
// const SUPABASE_ANON_KEY = '...';

// Initialize Supabase client (loaded from CDN) - REMOVED
// const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM elements
const form = document.getElementById('waitlist-form');
const emailInput = document.getElementById('email');
const submitButton = document.getElementById('submit-btn');
const messageContainer = document.getElementById('message-container');

// Disable button initially
submitButton.disabled = true;

// Language Switcher Elements
const langButtons = document.querySelectorAll('.lang-btn');
const translatableElements = document.querySelectorAll('[data-translate-key]');

// Translations (add more keys as needed)
const translations = {
  de: {
    appTitle: 'Rational Mind',
    headline: 'Stopp das Grübeln. Schaffe Klarheit. Entscheide Klug.',
    heroDescription: 'Quält dich ständiges Grübeln? Verloren im Labyrinth der "Was wäre wenns"? Rational Mind ist dein KI-Begleiter für eine ruhige, logische Perspektive. Erhalte Klarheit, genau dann, wenn du sie brauchst.',
    waitlistIncentive: '<strong>Trag dich in die kostenlose Warteliste ein.</strong> Sei unter den Ersten, die Zugang erhalten und profitiere von exklusiven Vorteilen zum Start!',
    emailPlaceholder: 'E-Mail eintragen.',
    emailAriaLabel: 'E-Mail-Adresse für die Warteliste',
    submitBtn: 'Sichere dir frühen Zugang!',
    formSmallPrint: 'Start in 1 Monat; Kostenlos eintragen; Wir respektieren deine Privatsphäre.',
    // Add success/error messages if they need translation
    successMessage: 'Erfolgreich eingetragen! Wir melden uns bald.',
    errorMessage: 'Fehler: Bitte versuche es erneut oder kontaktiere den Support.',
    invalidEmail: 'Bitte gib eine gültige E-Mail-Adresse ein.'
  },
  en: {
    appTitle: 'Rational Mind',
    headline: 'Stop Overthinking. Gain Clarity. Decide Wisely.',
    heroDescription: 'Are you plagued by constant overthinking? Lost in the maze of "what ifs"? Rational Mind is your AI companion for a calm, logical perspective. Gain clarity exactly when you need it.',
    waitlistIncentive: '<strong>Join the free waitlist.</strong> Be among the first to get access and benefit from exclusive launch advantages!',
    emailPlaceholder: 'Enter your email.',
    emailAriaLabel: 'Email address for the waitlist',
    submitBtn: 'Secure early access!',
    formSmallPrint: 'Launch in 1 month; Join for free; We respect your privacy.',
    // Add success/error messages if they need translation
    successMessage: 'Successfully registered! We will contact you soon.',
    errorMessage: 'Error: Please try again',
    invalidEmail: 'Please enter a valid email address.'
  }
};

// Function to set the language
function setLanguage(lang) {
  if (!translations[lang]) {
    console.error(`Language ${lang} not found in translations.`);
    return;
  }

  // Update text content
  translatableElements.forEach(element => {
    const key = element.dataset.translateKey;
    const translation = translations[lang][key];

    if (translation !== undefined) {
      // Handle elements containing HTML (like the incentive strong tag)
      if (element.dataset.translateKey === 'waitlistIncentive') {
        element.innerHTML = translation;
      } else if (element.tagName === 'INPUT' && key === 'emailPlaceholder') {
        element.placeholder = translation;
      } else if (element.tagName === 'INPUT' && element.dataset.translateAriaKey) {
        const ariaKey = element.dataset.translateAriaKey;
        const ariaTranslation = translations[lang][ariaKey];
        if(ariaTranslation !== undefined) {
          element.setAttribute('aria-label', ariaTranslation);
        }
      } else {
        element.textContent = translation;
      }
    } else {
      console.warn(`Translation key '${key}' not found for language '${lang}'.`);
    }
  });

  // Update button active states
  langButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.lang === lang);
    // Update aria-label for active/inactive buttons if needed
  });

  // Store preference
  localStorage.setItem('preferredLanguage', lang);

  // Update form validation messages based on new language
  updateValidationMessages(lang);
}

// Add event listeners to buttons
langButtons.forEach(button => {
  button.addEventListener('click', () => {
    setLanguage(button.dataset.lang);
  });
});

// Function to show messages (potentially update for language)
function showMessage(message, type) {
  messageContainer.innerHTML = `<div class="message ${type}">${message}</div>`;
  // Optional: Clear message after some time
  // setTimeout(() => { messageContainer.innerHTML = ''; }, 5000);
}

// Function to show toast notifications
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger the animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10); // Small delay to ensure transition works

  // Remove the toast after a few seconds
  setTimeout(() => {
    toast.classList.remove('show');
    // Remove element after transition ends
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}

// Update validation messages based on language
function updateValidationMessages(lang) {
  emailInput.setCustomValidity(''); // Reset previous custom validity
  // You might add more complex validation logic here
  // For now, just ensuring the lang influences potential future messages
}

// Form submission handler
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  console.log('Form submitted!'); // DEBUG LOG
  
  // Get email value
  const email = emailInput.value.trim();
  
  // Disable form during submission
  submitButton.disabled = true;
  submitButton.innerText = 'Joining...';
  
  // Clear previous messages
  messageContainer.innerHTML = '';
  
  const currentLang = localStorage.getItem('preferredLanguage') || 'de';

  // Basic email validation
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    showMessage(translations[currentLang].invalidEmail, 'error');
    emailInput.setCustomValidity(translations[currentLang].invalidEmail);
    emailInput.reportValidity(); // Show browser validation message
    submitButton.disabled = false;
    submitButton.innerText = translations[currentLang].submitBtn;
    return;
  }
  emailInput.setCustomValidity(''); // Clear validation message on valid input

  try {
    // Call our serverless function endpoint
    const response = await fetch('/api/submit-waitlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email }), // Send email in request body
    });

    const result = await response.json(); // Get response from function

    if (!response.ok) {
      // Handle errors reported by the function
      // Use result.message or provide a fallback based on status
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

    // Success
    showToast(translations[currentLang].successMessage);
    emailInput.value = ''; // Clear input

  } catch (error) {
    console.error('Error submitting email via API:', error);
    // Display the error message from the caught error
    showMessage(error.message || translations[currentLang].errorMessage, 'error');
  } finally {
    // Re-enable form
    submitButton.disabled = false;
    submitButton.innerText = translations[currentLang].submitBtn;
    console.log('Form processing finished.'); // DEBUG LOG
  }
});

// Simple validation on input
emailInput.addEventListener('input', () => {
  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log(`Input changed: ${email}, Valid: ${isValid}`); // DEBUG LOG
  submitButton.disabled = !isValid;
});

// --- Initial Language Setup ---
const preferredLanguage = localStorage.getItem('preferredLanguage') || 'de'; // Default to German
setLanguage(preferredLanguage);

// Clear custom validity message when user starts typing again
emailInput.addEventListener('input', () => {
  emailInput.setCustomValidity('');
}); 