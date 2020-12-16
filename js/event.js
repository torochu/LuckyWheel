import {
  fetchEvent,
  fetchEventMembers,
  fetchEventGifts,
  removeEventGift,
  removeEventMember,
  createEventHistory,
  fetchEventHistory,
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
const winnerList = document.getElementById('winner_list');

let itemAngle = 0; // 每個扇型佔有多少角度
let startAngle = 0; // 起始角度
let goToAngle = 0; // 終點角度
let actualDegree; // 中獎角度

let event = {};
let eventGifts = [];
let eventMembers = [];
let selectedGift = {};
let selector = {};
let eventWinners = [];
let historyObj = {};

const eventID = window.location.search.split('=')[1];

// FUNCTION: 倒數計時
let timer = (now, countDownDate) => {
  let x = setInterval(function () {
    // Get today's date and time
    // let now = new Date().getTime();

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
    document.getElementById('countdown').innerHTML =
      days + 'D：' + hours + 'H：' + minutes + 'M：' + seconds + 'S ';

    // If the count down is finished, write some text
    // if (distance < 0) {
    // clearInterval(x);
    // document.getElementById('demo').innerHTML = 'EXPIRED';
    // }
  }, 1000);
};

let isEmptyObj = (obj) => {
  return Object.keys(obj).length === 0;
};

// FUNCTION: 打亂獎項 order
let shuffle = function (a, b) {
  let num = Math.random() > 0.5 ? -1 : 1;
  return num;
};

let assembleTextBox = (item, rotateAngle, itemAngle) => {
  return `
    <div class="textBox" style="transform: rotate(${
      rotateAngle + itemAngle / 2
    }deg);">
      ${item.giftName}
    </div>
  `;
};

let assemblePieSlice = (item, idx, rotateAngle, skewedAngle, oddEven) => {
  return `
    <div 
      data-gift="${item.id}"
      class="slice" 
      style="
      transform: rotate(${rotateAngle}deg) skewY(${skewedAngle}deg); 
      background: ${oddEven[idx % oddEven.length]}
    "></div>
  `;
};

let renderWheel = () => {
  console.log('渲染轉盤 開始');

  // 隨機挑選玩家
  selector = eventMembers[Math.floor(Math.random() * eventMembers.length)];
  player.textContent = eventMembers.length !== 0 ? selector.memberName : '';
  const oddEven = eventGifts.length % 3 === 1 ? colors2 : colors;
  let gifts = eventGifts.sort(shuffle); // 打亂排序的獎項 array
  // console.log("判斷雙單數", oddEven);
  itemAngle = 360 / eventGifts.length;

  let skewedAngle = -90 + itemAngle;
  // console.log("skewedAngle: ", skewedAngle);
  let rotateAngle = 0; // 旋轉從 0 開始
  let pieTemplate = '';
  let textTemplate = '';

  switch (eventGifts.length) {
    case 0:
      textTemplate += `
        <div
          class="textBox"
          style="
            transform: rotate(0deg);
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
        ">
          沒有禮物了....
        </div>
      `;

      localStorage.setItem(
        eventID,
        JSON.stringify({
          count: 0,
        })
      );
      break;
    case 1:
      console.log('只剩一個禮物');
      eventGifts.forEach((item, index) => {
        textTemplate += assembleTextBox(item, rotateAngle, itemAngle);

        pieTemplate += `<div data-gift="${item.id}" class="slice-full"
        style="background: ${oddEven[index % oddEven.length]}"
        ></div>`;
        rotateAngle -= itemAngle; // 旋轉 - angle
      });

      break;
    case 2:
      console.log('只剩 2 個禮物');
      eventGifts.forEach((item, index) => {
        textTemplate += assembleTextBox(item, rotateAngle, itemAngle);

        pieTemplate += `
          <div 
            data-gift="${item.id}"
            class="slice-half" 
            style="
              transform: rotate(${rotateAngle}deg) skewY(0deg); 
              background: ${oddEven[index % oddEven.length]}
            ">
          </div>`;
        rotateAngle -= itemAngle; // 旋轉 - angle
      });
      break;
    // case 3:
    //   console.log("只剩 3 個禮物");

    //   break;
    default:
      eventGifts.forEach((item, index) => {
        textTemplate += assembleTextBox(item, rotateAngle, itemAngle);
        pieTemplate += assemblePieSlice(
          item,
          index,
          rotateAngle,
          skewedAngle,
          oddEven
        );
        rotateAngle -= itemAngle; // 旋轉 - angle
      });
      break;
  }

  textsWrapper.innerHTML = textTemplate;
  giftsWrapper.innerHTML = pieTemplate;

  // console.log(textsWrapper);
};

async function modifyList(obj) {
  const { event, gift, member } = obj;
  historyObj = {
    // ...event,
    // ...selectedGift,
    // ...selector,
    id: Date.now(),
    eventId: event.id,
    memberName: selector.memberName,
    giftName: selectedGift.giftName,
    // eventId: event.id,
    // giftId: selectedGift.id,
    // memberId: selector.id,
  };
  console.log('historyObj:', historyObj);
  // debugger;
  try {
    // debugger;
    // 移除 gift item
    await removeEventGift(gift.id);
    // 移除 中獎者
    await removeEventMember(member.id);

    // 新增得獎者資訊至 eventHistory
    await createEventHistory(historyObj);
  } catch (err) {
    console.log('錯誤：', err);
  }

  console.log(historyObj);
}

// FUNCTION: 下一回合
let nextRound = () => {
  console.log('next round');

  localStorage.setItem(
    eventID,
    JSON.stringify({
      count: eventGifts.length - 1,
    })
  );

  const item = {
    event,
    gift: selectedGift,
    member: selector,
  };
  console.log(item);
  // debugger;
  // historyObj = {
  //   ...event,
  //   ...selectedGift,
  //   ...selector,
  //   id: Date.now(),
  //   eventId: event.id,
  //   giftId: selectedGift.id,
  //   memberId: selector.id,
  // };

  // 新增得獎者資訊至 eventHistory
  // createEventHistory(historyObj);

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

  // console.log("randomIndex: ", rndDrawIndex);
  // console.log("random member: ", selector);

  selectedGift = eventGifts[rndDrawIndex];
  // console.log("抽出得獎項： ", selectedGift);

  goToAngle = startAngle + (rndDrawIndex * itemAngle + 360 * 4);
  pie.style.transition = 'all 4s ease-out';
  pie.style.transform = `rotate(${goToAngle}deg)`;
  // console.log("goAngle", goToAngle);
};

let afterTransition = (e) => {
  // console.log("e: ", e);
  actualDegree = goToAngle % 360; // 取得餘數, 真實的degree 中獎角度
  // console.log("actual degree: ", actualDegree);
  // pie.style.transform = `rotate(${actualDegree}deg)`
  const selectedSlice = document.querySelector(
    `[data-gift="${selectedGift.id}"]`
  );

  // 把抽中的 slice 換顏色
  // switch (eventGifts.length) {
  //   case 1:
  //     pie.classList.add('selected');
  //     break;
  //   case 2:
  //     break;
  //   default:
  selectedSlice.classList.add('selected');
  //     break;
  // }

  // 把獎項放到 DOM
  prizeWon.textContent = selectedGift.giftName;

  // 把 ＧＯ 按鈕置換成 下一位 按鈕
  setTimeout(() => {
    rotateBtn.classList.add('d-none');
    nextPlayer.classList.remove('d-none');
  }, 2000);
};

let renderEventHistory = () => {
  let historyTempalte = '';
  for (let item of eventWinners) {
    console.log(item);
    historyTempalte += `<li>${item.memberName} 抽到了 ${item.giftName}</li>`;
  }
  winnerList.innerHTML = historyTempalte;
};

let loadingAnimation = () => {
  console.log('fly');
  const rocketOff = document.querySelector('.rocketOff');
  const rocketOn = document.querySelector('.rocketOn');
  rocketOff.classList.add('d-none');
  rocketOn.classList.remove('d-none');
  // debugger;
  rocketOn.classList.add('rocket_fly');
  setTimeout(() => {
    const loadingEle = document.querySelector('.isLoading');
    loadingEle.classList.add('d-none');
    // debugger;
  }, 3000);
};

let startLoading = () => {
  // let count = 0;
  if (localStorage.getItem(eventID) === null) {
    console.log('找不到 eventID local storage');
    let obj = {
      count: 0,
    };
    localStorage.setItem(eventID, JSON.stringify(obj));
    loadingAnimation();
  } else {
    console.log('eventID local storage存在');
    let eventStorage = JSON.parse(localStorage.getItem(eventID));
    // count = eventStorage.count;
    // 判斷是否為 0
    console.log('次數：', eventStorage.count);
    if (eventStorage.count === 0) {
      loadingAnimation();
    } else {
      const loadingEle = document.querySelector('.isLoading');
      loadingEle.classList.add('d-none');
      // debugger;
    }
  }
};

async function getData(eventID) {
  try {
    await fetchEventGifts(eventID).then((res) => (eventGifts = res.data));
    await fetchEventMembers(eventID).then((res) => (eventMembers = res.data));
    await fetchEventHistory(eventID).then((res) => (eventWinners = res.data));
    console.log('目前禮品數量：', eventGifts.length);
    console.log('目前參與者人數: ', eventMembers.length);
    console.log('得獎資料: ', eventWinners.length);
    await renderWheel();
    await renderEventHistory();
    await startLoading();
  } catch (err) {
    console.log(err);
  }
}

rotateBtn.addEventListener('click', spin);
pie.addEventListener('transitionend', afterTransition);
nextPlayer.addEventListener('click', nextRound);

(function init() {
  // let count = 0;
  console.log('getitem:', localStorage.getItem(eventID).count);
  console.log('getitem:', JSON.parse(localStorage.getItem(eventID)).count);

  if (
    JSON.parse(localStorage.getItem(eventID)) === 0 &&
    localStorage.getItem(eventID) === null
  ) {
    // debugger;
    console.log('local storage  不等於 0');
    const loadingEle = document.querySelector('.isLoading');
    loadingEle.classList.add('d-none');
  } else {
    console.log('fefe');
  }

  // localStorage.setItem(
  //   eventID,
  //   JSON.stringify({
  //     count: count + 1,
  //   })
  // );

  fetchEvent(eventID).then((res) => {
    if (res.status === 200) {
      event = { ...res.data };
      heading.textContent = event.name;
      // console.log("fetchEvent", res);
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
