let token = localStorage.getItem('token') || '';

function getData() {
  return {
    name: val('name'),
    class: val('class'),
    level: val('level'),
    ancestry: val('ancestry'),
    background: val('background'),
    deity: val('deity'),
    stats: {
      str: val('str'), dex: val('dex'), con: val('con'),
      int: val('int'), wis: val('wis'), cha: val('cha')
    },
    feats: val('feats'),
    spells: val('spells'),
    actions: val('actions'),
    freeActions: val('freeActions'),
    inventory: val('inventory')
  };
}

function val(id) {
  return document.getElementById(id).value;
}

function fill(data) {
  for (const key in data) {
    const el = document.getElementById(key);
    if (el) el.value = data[key];
  }
  if (data.stats) {
    for (const key in data.stats) {
      const el = document.getElementById(key);
      if (el) el.value = data.stats[key];
    }
  }
}

function exportJSON() {
  const data = getData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (data.name || "character") + ".json";
  a.click();
}

function exportPDF() {
  window.print();
}

function authorize() {
  const client_id = "Ov23liOImIHECJoZfzJg";
  const redirect_uri = window.location.href;
  const url = \`https://github.com/login/oauth/authorize?client_id=\${client_id}&scope=gist&redirect_uri=\${redirect_uri}\`;
  window.location.href = url;
}

async function saveToGist() {
  if (!token) return alert("Сначала войдите через GitHub");

  const data = getData();
  const res = await fetch("https://api.github.com/gists", {
    method: "POST",
    headers: {
      Authorization: "token " + token,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      description: "PF2 Character: " + data.name,
      public: false,
      files: {
        "character.json": {
          content: JSON.stringify(data, null, 2)
        }
      }
    })
  });
  const json = await res.json();
  alert("Сохранено в Gist: " + json.id);
}

async function loadFromGist() {
  if (!token) return alert("Сначала войдите через GitHub");

  const gistId = prompt("Вставьте ID Gist:");
  const res = await fetch("https://api.github.com/gists/" + gistId, {
    headers: { Authorization: "token " + token }
  });
  const data = await res.json();
  const content = data.files["character.json"].content;
  fill(JSON.parse(content));
}

// OAuth обмен code → token через backend
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("code")) {
  fetch("https://tgwebapp-backend.onrender.com/oauth/github", {
    method: "POST",
    body: JSON.stringify({ code: urlParams.get("code") }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(res => {
    if (res.access_token) {
      token = res.access_token;
      localStorage.setItem("token", token);
      alert("GitHub авторизация прошла успешно!");
    }
  });
}
