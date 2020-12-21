// import apiService from './apiService.js';
import { fetchEvents } from './api.js';
import { checkEventState } from './util.js';
// const eventList = document.getElementById('event-list');
let events = [];

const createEventCard = (item, tag) => {
  const _lookup = {
    inProgress: '',
    notAvailable: '未開始',
    ended: '已結束',
  };

  const status_text = _lookup[tag];

  return `
    <article class="card">
      <div class="imgWrapper">
        <p>${status_text}</p>
          <img
            src="${item.imgUrl}"
            alt=""
            class="circleImg"
          >
          
      </div>

      <h3 class="title">${item.name}</h3>
    </article>
  `;
};

const createEventLink = (item, tag) => {
  const link = document.createElement('a');
  link.setAttribute('href', `./event.html?id=${item.id}`);
  const card = createEventCard(item, tag);
  link.innerHTML = card;
  return link;
};

const appendEventLink = (root, item, tag) => {
  const el = createEventLink(item, tag);
  // console.log('appendEventLink root: ', root);
  root.appendChild(el);
};

let renderEvents = (arr, tag, disabled = false) => {
  const root = document.getElementById(tag);

  arr.forEach((item) => {
    appendEventLink(root, item, tag);
  });
};

let render = () => {
  let lists = '';
  const currentDate = Date.parse(new Date());
  function eventIsOver(now, start, end) {
    if (now > Date.parse(start) && now < Date.parse(end)) {
      return '活動進行中';
    } else if (now > Date.parse(start) && now > Date.parse(end)) {
      return '活動已經結束';
    } else {
      return '活動未開始';
    }
  }
};

(function () {
  return fetchEvents()
    .then((res) => {
      if (res.status === 200) {
        events = res.data;

        render();
        return events;
      } else {
        eventList.innerText = `錯誤： ${res.status}`;
      }
    })
    .then((res) => {
      let notAvailable = [];
      let inProgress = [];
      let ended = [];

      let now = new Date().getTime();
      for (let item of res) {
        switch (checkEventState(item, now)) {
          case 'in-progress':
            inProgress.push(item);
            break;
          case 'ended':
            ended.push(item);
            break;
          case 'not-available':
            notAvailable.push(item);
            break;
        }
      }

      renderEvents(inProgress, 'inProgress');
      renderEvents(notAvailable, 'notAvailable', true);
      renderEvents(ended, 'ended');
    })
    .catch((err) => {
      console.log(err);
      eventList.innerText = '錯誤';
    });
})();
