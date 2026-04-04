document.addEventListener('DOMContentLoaded', () => {
  const data = window.coursePageData;
  if (!data) return;

  const descriptionContainer = document.getElementById('courseDescription');
  const curriculumContainer = document.getElementById('curriculumList');
  const youtubeContainer = document.getElementById('youtubeLessons');

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
    curriculumContainer.innerHTML = groupedSections
      .map((section, index) => {
        const lessonsHtml = section.lessons
          .map((lesson) => {
            const youtubeLink = lesson.youtube
              ? `<a href="${lesson.youtube}" target="_blank" rel="noopener noreferrer" class="lesson-youtube-link"><i class="bi bi-youtube"></i> Assistir no YouTube</a>`
              : '<span class="lesson-youtube-missing">Exclusiva para alunos</span>';
            return `<li><span class="lesson-title">${lesson.title}</span>${youtubeLink}</li>`;
          })
          .join('');

        return `<article class="curriculum-section card-surface">
            <div class="curriculum-section-head">
              <span class="curriculum-index">Seção ${index + 1}</span>
              <h3>${section.name}</h3>
            </div>
            <ul>${lessonsHtml}</ul>
          </article>`;
      })
      .join('');
  }

  if (youtubeContainer) {
    const youtubeLessons = data.lessons.filter((lesson) => lesson.youtube);

    youtubeContainer.innerHTML = youtubeLessons
      .map((lesson) => {
        const videoId = lesson.youtube.split('/').pop().split('?')[0];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;

        return `<div class="col-12 col-lg-6">
            <article class="video-lesson-card card-surface h-100">
              <div class="ratio ratio-16x9 rounded overflow-hidden mb-3">
                <iframe src="${embedUrl}" title="${lesson.title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
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
