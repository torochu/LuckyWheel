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

  // activeEventsArr.forEach((item) => {
  events.forEach((item) => {
    let str = `<li><a href="./event.html?id=${item.id}">${item.name}</a></li>`;
    lists += str;
  });
  eventList.innerHTML = lists;
};
