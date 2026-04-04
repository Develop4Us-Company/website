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

  const mountInlinePlayer = (targetId, videoId) => {
    const target = document.getElementById(targetId);
    if (!target || !videoId) return;

    target.hidden = false;

    if (target.dataset.loaded === 'true') {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    target.innerHTML = `
      <div class="ratio ratio-16x9 rounded overflow-hidden">
        <iframe src="https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0" title="Vídeo da aula" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
      </div>
    `;

    target.dataset.loaded = 'true';
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        const playerId = `youtube-player-${index + 1}`;

        return `<div class="col-12 col-lg-6">
            <article class="video-lesson-card card-surface h-100">
              <button type="button" class="video-thumb video-thumb-link rounded overflow-hidden border-0 p-0 w-100 text-start inline-play-trigger" data-video-id="${lesson.videoId}" data-target="${playerId}" aria-label="Assistir ${lesson.title} aqui mesmo">
                <img src="https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg" alt="Thumbnail da aula ${lesson.title}" class="video-thumb-image">
                <span class="video-play-badge"><i class="bi bi-play-fill"></i></span>
              </button>
              <span class="guide-step-label mt-3">${lesson.section}</span>
              <h3>${lesson.title}</h3>
              <div id="${playerId}" class="inline-player mt-3" hidden></div>
              <div class="d-flex flex-wrap gap-2 mt-3">
                <button type="button" class="btn btn-outline-light inline-play-trigger" data-video-id="${lesson.videoId}" data-target="${playerId}">Assistir aqui mesmo</button>
                <a href="${lesson.youtube}" class="btn btn-link btn-sm p-0 open-youtube-link" target="_blank" rel="noopener noreferrer">Abrir no YouTube</a>
              </div>
            </article>
          </div>`;
      })
      .join('');
  }

  document.querySelectorAll('.inline-play-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const videoId = trigger.getAttribute('data-video-id');
      const targetId = trigger.getAttribute('data-target');
      mountInlinePlayer(targetId, videoId);
    });
  });
});
