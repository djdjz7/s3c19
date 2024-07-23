import { data } from './data.js';
import { createApp, reactive } from './petite-vue.es.js'

const store = reactive({
    data,
    selectedProvince: { details: [] },
    isInSelection: false,
    setSelection(province) {
        this.selectedProvince = province;
    }
});

createApp({ store }).mount()

let hue = 0;
const updateHue = () => {
    hue = (hue + 0.1) % 360; // 每次增加1，范围保持在0-359之间
    document.documentElement.style.setProperty('--theme-hue', hue);
    requestAnimationFrame(updateHue); // 请求下一帧
};
requestAnimationFrame(updateHue); // 启动动画

const map = document.getElementById('map');

const lands = document.querySelectorAll('.land');
const infoAreaTitleText = document.getElementById('info-area-title-text');
const backButton = document.getElementById('back-button');
const infoAreaTitle = document.getElementById('info-area-title');
const schoolWrapper = document.getElementById('school-wrapper');

const fadeLeftOutKF = [
    {
        transform: "translateX(-40px)",
        opacity: 0,
    },
];

const fadeRightInKF = [
    {
        transform: "translateX(40px)",
        opacity: 0,
    },
    {
        transform: "translateX(0)",
        opacity: 1,
    },
];

const fadeTiming = {
    duration: 250,
    iterations: 1,
    fill: "both",
    easing: "ease-out",
};

lands.forEach(land => {
    console.log(land.getAttribute('title'));
    land.addEventListener('mouseover', function () {
        lands.forEach(otherLand => {
            if (otherLand !== land) {
                otherLand.classList.add('unselected');
            }
        });
    });

    land.addEventListener('mouseout', function () {
        lands.forEach(otherLand => {
            otherLand.classList.remove('unselected');
        });
    });
});

lands.forEach(land => {
    land.addEventListener("click", provinceClick);
    let num = data.find(province => province.province === land.getAttribute('title'))?.num;
    if (num != undefined) {
        land.setAttribute('data-num', num);
        land.style.fill = `hsl(var(--theme-hue), ${num * 20}%, 70%)`;
    }
})

backButton.addEventListener("click", back);

function provinceClick(e) {
    if (store.isInSelection)
        return;

    store.isInSelection = true;

    backButton.style.opacity = 1;
    infoAreaTitle.style.transform = "";

    var target = e.target;
    map.appendChild(target);

    lands.forEach(land => {
        if (land !== target) {
            land.classList.remove('selected-hold');
            land.classList.add('unselected-hold');
        }
    });
    target.classList.add('selected-hold');

    const targetRect = target.getBoundingClientRect();
    const mapRect = map.getBoundingClientRect();
    const xRatio = mapRect.width / targetRect.width;
    const yRatio = mapRect.height / targetRect.height;
    const ratio = Math.min(xRatio, yRatio) * 0.7;

    const dx = (mapRect.width - targetRect.width) / 2 - targetRect.left;
    const dy = (mapRect.height - targetRect.height) / 2 - targetRect.top;

    map.style.transformOrigin = `${targetRect.left + targetRect.width / 2}px ${targetRect.top + targetRect.height / 2}px`;
    map.style.translate = `-${dx}px -${dy}px`;
    map.style.transform = `rotateX(45deg) rotateZ(12deg) scale(${ratio})`;
    infoAreaTitleText.innerText = target.getAttribute('title');



    var animation = schoolWrapper.animate(fadeLeftOutKF, fadeTiming);
    animation.onfinish = () => {
        store.setSelection(data.find(province => province.province === target.getAttribute('title')));
        schoolWrapper.animate(fadeRightInKF, fadeTiming);
    };
}

function back() {
    store.isInSelection = false;
    backButton.style.opacity = 0;
    infoAreaTitle.style.transform = "translateX(-40px)";
    map.style.transform = "";
    map.style.translate = "";
    lands.forEach(land => {
        land.classList.remove('selected-hold');
        land.classList.remove('unselected-hold');
    });
}