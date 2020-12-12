import {
  fetchEvent,
  fetchEventMembers,
  fetchEventGifts,
  removeEventGift,
  removeEventMember,
  createEventHistory,
} from './api.js';
// import timer from './timer.js'

const colors2 = ['#ffd15b', '#ffe99c'];
const colors = ['#ffd15b', '#ffe99c', '#ffbe5b'];

const pie = document.getElementById('pie');
const giftsWrapper = document.querySelector('#giftsWrapper');
const textsWrapper = document.querySelector('#textsWrapper');
const prizeWon = document.querySelector('#prizeWon');
const player = document.getElementById('player');
const heading = document.querySelector('.heading');
const rotateBtn = document.getElementById('rotateBtn');
const nextPlayer = document.getElementById('nextPlayer');
let itemAngle = 0; // 每個扇型佔有多少角度
let startAngle = 0; // 起始角度
let goToAngle = 0; // 終點角度
let actualDegree; // 中獎角度
let event = {};
let eventGifts = [];
let eventMembers = [];
let selectedGift = {};
let selector = {};

// FUNCTION: 倒數計時
let timer = (now, countDownDate) => {
  let x = setInterval(function () {
    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the count down date
    let distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById('app').innerHTML =
      days + 'D：' + hours + 'H：' + minutes + 'M：' + seconds + 'S ';

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById('demo').innerHTML = 'EXPIRED';
    }
  }, 1000);
};

// FUNCTION: 打亂獎項 order
let shuffle = function (a, b) {
  let num = Math.random() > 0.5 ? -1 : 1;
  return num;
};

let renderWheel = () => {
  console.log('渲染轉盤 開始');

  // 隨機挑選玩家
  selector = eventMembers[Math.floor(Math.random() * eventMembers.length)];
  player.textContent = selector.memberName;
  const oddEven = eventGifts.length % 3 === 1 ? colors2 : colors;
  let gifts = eventGifts.sort(shuffle); // 打亂排序的獎項 array
  console.log('判斷雙單數', oddEven);
  itemAngle = 360 / eventGifts.length;

  let skewedAngle = -90 + itemAngle;
  console.log('skewedAngle: ', skewedAngle);
  let rotateAngle = 0; // 旋轉從 0 開始
  let pieTemplate = '';
  let textTemplate = '';

  eventGifts.forEach((item, index) => {
    let textTemp = `
      <div class="textBox" style="transform: rotate(${
        rotateAngle + itemAngle / 2
      }deg);">
          ${item.giftName}
      </div>
    `;
    console.log('index % oddEven.length: ', index % oddEven.length);
    let pieTemp = `
      <div 
        data-gift="${item.id}"
        class="slice" 
        style="
          transform: rotate(${rotateAngle}deg) skewY(${skewedAngle}deg); 
          background: ${oddEven[index % oddEven.length]}
      "></div>
    `;
    // console.log('字體反轉: ', 90 - itemAngle);
    textTemplate += textTemp;
    pieTemplate += pieTemp;

    rotateAngle -= itemAngle; // 旋轉 - angle
  });

  textsWrapper.innerHTML = textTemplate;
  giftsWrapper.innerHTML = pieTemplate;

  console.log(textsWrapper);
};

async function modifyList(obj) {
  const { gift, member } = obj;
  const historyObj = {
    ...event,
    ...gift,
    ...member,
    id: Date.now(),
    eventId: gift.eventId,
    giftId: gift.id,
    memberId: member.id,
  };

  try {
    // 新增 eventHistory
    await createEventHistory(historyObj);
    // 移除 gift item
    await removeEventGift(gift.id);
    // 移除 中獎者
    await removeEventMember(member.id);
  } catch (err) {
    console.log('錯誤：', err);
  }

  console.log(historyObj);
}

// async function removeMemberGift(obj) {
//   const { gift, member } = obj;
//   try {
//     // 移除 gift item
//     await removeEventGift(gift.id);
//     // 移除 中獎者
//     await removeEventMember(member.id);
//   } catch (err) {
//     console.log('錯誤：', err);
//   }
// }

// FUNCTION: 下一回合
let nextRound = () => {
  console.log('next round');
  const item = {
    gift: selectedGift,
    member: selector,
  };

  modifyList(item);
  // 清空被選取的 人＆禮物
  selector = {};
  selectedGift = {};
};

// FUNCTION: 轉盤開始旋轉
let spin = (e) => {
  rotateBtn.disabled = true;
  console.log('開始旋轉');
  let rndDrawIndex = Math.floor(Math.random() * eventGifts.length);

  console.log('randomIndex: ', rndDrawIndex);
  console.log('random member: ', selector);

  selectedGift = eventGifts[rndDrawIndex];
  console.log('抽出得獎項： ', selectedGift);

  goToAngle = startAngle + (rndDrawIndex * itemAngle + 360 * 4);
  pie.style.transition = 'all 4s ease-out';
  pie.style.transform = `rotate(${goToAngle}deg)`;
  console.log('goAngle', goToAngle);
};

let afterTransition = (e) => {
  console.log('e: ', e);
  actualDegree = goToAngle % 360; // 取得餘數, 真實的degree 中獎角度
  console.log('actual degree: ', actualDegree);
  // pie.style.transform = `rotate(${actualDegree}deg)`

  // 把抽中的 slice 換顏色
  const selectedSlice = document.querySelector(
    `[data-gift="${selectedGift.id}"]`
  );
  selectedSlice.classList.add('selected');

  // 把獎項放到 DOM
  prizeWon.textContent = selectedGift.giftName;

  // 把 ＧＯ 按鈕置換成 下一位 按鈕
  setTimeout(() => {
    rotateBtn.classList.add('d-none');
    nextPlayer.classList.remove('d-none');
  }, 2000);
};

async function getData(eventID) {
  try {
    await fetchEventGifts(eventID).then((res) => (eventGifts = res.data));
    await fetchEventMembers(eventID).then((res) => (eventMembers = res.data));
    console.log('獎項數量: ', eventGifts.length);
    console.log('參與者人數: ', eventMembers.length);
    renderWheel();
  } catch (err) {
    console.log(err);
  }
}

rotateBtn.addEventListener('click', spin);
pie.addEventListener('transitionend', afterTransition);
nextPlayer.addEventListener('click', nextRound);

(function () {
  const eventID = window.location.search.split('=')[1];

  fetchEvent(eventID).then((res) => {
    if (res.status === 200) {
      event = { ...res.data };
      heading.textContent = event.name;
      console.log('fetchEvent', res);
      let now = new Date().getTime();
      if (now > Date.parse(event.start)) {
        console.log('活動開始');
        getData(eventID);
      } else if (now > Date.parse(event.end)) {
        console.log('活動已經結束');
      } else {
        console.log('活動倒數');
        timer(now, Date.parse(event.start));
      }
    }
  });
})();
