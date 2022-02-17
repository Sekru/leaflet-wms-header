'use strict';

function fetchImage(url, headers, abort) {
  let _headers = {};
  if (headers) {
    headers.forEach(h => {
      _headers[h.header] = h.value;
    });
  }
  const controller = new AbortController();
  const signal = controller.signal;
  if (abort) {
    abort.subscribe(() => {
      controller.abort();
    });
  }
  return fetch(url, {
    method: "GET",
    headers: _headers,
    mode: "cors",
    signal: signal
  })
  .then(f => f.blob());
}

L.TileLayer.WMSHeader = L.TileLayer.WMS.extend({
  initialize: function (url, options, headers, abort) {
    L.TileLayer.WMS.prototype.initialize.call(this, url, options);
    this.headers = headers;
    this.abort = abort;
  },
  createTile(coords, done) {
    const url = this.getTileUrl(coords);
    const img = document.createElement("img");
    img.setAttribute("role", "presentation");

    fetchImage(
      url,
      this.headers,
      this.abort
    ).then(blob => {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = reader.result;
      };
      reader.readAsDataURL(blob);
      done(null, img);
    });
    return img;
  }
});

L.tileLayer.wmsHeader = function (url, options, headers, abort) {
  return new L.TileLayer.WMSHeader(url, options, headers, abort);
};
