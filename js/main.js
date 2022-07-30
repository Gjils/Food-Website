window.addEventListener("DOMContentLoaded", () => {
  // Tabs

  const tabs = document.querySelectorAll(".tabheader__item"),
    tabsContent = document.querySelectorAll(".tabcontent"),
    tabsParent = document.querySelector(".tabheader__items");

  function hideTabContent() {
    tabsContent.forEach((tab) => {
      tab.classList.add("hide");
      tab.classList.remove("show", "fade");
    });

    tabs.forEach((tab) => {
      tab.classList.remove("tabheader__item_active");
    });
  }

  function showTabContent(i = 0) {
    tabsContent[i].classList.remove("hide");
    tabsContent[i].classList.add("fade", "show");
    tabs[i].classList.add("tabheader__item_active");
  }

  tabsParent.addEventListener("click", (event) => {
    const target = event.target;
    if (target && target.matches(".tabheader__item")) {
      tabs.forEach((tab, i) => {
        if (tab == target) {
          hideTabContent();
          showTabContent(i);
        }
      });
    }
  });

  hideTabContent();
  showTabContent();

  // Timer

  function getZero(num) {
    return num >= 0 && num < 10 ? "0" + num : num;
  }
  const endtime = "2023-05-20";

  function getTimeRemaining(endtime) {
    let days = 0,
      hours = 0,
      minutes = 0,
      seconds = 0;
    const t = Date.parse(endtime) - Date.parse(new Date());
    if (t > 0) {
      days = Math.floor(t / (1000 * 60 * 60 * 24));
      hours = Math.floor((t / (1000 * 60 * 60)) % days);
      minutes = Math.floor((t / (1000 * 60)) % 60);
      seconds = Math.floor((t / 1000) % 60);
    }
    return {
      total: t,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }
  function setClock(selector, endtime) {
    const timer = document.querySelector(selector),
      days = timer.querySelector("#days"),
      hours = timer.querySelector("#hours"),
      minutes = timer.querySelector("#minutes"),
      seconds = timer.querySelector("#seconds"),
      timeInterval = setInterval(updateClock, 1000);

    function updateClock() {
      const t = getTimeRemaining(endtime);
      days.innerHTML = getZero(t.days);
      hours.innerHTML = getZero(t.hours);
      minutes.innerHTML = getZero(t.minutes);
      seconds.innerHTML = getZero(t.seconds);

      if (t <= 0) {
        clearInterval(timeInterval);
      }
    }
    updateClock();
  }
  setClock(".timer", endtime);

  // Modal

  const modalTrigger = document.querySelectorAll("[data-modal]"),
    modalCloseBtn = document.querySelector("[data-close]"),
    modal = document.querySelector(".modal");

  function toggleModalWindow() {
    modal.classList.toggle("show");
    document.body.classList.toggle("scroll-lock");
    // clearInterval(modalTimerId);
  }

  // Hide modal window
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      toggleModalWindow();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && modal.classList.contains("show")) {
      toggleModalWindow();
    }
  });

  modalCloseBtn.addEventListener("click", toggleModalWindow);

  // Show modal window
  modalTrigger.forEach((btn) => {
    btn.addEventListener("click", toggleModalWindow);
  });

  // const modalTimerId = setTimeout(toggleModalWindow, 5000);

  function showModalByScroll() {
    if (
      window.pageYOffset + document.documentElement.clientHeight >=
      document.documentElement.scrollHeight - 1
    ) {
      toggleModalWindow();
      window.removeEventListener("scroll", showModalByScroll);
    }
  }
  window.addEventListener("scroll", showModalByScroll);

  // Menu pattern

  const menuBlock = document.querySelector(".menu .container"),
    menuItems = menuBlock.querySelectorAll(".menu__item"),
    menuParsedItems = [];

  menuBlock.innerHTML = "";

  menuItems.forEach((item, i) => {
    menuParsedItems.push({
      src: item.querySelector("img").getAttribute("src"),
      alt: "img",
      title: item.querySelector(".menu__item-subtitle").textContent,
      descr: item.querySelector(".menu__item-descr").textContent,
      price: +item.querySelector(".menu__item-total > span").textContent / 27,
      parentSelector: ".menu .container",
      classes: item.classList,
    });
  });

  class MenuCard {
    constructor({
      src,
      alt = "img",
      title,
      descr,
      price,
      parentSelector,
      classes = ["menu__item"],
    }) {
      this.src = src;
      this.title = title;
      this.descr = descr;
      this.price = price;
      this.transfer = 27;
      this.parent = document.querySelector(parentSelector);
      this.classes = classes;
      this.alt = alt;
    }

    changeToUAH() {
      this.price *= this.transfer;
    }

    render() {
      this.changeToUAH();
      const element = document.createElement("div");
      this.classes.forEach((item) => element.classList.add(item));
      element.innerHTML = `
          <img src="${this.src}" alt="${this.alt}" />
          <h3 class="menu__item-subtitle">${this.title}</h3>
          <div class="menu__item-descr">${this.descr}</div>
          <div class="menu__item-divider"></div>
          <div class="menu__item-price">
            <div class="menu__item-cost">Цена:</div>
            <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
          </div>`;
      this.parent.append(element);
    }
  }

  menuItems.forEach((item, i) => {
    new MenuCard(menuParsedItems[i]).render();
  });

  // Forms

  const forms = document.querySelectorAll("form");

  const message = {
    loading: "Loading",
    success: "Success",
    failure: "Something went wrong",
  };

  forms.forEach((item) => {
    postData(item);
  });

  function postData(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const statusMessage = document.createElement("div");
      statusMessage.classList.add("status");
      statusMessage.textContent = message.loading;
      form.append(statusMessage);

      const request = new XMLHttpRequest();
      request.open("POST", "server.php");
      // request.setRequestHeader("Content-type", "multipart/form-data");

      const formData = new FormData(form);
      request.send(formData);

      request.addEventListener("load", () => {
        if (request.status == 200) {
          console.log(request.response);
          statusMessage.textContent = message.success;
        } else {
          console.log(`Error ${request.status}`);
          statusMessage.textContent = message.failure;
        }
      });
    });
  }
});
