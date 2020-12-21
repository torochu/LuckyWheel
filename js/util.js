export const checkEventState = (event, now) => {
  const { start, end } = event;
  if (now >= Date.parse(start) && now <= Date.parse(end)) {
    return 'in-progress';
  } else if (now > Date.parse(start) && now > Date.parse(end)) {
    return 'ended';
  } else {
    return 'not-available';
  }
};

export const setLocalStorageCount = (eventID, num) => {
  localStorage.setItem(
    eventID,
    JSON.stringify({
      count: num,
    })
  );
};

export const checkLocalStorageCount = (
  eventID,
  loadingEle,
  dollGifts,
  rocketOff,
  rocketOn
) => {
  if (localStorage.getItem(eventID) === null) {
    setLocalStorageCount(eventID, 0);
  } else if (JSON.parse(localStorage.getItem(eventID)).count === 0) {
    // 如果 localStorage count 是 0 或者不存在 ~~> 跑動畫
    console.log('動畫');
    loadingEle.classList.remove('d-none');
    dollGifts.classList.remove('d-none');
    rocketOff.classList.remove('d-none');
    return true;
  } else {
    console.log('local storage  不等於 0 ~~~> 不跑動畫');

    dollGifts.classList.add('d-none');
    rocketOff.classList.add('d-none');
    rocketOn.classList.add('d-none');
    loadingEle.classList.add('d-none');
    return false;
  }
};

export let clock = (now, countDownDate) => {
  let distance = countDownDate - now;

  // Time calculations for days, hours, minutes and seconds
  let days = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return {
    days,
    hours,
    minutes,
    seconds,
  };
};
