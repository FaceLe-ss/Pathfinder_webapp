let token = localStorage.getItem('token') || '';

function getData() {
  return Object.fromEntries(
    Array.from(document.querySelectorAll('input, textarea'))
      .map(el => [el.id, el.value])
  );
}

function fill(data) {
  for (const key in data) {
    const el = document.getElementById(key);
    if (el) el.value = data[key];
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
  window.location.href = \`https://github.com/login/oauth/authorize?client_id=\${client_id}&scope=gist&redirect_uri=\${redirect_uri}\`;
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
      description: "PF2 персонаж: " + (data.name || "без имени"),
      public: false,
      files: {
        "character.json": { content: JSON.stringify(data, null, 2) }
      }
    })
  });
  const json = await res.json();
  alert("Сохранено! ID: " + json.id);
}

async function loadFromGist() {
  if (!token) return alert("Сначала войдите через GitHub");
  const gistId = prompt("Введите ID Gist:");
  const res = await fetch("https://api.github.com/gists/" + gistId, {
    headers: { Authorization: "token " + token }
  });
  const data = await res.json();
  fill(JSON.parse(data.files["character.json"].content));
}

const params = new URLSearchParams(location.search);
if (params.get("code")) {
  fetch("https://tgwebapp-backend.onrender.com/oauth/github", {
    method: "POST",
    body: JSON.stringify({ code: params.get("code") }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(res => {
    if (res.access_token) {
      token = res.access_token;
      localStorage.setItem("token", token);
      alert("Вход через GitHub выполнен!");
    }
  });
}
