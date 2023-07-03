window.addEventListener('DOMContentLoaded', (ev) => {
  const fileInput = document.getElementById('file-input');
  const viewer = document.getElementById('viewer');
  const textTitle = document.getElementById('textTitle');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    textTitle.innerText = file.name.split('.fb2')[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      viewer.innerHTML = content;
      const { offset, bookmarkText, bookmarkStyle } = getFromStorage();
      if (offset) autoScrollTo(offset);
      if (bookmarkText) {
        createBookmark({ bookmarkText, bookmarkStyle });
      }
    };

    reader.readAsText(file);
  });

  const saveToStorage = () => {
    document.addEventListener('scroll', (ev) => {
      if (viewer.innerText) {
        const currentPosition = window.scrollY;
        localStorage.setItem('fb2Position', currentPosition);
      }
    });
    viewer.addEventListener('click', (ev) => {
      const target = ev.target;
      const bookmark = target.innerText;
      const { bookmarkText } = getFromStorage();

      if (bookmark === bookmarkText) {
        target.style.backgroundColor = '#181818';
        target.style.color = '#a7a7a7';
        removeFromStorage();
        return;
      } else {
        target.style.backgroundColor = '#87ceeb';
        target.style.color = '#181818';
      }

      const style = {
        color: target.style.color,
        backgroundColor: target.style.backgroundColor,
      };
      localStorage.setItem('fb2BookmarkText', bookmark);
      localStorage.setItem('fb2BookmarkStyle', JSON.stringify(style));
    });
  };

  const getFromStorage = () => {
    const savedPosition = localStorage.getItem('fb2Position');
    const savedBookmarkText = localStorage.getItem('fb2BookmarkText');
    const savedBookmarkStyle = localStorage.getItem('fb2BookmarkStyle');
    if (viewer.innerText && Number(savedPosition)) {
      return {
        offset: Number(savedPosition),
        bookmarkText: savedBookmarkText,
        bookmarkStyle: JSON.parse(savedBookmarkStyle),
      };
    }
    return {};
  };
  const autoScrollTo = (offset) => {
    window.scroll(0, offset);
  };

  const removeFromStorage = () => {
    localStorage.removeItem('fb2Position');
    localStorage.removeItem('fb2BookmarkText');
    localStorage.removeItem('fb2BookmarkStyle');
  };

  const createBookmark = ({ bookmarkText, bookmarkStyle }) => {
    const viewportNodes = [...viewer.firstElementChild.getElementsByTagName('section')];

    viewportNodes.forEach((node) => {
      const paragraph = node.innerText.match(bookmarkText);
      if (paragraph) {
        const array = [...node.childNodes].filter((childNode) => {
          if (childNode.textContent === bookmarkText) return childNode;
        });
        array[0].style.backgroundColor = bookmarkStyle.backgroundColor;
        array[0].style.color = bookmarkStyle.color;
      }
    });
  };

  saveToStorage();
});
