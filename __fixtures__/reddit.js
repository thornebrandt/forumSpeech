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

function redditTitleTemplate(title){
  return (
    `<p class="title">
      <a class="title" href="#">
        ${title}
      </a>
    </p>`
  );
}

export function createComment(comment, author='author'){
  const container = document.createElement('div');
  container.innerHTML = redditCommentTemplate(comment, author);
  return container
};

export function createTitle(title){
  const titleContainer = document.createElement('div');
  titleContainer.innerHTML = redditTitleTemplate(title);
  return titleContainer
}

export function createRedditPage(comments, authors, title){
  const wrapper = document.createElement('div');
  comments.forEach((comment, i) => {
    wrapper.appendChild(createComment(comments[i], authors[i]));
  });
  if(title){
    wrapper.prepend(createTitle(title));
  }
  return wrapper;
}