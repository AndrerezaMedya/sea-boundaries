fetch('http://localhost:8080/api/locations/TD.001A_2002')
  .then(res => res.text())
  .then(console.log)
  .catch(console.error);
