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
    showToastNotification(result.message || 'Thank you! You\'ve been added.');
    emailInput.value = ''; // Clear input

  } catch (error) {
    console.error('Error submitting email via API:', error);
    // Display the error message from the caught error
    showMessage(error.message || 'An unexpected error occurred. Please try again.', 'error');
  } finally {
    // Re-enable form
    submitButton.disabled = false;
    submitButton.innerText = 'Join the Waitlist';
    console.log('Form processing finished.'); // DEBUG LOG
  }
});

// Display a message in the designated container (mostly for errors now)
function showMessage(text, type) {
  // Clear previous messages only from the container
  messageContainer.innerHTML = '';
  const messageElement = document.createElement('div');
  messageElement.classList.add('message', type);
  messageElement.textContent = text;
  messageContainer.appendChild(messageElement);
}

// Display a toast notification (for success)
function showToastNotification(text) {
    // Remove any existing toast
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.classList.add('toast-notification');
    toast.textContent = text;
    document.body.appendChild(toast);

    // Trigger the animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Auto-remove after a delay
    setTimeout(() => {
        toast.classList.remove('show');
        // Remove from DOM after transition ends
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000); // Show for 3 seconds
}

// Simple validation on input
emailInput.addEventListener('input', () => {
  const email = emailInput.value.trim();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  console.log(`Input changed: ${email}, Valid: ${isValid}`); // DEBUG LOG
  submitButton.disabled = !isValid;
}); 