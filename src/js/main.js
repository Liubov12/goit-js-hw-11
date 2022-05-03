import '../sass/main.scss';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import ImagesAPIService from './apiService';
import LoadMoreBtn from './loadMore';
import Markup from './markupTemplate';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

const imagesAPIService = new ImagesAPIService();
const loadMoreBtn = new LoadMoreBtn({ selector: '.load-more' });
const renderMarkup = new Markup({ selector: refs.gallery });

refs.form.addEventListener('submit', onFormSubmit);
loadMoreBtn.button.addEventListener('click', onloadMoreBtnClick);

// Submit handler
async function onFormSubmit(e) {
  e.preventDefault();
  renderMarkup.reset();
  imagesAPIService.query = e.currentTarget.searchQuery.value.trim();

  if (imagesAPIService.query === '') {
    loadMoreBtn.hideBtn();
    Notify.info('Your query is empty. Try again!');
    return;
  }

  imagesAPIService.resetPage();

  try {
    loadMoreBtn.showBtn();
    await initFetchImages();
  } catch (error) {
    loadMoreBtn.hideBtn();
    Notify.failure(error.message);
  }

  refs.form.reset();
}
// Load-More Button handler
async function onloadMoreBtnClick() {
  try {
    await initFetchImages();
  } catch {
    Notify.failure(error.message);
  }
  pageScroll();
  renderMarkup.lightbox.refresh();
}

// Send request
async function initFetchImages() {
  try {
    loadMoreBtn.disable();
    const images = await imagesAPIService.fetchImages();
    renderMarkup.items = images;
    renderMarkup.render();
  } catch {
    Notify.failure(error.message);
  }

  if (imagesAPIService.endOfHits) {
    loadMoreBtn.hideBtn();
    return;
  }
  loadMoreBtn.enable();
}

// Scroll page
function pageScroll() {
  const { height: formHeight } = refs.form.getBoundingClientRect();
  const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2 - formHeight * 2,
    behavior: 'smooth',
  });
}
