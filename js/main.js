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
    modal = document.querySelector(".modal");

  function toggleModalWindow() {
    modal.classList.toggle("show");
    document.body.classList.toggle("scroll-lock");
    clearInterval(modalTimerId);
  }

  // Hide modal window
  modal.addEventListener("click", (e) => {
    if (e.target === modal || e.target.getAttribute("data-close") == "") {
      toggleModalWindow();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.code === "Escape" && modal.classList.contains("show")) {
      toggleModalWindow();
    }
  });

  // Show modal window
  modalTrigger.forEach((btn) => {
    btn.addEventListener("click", toggleModalWindow);
  });

  const modalTimerId = setTimeout(toggleModalWindow, 50000);

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

  class MenuCard {
    constructor({
      img,
      altimg,
      title,
      descr,
      price,
      parentSelector,
      classes = ["menu__item"],
    }) {
      this.img = img;
      this.alt = altimg;
      this.title = title;
      this.descr = descr;
      this.price = price;
      this.transfer = 27;
      this.parent = document.querySelector(parentSelector);
      this.classes = classes;
    }

    changeToUAH() {
      this.price *= this.transfer;
    }

    render() {
      this.changeToUAH();
      const element = document.createElement("div");
      this.classes.forEach((item) => element.classList.add(item));
      element.innerHTML = `
          <img src="${this.img}" alt="${this.alt}" />
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

  const getResource = async (url) => {
    const res = await fetch("http://localhost:3000/menu");

    if (!res.ok) {
      throw new Error(`Could'd not fetch ${url}, status ${res.status}`);
    }
    return res.json();
  };

  getResource("http://localhost:3000/menu").then((content) => {
    content.forEach(({ img, altimg, title, descr, price }) => {
      new MenuCard(
        img,
        altimg,
        title,
        descr,
        price,
        ".menu .container"
      ).render();
    });
  });

  // Forms

  const forms = document.querySelectorAll("form");
  const message = {
    loading: "img/form/spinner.svg",
    success: "Success",
    failure: "Something went wrong",
  };

  forms.forEach((item) => {
    bindPostData(item);
  });

  const postData = async (url, data) => {
    let res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: data,
    });
    return await res.json();
  };

  function bindPostData(form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      let statusMessage = document.createElement("img");
      statusMessage.src = message.loading;
      statusMessage.style.cssText = `
        display: block;
        margin: 0 auto;
      `;
      form.insertAdjacentElement("afterend", statusMessage);

      const formData = new FormData(form);

      const json = JSON.stringify(Object.fromEntries(formData.entries()));

      postData("http://localhost:3000/requests", json)
        .then((data) => {
          console.log(data);
          showThanksModal(message.success);
          statusMessage.remove();
        })
        .catch((data) => {
          console.log(`Error ${data}`);
          showThanksModal(message.failure);
        })
        .finally((data) => {
          form.reset();
        });
    });
  }

  function showThanksModal(message) {
    const prevModalDialog = document.querySelector(".modal__dialog");

    prevModalDialog.classList.toggle("hide");

    if (!modal.classList.contains("show")) {
      toggleModalWindow();
    }

    const thanksModal = document.createElement("div");
    thanksModal.classList.add("modal__dialog");

    thanksModal.innerHTML = `
      <div class="modal__content">
        <div class="modal__close" data-close>×</div>
        <div class="modal__title">${message}</div>
      </div>`;
    document.querySelector(".modal").append(thanksModal);

    setTimeout(() => {
      thanksModal.remove();
      prevModalDialog.classList.toggle("hide");
      if (modal.classList.contains("show")) {
        toggleModalWindow();
      }
    }, 4000);
  }
});
