// To enable and disable the time if it is a holiday
document.addEventListener('DOMContentLoaded', () => {

    const startTimeInput = document.getElementById('startTime');
    const endTimeInput = document.getElementById('endTime');
    const duration = document.getElementById('duration');
    const isHolidayCheckbox = document.getElementById('isHoliday');
    const doctorId = document.getElementById('currentUser').value;
    let slots = [];
    
    const daySelect = document.getElementById('day');
    function getSelectedDayText() {
      const selectedText = daySelect.options[daySelect.selectedIndex].text;
      return selectedText;
    }

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

    $.ajax({
      url: `/doctor/slot/${doctorId}`,
      method: 'GET',
      dataType: 'json',
      success: function (data) {
          slots = data.slots;
          updateSlots();
      },
      error: function (error) {
        console.error('Error fetching slots data:', error);
      }
    });

    document.getElementById('day').addEventListener('change', updateSlots);

    function updateSlots() {
        let dayName = getSelectedDayText();
        const slot = slots.find(slot => slot.day == dayName);
        if(slot && !slot.isHoliday){
          startTimeInput.disabled = false;
          endTimeInput.disabled = false;
          duration.disabled = false;
          isHolidayCheckbox.checked = false;
          startTimeInput.value = slot.startTime;
          endTimeInput.value = slot.endTime;
          duration.value = slot.duration;
        }
        else{
          isHolidayCheckbox.checked = true;
          startTimeInput.disabled = true;
          endTimeInput.disabled = true;
          duration.disabled = true;
        }
    }

  });
  
  