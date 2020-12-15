import apiService from './apiService.js';

const eventList = document.getElementById('event-list');
let events = [];

(function () {
  return apiService
    .fetchEvents()
    .then((res) => {
      if (res.status === 200) {
        events = res.data;
        console.log(res);
        render();
      } else {
        eventList.innerText = `錯誤： ${res.status}`;
      }
    })
    .catch((err) => {
      console.log(err);
      eventList.innerText = '錯誤';
    });
})();

let activeEvents = (currentDate, items) => {
  return items.filter((item) => {
    return (
      Date.parse(item.start) < currentDate && Date.parse(item.end) > currentDate
    );
  });
};

let render = () => {
  let lists = '';
  const currentDate = Date.parse(new Date());
  // const activeEventsArr = activeEvents(currentDate, events)
  function eventIsOver(now, start, end) {
    if (now > Date.parse(start) && now < Date.parse(end)) {
      return '活動進行中';
    } else if (now > Date.parse(start) && now > Date.parse(end)) {
      return '活動已經結束';
    } else {
      return '活動未開始';
    }
  }

  // activeEventsArr.forEach((item) => {
  events.forEach((item) => {
    let now = new Date().getTime();
    console.log('現在: ', now);
    console.log('開始: ', Date.parse(item.start));
    console.log('結束: ', Date.parse(item.end));
    let str = `
      <li>
        <a href="./event.html?id=${item.id}">
          ${item.name}
        </a>, 
        開始時間: ${item.start.split('T')[0]}; 
        結束時間: ${item.end.split('T')[0]};
        ${eventIsOver(now, item.start, item.end)}
      </li>
    `;
    lists += str;
  });
  eventList.innerHTML = lists;
};
