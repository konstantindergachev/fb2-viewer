window.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('file-input');
  const viewer = document.getElementById('viewer');
  const textTitle = document.getElementById('textTitle');
  const textFont = document.getElementById('textFont');
  const textFontSize = document.getElementById('textFontSize');
  const theme = document.getElementById('theme');

  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    textTitle.innerText = file.name.split('.fb2')[0];

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      viewer.innerHTML = content;
      const { offset, font, fontSize, theme, bookmarkText, bookmarkStyle } = getFromStorage();
      if (offset) autoScrollTo(offset);
      if (font) viewer.style.fontFamily = font;
      if (fontSize) viewer.style.fontSize = `${fontSize}px`;
      if (theme) setupTheme(theme);
      if (bookmarkText) {
        createBookmark({ bookmarkText, bookmarkStyle });
      }
    };

    reader.readAsText(file);
  });

  document.addEventListener('scroll', () => {
    if (viewer.innerText) {
      const currentPosition = window.scrollY;
      saveToStorage({ name: 'fb2Position', payload: currentPosition });
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

    saveToStorage({ name: 'fb2BookmarkText', payload: bookmark });
    saveToStorage({ name: 'fb2BookmarkStyle', payload: JSON.stringify(style) });
  });

  const autoScrollTo = (offset) => {
    window.scroll(0, offset);
  };

  const createBookmark = ({ bookmarkText, bookmarkStyle }) => {
    const viewportNodes = [...viewer.firstElementChild.getElementsByTagName('section')];
    viewportNodes.forEach((node) => {
      const paragraph = node.innerText.match(bookmarkText);
      if (paragraph) {
        const target = filterNodes(node.childNodes, bookmarkText);
        bookMarkColorize(target, bookmarkStyle);
      }
    });
  };

  const filterNodes = (childNodes, bookmarkText) => {
    const target = [];
    childNodes.forEach((childNode) => {
      if (childNode.textContent === bookmarkText) target.push(childNode);
      else if (childNode.lastChild !== null && childNode.lastChild.children) {
        [...childNode.lastChild.children].forEach((child) => {
          if (child.textContent === bookmarkText) target.push(child);
        });
      }
    });

    return target;
  };

  const bookMarkColorize = (target, bookmarkStyle) => {
    if (target.length) {
      target[0].style.backgroundColor = bookmarkStyle.backgroundColor;
      target[0].style.color = bookmarkStyle.color;
    }
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
      viewer.style.backgroundColor = '#a7a7a7';
      viewer.style.color = '#181818';
    } else if (theme === 'dark') {
      viewer.style.backgroundColor = '#181818';
      viewer.style.color = '#a7a7a7';
    }
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
    const savedBookmarkStyle = localStorage.getItem('fb2BookmarkStyle');
    if (savedFont || savedFontSize || savedTheme || (viewer.innerText && Number(savedPosition))) {
      return {
        offset: Number(savedPosition),
        font: savedFont,
        fontSize: savedFontSize,
        theme: savedTheme,
        bookmarkText: savedBookmarkText,
        bookmarkStyle: JSON.parse(savedBookmarkStyle),
      };
    }
    return {};
  };
  const removeFromStorage = () => {
    localStorage.removeItem('fb2Position');
    localStorage.removeItem('fb2BookmarkText');
    localStorage.removeItem('fb2BookmarkStyle');
  };
});
