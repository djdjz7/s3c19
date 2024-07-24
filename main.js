import { data } from "./data.js";
import { createApp, reactive } from "./petite-vue.es.js";

const store = reactive({
  data,
  selectedProvince: { details: [] },
  isInSelection: false,
  isInitial: true,
  setSelection(province) {
    this.selectedProvince = province;
  },
});

createApp({ store }).mount();

let hue = 0;
const updateHue = () => {
  hue = (hue + 0.1) % 360;
  document.documentElement.style.setProperty("--theme-hue", hue);
  requestAnimationFrame(updateHue);
};

requestAnimationFrame(updateHue);

document.addEventListener("DOMContentLoaded", () => {
  const loadingOverlay = document.getElementById("loading-overlay");
  loadingOverlay.style.opacity = 0;
  setTimeout(() => {
    loadingOverlay.remove();
  }, 500);
});

var isMenuOpen = false;

const map = document.getElementById("map");

const lands = document.querySelectorAll(".land");
const infoAreaTitleText = document.getElementById("info-area-title-text");
const backButton = document.getElementById("back-button");
const menuToggle = document.getElementById("menu-toggle");
const infoAreaTitle = document.getElementById("info-area-title");
const schoolWrapper = document.getElementById("school-wrapper");
const provinceListItems = document.querySelectorAll(".province-list-item");
const provinceList = document.getElementById("available-province-list");

const menuToggleUpper = document.getElementById("menu-toggle-upper");
const menuToggleMiddle = document.getElementById("menu-toggle-middle");
const menuToggleLower = document.getElementById("menu-toggle-lower");

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

lands.forEach((land) => {
  land.addEventListener("mouseover", function () {
    lands.forEach((otherLand) => {
      if (otherLand !== land) {
        otherLand.classList.add("unselected");
      }
    });
  });

  land.addEventListener("mouseout", function () {
    lands.forEach((otherLand) => {
      otherLand.classList.remove("unselected");
    });
  });
});

provinceListItems.forEach((item) => {
  item.addEventListener("click", function () {
    let provinceName = item.querySelector("h2").textContent.trim();
    let target = [...lands].find(
      (land) => land.getAttribute("title") === provinceName
    );

    provinceClick(
      {
        target,
      },
      true
    );
  });
});

lands.forEach((land) => {
  land.addEventListener("click", provinceClick);
  let num = data.find(
    (province) => province.province === land.getAttribute("title")
  )?.num;
  if (num != undefined) {
    land.setAttribute("data-num", num);
    land.style.fill = `hsl(var(--theme-hue), ${num * 20}%, 70%)`;
  }
});

backButton.addEventListener("click", back);
menuToggle.addEventListener("click", toggleMenu);

function provinceClick(e, isAutoClose = false) {
  store.isInitial = false;

  closeMenu(true);

  if (store.isInSelection) return;

  store.isInSelection = true;

  backButton.style.opacity = 1;
  menuToggle.style.opacity = 0;

  infoAreaTitle.style.transform = "";

  var target = e.target;
  map.appendChild(target);
  target.classList.add("selected-hold");

  lands.forEach((land) => {
    if (land !== target) {
      land.classList.remove("selected-hold");
      land.classList.add("unselected-hold");
    }
  });

  const targetRect = target.getBoundingClientRect();
  const mapRect = map.getBoundingClientRect();
  const xRatio = mapRect.width / targetRect.width;
  const yRatio = mapRect.height / targetRect.height;
  const ratio = Math.min(xRatio, yRatio) * 0.7;

  const dx = (mapRect.width - targetRect.width) / 2 - targetRect.left;
  const dy = (mapRect.height - targetRect.height) / 2 - targetRect.top;

  map.style.transformOrigin = `${targetRect.left + targetRect.width / 2}px ${
    targetRect.top + targetRect.height / 2
  }px`;
  map.style.translate = `-${dx}px -${dy}px`;
  map.style.transform = `rotateX(45deg) rotateZ(12deg) scale(${ratio})`;
  infoAreaTitleText.innerText = target.getAttribute("title");

  var animation = schoolWrapper.animate(
    isAutoClose ? null : fadeLeftOutKF,
    fadeTiming
  );
  animation.onfinish = () => {
    let conflictingBackgrounds = document.querySelectorAll(
      ".conflicting-background"
    );
    conflictingBackgrounds.forEach((background) => {
      console.log(background);
      background.style.opacity = 1;
    });
    store.setSelection(
      data.find(
        (province) => province.province === target.getAttribute("title")
      )
    );
    schoolWrapper.animate(fadeRightInKF, fadeTiming);
  };
}

function back() {
  store.isInSelection = false;
  backButton.style.opacity = 0;
  menuToggle.style.opacity = 1;
  infoAreaTitle.style.transform = "translateX(-40px)";
  map.style.transform = "";
  map.style.translate = "";
  lands.forEach((land) => {
    land.classList.remove("selected-hold");
    land.classList.remove("unselected-hold");
  });
}

function toggleMenu() {
  if (!isMenuOpen) {
    isMenuOpen = true;

    menuToggleUpper.style.top = "5px";
    menuToggleUpper.style.transform = "rotate(45deg)";
    menuToggleMiddle.style.opacity = "0";
    menuToggleLower.style.top = "-5px";
    menuToggleLower.style.transform = "rotate(-45deg)";

    let conflictingBackgrounds = document.querySelectorAll(
      ".conflicting-background"
    );

    conflictingBackgrounds.forEach((background) => {
      console.log(background);
      background.style.opacity = 0;
    });

    provinceList.style.height = "100%";
    provinceListItems.forEach((item) => {
      item.style.opacity = 1;
      item.style.transform = "translateY(-40px)";
    });
  } else {
    closeMenu();
  }
}

function closeMenu(isAutoClose = false) {
  isMenuOpen = false;

  menuToggleUpper.style.top = "";
  menuToggleUpper.style.transform = "";
  menuToggleMiddle.style.opacity = "";
  menuToggleLower.style.top = "";
  menuToggleLower.style.transform = "";

  let conflictingBackgrounds = document.querySelectorAll(
    ".conflicting-background"
  );

  if (!isAutoClose)
    conflictingBackgrounds.forEach((background) => {
      background.style.opacity = 1;
    });

  provinceList.style.height = "0%";
  provinceListItems.forEach((item) => {
    item.style.opacity = 0;
    item.style.transform = "";
  });
}
