
function redditTemplate(comment, author){
  return (
    `<div class="comment">
      <div class="entry">
        <p class="tagline">
          <a class="author" href="#">
            ${author}
          </a>
        </p>
        <form class="usertext">
          <div class="usertext-body">
            <div class="md">
              <p>${comment}</p>
            </div>
          </div>
        </form>
      </div>
    </div>`
  );
}


export function createComment(comment, author='author') {
  const container = document.createElement('div');
  container.innerHTML = redditTemplate(comment, author);
  return container
};

