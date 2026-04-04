document.addEventListener('DOMContentLoaded', () => {
  const data = window.coursePageData;
  if (!data) return;

  const descriptionContainer = document.getElementById('courseDescription');
  const curriculumContainer = document.getElementById('curriculumList');
  const youtubeContainer = document.getElementById('youtubeLessons');

  const getVideoId = (youtubeUrl) => {
    if (!youtubeUrl) return null;

    try {
      const parsedUrl = new URL(youtubeUrl);
      const host = parsedUrl.hostname.replace('www.', '');

      if (host === 'youtu.be') {
        return parsedUrl.pathname.slice(1) || null;
      }

      if (host.includes('youtube.com')) {
        return parsedUrl.searchParams.get('v');
      }

      return null;
    } catch {
      return null;
    }
  };

  const loadYouTubeIframeApi = () => {
    if (window.YT && window.YT.Player) {
      return Promise.resolve(window.YT);
    }

    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');

      if (!existingScript) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.head.appendChild(tag);
      }

      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
    });
  };

  const initializePlayers = () => {
    const players = document.querySelectorAll('.yt-player[data-video-id]');
    if (!players.length) return;

    const playerOrigin = window.location.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'https://develop4us.com';

    loadYouTubeIframeApi().then((YT) => {
      players.forEach((playerElement) => {
        const videoId = playerElement.getAttribute('data-video-id');
        if (!videoId || !playerElement.id) return;

        new YT.Player(playerElement.id, {
          videoId,
          playerVars: {
            rel: 0,
            origin: playerOrigin
          }
        });
      });
    });
  };

  if (descriptionContainer && Array.isArray(data.description)) {
    descriptionContainer.innerHTML = data.description
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');
  }

  if (!Array.isArray(data.lessons)) return;

  const groupedSections = [];
  data.lessons.forEach((lesson) => {
    let section = groupedSections.find((item) => item.name === lesson.section);
    if (!section) {
      section = { name: lesson.section, lessons: [] };
      groupedSections.push(section);
    }
    section.lessons.push(lesson);
  });

  if (curriculumContainer) {
    curriculumContainer.innerHTML = `
      <div class="accordion course-accordion" id="courseAccordion">
        ${groupedSections
          .map((section, index) => {
            const headingId = `heading-${index + 1}`;
            const collapseId = `collapse-${index + 1}`;

            const lessonsHtml = section.lessons
              .map((lesson) => {
                const videoId = getVideoId(lesson.youtube);
                const lessonMeta = videoId
                  ? '<a href="#aulas-youtube" class="lesson-badge lesson-badge-open">Aula gratuita disponível</a>'
                  : '<span class="lesson-badge">Exclusiva para alunos</span>';

                return `<li>
                    <div class="lesson-header">
                      <span class="lesson-title">${lesson.title}</span>
                      ${lessonMeta}
                    </div>
                  </li>`;
              })
              .join('');

            return `<div class="accordion-item curriculum-section">
                <h3 class="accordion-header" id="${headingId}">
                  <button class="accordion-button ${index === 0 ? '' : 'collapsed'}" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="${index === 0 ? 'true' : 'false'}" aria-controls="${collapseId}">
                    <span class="curriculum-index">Seção ${index + 1}</span>
                    <span>${section.name}</span>
                  </button>
                </h3>
                <div id="${collapseId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" aria-labelledby="${headingId}" data-bs-parent="#courseAccordion">
                  <div class="accordion-body">
                    <ul>${lessonsHtml}</ul>
                  </div>
                </div>
              </div>`;
          })
          .join('')}
      </div>
    `;
  }

  if (youtubeContainer) {
    const youtubeLessons = data.lessons
      .filter((lesson) => lesson.youtube)
      .map((lesson) => ({
        ...lesson,
        videoId: getVideoId(lesson.youtube)
      }))
      .filter((lesson) => lesson.videoId);

    youtubeContainer.innerHTML = youtubeLessons
      .map((lesson, index) => {
        const playerId = `yt-lesson-${index + 1}`;

        return `<div class="col-12 col-lg-6">
            <article class="video-lesson-card card-surface h-100">
              <div class="ratio ratio-16x9 rounded overflow-hidden mb-3">
                <div id="${playerId}" class="yt-player" data-video-id="${lesson.videoId}" aria-label="Aula gratuita: ${lesson.title}"></div>
              </div>
              <span class="guide-step-label">${lesson.section}</span>
              <h3>${lesson.title}</h3>
              <a href="${lesson.youtube}" class="btn btn-link btn-sm p-0 mt-2 open-youtube-link" target="_blank" rel="noopener noreferrer">Abrir no YouTube</a>
            </article>
          </div>`;
      })
      .join('');
  }

  initializePlayers();
});
