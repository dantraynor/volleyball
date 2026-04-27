$(function () {
  const $court = $("#court-drop");
  if (!$court.length) return;

  $(".palette-item").draggable({
    helper: "clone",
    revert: "invalid",
    appendTo: "body",
    cursor: "grabbing",
    zIndex: 1000,
  });

  $court.droppable({
    accept: ".palette-item, .placed-player",
    drop: function (event, ui) {
      if (ui.draggable.hasClass("placed-player")) return;

      const courtOffset = $court.offset();
      const x = ui.offset.left - courtOffset.left;
      const y = ui.offset.top - courtOffset.top;
      const role = ui.draggable.data("role");
      const label = ui.draggable.data("label");

      let $player;
      if (role === "ball") {
        $player = $('<div class="placed-player ball"></div>');
      } else {
        $player = $('<div class="placed-player"></div>')
          .addClass(role)
          .text(label);
      }
      $player.css({ left: x, top: y });
      $court.append($player);
      makePlaceable($player);
    },
  });

  const $palette = $(".play-palette");

  $palette.droppable({
    accept: ".placed-player",
    over: function () {
      $palette.addClass("trash-hover");
    },
    out: function () {
      $palette.removeClass("trash-hover");
    },
    drop: function (event, ui) {
      $palette.removeClass("trash-hover");
      ui.draggable.remove();
    },
  });

  function makePlaceable($el) {
    $el.draggable({
      containment: "document",
      cursor: "grabbing",
      zIndex: 1000,
      start: function () {
        $palette.addClass("trash-active");
      },
      stop: function () {
        $palette.removeClass("trash-active");
      },
      revert: function (dropped) {
        if (dropped === false) {
          $(this).remove();
        }
        return false;
      },
    });
  }
});
