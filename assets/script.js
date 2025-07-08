let token = localStorage.getItem('token') || '';

function getData() {
  return Object.fromEntries([...document.querySelectorAll('input, textarea')].map(el => [el.id, el.value]));
}
function fill(data) {
  for (const id in data) {
    const el = document.getElementById(id);
    if (el) el.value = data[id];
  }
}
function exportJSON() {
  const blob = new Blob([JSON.stringify(getData(), null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'character.json';
  a.click();
}
function authorize() {
  const client_id = 'Ov23liOImIHECJoZfzJg';
  const redirect_uri = window.location.href;
  location.href = `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=gist&redirect_uri=${redirect_uri}`;
}
async function saveToGist() {
  if (!token) return alert('Авторизуйтесь через GitHub');
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {'Authorization': 'token ' + token, 'Content-Type': 'application/json'},
    body: JSON.stringify({public: false, files: {'character.json': {content: JSON.stringify(getData())}}})
  });
  const data = await res.json();
  alert('Сохранено в Gist: ' + data.id);
}
async function loadFromGist() {
  if (!token) return alert('Авторизуйтесь через GitHub');
  const id = prompt('ID Gist:');
  const res = await fetch('https://api.github.com/gists/' + id, {
    headers: {'Authorization': 'token ' + token}
  });
  const data = await res.json();
  fill(JSON.parse(data.files['character.json'].content));
}
const params = new URLSearchParams(location.search);
if (params.get('code')) {
  fetch('https://tgwebapp-backend.onrender.com/oauth/github', {
    method: 'POST',
    body: JSON.stringify({code: params.get('code')}),
    headers: {'Content-Type': 'application/json'}
  }).then(res => res.json()).then(res => {
    if (res.access_token) {
      token = res.access_token;
      localStorage.setItem('token', token);
      alert('Успешный вход!');
    }
  });
}
