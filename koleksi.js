$(document).ready(function () {
  // Tampilkan karya seni default dari kedua API saat halaman pertama kali dibuka
  fetchDefaultArtMET();
  fetchDefaultArtArtInstitute();

  // Event pencarian gabungan
  $('#button-search').on('click', function () {
    const query = $('#search-input').val().trim();
    if (query !== '') {
      $('#daftar-art').empty();
      searchArtMET(query);
      searchArtArtInstitute(query);
    }
  });

  // Event klik detail
  $('#daftar-art').on('click', '.see-detail', function (e) {
    e.preventDefault();
    const source = $(this).data('source');
    const objectID = $(this).data('id');
    showDetail(source, objectID);
  });
});

/** 
 * API 1: The MET Collection API - Default fetch 10 karya seni pertama 
 */
function fetchDefaultArtMET() {
  $.ajax({
    url: 'https://collectionapi.metmuseum.org/public/collection/v1/objects',
    type: 'get',
    dataType: 'json',
    success: function (data) {
      if (data && data.objectIDs) {
        const ids = data.objectIDs.slice(0, 10);
        ids.forEach(id => loadArtworkMET(id));
      } else {
        $('#daftar-art').append('<p class="text-center w-100">Tidak ada karya seni dari MET.</p>');
      }
    },
    error: function () {
      console.warn('Gagal memuat data awal dari MET.');
    }
  });
}

/**
 * API 2: Art Institute of Chicago API - Default fetch 10 karya seni terbaru
 */
function fetchDefaultArtArtInstitute() {
  $.ajax({
    url: 'https://api.artic.edu/api/v1/artworks',
    type: 'get',
    dataType: 'json',
    data: {
      page: 1,
      limit: 10,
      fields: 'id,title,image_id,artist_display,date_display'
    },
    success: function (res) {
      if (res && res.data) {
        res.data.forEach(art => loadArtworkArtInstitute(art));
      } else {
        $('#daftar-art').append('<p class="text-center w-100">Tidak ada karya seni dari Art Institute.</p>');
      }
    },
    error: function () {
      console.warn('Gagal memuat data awal dari Art Institute.');
    }
  });
}

// Cari di The MET Collection
function searchArtMET(query) {
  $.ajax({
    url: 'https://collectionapi.metmuseum.org/public/collection/v1/search',
    type: 'get',
    dataType: 'json',
    data: { q: query },
    success: function (result) {
      if (result.total > 0 && result.objectIDs) {
        const ids = result.objectIDs.slice(0, 10);
        ids.forEach(id => loadArtworkMET(id));
      } else {
        $('#daftar-art').append('<p class="text-center w-100">Tidak ditemukan di MET.</p>');
      }
    },
    error: function () {
      alert('Terjadi kesalahan saat pencarian di MET.');
    }
  });
}

// Cari di Art Institute of Chicago
function searchArtArtInstitute(query) {
  $.ajax({
    url: 'https://api.artic.edu/api/v1/artworks/search',
    type: 'get',
    dataType: 'json',
    data: {
      q: query,
      fields: 'id,title,image_id,artist_display,date_display',
      limit: 10
    },
    success: function (res) {
      if (res && res.data && res.data.length > 0) {
        res.data.forEach(art => loadArtworkArtInstitute(art));
      } else {
        $('#daftar-art').append('<p class="text-center w-100">Tidak ditemukan di Art Institute.</p>');
      }
    },
    error: function () {
      alert('Terjadi kesalahan saat pencarian di Art Institute.');
    }
  });
}

// Tampilkan karya seni dari The MET
function loadArtworkMET(id) {
  $.ajax({
    url: `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`,
    type: 'get',
    dataType: 'json',
    success: function (art) {
      if (art.primaryImageSmall) {
        $('#daftar-art').append(`
          <div class="col-md-4 mb-4">
            <div class="card shadow-sm art-item h-100">
              <img src="${art.primaryImageSmall}" alt="${art.title}" class="card-img-top" style="height: 300px; object-fit: cover;">
              <div class="card-body">
                <h5 class="card-title">${art.title}</h5>
                <p class="card-text">${art.artistDisplayName || 'Unknown Artist'}</p>
                <a href="#" class="card-link see-detail" data-id="${art.objectID}" data-source="met" data-toggle="modal" data-target="#exampleModal">Lihat Detail</a>
              </div>
            </div>
          </div>
        `);
      }
    },
    error: function () {
      console.warn('Error loading artwork MET:', id);
    }
  });
}

// Tampilkan karya seni dari Art Institute of Chicago
function loadArtworkArtInstitute(art) {
  if (art.image_id) {
    const imageUrl = `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg`;
    $('#daftar-art').append(`
      <div class="col-md-4 mb-4">
        <div class="card shadow-sm art-item h-100">
          <img src="${imageUrl}" alt="${art.title}" class="card-img-top" style="height: 300px; object-fit: cover;">
          <div class="card-body">
            <h5 class="card-title">${art.title}</h5>
            <p class="card-text">${art.artist_display || 'Unknown Artist'}</p>
            <a href="#" class="card-link see-detail" data-id="${art.id}" data-source="artic" data-toggle="modal" data-target="#exampleModal">Lihat Detail</a>
          </div>
        </div>
      </div>
    `);
  }
}

// Tampilkan detail karya seni sesuai API sumbernya
function showDetail(source, objectID) {
  if (source === 'met') {
    $.ajax({
      url: `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`,
      type: 'get',
      dataType: 'json',
      success: function (art) {
        $('.modal-title').text(art.title);
        $('.modal-body').html(`
          <div class="container-fluid">
            <div class="row">
              <div class="col-md-4 text-center">
                <img src="${art.primaryImageSmall}" class="img-fluid" alt="${art.title}" style="height: 300px; object-fit: cover;">
              </div>
              <div class="col-md-8">
                <ul class="list-group">
                  <li class="list-group-item"><strong>Title:</strong> ${art.title}</li>
                  <li class="list-group-item"><strong>Artist:</strong> ${art.artistDisplayName || 'Unknown'}</li>
                  <li class="list-group-item"><strong>Culture:</strong> ${art.culture || '-'}</li>
                  <li class="list-group-item"><strong>Object Date:</strong> ${art.objectDate || '-'}</li>
                  <li class="list-group-item"><strong>Medium:</strong> ${art.medium || '-'}</li>
                  <li class="list-group-item"><strong>Dimensions:</strong> ${art.dimensions || '-'}</li>
                </ul>
              </div>
            </div>
          </div>
        `);
      },
      error: function () {
        $('.modal-body').html('<p class="text-center">Detail tidak tersedia</p>');
      }
    });
  } else if (source === 'artic') {
    $.ajax({
      url: `https://api.artic.edu/api/v1/artworks/${objectID}`,
      type: 'get',
      dataType: 'json',
      success: function (res) {
        const art = res.data;
        const imageUrl = art.image_id ? `https://www.artic.edu/iiif/2/${art.image_id}/full/843,/0/default.jpg` : '';
        $('.modal-title').text(art.title);
        $('.modal-body').html(`
          <div class="container-fluid">
            <div class="row">
              <div class="col-md-4 text-center">
                ${imageUrl ? `<img src="${imageUrl}" class="img-fluid" alt="${art.title}" style="height: 300px; object-fit: cover;">` : ''}
              </div>
              <div class="col-md-8">
                <ul class="list-group">
                  <li class="list-group-item"><strong>Title:</strong> ${art.title}</li>
                  <li class="list-group-item"><strong>Artist:</strong> ${art.artist_display || 'Unknown'}</li>
                  <li class="list-group-item"><strong>Date:</strong> ${art.date_display || '-'}</li>
                  <li class="list-group-item"><strong>Medium:</strong> ${art.medium_display || '-'}</li>
                  <li class="list-group-item"><strong>Dimensions:</strong> ${art.dimensions || '-'}</li>
                </ul>
              </div>
            </div>
          </div>
        `);
      },
      error: function () {
        $('.modal-body').html('<p class="text-center">Detail tidak tersedia</p>');
      }
    });
  }
}
