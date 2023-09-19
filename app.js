const loading = document.querySelector('#loading');
let dots = "";
function addDot() {
  dots += '.';
  loading.textContent = dots;

  if (dots.length > 3) {
      dots = '';
      loading.textContent = '';
  }
  console.log(dots);
}

setInterval(addDot, 1000);
