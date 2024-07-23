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

const map = document.getElementById('map');

const lands = document.querySelectorAll('.land');
const infoAreaTitleText = document.getElementById('info-area-title-text');
const backButton = document.getElementById('back-button');
const infoAreaTitle = document.getElementById('info-area-title');

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
        land.style.fill = `hsl(72, ${num * 20}%, 70%)`;
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

    store.setSelection(data.find(province => province.province === target.getAttribute('title')));
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