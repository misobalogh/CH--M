(function () {
  const container = document.querySelector(".countdown__grid");
  if (!container) return;

  const targetIso = container.getAttribute("data-countdown-target");
  if (!targetIso) return;

  const messageNode = document.querySelector(".countdown__message");
  const finishedMessage =
    container.getAttribute("data-countdown-finished") || "Svadba práve prebieha!";

  const targetDate = new Date(targetIso);
  if (Number.isNaN(targetDate.getTime())) {
    if (messageNode) {
      messageNode.textContent = "Nepodarilo sa načítať dátum svadby.";
    }
    return;
  }

  const numberNodes = {
    days: container.querySelector('[data-unit="days"]'),
    hours: container.querySelector('[data-unit="hours"]'),
    minutes: container.querySelector('[data-unit="minutes"]'),
    seconds: container.querySelector('[data-unit="seconds"]'),
  };

  const formatUnit = (value, unit) => {
    const padded = String(Math.max(value, 0)).padStart(unit === "days" ? 3 : 2, "0");
    return padded;
  };

  const renderDiff = () => {
    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime();

    if (diffMs <= 0) {
      Object.entries(numberNodes).forEach(([unit, node]) => {
        if (!node) return;
        node.textContent = formatUnit(0, unit);
      });
      if (messageNode) {
        messageNode.textContent = finishedMessage;
      }
      return true;
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;
    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;
    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;
    const days = Math.floor(totalHours / 24);

    if (numberNodes.days) numberNodes.days.textContent = formatUnit(days, "days");
    if (numberNodes.hours) numberNodes.hours.textContent = formatUnit(hours, "hours");
    if (numberNodes.minutes) numberNodes.minutes.textContent = formatUnit(minutes, "minutes");
    if (numberNodes.seconds) numberNodes.seconds.textContent = formatUnit(seconds, "seconds");

    if (messageNode) {
      messageNode.textContent = "";
    }

    return false;
  };

  renderDiff();
  const interval = window.setInterval(() => {
    const isDone = renderDiff();
    if (isDone) {
      window.clearInterval(interval);
    }
  }, 1000);
})();
