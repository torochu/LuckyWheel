import {fetchEvent, fetchEventMembers, fetchEventGifts} from './api.js'
// import timer from './timer.js'

const colors = ['#f1e8e6', '#bbd4ce', '#64379f', '#81e9e6', '#2c698d', '#2a6fdb', '#ffcb00','#543c52', '#fefcbf', '#ff6150', '#e3f6f5', '#072448', '#f9b4ab', '#fdebd3', '#bbd4ce', '#309975', '#ddacf5', '#dad873', '#bae8e8', '#f55951', '#edd2cb', '#95adbe']


let event = {}
let eventGifts = []
let eventMembers = []


let timer = (now, countDownDate) => {
  let x = setInterval(function() {

    // Get today's date and time
    let now = new Date().getTime();

    // Find the distance between now and the count down date
    let distance = countDownDate - now;

    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the element with id="demo"
    document.getElementById("app").innerHTML = days + "d " + hours + "h "
    + minutes + "m " + seconds + "s ";

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(x);
      document.getElementById("demo").innerHTML = "EXPIRED";
    }
  }, 1000);
}

let renderWheel = () => {
  console.log('render wheel')
  const pie = document.querySelector('#pie')
  const pieText = document.querySelector('#pieText')
  let itemAngle = 360 / eventGifts.length; // 每個扇型佔有多少角度
  let startAngle = 15;  // 指針起始角度
  let textAngle = 0;
  let skewedAngle = -90 + itemAngle;
  let rotateAngle = 0; // 旋轉從 0 開始
  let pieTemplate = ''
  let textTemplate = ''

  console.log('rotate angle ', rotateAngle)
  console.log('skewedAngle ', skewedAngle)
  console.log('item angle: ', itemAngle)
  

  eventGifts.forEach((item, index) => {
    let textTemp = `
      <li class="slice textSlice">
        <p style="transform: rotate(0deg);">
          ${ index }
        </p>
      </li>
    `
    textTemplate += textTemp;

    // let pieTemp = `
    //   <li class="slice" style="transform: rotate(${ rotateAngle }deg) skewY(${ skewedAngle }deg); background-color: ${colors[index]};">
    //     <div style="">
    //       <p style="
    //         transform: rotate(0deg) skewY(${90-itemAngle}deg);
    //       ">
          
    //       </p>
    //     </div>
    //   </li>
    // `
      console.log('字體反轉: ', 90-itemAngle)
    // console.log(temp)
    // pieTemplate += pieTemp;
    rotateAngle -= itemAngle; // 旋轉 - angle
  })
  pieText.innerHTML = textTemplate
  pie.innerHTML = pieTemplate
  console.log('pieText: ', pieText)
  console.log('pieTemplate: ', pieTemplate)
}

async function getData(eventID) {
  try {
    await fetchEventGifts(eventID).then(res => eventGifts = res.data)
    await fetchEventMembers(eventID).then(res => eventMembers = res.data)
    renderWheel()
  } catch (err) {
    console.log(err)
  }
}

(function () {
  const eventID = window.location.search.split('=')[1]

  fetchEvent(eventID)
  .then(res => {
    if (res.status === 200) {
      event = {...res.data}
      console.log('fetchEvent', res)
      let now = new Date().getTime()
      if (now > Date.parse(event.start)) {
        console.log('活動開始')
        getData(eventID)
      } else if (now > Date.parse(event.end)){
        console.log('活動已經結束')
        
      } else {
        console.log('活動倒數')
        timer(now, Date.parse(event.start))
        
      }
    }
  })
})();