function displayArticles() {
    $.getJSON('/articles', data => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].saved) {
                $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Saved</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
            } else {
                $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Save Article</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
            }
            // $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Save Article</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
        }
    });
};

$(document).on('click', '#scrapearticles', function() {
    $('#notelist').empty();
    let stillFetching = true;
    document.getElementById('articles').classList.add('fetching');
    $('#articles').html(`Fetching articles `);
    for (i = 0; i < 25; i++) {
        if (stillFetching === true) {
            setTimeout(function() {
                $('#articles').append(`. `)
            }, i * 300);
        }
    }
    document.getElementById('allarticles').checked = true;
    $.ajax({
            method: 'GET',
            url: '/scrape'
        })
        .then(function(data) {
            stillFetching = false;
            console.log('scrapearticles');
            $('#articles').empty();
            document.getElementById('articles').classList.remove('fetching');
            displayArticles();
        });
});

displayArticles();

$(document).on('click', '#allarticles', function() {
    displayArticles();
});

$(document).on('click', '#savedarticles', function() {
    $('#notelist').empty();
    $('#articles').empty();
    $.ajax({
            method: 'GET',
            url: '/articles/saved'
        })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                $('#articles').append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='savearticle'>Saved</button><button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
            }
        });
});

$(document).on('click', '#addnote', function() {
    $('#notelist').empty();
    const thisId = $(this).attr('data-id');
    $.ajax({
            method: 'GET',
            url: '/articles/' + thisId
        })
        .then(data => {
            console.log(thisId);
            console.log(data.note);
            $('#noteentry').append(`<h2>Notes for: <em>${data.title}${thisId}</em></h2>`);
            $('#noteentry').append(`<input id='titleinput' name='title' >`);
            $('#noteentry').append(`<textarea id='bodyinput' name='body'></textarea>`);
            $('#noteentry').append(`<button data-id='${thisId}' id='savenote'>Save Note</button>`);
            // if (data.note) {
            //     $('#titleinput').val(data.note.title);
            //     $('#bodyinput').val(data.note.body);
            // }
            for (let i = 0; i < data.length; i++) {
                // ...populate #results with a p-tag that includes the note's title and object id
                $("#notelist").prepend("<p class='data-entry' data-id=" + data[i]._id + "><span class='dataTitle' data-id=" +
                    data[i]._id + ">" + data[i].title + "</span><span class=delete>X</span></p>");
            }

        });
});

$(document).on('click', '#savenote', function() {
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
            $('#notelist').empty();
        });
    $('#titleinput').val('');
    $('#bodyinput').val('');
});

$(document).on('click', '#savearticle', function() {
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