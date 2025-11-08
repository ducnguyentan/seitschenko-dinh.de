/**
 * Slideshow functionality for dental practice website
 * Auto-rotates images every 10 seconds with smooth transitions
 */

class Slideshow {
  constructor(containerId, interval = 10000) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.images = this.container.querySelectorAll('.slideshow-image');
    this.dots = this.container.querySelectorAll('.slideshow-dot');
    this.currentIndex = 0;
    this.interval = interval;
    this.autoPlayTimer = null;

    this.init();
  }

  init() {
    // Set up dot click handlers
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.resetAutoPlay();
      });
    });

    // Start autoplay
    this.startAutoPlay();

    // Pause on hover
    this.container.addEventListener('mouseenter', () => this.stopAutoPlay());
    this.container.addEventListener('mouseleave', () => this.startAutoPlay());
  }

  goToSlide(index) {
    // Remove active class from current image and dot
    this.images[this.currentIndex].classList.remove('active');
    this.dots[this.currentIndex].classList.remove('active');

    // Update index
    this.currentIndex = index;

    // Add active class to new image and dot
    this.images[this.currentIndex].classList.add('active');
    this.dots[this.currentIndex].classList.add('active');
  }

  nextSlide() {
    const nextIndex = (this.currentIndex + 1) % this.images.length;
    this.goToSlide(nextIndex);
  }

  startAutoPlay() {
    this.autoPlayTimer = setInterval(() => {
      this.nextSlide();
    }, this.interval);
  }

  stopAutoPlay() {
    if (this.autoPlayTimer) {
      clearInterval(this.autoPlayTimer);
      this.autoPlayTimer = null;
    }
  }

  resetAutoPlay() {
    this.stopAutoPlay();
    this.startAutoPlay();
  }
}

// Initialize slideshow when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize praxis slideshow (10 seconds = 10000ms)
  const praxisSlideshow = new Slideshow('praxis-slideshow', 10000);

  // You can add more slideshows here if needed
  // const laborSlideshow = new Slideshow('labor-slideshow', 10000);
});
