document.addEventListener("DOMContentLoaded", function () {
  // === Horizontal drag scroll for portfolio-wrapper ===
  const portfolioWrapper = document.querySelector('.portfolio-wrapper');
  let isDown = false;
  let startX, scrollLeft;

  if (portfolioWrapper) {
    portfolioWrapper.addEventListener('mousedown', (e) => {
      isDown = true;
      portfolioWrapper.classList.add('dragging');
      startX = e.pageX - portfolioWrapper.offsetLeft;
      scrollLeft = portfolioWrapper.scrollLeft;
    });
    portfolioWrapper.addEventListener('mouseleave', () => {
      isDown = false;
      portfolioWrapper.classList.remove('dragging');
    });
    portfolioWrapper.addEventListener('mouseup', () => {
      isDown = false;
      portfolioWrapper.classList.remove('dragging');
    });
    portfolioWrapper.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - portfolioWrapper.offsetLeft;
      const walk = (x - startX) * 1.5;
      portfolioWrapper.scrollLeft = scrollLeft - walk;
    });

    // === Wheel handler: scroll horizontally only on wide screens ===
    portfolioWrapper.addEventListener('wheel', (e) => {
      const isWideScreen = window.innerWidth > 768;
      if (isWideScreen && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault(); // only block if we're going to scroll horizontally
        portfolioWrapper.scrollLeft += e.deltaY;
      }
    }, { passive: false });

  }

  // === In‐section carousel logic ===
  document.querySelectorAll(".carousel").forEach(carousel => {
    let images = Array.from(carousel.querySelectorAll(".carousel-img"));

    const updateClasses = () => {
      images.forEach((img, idx) => {
        img.classList.remove("active", "left", "right", "hidden");
        if (idx === 0)      img.classList.add("left");
        else if (idx === 1) img.classList.add("active");
        else if (idx === 2) img.classList.add("right");
        else                img.classList.add("hidden");
      });
    };

    const rotateForward = () => {
      images.push(images.shift());
      updateClasses();
    };
    const rotateBackward = () => {
      images.unshift(images.pop());
      updateClasses();
    };

    updateClasses();

    carousel.addEventListener("click", e => {
      const rect = carousel.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const midX = rect.width / 2;

      if (e.target.classList.contains("carousel-img") &&
          e.target.classList.contains("active")) {
        openModal(images.map(img => img.src));
        return;
      }

      if (clickX < midX)       rotateBackward();
      else /* clickX >= midX*/ rotateForward();
    });
  });

  // === Fullscreen modal logic ===
  function openModal(srcArray) {
    const modal = document.createElement("div");
    modal.classList.add("carousel-modal");

    const closeBtn = document.createElement("span");
    closeBtn.classList.add("close-btn");
    closeBtn.textContent = "×";
    modal.appendChild(closeBtn);

    const modalCarousel = document.createElement("div");
    modalCarousel.classList.add("modal-carousel");
    modal.appendChild(modalCarousel);

    let modalImages = srcArray.map(src => {
      const img = document.createElement("img");
      img.classList.add("modal-carousel-img");
      img.src = src;
      modalCarousel.appendChild(img);
      return img;
    });

    document.body.appendChild(modal);

    const mUpdateClasses = () => {
      modalImages.forEach((img, idx) => {
        img.classList.remove("active", "left", "right", "hidden");
        if (idx === 0)      img.classList.add("left");
        else if (idx === 1) img.classList.add("active");
        else if (idx === 2) img.classList.add("right");
        else                img.classList.add("hidden");
      });
    };

    const mRotateForward = () => {
      modalImages.push(modalImages.shift());
      mUpdateClasses();
    };
    const mRotateBackward = () => {
      modalImages.unshift(modalImages.pop());
      mUpdateClasses();
    };

    mUpdateClasses();

    modalCarousel.addEventListener("click", e => {
      const rect = modalCarousel.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const midX = rect.width / 2;

      if (e.target.classList.contains("modal-carousel-img") &&
          e.target.classList.contains("active")) {
        return;
      }
      if (clickX < midX)       mRotateBackward();
      else                     mRotateForward();
    });

    // Keyboard inside modal
    const keyHandler = (e) => {
      if (e.key === "ArrowLeft")      mRotateBackward();
      else if (e.key === "ArrowRight") mRotateForward();
      else if (e.key === "Escape")   closeModal();
    };
    document.addEventListener("keydown", keyHandler);

    // Swipe support inside modal
    let startTouchX = null;
    modalCarousel.addEventListener("touchstart", (e) => {
      startTouchX = e.touches[0].clientX;
    });
    modalCarousel.addEventListener("touchmove", (e) => {
      if (startTouchX === null) return;
      const currentX = e.touches[0].clientX;
      const diffX = startTouchX - currentX;
      if (diffX > 50) {
        mRotateForward();
        startTouchX = null;
      } else if (diffX < -50) {
        mRotateBackward();
        startTouchX = null;
      }
    });
    modalCarousel.addEventListener("touchend", () => {
      startTouchX = null;
    });

    // Close modal callback
    const closeModal = () => {
      document.removeEventListener("keydown", keyHandler);
      document.body.removeChild(modal);
    };
    closeBtn.addEventListener("click", closeModal);
  }

  // === Filter Buttons Logic ===
  const filters = document.querySelectorAll('.filter-group span');
  const allProjects = document.querySelectorAll('.project-block');

  filters.forEach(filterBtn => {
    filterBtn.addEventListener('click', () => {
      // 1) Set active style on clicked filter, remove from others
      filters.forEach(f => f.classList.remove('active'));
      filterBtn.classList.add('active');

      // 2) Get the filter name, e.g. "project", "2025", or "all"
      const filterValue = filterBtn.dataset.filter;

      // 3) Loop through each project-block and show/hide
      allProjects.forEach(section => {
        const tags = section.dataset.tags.split(' ');
        if (filterValue === 'all' || tags.includes(filterValue)) {
          section.style.display = 'inline-block';
        } else {
          section.style.display = 'none';
        }
      });
    });
  });
});

