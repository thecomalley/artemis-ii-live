const CREW = [
  {
    name:     'Reid Wiseman',
    role:     'Commander',
    initials: 'RW',
    photo:    'https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016434-alt.jpg',
  },
  {
    name:     'Victor Glover',
    role:     'Pilot',
    initials: 'VG',
    photo:    'https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016433-alt.jpg',
  },
  {
    name:     'Christina Koch',
    role:     'Mission Specialist 1',
    initials: 'CK',
    photo:    'https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016435-alt.jpg',
  },
  {
    name:     'Jeremy Hansen',
    role:     'Mission Specialist 2 \u2014 CSA',
    initials: 'JH',
    photo:    'https://www.nasa.gov/wp-content/uploads/2023/06/jsc2023e0016436-alt.jpg',
  },
];

export function mountCrew(el) {
  el.className = 'crew-panel';

  const header = document.createElement('div');
  header.className = 'crew-panel-header';
  header.textContent = 'ARTEMIS II CREW';
  el.appendChild(header);

  for (const c of CREW) {
    const card = document.createElement('div');
    card.className = 'crew-card';

    const photoWrap = document.createElement('div');
    photoWrap.className = 'crew-card-photo-wrap';

    const img = document.createElement('img');
    img.className = 'crew-card-photo';
    img.src = c.photo;
    img.alt = c.name;
    img.onerror = function() {
      this.style.display = 'none';
      this.nextElementSibling.style.display = 'flex';
    };

    const initials = document.createElement('div');
    initials.className = 'crew-card-initials';
    initials.style.display = 'none';
    initials.textContent = c.initials;

    photoWrap.appendChild(img);
    photoWrap.appendChild(initials);

    const info = document.createElement('div');
    info.className = 'crew-card-info';

    const name = document.createElement('div');
    name.className = 'crew-card-name';
    name.textContent = c.name;

    const role = document.createElement('div');
    role.className = 'crew-card-role';
    role.textContent = c.role;

    info.appendChild(name);
    info.appendChild(role);

    card.appendChild(photoWrap);
    card.appendChild(info);
    el.appendChild(card);
  }
}
