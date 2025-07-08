function exportJSON() {
  const character = {
    name: document.getElementById('char-name').value,
    class: document.getElementById('char-class').value,
    level: document.getElementById('char-level').value
  };
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "character.json";
  link.click();
}
