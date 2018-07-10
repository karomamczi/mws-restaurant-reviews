/**
 * Fetch current year as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  getCurrentYear();

});

/**
 * Get current year for the footer.
 */
const getCurrentYear = () => {
  const year = document.getElementById('year');
  const currentYear = new Date().getFullYear();
  year.innerHTML = currentYear;
};
