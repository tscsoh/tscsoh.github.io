/*
 * Renders the small project thumbnail grid (.projects-array) below the
 * two featured project images. Split out from script.js because it's a
 * self-contained data + render concern, unrelated to that file's nav/
 * animation/scroll behavior. Requires jQuery, loaded before this file.
 */

// Array of projects
const projects = [
  { src: "assets/img/SimpleConnect.jpg", title: "Smart Home App", target: "project_1" },
  { src: "assets/img/UtilityManagerComputerScreen.jpg", title: "Utility Manager", target: "project_2" },
  { src: "assets/img/NikePage.jpg", title: "Nike Mobile & Web", target: "project_3" },
  { src: "assets/img/TheGOAT.jpg", title: "The GOAT Mobile", target: "project_4" },
  { src: "assets/img/EducationDesktopTabletPhone.jpg", title: "LMS Web & Mobile", target: "project_5" },
  { src: "assets/img/SAIGroupImage.jpg", title: "SAI Group Design", target: "project_6" },
  { src: "assets/img/FDQBusinessAdvocates.jpg", title: "FDQ Business Advocates", target: "project_7" },
  { src: "assets/img/EogentLoginPage.jpg", title: "Eogent Properties", target: "project_8" },
  { src: "assets/img/SuperHStoryBoard.jpg", title: "Storyboarding", target: "project_9" },
  { src: "assets/img/HandSoftware.jpg", title: "Hand Software", target: "project_10" },
  { src: "assets/img/Clubman_UI.jpg", title: "Clubman by Calloway", target: "project_11" },
  { src: "assets/img/SchoolHouse.jpg", title: "School House Game Model", target: "project_12" },
  { src: "assets/img/Spaceship.jpg", title: "Spaceship 3D Model", target: "project_13" },
  { src: "assets/img/RobinHood.jpg", title: "Robin Hood", target: "project_14" },
  { src: "assets/img/ToddsHead.jpg", title: "My Head", target: "project_15" },
  { src: "assets/img/Tunnel.jpg", title: "Train Tunnel", target: "project_16" },
  { src: "assets/img/Linux.jpg", title: "Linux Workstation", target: "project_17" },
  { src: "assets/img/Windows.jpg", title: "Windows Workstation", target: "project_18" },
  { src: "assets/img/HeadRenders1920.jpg", title: "Heads", target: "project_19" },
  { src: "assets/img/House03c.jpg", title: "House 3D Model", target: "project_20" },
  { src: "assets/img/3dblock.jpg", title: "3D Block Environment Model", target: "project_21" }
];

/*
 * Each tile renders into a box at most ~470px wide, so the grid loads a
 * 900px-wide copy from assets/img/thumbs/ instead of the full-size
 * original. On screen it is the same picture; the difference is decode
 * memory, and with 21 tiles on one page that is what a phone actually
 * runs out of — the whole grid drops from ~32MP of decoded pixels to
 * ~13MP. The untouched original stays on data-full so the lightbox can
 * still open it at full resolution (see lightbox.js).
 */
function thumbFor(src) {
  return src.replace('assets/img/', 'assets/img/thumbs/');
}

$(document).ready(function() {
  let projectHtml = '';

  projects.forEach((project, index) => {
    projectHtml += `
      <div class="col-lg-4 col-md-6 col-sm-6">
        <div class="project add-animation animation-${(index % 3) + 1}">
          <img src="${thumbFor(project.src)}" data-full="${project.src}" style="width: 100%; object-fit: cover; height: 400px;" loading="lazy" decoding="async" data-title="${project.title}" />
          <div class="project-caption"><span>${project.title}</span></div>
        </div>
      </div>
    `;
  });

  $('.projects-array').html(projectHtml);
});
