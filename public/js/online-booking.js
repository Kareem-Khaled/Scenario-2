// Add this script to your public/js/slot.js file
document.addEventListener('DOMContentLoaded', () => {
    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const duration = document.getElementById('duration');
    const isHolidayCheckbox = document.getElementById('isHoliday');
  
    isHolidayCheckbox.addEventListener('change', () => {
      if (isHolidayCheckbox.checked) {
        startTimeInput.disabled = true;
        endTimeInput.disabled = true;
        duration.disabled = true;
      } else {
        startTimeInput.disabled = false;
        endTimeInput.disabled = false;
        duration.disabled = false;
      }
    });
  });
  