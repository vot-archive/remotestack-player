function populatePartials () {
  var links = document.querySelectorAll('link[rel="import"].partial')

  Array.prototype.forEach.call(links, function (link) {
    console.log('Loaded partial:', link.href);

    var filename = link.href.split('/').pop().replace('.html', '');
    var destination = filename;

    let template = link.import.querySelector('partial');
    let clone = document.importNode(template, true);


    var element = document.querySelector('#' + destination);
    if (element) {
      element.appendChild(clone);
    }

  });
}

function populateTemplates () {
  var links = document.querySelectorAll('link[rel="import"].template')

  Array.prototype.forEach.call(links, function (link) {
    console.log('Loaded template:', link.href);

    let template = link.import.querySelector('template');
    let clone = document.importNode(template.content, true);

    document.querySelector('#wBody').appendChild(clone)

    // if (link.href.match('about.html')) {
    //   document.querySelector('body').appendChild(clone)
    // } else {
    //   document.querySelector('.content').appendChild(clone)
    // }
  })
}



populatePartials();
populateTemplates();
