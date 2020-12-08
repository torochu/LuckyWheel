const colors = ['#f1e8e6', '#bbd4ce', '#64379f', '#81e9e6', '#2c698d', '#2a6fdb', '#ffcb00','#543c52', '#fefcbf', '#ff6150', '#e3f6f5', '#072448', '#f9b4ab', '#fdebd3', '#bbd4ce', '#309975', '#ddacf5', '#dad873', '#bae8e8', '#f55951', '#edd2cb', '#95adbe']
// let items = ['衛生紙', '礦泉水', 'iPhone 12', '沙子', '滑鼠', '水壺'];
let items = ['衛生紙', '礦泉水', 'iPhone 12', '沙子', '滑鼠', '水壺', '湯匙', '糖果', '麵包', '蘋果', '螢幕', '維他命', '筆電', '慢跑鞋', '羽球拍', '彈珠', '安全帽', '咖啡', '咖啡1', '咖啡2', '咖啡3', '咖啡4'];

const pie = document.querySelector('#pie');
const startBtn = document.querySelector('.startBtn');
let angle = 360 / items.length; // 每個扇型佔有多少角度
let goAngle = 0;
let actualDegree = 0; // 中獎角度
let startAngle = 15;  // 指針起始角度
let rotateAngle = 0;
(function () {   
  let slice = '';  
  let skewedAngle = -90 + angle;
  let rotateAngle = 0; // 旋轉從 0 開始
  items.forEach((item, index) => {
    const temp = `<li class="slice" style="transform: rotate(${ rotateAngle }deg) skewY(${ skewedAngle }deg); background-color: ${colors[index]};" data-item="${items[index]}"></li>`
    // console.log(temp)
    slice += temp;
    rotateAngle -= angle; // 旋轉 - angle
  });

  pie.innerHTML = slice;
})();


let spin = () => {
  let rndDrawIndex = Math.round(Math.random() * items.length);
  // let shuffle = function(a, b) {
  //   let num = Math.random() > 0.5 ? -1 : 1
  //   return num
  // }
  // let gift = items.sort(shuffle)
  // console.log(gift)
  console.log(items[rndDrawIndex])
  // console.log('random index: ', rndDrawIndex)
  console.log('startAngle: ', startAngle)
  console.log('隨機 * 圈數: ', rndDrawIndex + 4 * 360)
  goAngle = startAngle + (rndDrawIndex * angle + 360 * 4);
  pie.style.transition = 'all 4s ease-out';
  pie.style.transform = `rotate(${goAngle}deg)`
  console.log('goAngle', goAngle)
}

  let afterTransition = (e) => {
    actualDegree = goAngle % 360; // 取得餘數, 真實的degree 中獎角度
    console.log('actual degree: ', actualDegree)
    // pie.style.transform = `rotate(${actualDegree}deg)`
  }


startBtn.addEventListener('click', spin);
pie.addEventListener('transitionend', afterTransition);