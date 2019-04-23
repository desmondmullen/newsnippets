function displayArticles(saved) {
    $('#noteentry').empty();
    $('#notelist').empty();
    $('#articles').empty();
    let isSaved;
    let theUrl = '/articles';
    if (saved) { theUrl = '/articles/saved' };
    if (1 === 2) { theUrl = '/find/' + 'Sri' };
    $.getJSON(theUrl, data => {
        for (let i = 0; i < data.length; i++) {
            if (data[i].saved) {
                isSaved = `checked='checked'`;
            } else {
                isSaved = ``;
            }
            let theSavedToggle = `<section class='save-switch'>Save Article: 
        OFF <label class='switch'>On
            <input data-id='${data[i]._id}' type='checkbox' ${isSaved} name='savearticle${data[i]._id}' class='saveart saveart${data[i]._id}'>
            <span class='slider round'></span>
        </label> ON</section>`;
            $('#articles').append(`<div class='article-display'><span class='article-title'>${data[i].title}</span><br />${data[i].description}<br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><div class='article-bar'>${theSavedToggle}<button data-id='${data[i]._id}' data-title='${data[i].title}' id='displaynotes'>See/Add Note(s)</button></div></div><br />`);
        }
    });
};

$(document).on('click', '#scrapearticles', function() {
    $('#noteentry').empty();
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
            document.getElementById('articles').classList.remove('fetching');
            displayArticles();
        });
});

displayArticles();

$(document).on('click', '#allarticles', function() {
    displayArticles();
});

$(document).on('click', '#savedarticles', function() {
    displayArticles('saved');
});

$(document).on('click', '#search', function() {
    $.ajax({
            method: 'GET',
            url: '/find/' + $('#searchinput').val()
        })
        .then(data => {
            $('#noteentry').empty();
            $('#notelist').empty();
            $('#articles').empty();
            for (let i = 0; i < data.length; i++) {
                if (data[i].saved) {
                    isSaved = `checked='checked'`;
                } else {
                    isSaved = ``;
                }
                let theSavedToggle = `<section class='save-switch'>Save Article: 
        OFF <label class='switch'>On
            <input data-id='${data[i]._id}' type='checkbox' ${isSaved} name='savearticle${data[i]._id}' class='saveart saveart${data[i]._id}'>
            <span class='slider round'></span>
        </label> ON</section>`;
                $('#articles').append(`<div class='article-display'><span class='article-title'>${data[i].title}</span><br />${data[i].description}<br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><div class='article-bar'>${theSavedToggle}<button data-id='${data[i]._id}' data-title='${data[i].title}' id='displaynotes'>See/Add Note(s)</button></div></div><br />`);
            }
        });
});

$(document).on('click', '#displaynotes', function() {
    let thisId = $(this).attr('data-id');
    let thisTitle = $(this).attr('data-title');
    displayNotes(thisId, thisTitle);
});

function displayNotes(thisId, thisTitle) {
    $('#noteentry').empty();
    $('#notelist').empty();
    $('#titleinput').val('');
    $('#bodyinput').val('');
    $('#noteentry').append(`<h2>Notes for: <em>${thisTitle}</em></h2>`);
    $('#noteentry').append(`<input id='titleinput' name='title' placeholder='New note title...'>`);
    $('#noteentry').append(`<textarea id='bodyinput' name='body' placeholder='New note body...'></textarea>`);
    $('#noteentry').append(`<button data-id='${thisId}' data-title='${thisTitle}' id='savenote'>Save Note</button>`);
    $.ajax({
            method: 'GET',
            url: '/articles/' + thisId
        })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                $('#notelist').prepend(`<p class='data-entry' data-id='${data[i]._id}'><span class='dataTitle' data-id='${data[i]._id}'>${data[i].title}</span><span class=delete>X</span></p>`);
            }
        });
};

$(document).on('click', '#savenote', function() {
    if ($('#titleinput').val() && $('#bodyinput').val()) {
        const thisId = $(this).attr('data-id');
        const thisTitle = $(this).attr('data-title');
        $.ajax({
                method: 'POST',
                url: '/articles/' + thisId,
                data: {
                    title: $('#titleinput').val(),
                    body: $('#bodyinput').val()
                }
            })
            .then(data => {
                displayNotes(thisId, thisTitle);
            });
    }
});

$(document).on('click', '.saveart', function() {
    const thisId = $(this).attr('data-id');
    const trueOrFalse = $(this)[0].checked
    $.ajax({
            method: 'POST',
            url: '/articles/' + thisId,
            data: {
                saved: trueOrFalse
            }
        })
        .then(data => {
            $(this)[0].checked = !$(this)[0].checked;
            displayArticles();
        });
});

// $(document).on('click', '#saveoff', function() {
//     const thisId = $(this).attr('data-id');
//     $.ajax({
//             method: 'POST',
//             url: '/articles/' + thisId,
//             data: {
//                 saved: false
//             }
//         })
//         .then(data => {
//             displayArticles();
//         });
// });

$(document).on('click', '.delete', function() {
    let selected = $(this).parent();
    $.ajax({
        type: 'GET',
        url: '/delete/' + selected.attr('data-id'),
        success: (response) => {
            selected.remove();
            $('#note').val('');
            $('#title').val('');
            $('#action-button').html(`<button id='make-new'>Submit</button>`);
        }
    });
});

$(document).on('click', '.dataTitle', function() {
    const thisId = $(this).attr('data-id');
    $.ajax({
        type: 'GET',
        url: '/notes/' + thisId,
        success: (data) => {
            $('#noteentry').html(`<h2>Notes for: <em>${data[0].article.title}</em></h2>`);
            $('#noteentry').append(`<input id='titleinput' name='title' >`);
            $('#titleinput').val(data[0].title);
            $('#noteentry').append(`<textarea id='bodyinput' name='body'>${data[0].body}</textarea>`);
            $('#noteentry').append(`<button data-id='${thisId}' data-articleId='${data[0].article._id}' data-title='${data[0].article.title}' id='updatenote'>Update Note</button>`);
        }
    });
});

$(document).on('click', '#updatenote', function() {
    let thisId = $(this).attr('data-id')
    let thisTitle = $(this).attr('data-title')
    let thisArticleId = $(this).attr('data-articleId')
    $.ajax({
        type: 'POST',
        url: '/update/' + thisId,
        dataType: 'json',
        data: {
            title: $('#titleinput').val(),
            body: $('#bodyinput').val()
        },
        success: (data) => {
            displayNotes(thisArticleId, thisTitle);
        }
    });
});