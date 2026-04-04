document.addEventListener('DOMContentLoaded', () => {
  const data = window.coursePageData;
  if (!data) return;

  const descriptionContainer = document.getElementById('courseDescription');
  const curriculumContainer = document.getElementById('curriculumList');
  const youtubeContainer = document.getElementById('youtubeLessons');

  const toEmbedUrl = (youtubeUrl) => {
    if (!youtubeUrl) return null;

    try {
      const parsedUrl = new URL(youtubeUrl);
      const host = parsedUrl.hostname.replace('www.', '');
      let videoId = null;

      if (host === 'youtu.be') {
        videoId = parsedUrl.pathname.slice(1);
      } else if (host.includes('youtube.com')) {
        videoId = parsedUrl.searchParams.get('v');
        if (!videoId && parsedUrl.pathname.includes('/embed/')) {
          videoId = parsedUrl.pathname.split('/embed/')[1]?.split('/')[0];
        }
      }

      if (!videoId) return null;
      return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;
    } catch {
      return null;
    }
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
            const sectionId = `section-${index + 1}`;
            const headingId = `heading-${index + 1}`;
            const collapseId = `collapse-${index + 1}`;

            const lessonsHtml = section.lessons
              .map((lesson) => {
                const embedUrl = toEmbedUrl(lesson.youtube);
                const lessonMeta = embedUrl
                  ? '<span class="lesson-badge lesson-badge-open">Aula gratuita disponível</span>'
                  : '<span class="lesson-badge">Exclusiva para alunos</span>';

                const lessonVideo = embedUrl
                  ? `<div class="ratio ratio-16x9 rounded overflow-hidden mt-3">
                      <iframe src="${embedUrl}" title="${lesson.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                    </div>`
                  : '';

                return `<li>
                    <div class="lesson-header">
                      <span class="lesson-title">${lesson.title}</span>
                      ${lessonMeta}
                    </div>
                    ${lessonVideo}
                  </li>`;
              })
              .join('');

            return `<div class="accordion-item curriculum-section" id="${sectionId}">
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
        embedUrl: toEmbedUrl(lesson.youtube)
      }))
      .filter((lesson) => lesson.embedUrl);

    youtubeContainer.innerHTML = youtubeLessons
      .map((lesson) => {
        return `<div class="col-12 col-lg-6">
            <article class="video-lesson-card card-surface h-100">
              <div class="ratio ratio-16x9 rounded overflow-hidden mb-3">
                <iframe src="${lesson.embedUrl}" title="${lesson.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </div>
              <span class="guide-step-label">${lesson.section}</span>
              <h3>${lesson.title}</h3>
              <a href="${lesson.youtube}" class="btn btn-outline-light mt-3" target="_blank" rel="noopener noreferrer">Abrir no YouTube</a>
            </article>
          </div>`;
      })
      .join('');
  }
});
