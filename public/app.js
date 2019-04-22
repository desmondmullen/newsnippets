function displayArticles() {
    $.getJSON('/articles', data => {
        for (let i = 0; i < data.length; i++) {
            $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Save Article</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
        }
    });
};

$(document).on('click', '#scrapearticles', function () {
    $('#notes').empty();
    let stillFetching = true;
    document.getElementById('articles').classList.add('fetching');
    $('#articles').html(`Fetching articles `);
    for (i = 0; i < 25; i++) {
        if (stillFetching === true) {
            setTimeout(function () {
                $('#articles').append(`. `)
            }, i * 300);
        }
    }
    document.getElementById('allarticles').checked = true;
    $.ajax({
        method: 'GET',
        url: '/scrape'
    })
        .then(function (data) {
            stillFetching = false;
            console.log('scrapearticles');
            $('#articles').empty();
            document.getElementById('articles').classList.remove('fetching');
            displayArticles();
            // for (let i = 0; i < data.length; i++) {
            //     $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Save Article</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
            // }
        });
});

displayArticles();

$(document).on('click', '#allarticles', function () {
    displayArticles();
});

$(document).on('click', '#savedarticles', function () {
    $('#notes').empty();
    $('#articles').empty();
    $.ajax({
        method: 'GET',
        url: '/articles/saved'
    })
        .then(data => {
            // console.log('before');
            // console.log(data);
            // console.log('after');
            for (let i = 0; i < data.length; i++) {
                $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Save Article</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
            }
        });
});

$(document).on('click', '#addnote', function () {
    $('#notes').empty();
    const thisId = $(this).attr('data-id');
    $.ajax({
        method: 'GET',
        url: '/articles/' + thisId
    })
        .then(data => {
            $('#notes').append(`<h2>Notes for: <em>${data.title}</em></h2>`);
            $('#notes').append(`<input id='titleinput' name='title' >`);
            $('#notes').append(`<textarea id='bodyinput' name='body'></textarea>`);
            $('#notes').append(`<button data-id='${data._id}' id='savenote'>Save Note</button>`);
            if (data.note) {
                $('#titleinput').val(data.note.title);
                $('#bodyinput').val(data.note.body);
            }
        });
});

$(document).on('click', '#savenote', function () {
    const thisId = $(this).attr('data-id');
    $.ajax({
        method: 'POST',
        url: '/articles/' + thisId,
        data: {
            title: $('#titleinput').val(),
            body: $('#bodyinput').val()
        }
    })
        .then(data => {
            $('#notes').empty();
        });
    $('#titleinput').val('');
    $('#bodyinput').val('');
});

$(document).on('click', '#savearticle', function () {
    console.log('saving');
    const thisId = $(this).attr('data-id');
    $.ajax({
        method: 'POST',
        url: '/articles/' + thisId,
        data: {
            saved: true
        }
    })
        .then(data => {
            console.log(data);
        });
});