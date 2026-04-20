// app.js — jQuery per HW10 req2

$(document).ready(function () {

  // Record interactive lesson choices via AJAX
  $('.choice-btn').on('click', function () {
    const $btn = $(this);
    const choice = $btn.data('choice');
    const lessonId = window.LESSON_ID || null;

    $('.choice-btn').removeClass('btn-primary').addClass('btn-outline-primary');
    $btn.removeClass('btn-outline-primary').addClass('btn-primary');

    $('#choice-feedback').text('Recorded: ' + choice).show();

    $.ajax({
      url: '/api/lesson-choice',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ lesson_id: lessonId, choice: choice }),
      success: function (response) { console.log('Choice recorded:', response); },
      error: function (err) { console.error('Failed to record choice:', err); }
    });
  });

  // Make quiz option rows fully clickable
  $('.option-row').on('click', function () {
    $('.option-row').removeClass('border-primary bg-light');
    $(this).addClass('border-primary bg-light');
    $(this).find('input[type="radio"]').prop('checked', true);
  });

});
