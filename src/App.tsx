import React, { useEffect, useState } from "react";
import { getAccessTokenFromCode, listGists, loadCharacterFromGist, createGist } from "./github";
import { exportToPDF, exportToJSON } from "./export";
import { CharacterEditor } from "./editor";
import { FloatingMenu } from "./menu";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [gists, setGists] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    if (code && !token) {
      getAccessTokenFromCode(code).then((token) => {
        setToken(token);
        localStorage.setItem("token", token);
      });
    } else {
      const stored = localStorage.getItem("token");
      if (stored) setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      listGists(token).then(setGists);
    }
  }, [token]);

  const onCreate = () => {
    const name = prompt("Имя нового персонажа?");
    if (name) {
      const character = { name, level: 1, class: "", stats: {} };
      createGist(name, character, token!).then((gist) => {
        setGists([...gists, gist]);
        setCurrent(character);
      });
    }
  };

  const onSelect = (gistId: string) => {
    loadCharacterFromGist(gistId, token!).then(setCurrent);
  };

  if (!token) {
    const authURL = `https://github.com/login/oauth/authorize?client_id=${import.meta.env.VITE_GITHUB_CLIENT_ID}&scope=gist`;
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Pathfinder Character Sheet</h1>
        <a href={authURL} className="bg-blue-500 text-white p-3 rounded">Войти через GitHub</a>
      </div>
    );
  }

  return (
    <div className="p-4">
      {current ? (
        <>
          <CharacterEditor character={current} setCharacter={setCurrent} />
          <FloatingMenu
            onExportJSON={() => exportToJSON(current)}
            onExportPDF={() => exportToPDF()}
            onSelectCharacter={() => {
              const id = prompt("ID Gist персонажа?");
              if (id) onSelect(id);
            }}
            onCreateCharacter={onCreate}
          />
        </>
      ) : (
        <div>
          <h2 className="mb-2">Выбери персонажа:</h2>
          <ul>
            {gists.map((g) => (
              <li key={g.id}>
                <button className="text-blue-600 underline" onClick={() => onSelect(g.id)}>
                  {g.description}
                </button>
              </li>
            ))}
          </ul>
          <button onClick={onCreate} className="mt-4 bg-green-500 text-white p-2 rounded">Создать нового</button>
        </div>
      )}
    </div>
  );
}