/**
 * Temporarily Disable Appointment Booking
 * This script disables all appointment booking links across all pages
 */

(function() {
  'use strict';

  // Add CSS to disable appointment links
  const style = document.createElement('style');
  style.textContent = `
    /* Disable all appointment links */
    a[href*="appointment.html"] {
      opacity: 0.5 !important;
      pointer-events: none !important;
      cursor: not-allowed !important;
      filter: grayscale(50%) !important;
      position: relative;
    }

    /* Add disabled tooltip */
    a[href*="appointment.html"]::after {
      content: '⚠️ Vorübergehend nicht verfügbar';
      position: absolute;
      bottom: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s;
      z-index: 1000;
    }

    a[href*="appointment.html"]:hover::after {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);

  // Prevent navigation to appointment page
  document.addEventListener('DOMContentLoaded', function() {
    disableAppointmentLinks();
  });

  // Also run immediately in case DOM is already loaded
  if (document.readyState === 'interactive' || document.readyState === 'complete') {
    disableAppointmentLinks();
  }

  function disableAppointmentLinks() {
    const appointmentLinks = document.querySelectorAll('a[href*="appointment.html"]');

    appointmentLinks.forEach(link => {
      // Disable click
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('⚠️ Appointment booking is temporarily disabled');

        // Optional: Show alert to user
        // alert('Die Terminbuchung ist vorübergehend nicht verfügbar. Bitte rufen Sie uns an: 0202 660828');

        return false;
      }, true);

      // Add aria-disabled attribute for accessibility
      link.setAttribute('aria-disabled', 'true');
      link.setAttribute('title', 'Vorübergehend nicht verfügbar');
    });

    console.log(`🚫 Disabled ${appointmentLinks.length} appointment link(s)`);
  }
})();
