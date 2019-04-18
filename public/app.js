$.getJSON("/articles", data => {
  for (let i = 0; i < data.length; i++) {
    $("#articles").append(`<p>${data[i].title} <button data-id='${data[i]._id}' id='addnote'>See/Add Note(s)</button><br /><a href='${data[i].link}' target='_blank'>${data[i].link}</a><br />${data[i].description}</p>`);
  }
});


$(document).on("click", "#addnote", function () {
  $("#notes").empty();
  const thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    .then(data => {
      $("#notes").append(`<h2>Notes for: <em>${data.title}</em></h2>`);
      $("#notes").append("<input id='titleinput' name='title' >");
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
      if (data.note) {
        $("#titleinput").val(data.note.title);
        $("#bodyinput").val(data.note.body);
      }
    });
});

$(document).on("click", "#savenote", function () {
  const thisId = $(this).attr("data-id");
  console.log(thisId);
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      title: $("#titleinput").val(),
      body: $("#bodyinput").val()
    }
  })
    .then(data => {
      console.log(data);
      $("#notes").empty();
    });
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
