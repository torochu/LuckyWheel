import {
  fetchEvent,
  fetchEventMembers,
  fetchEventGifts,
  removeEventGift,
  removeEventMember,
  createEventHistory,
  fetchEventHistory,
} from './api.js';

import {
  checkEventState,
  checkLocalStorageCount,
  setLocalStorageCount,
  clock,
} from './util.js';
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
let actualDegree = 0; // 中獎角度

let event = {};
let eventGifts = [];
let eventMembers = [];
let selectedGift = {};
let selector = {};
let eventWinners = [];
let historyObj = {};

const eventID = window.location.search.split('=')[1];

// FUNCTION: 倒數計時
let timer = (countDownDate) => {
  let x = setInterval(function () {
    let now = new Date().getTime();
    let { days, hours, minutes, seconds } = clock(now, countDownDate);

    // const rocketOff = document.getElementById('rocketOff');
    // const dollGifts = document.getElementById('dollGifts');

    // rocketOff.classList.remove('d-none');
    // rocketOff.classList.add('countdownRocketOff');
    // dollGifts.classList.remove('d-none');
    // dollGifts.classList.add('countdownDollGifts');

    const rocketDolls = document.getElementById('countdownRocketDoll');
    rocketDolls.classList.remove('d-none');

    document.getElementById('countdown').innerHTML =
      days + 'D：' + hours + 'H：' + minutes + 'M：' + seconds + 'S ';
  }, 1000);
};

// let isEmptyObj = (obj) => {
//   return Object.keys(obj).length === 0;
// };

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
    id: Date.now(),
    eventId: event.id,
    memberName: selector.memberName,
    giftName: selectedGift.giftName,
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
    await init();
  } catch (err) {
    console.log('錯誤：', err);
  }
}

// FUNCTION: 下一回合
let nextRound = () => {
  console.log('點擊 下一位，next round');

  // 設定 local storage count
  setLocalStorageCount(eventID, eventGifts.length - 1);

  // 組合
  const item = {
    event,
    gift: selectedGift,
    member: selector,
  };
  console.log('組合item object', item);
  // debugger;

  // 新增得獎者資訊至 eventHistory
  // createEventHistory(historyObj);

  modifyList(item);
  // 清空被選取的 人＆禮物
  selector = {};
  selectedGift = {};

  rotateBtn.disabled = false;
  rotateBtn.classList.remove('d-none');
  nextPlayer.classList.add('d-none');
  prizeWon.innerHTML = '&nbsp;';
};

// FUNCTION: 轉盤開始旋轉
let spin = (e) => {
  rotateBtn.disabled = true;
  console.log('點擊 ＧＯ 按鈕，開始旋轉');
  let rndDrawIndex = Math.floor(Math.random() * eventGifts.length);

  // console.log('startAngle', startAngle);
  // console.log('randomIndex: ', rndDrawIndex);
  // console.log('itemAngle', itemAngle);
  // console.log('actualDegree', actualDegree);
  console.table({
    startAngle: startAngle,
    randomIndex: rndDrawIndex,
    itemAngle: itemAngle,
    actualDegree: actualDegree,
  });
  // console.log("random member: ", selector);

  selectedGift = eventGifts[rndDrawIndex];
  // console.log("抽出得獎項： ", selectedGift);

  // 上一回的角度 + (禮物index * 扇型的角度 + 360度 * 4圈)
  goToAngle = startAngle + (rndDrawIndex * itemAngle + 360 * 4);
  pie.style.transition = 'all 4s ease-out';
  pie.style.transform = `rotate(${goToAngle}deg)`;
  console.log('goAngle', goToAngle);
};

let afterTransition = (e) => {
  actualDegree = goToAngle % 360; // 取得餘數, 真實的degree 中獎角度
  const selectedSlice = document.querySelector(
    `[data-gift="${selectedGift.id}"]`
  );
  console.log('轉盤停止時角度：', actualDegree);

  selectedSlice.classList.add('selected');

  // 把獎項放到 DOM
  prizeWon.textContent = selectedGift.giftName;

  // 把 ＧＯ 按鈕置換成 下一位 按鈕
  setTimeout(() => {
    rotateBtn.classList.add('d-none');
    nextPlayer.classList.remove('d-none');
  }, 2000);

  // 把 startAngle = actualDegree
  startAngle = goToAngle - actualDegree;
};

let renderEventHistory = () => {
  let historyTempalte = '';
  for (let item of eventWinners) {
    // console.log(item);
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

// 起始動畫
let startLoading = () => {
  console.log('loadingAnimation()');
  loadingAnimation();
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
    // await startLoading();
  } catch (err) {
    console.log(err);
  }
}

async function getEventAndCheck(eventID, now) {
  try {
    await fetchEvent(eventID)
      .then((res) => {
        // console.log(res);
        return (event = res.data);
      })
      .then((res) => {
        const eventState = checkEventState(res, now);
        const body = document.getElementById('app');
        switch (eventState) {
          case 'not-available':
            console.log('活動倒數');

            body.classList.add('disable-scroll');
            timer(Date.parse(event.start));
            break;
          case 'ended':
            console.log('活動已經結束');

            body.classList.add('disable-scroll');
            break;
          case 'in-progress':
            console.log('活動開始');
            console.log('EVENT ID: ', eventID);

            body.classList.remove('disable-scroll');
            // 檢查 localStorage count值, true 跑動畫
            const loadingEle = document.querySelector('.isLoading');
            const rocketOff = document.querySelector('.rocketOff');
            const rocketOn = document.querySelector('.rocketOn');
            const dollGifts = document.querySelector('.dollGifts');
            if (
              checkLocalStorageCount(
                eventID,
                loadingEle,
                dollGifts,
                rocketOff,
                rocketOn
              )
            ) {
              loadingAnimation();
            }

            getData(eventID);
            break;
          default:
            console.log('錯誤：找不到此活動');
        }
      });
    // return await checkEventState(event, now);
  } catch (error) {
    console.error(error);
  }
}

function init() {
  // const loadingEle = document.querySelector('.isLoading');
  // const rocketOff = document.querySelector('.rocketOff');
  // const rocketOn = document.querySelector('.rocketOn');
  // const dollGifts = document.querySelector('.dollGifts');

  // 檢查活動時間狀態

  let now = new Date().getTime();
  getEventAndCheck(eventID, now);
  // // const eventState = checkEventState(eventID, now);
}
init();

rotateBtn.addEventListener('click', spin);
pie.addEventListener('transitionend', afterTransition);
nextPlayer.addEventListener('click', nextRound);
