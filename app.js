window.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const viewer = document.getElementById('viewer');
  const textTitle = document.getElementById('textTitle');
  const textFont = document.getElementById('textFont');
  const textFontSize = document.getElementById('textFontSize');
  const theme = document.getElementById('theme');

  const LOADER_TEXT = 'Файл загружается';

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    textTitle.innerText = file.name.split('.fb2')[0];

    const reader = new FileReader();

    createLoader();

    reader.onload = (event) => {
      const content = event.target.result;
      viewer.innerHTML = content;
      const { offset, font, fontSize, theme, bookmarkText, bookmarkHTMLClass } = getFromStorage();
      if (offset) autoScrollTo(offset);
      if (font) viewer.style.fontFamily = font;
      if (fontSize) viewer.style.fontSize = `${fontSize}px`;
      if (theme) setupTheme(theme);
      if (bookmarkText) {
        createBookmark({ bookmarkText, bookmarkHTMLClass });
      }

      const imageNodes = [...viewer.firstElementChild.getElementsByTagName('img')];
      createImage(imageNodes);
    };

    reader.readAsText(file);
  });

  const autoScrollTo = (offset) => {
    window.scrollTo({ left: 0, top: offset, behavior: 'smooth' });
  };

  document.addEventListener('scroll', () => {
    const currentPosition = window.scrollY;
    saveToStorage({ name: 'fb2Position', payload: currentPosition });
  });

  viewer.addEventListener('click', (ev) => {
    const target = ev.target;
    setupBookmarkStyle(target);
  });

  let target = null;
  const findTargetTag = (parentNode, text) => {
    if (parentNode && parentNode.textContent.trim() === text) {
      target = parentNode;
      return target;
    } else {
      if (parentNode && parentNode.hasChildNodes()) {
        [...parentNode.children].forEach((child) => {
          return findTargetTag(child, text);
        });
      }
      return target;
    }
  };

  const createBookmark = ({ bookmarkText, bookmarkHTMLClass }) => {
    const parentNode = viewer.firstElementChild;
    const bookmark = findTargetTag(parentNode, bookmarkText);
    if (bookmark) bookmarkColorize(bookmark, bookmarkHTMLClass);
  };

  const createImage = (imageNodes) => {
    imageNodes.forEach((node, index) => {
      const base64 = document.getElementById(node.attributes[0].nodeValue.split('#')[1]).innerText;
      const alt = node.attributes[0].nodeValue.split('#')[1].split('.')[0];
      node.setAttribute('src', `data:image/png;base64, ${base64}`);
      node.setAttribute('alt', alt);
      node.removeAttribute('l:href');

      setupImageStyle(node, index);
    });
  };

  const bookmarkColorize = (target, bookmarkHTMLClass) => {
    target.classList.add(bookmarkHTMLClass);
  };

  textFont.addEventListener('click', (ev) => {
    const font = ev.target.value;
    viewer.style.fontFamily = font;

    saveToStorage({ name: 'fb2Font', payload: font });
  });

  textFontSize.addEventListener('click', (ev) => {
    const fontSize = ev.target.value;
    viewer.style.fontSize = `${fontSize}px`;

    saveToStorage({ name: 'fb2FontSize', payload: fontSize });
  });

  theme.addEventListener('click', (ev) => {
    const theme = ev.target.value;
    setupTheme(theme);
    saveToStorage({ name: 'fb2Theme', payload: theme });
  });

  const setupTheme = (theme) => {
    if (theme === 'light') {
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    } else if (theme === 'dark') {
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    }
  };

  const setupBookmarkStyle = (target) => {
    const { bookmarkText } = getFromStorage();
    const BOOKMARK_HTML_CLASS = 'bookmark';
    if (bookmarkText === target.innerText) {
      target.classList.remove(BOOKMARK_HTML_CLASS);
      target.classList.add('dark');
      removeFromStorage();
    } else {
      target.classList.remove('dark');
      target.classList.add(BOOKMARK_HTML_CLASS);

      saveToStorage({ name: 'fb2BookmarkText', payload: target.innerText });
      saveToStorage({ name: 'fb2BookmarkHTMLClass', payload: BOOKMARK_HTML_CLASS });
    }
  };

  const setupImageStyle = (node, index) => {
    node.classList.add('image');
    if (index % 2 === 0) node.style.float = 'left';
    else node.style.float = 'right';
  };

  const saveToStorage = (props) => {
    localStorage.setItem(props.name, props.payload);
  };

  const getFromStorage = () => {
    const savedPosition = localStorage.getItem('fb2Position');
    const savedFont = localStorage.getItem('fb2Font');
    const savedFontSize = localStorage.getItem('fb2FontSize');
    const savedTheme = localStorage.getItem('fb2Theme');
    const savedBookmarkText = localStorage.getItem('fb2BookmarkText');
    const savedBookmarkHTMLClass = localStorage.getItem('fb2BookmarkHTMLClass');

    if (viewer.innerText) {
      return {
        offset: Number(savedPosition),
        font: savedFont,
        fontSize: savedFontSize,
        theme: savedTheme,
        bookmarkText: savedBookmarkText,
        bookmarkHTMLClass: savedBookmarkHTMLClass,
      };
    }
    return {};
  };
  const removeFromStorage = () => {
    localStorage.removeItem('fb2Position');
    localStorage.removeItem('fb2BookmarkText');
    localStorage.removeItem('fb2BookmarkHTMLClass');
  };

  const settingsFromStorage = () => {
    const { font, fontSize, theme: savedTheme } = getFromStorage();
    if (font) {
      [...textFont.options].forEach((option) => {
        if (option.value === font) {
          option.selected = true;
          viewer.style.fontFamily = font;
        }
      });
    }
    if (fontSize) {
      [...textFontSize.options].forEach((option) => {
        if (option.value === fontSize) {
          option.selected = true;
          viewer.style.fontSize = `${fontSize}px`;
        }
      });
    }
    if (savedTheme) {
      [...theme.options].forEach((option) => {
        if (option.value === savedTheme) {
          option.selected = true;
          setupTheme(savedTheme);
        }
      });
    }
  };

  settingsFromStorage();

  const createLoader = () => {
    viewer.appendChild(document.createElement('p'));
    viewer.firstElementChild.classList.add('loader');
    viewer.firstElementChild.innerText = LOADER_TEXT;
  };
});
