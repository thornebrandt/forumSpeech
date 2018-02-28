// If reddit changes their DOM structure, this is the first place to change.
// If reddit is changing their UX frequently,
// I would suggest using a simple archived post for fixtures and regular tests.


function redditCommentTemplate(comment, author){
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
  container.innerHTML = redditCommentTemplate(comment, author);
  return container
};

export function createRedditPage(comments, authors){
  const wrapper = document.createElement('div');
  comments.forEach((comment, i) => {
    wrapper.appendChild(createComment(comments[i], authors[i]));
  });
  return wrapper;
}