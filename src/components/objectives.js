import objectivesData from '../data/objectives.json';

function renderSection(items) {
  const list = document.createElement('ol');
  list.className = 'objectives-list';

  items.forEach(item => {
    const li = document.createElement('li');
    li.value = item.number;
    li.textContent = item.text;

    if (item.subItems.length) {
      const subList = document.createElement('ol');
      subList.type = 'a';
      subList.className = 'objectives-sublist';
      item.subItems.forEach(subItem => {
        const subLi = document.createElement('li');
        subLi.value = subItem.letter.charCodeAt(0) - 96;
        subLi.textContent = subItem.text;
        subList.appendChild(subLi);
      });
      li.appendChild(subList);
    }

    list.appendChild(li);
  });

  return list;
}

export function mountObjectives(el) {
  el.replaceChildren();

  const wrap = document.createElement('div');
  wrap.className = 'objectives-wrap';

  const title = document.createElement('div');
  title.className = 'objectives-title';
  title.textContent = objectivesData.title;

  wrap.append(title);

  objectivesData.sections.forEach(section => {
    const items = section.items;
    if (!items || !items.length) return;

    const heading = document.createElement('div');
    heading.className = 'objectives-section-title';
    heading.textContent = section.name;

    wrap.append(heading, renderSection(items));
  });

  el.appendChild(wrap);
}
