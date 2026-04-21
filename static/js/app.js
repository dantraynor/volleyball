// app.js — jQuery per HW10 req2

$(document).ready(function () {

  // Popup term highlights and diagram info button
  const popups = window.LESSON_POPUPS || [];
  if (popups.length) {
    const termPopups = popups.filter(p => p.type !== 'diagram');
    const diagramPopups = popups.filter(p => p.type === 'diagram');

    if (termPopups.length) {
      $('.lesson-text p, .lesson-text td').each(function () {
        let html = $(this).html();
        termPopups.forEach(p => {
          const escaped = p.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const re = new RegExp('\\b(' + escaped + ')\\b', 'i');
          html = html.replace(re, match => {
            const def = p.definition.replace(/"/g, '&quot;');
            return '<span class="popup-term" tabindex="0" role="button"'
              + ' data-bs-toggle="popover" data-bs-trigger="click focus"'
              + ' data-bs-placement="top" data-bs-content="' + def + '"'
              + '>' + match + '</span>';
          });
        });
        $(this).html(html);
      });
      $('.popup-term').each(function () {
        new bootstrap.Popover(this, { container: 'body' });
      });
    }

    if (diagramPopups.length) {
      const $imgCol = $('.col-md-6.mb-3');
      if ($imgCol.length) {
        $imgCol.css('position', 'relative');
        const content = diagramPopups.map(p => p.definition).join('<hr style="margin:6px 0">');
        const $btn = $('<button class="popup-info-btn" tabindex="0" aria-label="Diagram info">ⓘ</button>');
        $imgCol.append($btn);
        new bootstrap.Popover($btn[0], { container: 'body', trigger: 'click', placement: 'left', html: true, content });
      }
    }

    $(document).on('click', function (e) {
      if (!$(e.target).closest('.popup-term, .popup-info-btn, .popover').length) {
        $('.popup-term, .popup-info-btn').each(function () {
          bootstrap.Popover.getInstance(this)?.hide();
        });
      }
    });
  }



  // Record interactive lesson choices via AJAX
  $('.choice-btn').on('click', function () {
    const $btn = $(this);
    const choice = $btn.data('choice');
    const lessonId = window.LESSON_ID || null;

    $('.choice-btn').removeClass('btn-primary').addClass('btn-outline-primary');
    $btn.removeClass('btn-outline-primary').addClass('btn-primary');

    $('#choice-feedback').text('Recorded: ' + choice).show();

    if (window.LESSON_TYPE === "defense") 
      {
        const url = $btn.data('url');
        window.location.href = url;
      }

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
