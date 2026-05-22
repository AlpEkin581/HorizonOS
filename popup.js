// ─── HorizonOS Terminal — Chrome Extension Popup ───
// Gerçek sistem bilgileri chrome.system API'leriyle alınır

// ── FETCH LOGO ──
const FETCH_LOGO = [
  "                                         .-* ==        ",
  "                                         -*####     :##-         ",
  "                             ::  .=++***:  =#*==.                 ",
  "                               ::---. =*=  :**+=-                 ",
  "                                .    -+=  .+*+===                  ",
  "                                  -==   =+=--:-=                   ",
  "                                 .--.   -==--:  :-                     ",
  "                                                                     ",
  "                               .-=+********########*+-:                     ",
  "                         .-=+++=-:..:-:          ..::=+***+=:                 ",
  "                       :==:           :.                     :+*-               ",
  "                                      ..                           .               ",
  "                                                                                     ",
  "                                                                                      ",
               " -%   :@:  =@@@%:  =@@@@* =@..%@@@@#  .%@@@=  .@+   #=                ",
               " *@.  -@- @@   .@@ *@   %@ *@:    @@. @@:   @@ :@@@. @* ",
               " +@*==#@- @@    @@ +@@@@@: *@:   %@-   @@    %@.:@=-@@@* ",
               " +@   -@-  @@@@@#  *@  :@+ *@::@@@@@@: *@@@@@  :@=  =@* "
];

const FETCH_COLORS = [
  "#00e5ff","#00e5ff","#00bcd4","#00bcd4",
  "#2196f3","#2196f3","#1e88e5","#1e88e5",
  "#00bcd4","#00bcd4","#4dd0e1","#4dd0e1",
  "#80deea","#80deea","#00e5ff","#4dd0e1","#00bcd4"
];

const BOOT_LOGO = [
  " /$$  /$$                    /$$                                  /$$$$$$   /$$$$$$  ",
  "| $$  | $$                       |__/                            /$$__  $$ /$$__  $$ ",
  "| $$  | $$  /$$$$$$   /$$$$$$   /$$ /$$$$$$$$  /$$$$$$  /$$$$$$$ | $$  \\ $$| $$  \\__/",
  "| $$$$$$$$ /$$__  $$ /$$__  $$| $$|____ /$$/ /$$__  $$| $$__  $$| $$  | $$|  $$$$$$ ",
  "| $$__  $$| $$  \\ $$| $$  \\__/| $$   /$$$$/ | $$  \\ $$| $$  \\ $$| $$  | $$ \____  $$",
  "| $$  | $$| $$  | $$| $$      | $$  /$$__/   | $$  | $$| $$  | $$| $$  | $$ /$$  \\ $$",
  "| $$  | $$|  $$$$$$/| $$      | $$ /$$$$$$$$|  $$$$$$/| $$  | $$|  $$$$$$/|  $$$$$$/",
  "|__/  |__/ \\______/ |__/      |__/|________/ \\______/ |__/  |__/ \\______/  \\______/ "
];
const BOOT_COLORS = ["#00e5ff","#00bcd4","#2196f3","#1e88e5","#00bcd4","#00e5ff","#4dd0e1","#80deea"];

// ── FILESYSTEM ──
const FS = {
  "/": { type:"dir", children:["home","etc","bin","usr","var","tmp"] },
  "/home": { type:"dir", children:["user"] },
  "/home/user": { type:"dir", children:["documents","downloads",".hzrc","readme.txt"] },
  "/home/user/documents": { type:"dir", children:["notes.txt"] },
  "/home/user/downloads": { type:"dir", children:["horizonos-1.2.iso"] },
  "/home/user/.hzrc": { type:"file", content:`alias cls="clear"\nalias fetch="hzfetch"\nalias neofetch="hzfetch"\nalias matrix="matrix"\nalias snake="snake"` },
  "/home/user/readme.txt": { type:"file", content:`Welcome to HorizonOS v1.2.0\n============================\nGerçek sistem bilgilerin ile çalışıyor!\n\nhzfetch  — PC bilgilerini göster\nhelp     — Tüm komutlar\nsnake    — Yılan oyunu\nmatrix   — Matrix efekti` },
  "/home/user/documents/notes.txt": { type:"file", content:`HorizonOS Chrome Extension\n==========================\nGerçek CPU, RAM, Disk ve Ekran bilgisi\nchrome.system API ile alınır.` },
  "/home/user/downloads/horizonos-1.2.iso": { type:"file", content:"[Binary ISO — 2.8 GB]" },
  "/etc": { type:"dir", children:["os-release","hostname"] },
  "/etc/os-release": { type:"file", content:`NAME="HorizonOS"\nVERSION="1.2.0"\nPRETTY_NAME="HorizonOS 1.2.0 (Zenith)"` },
  "/etc/hostname": { type:"file", content:"horizon-local" },
  "/bin": { type:"dir", children:["ls","cat","pwd","clear","echo"] },
  "/usr": { type:"dir", children:["bin","share"] },
  "/usr/bin": { type:"dir", children:["hzfetch","nano"] },
  "/usr/share": { type:"dir", children:["horizonos"] },
  "/var": { type:"dir", children:["log"] },
  "/var/log": { type:"dir", children:["boot.log"] },
  "/var/log/boot.log": { type:"file", content:`[  0.000000] HorizonOS kernel starting...\n[  1.340012] Boot complete.` },
  "/tmp": { type:"dir", children:[] },
};

// ── STATE ──
let sysInfo = null;
let cwd = "/home/user";
let userName = "user";
let isRoot = false;
let outputLines = [];
let inputValue = "";
let cmdHistory = [];
let historyIdx = -1;
let cursorOn = true;
let mode = "boot"; // boot | logo | terminal | sudo-auth | nano | snake | matrix
let bootStep = 0;
let logoStep = 0;
let nanoFile = "";
let nanoContent = "";
let activePing = null;
let pingInterval = null;

// Snake
let snake = [[5,5]];
let snakeFood = [8,8];
let snakeDir = [0,1];
let snakeScore = 0;
let snakeOver = false;
let snakeLoop = null;

// ── DOM HELPERS ──
const root = document.getElementById("root");

function h(tag, attrs={}, ...children) {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const c of children) {
    if (c == null) continue;
    el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return el;
}

// ── SYSTEM INFO FETCH ──
async function loadSysInfo() {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ type: "GET_SYSTEM_INFO" }, resp => {
      if (resp?.success) resolve(resp.data);
      else resolve(null);
    });
  });
}

function buildSysRows(info) {
  if (!info) return getDefaultRows();

  const cpu = info.cpu?.modelName || "Unknown CPU";
  const cores = info.cores || info.cpu?.numOfProcessors || 1;
  const totalMB = info.memory?.totalMB || 8192;
  const usedMB  = info.memory?.usedMB  || 4096;
  const pct = Math.round((usedMB / totalMB) * 100);

  // Platform → OS
  let osName = "HorizonOS 1.2.0";
  const ua = info.userAgent || "";
  if      (ua.includes("Windows NT 11")) osName = "HorizonOS on Windows 11";
  else if (ua.includes("Windows NT 10")) osName = "HorizonOS on Windows 10";
  else if (ua.includes("Macintosh"))     osName = "HorizonOS on macOS";
  else if (ua.includes("Linux"))          osName = "HorizonOS on Linux";
  else if (ua.includes("CrOS"))           osName = "HorizonOS on ChromeOS";

  // Ekran
  const primary = (info.displays||[]).find(d=>d.isPrimary) || info.displays?.[0];
  const res = primary ? `${primary.width} × ${primary.height}` : "1920 × 1080";

  // Disk
  const disks = info.storage || [];
  const mainDisk = disks.find(d=>d.type==="fixed") || disks[0];
  const diskStr = mainDisk ? `~${mainDisk.capacity} GB` : "Unknown";

  return [
    ["", `${userName}@horizon-local`],
    ["OS",         osName],
    ["Kernel",     "6.9.5-horizon-pro"],
    ["Shell",      "hzsh 3.2.5"],
    ["Resolution", res],
    ["CPU",        `${cpu} (${cores} cores)`],
    ["Memory",     `${usedMB.toLocaleString()} / ${totalMB.toLocaleString()} MiB (${pct}%)`],
    ["Disk",       diskStr],
    ["Platform",   info.platform || "Unknown"],
    ["Language",   info.language || "en"],
    ["Network",    info.online ? "Online ✓" : "Offline ✗"],
    ["", ""],
    ["", "▓▒░ ████ ░▒▓  ▓▒░ ████ ░▒▓"],
  ];
}

function getDefaultRows() {
  return [
    ["", "user@horizon-local"],
    ["OS", "HorizonOS 1.2.0 (Zenith)"],
    ["Kernel", "6.9.5-horizon-pro"],
    ["Memory", "Loading..."],
    ["", ""],
  ];
}

// ── PATH RESOLVER ──
function resolvePath(p) {
  if (!p) return cwd;
  if (p === "~") return `/home/${userName}`;
  if (p.startsWith("/")) return p.replace(/\/+$/,"") || "/";
  if (p === "..") {
    const parts = cwd.split("/").filter(Boolean);
    parts.pop();
    return "/" + parts.join("/") || "/";
  }
  if (p === ".") return cwd;
  const base = cwd === "/" ? "" : cwd;
  return (base+"/"+p).replace(/\/+/g,"/").replace(/\/$/,"") || "/";
}

// ── COMMAND RUNNER ──
function runCmd(cmdLine) {
  cmdLine = cmdLine.trim();
  if (!cmdLine) return;

  if (mode === "sudo-auth") {
    if (cmdLine === "horizon") {
      isRoot = true; userName = "root"; mode = "terminal";
      pushLine("Access granted. You are now root.", "#28c840");
    } else {
      mode = "terminal";
      pushLine("sudo: Authentication failure.", "#ff5f57");
    }
    pushLine("","");
    render(); return;
  }

  cmdHistory.push(cmdLine);
  historyIdx = -1;

  outputLines.push({ type:"prompt-echo", user:userName, path:displayCwd(), cmd:cmdLine, isRoot });

  const aliases = loadAliases();
  const base = cmdLine.split(/\s+/)[0];
  if (aliases[base]) cmdLine = cmdLine.replace(base, aliases[base]);

  const parts = cmdLine.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  switch(cmd) {
    case "help":
      pushLines([
        l("╔══════════════════════════════════════════╗","#00bcd4"),
        l("║        HorizonOS Shell  v1.2.0           ║","#00bcd4"),
        l("╚══════════════════════════════════════════╝","#00bcd4"),
        l(""),
        l("  ls [path]    - Dizin listele","#d4d8de"),
        l("  cd <dir>     - Dizin değiştir","#d4d8de"),
        l("  pwd          - Mevcut dizin","#d4d8de"),
        l("  cat <file>   - Dosya oku","#d4d8de"),
        l("  nano <file>  - Dosya düzenle","#d4d8de"),
        l("  touch <f>    - Dosya oluştur","#d4d8de"),
        l("  mkdir <d>    - Klasör oluştur","#d4d8de"),
        l("  rm <f>       - Dosya/klasör sil","#d4d8de"),
        l(""),
        l("  hzfetch      - Gerçek sistem bilgisi ★","#00e5ff"),
        l("  uname [-a]   - Kernel bilgisi","#d4d8de"),
        l("  uptime       - Çalışma süresi","#d4d8de"),
        l("  whoami       - Kullanıcı","#d4d8de"),
        l("  date         - Tarih/saat","#d4d8de"),
        l("  ps           - Süreçler","#d4d8de"),
        l("  df           - Disk kullanımı","#d4d8de"),
        l("  free         - RAM kullanımı","#d4d8de"),
        l("  ping <host>  - Sürekli ping (Ctrl+C dur)","#d4d8de"),
        l(""),
        l("  sudo su      - Root ol (Şifre: horizon)","#ff5f57"),
        l("  exit         - Root'tan çık","#d4d8de"),
        l(""),
        l("  snake        - Yılan oyunu 🐍","#28c840"),
        l("  matrix       - Matrix efekti","#d4d8de"),
        l("  fortune      - Rastgele alıntı","#d4d8de"),
        l("  banner       - Logo göster","#d4d8de"),
        l("  clear / cls  - Temizle","#d4d8de"),
      ]);
      break;

    case "clear": case "cls":
      outputLines = []; break;

    case "pwd":
      pushLine(cwd, "#00e5ff"); break;

    case "whoami":
      pushLine(userName, "#00e5ff"); break;

    case "hostname":
      pushLine("horizon-local", "#00e5ff"); break;

    case "date":
      pushLine(new Date().toString(), "#4dd0e1"); break;

    case "echo":
      pushLine(args.join(" ")); break;

    case "uname":
      pushLine(args.includes("-a")
        ? "HorizonOS horizon-local 6.9.5-horizon-pro #1 SMP 2026-05-20 x86_64"
        : "HorizonOS", "#d4d8de");
      break;

    case "uptime":
      pushLine(` up ${Math.floor(Math.random()*8+1)}:${String(Math.floor(Math.random()*60)).padStart(2,"0")},  1 user,  load average: ${(Math.random()*1.5).toFixed(2)}`);
      break;

    case "ps":
      pushLines([
        l("  PID TTY          TIME CMD","#4dd0e1"),
        l("    1 ?        00:00:01 horizond"),
        l("   42 ?        00:00:00 hzde-session"),
        l("  128 pts/0    00:00:00 hzsh"),
      ]);
      break;

    case "df":
      pushLines([
        l("Filesystem   Size   Used  Avail Use% Mounted","#4dd0e1"),
        ...((sysInfo?.storage||[{name:"Storage",capacity:256,type:"fixed"}]).map(s =>
          l(`${s.name||"/dev/sda"}  ${s.capacity}G  ~${Math.round(s.capacity*0.3)}G  ~${Math.round(s.capacity*0.7)}G  30% /`)
        ))
      ]);
      break;

    case "free": {
      const total = sysInfo?.memory?.totalMB || 8192;
      const used  = sysInfo?.memory?.usedMB  || 4096;
      const free  = total - used;
      pushLines([
        l("               total        used        free","#4dd0e1"),
        l(`Mem:        ${String(total).padStart(8)}    ${String(used).padStart(8)}    ${String(free).padStart(8)}`),
      ]);
      break;
    }

    case "hzfetch": case "neofetch": case "fetch": {
      const rows = buildSysRows(sysInfo);
      const maxLen = Math.max(FETCH_LOGO.length, rows.length);
      for (let i = 0; i < maxLen; i++) {
        outputLines.push({
          type: "fetch-row",
          logo:      FETCH_LOGO[i] || "                         ",
          logoColor: FETCH_COLORS[i] || "#80deea",
          label:     rows[i]?.[0] ?? "",
          value:     rows[i]?.[1] ?? "",
          isHeader:  i === 0,
        });
      }
      pushLine("","");
      break;
    }

    case "ls": {
      const target = resolvePath(args.find(a=>!a.startsWith("-")));
      const node = FS[target];
      if (!node) { pushLine(`hzsh: ls: '${args[0]}': No such file or directory`,"#ff5f57"); break; }
      if (node.type==="file") { pushLine(target.split("/").pop()); break; }
      const children = node.children || [];
      if (!children.length) { pushLine("(empty)","#666"); break; }
      const showLong = args.some(a=>["-l","-la","-al"].includes(a));
      if (showLong) {
        children.forEach(c => {
          const cp = (target==="/"?"":target)+"/"+c;
          const isDir = FS[cp]?.type==="dir";
          pushLine(`${isDir?"drwxr-xr-x":"-rw-r--r--"}  1 ${userName} ${userName}  4096 May 20 12:34 ${c}`, isDir?"#00e5ff":"#d4d8de");
        });
      } else {
        outputLines.push({ type:"ls-grid", items:children, basePath:target });
      }
      break;
    }

    case "cd": {
      const target = resolvePath(args[0]||"~");
      if (!FS[target]) { pushLine(`hzsh: cd: ${args[0]}: No such file or directory`,"#ff5f57"); break; }
      if (FS[target].type!=="dir") { pushLine(`hzsh: cd: ${args[0]}: Not a directory`,"#ff5f57"); break; }
      cwd = target; break;
    }

    case "cat": {
      if (!args[0]) { pushLine("hzsh: cat: missing operand","#ff5f57"); break; }
      const target = resolvePath(args[0]);
      const node = FS[target];
      if (!node) { pushLine(`hzsh: cat: ${args[0]}: No such file or directory`,"#ff5f57"); break; }
      if (node.type==="dir") { pushLine(`hzsh: cat: ${args[0]}: Is a directory`,"#ff5f57"); break; }
      node.content.split("\n").forEach(line => pushLine(line,"#e8eaed"));
      break;
    }

    case "touch": {
      if (!args[0]) { pushLine("hzsh: touch: missing operand","#ff5f57"); break; }
      const target = resolvePath(args[0]);
      const parent = target.substring(0, target.lastIndexOf("/")) || "/";
      const name = target.split("/").pop();
      if (!FS[parent]) { pushLine(`hzsh: touch: no such directory`,"#ff5f57"); break; }
      if (!FS[target]) { FS[parent].children.push(name); FS[target]={type:"file",content:""}; }
      pushLine(`Created: ${args[0]}`,"#28c840"); break;
    }

    case "mkdir": {
      if (!args[0]) { pushLine("hzsh: mkdir: missing operand","#ff5f57"); break; }
      const target = resolvePath(args[0]);
      const parent = target.substring(0, target.lastIndexOf("/")) || "/";
      const name = target.split("/").pop();
      if (!FS[parent]) { pushLine(`hzsh: mkdir: no such parent directory`,"#ff5f57"); break; }
      if (FS[target])  { pushLine(`hzsh: mkdir: '${args[0]}': File exists`,"#ff5f57"); break; }
      FS[parent].children.push(name);
      FS[target] = { type:"dir", children:[] };
      pushLine(`Directory created: ${args[0]}`,"#28c840"); break;
    }

    case "rm": {
      if (!args[0]) { pushLine("hzsh: rm: missing operand","#ff5f57"); break; }
      const target = resolvePath(args[0]);
      if (!FS[target]) { pushLine(`hzsh: rm: '${args[0]}': No such file or directory`,"#ff5f57"); break; }
      if (FS[target].type==="dir" && !args.some(a=>a==="-r"||a==="-rf")) {
        pushLine(`hzsh: rm: '${args[0]}': Is a directory (use -r)`,`#ff5f57`); break;
      }
      const parent = target.substring(0, target.lastIndexOf("/")) || "/";
      const name = target.split("/").pop();
      if (FS[parent]) FS[parent].children = FS[parent].children.filter(c=>c!==name);
      delete FS[target];
      pushLine(`Removed: ${args[0]}`,"#febc2e"); break;
    }

    case "nano": {
      if (!args[0]) { pushLine("hzsh: nano: missing file argument","#ff5f57"); break; }
      nanoFile = resolvePath(args[0]);
      nanoContent = FS[nanoFile]?.content ?? "";
      mode = "nano";
      render(); return;
    }

    case "sudo": {
      if (args[0]==="su") {
        if (isRoot) { pushLine("You are already root.","#febc2e"); break; }
        pushLine("[sudo] password for user:","#ff5f57");
        mode = "sudo-auth";
        render(); return;
      }
      pushLine("hzsh: sudo: usage: sudo su","#ff5f57"); break;
    }

    case "exit": case "logout":
      if (isRoot) { isRoot=false; userName="user"; cwd=`/home/user`; pushLine("Exited root session.","#febc2e"); }
      else pushLine("Goodbye from HorizonOS! ◈","#00e5ff");
      break;

    case "ping": {
      const host = args[0]||"horizonos.dev";
      pushLine(`PING ${host}: 56 data bytes. Ctrl+C ile durdur.`,"#d4d8de");
      activePing = host;
      let seq=1;
      pingInterval = setInterval(()=>{
        const ms = (Math.random()*5+0.3).toFixed(1);
        pushLine(`64 bytes from ${host}: icmp_seq=${seq++} ttl=64 time=${ms} ms`,"#4dd0e1");
        render();
      },1000);
      render(); return;
    }

    case "matrix":
      mode = "matrix"; render(); return;

    case "snake":
      snake=[[5,5]]; snakeFood=[8,8]; snakeDir=[0,1];
      snakeScore=0; snakeOver=false;
      mode = "snake"; startSnake(); render(); return;

    case "fortune": {
      const quotes = [
        '"The horizon is not a limit — it\'s a direction." — HorizonOS Team',
        '"sudo rm -rf /worries && hzpkg install happiness" — Shell Wisdom',
        '"Hayatta en hakiki mürşit ilimdir." — Mustafa Kemal Atatürk',
        '"The best OS is the one you build yourself." — HorizonOS Docs',
        '"There are 10 types of people: those who understand binary, and those who don\'t." — Classic',
      ];
      pushLine("","");
      pushLine(quotes[Math.floor(Math.random()*quotes.length)],"#4dd0e1");
      pushLine("","");
      break;
    }

    case "banner":
      BOOT_LOGO.forEach((line,i)=>pushLine(line, BOOT_COLORS[i]));
      pushLine('  "Beyond The Horizon" — HorizonOS v1.2.0 (Zenith)',"#4dd0e1");
      pushLine("","");
      break;

    case "history":
      cmdHistory.slice(-20).forEach((h,i)=>pushLine(`  ${String(i+1).padStart(4)}   ${h}`,"#80deea"));
      break;

    default:
      pushLine(`hzsh: '${cmd}': command not found. Type 'help'.`,"#ff5f57");
  }

  pushLine("","");
  render();
}

// ── HELPERS ──
function l(text, color="#d4d8de") { return { type:"line", text, color }; }
function pushLine(text, color="#d4d8de") { outputLines.push({ type:"line", text, color }); }
function pushLines(arr) { arr.forEach(x => outputLines.push(x)); }
function displayCwd() { return cwd === `/home/${userName}` ? "~" : cwd.replace(`/home/${userName}`,"~"); }

function loadAliases() {
  const hzrc = FS[`/home/user/.hzrc`] || FS[`/home/${userName}/.hzrc`];
  if (!hzrc) return {};
  const map = {};
  hzrc.content.split("\n").forEach(line => {
    const m = line.match(/^alias\s+(\w+)="(.+)"$/);
    if (m) map[m[1]] = m[2];
  });
  return map;
}

// ── SNAKE ──
function startSnake() {
  clearInterval(snakeLoop);
  snakeLoop = setInterval(()=>{
    if (snakeOver) { clearInterval(snakeLoop); render(); return; }
    const head = snake[0];
    const newHead = [head[0]+snakeDir[0], head[1]+snakeDir[1]];
    if (newHead[0]<0||newHead[0]>=15||newHead[1]<0||newHead[1]>=25||
        snake.some(s=>s[0]===newHead[0]&&s[1]===newHead[1])) {
      snakeOver = true; render(); return;
    }
    const next = [newHead, ...snake];
    if (newHead[0]===snakeFood[0]&&newHead[1]===snakeFood[1]) {
      snakeScore += 10;
      snakeFood = [Math.floor(Math.random()*15), Math.floor(Math.random()*25)];
    } else { next.pop(); }
    snake = next;
    render();
  }, 150);
}

// ── KEYBOARD ──
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.key.toLowerCase()==="c") {
    e.preventDefault();
    if (activePing) {
      clearInterval(pingInterval); activePing=null; pingInterval=null;
      pushLine("^C","#ff5f57");
      pushLine("--- ping durduruldu (SIGINT) ---","#ff5f57");
      pushLine("","");
    }
    if (["matrix","snake","nano"].includes(mode)) {
      clearInterval(snakeLoop); mode="terminal";
    }
    render(); return;
  }

  if (e.ctrlKey && e.key.toLowerCase()==="l" && mode==="terminal") {
    e.preventDefault(); outputLines=[]; render(); return;
  }

  if (e.ctrlKey && e.key.toLowerCase()==="o" && mode==="nano") {
    e.preventDefault(); saveNano(); return;
  }

  if (mode==="snake" && !snakeOver) {
    const dirs = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1] };
    if (dirs[e.key]) {
      const d = dirs[e.key];
      if (d[0]!==-snakeDir[0]||d[1]!==-snakeDir[1]) { e.preventDefault(); snakeDir=d; }
    }
    return;
  }
  
  if (mode==="snake" && snakeOver) {
    if (e.key==="r"||e.key==="R") {
      snake=[[5,5]]; snakeFood=[8,8]; snakeDir=[0,1]; snakeScore=0; snakeOver=false; startSnake(); render();
    }
    return;
  }

  if (mode!=="terminal" && mode!=="sudo-auth") return;

  if (e.key==="ArrowUp") {
    e.preventDefault();
    const idx = historyIdx===-1 ? cmdHistory.length-1 : Math.max(0,historyIdx-1);
    historyIdx=idx; inputValue=cmdHistory[idx]||""; render(); return;
  }
  if (e.key==="ArrowDown") {
    e.preventDefault();
    if (historyIdx===-1) return;
    historyIdx++;
    if (historyIdx>=cmdHistory.length) { historyIdx=-1; inputValue=""; }
    else inputValue=cmdHistory[historyIdx];
    render(); return;
  }
  if (e.key==="Tab") {
    e.preventDefault();
    const parts = inputValue.split(" "); const last=parts[parts.length-1];
    if (!last) return;
    const node = FS[cwd];
    const match = (node?.children||[]).find(c=>c.startsWith(last));
    if (match) { parts[parts.length-1]=match; inputValue=parts.join(" "); render(); }
    return;
  }
  if (e.key==="Enter") { const val=inputValue; inputValue=""; runCmd(val); return; }
  if (e.key==="Backspace") { inputValue=inputValue.slice(0,-1); render(); return; }
  if (e.key.length===1) { inputValue+=e.key; render(); }
});

function saveNano() {
  const parent = nanoFile.substring(0, nanoFile.lastIndexOf("/")) || "/";
  const name = nanoFile.split("/").pop();
  if (!FS[nanoFile] && FS[parent]) { FS[parent].children.push(name); }
  FS[nanoFile] = { type:"file", content:nanoContent };
  mode="terminal";
  pushLine(`[ File written: ${nanoFile} ]`,"#28c840");
  pushLine("","");
  render();
}

// ── RENDER ──
function render() {
  root.innerHTML = "";

  if (mode==="boot" || mode==="logo") {
    renderBootOrLogo();
    return;
  }

  if (mode==="matrix") { renderMatrix(); return; }
  if (mode==="snake")  { renderSnake();  return; }
  if (mode==="nano")   { renderNano();   return; }
  renderTerminal();
}

function renderBootOrLogo() {
  const wrap = h("div",{style:{
    height:"100vh", background:"#0d1117", padding:"20px",
    fontFamily:"monospace", overflowY:"auto"
  }});
  if (mode==="boot") {
    BOOT_LOGO.slice(0,3).forEach((line,i)=>{
      wrap.appendChild(h("div",{style:{color:BOOT_COLORS[i],fontSize:"8px",whiteSpace:"pre",lineHeight:1.2}},line));
    });
    wrap.appendChild(h("div",{style:{color:"#4dd0e1",fontSize:"11px",marginBottom:"12px",letterSpacing:"2px"}},"ZENITH EDITION — v1.2.0"));
    const steps = [
      "HorizonOS v1.2.0 — Zenith Edition",
      "[  0.000000] Kernel initializing...",
      "[  0.210000] CPU detected: " + (sysInfo?.cpu?.modelName||"Detecting..."),
      "[  0.450000] Memory: " + (sysInfo?.memory?.totalMB||"...") + " MB",
      "[  0.720000] Storage mounted.",
      "[  1.020000] Shell modules ready.",
      "███████████████████████████████ 100%",
      "  ✓ System ready.",
    ].slice(0, bootStep+1);
    steps.forEach((s,i)=>wrap.appendChild(h("div",{style:{color:i===steps.length-1?"#00e5ff":i===steps.length-2?"#00bcd4":"#80deea",fontSize:"12px",lineHeight:"1.7"}},s)));
    
    const prog = h("div",{style:{marginTop:"14px"}});
    const bar = h("div",{style:{height:"3px",background:"rgba(0,188,212,0.15)",borderRadius:"2px"}});
    const fill = h("div",{style:{height:"100%",width:`${Math.round((bootStep+1)/8*100)}%`,background:"linear-gradient(to right,#1e5fa8,#00e5ff)",boxShadow:"0 0 6px #00e5ff"}});
    bar.appendChild(fill); prog.appendChild(bar); wrap.appendChild(prog);
  } else {
    BOOT_LOGO.slice(0,logoStep).forEach((line,i)=>{
      wrap.appendChild(h("div",{style:{color:BOOT_COLORS[i],fontSize:"11px",whiteSpace:"pre",lineHeight:1.4,textShadow:`0 0 12px ${BOOT_COLORS[i]}`}},line));
    });
    if (logoStep>=BOOT_LOGO.length) {
      wrap.appendChild(h("div",{style:{color:"#4dd0e1",fontSize:"12px",marginTop:"20px",textAlign:"center",letterSpacing:"2px"}},"◈ Starting terminal..."));
    }
  }
  root.appendChild(wrap);
}

function renderMatrix() {
  const canvas = h("canvas",{style:{display:"block",width:"100%",height:"100vh",cursor:"pointer"}});
  const wrap=h("div",{style:{position:"relative",background:"#0d1117",width:"100%",height:"100vh"}});
  
  canvas.width = window.innerWidth || 700; 
  canvas.height = window.innerHeight || 520;
  
  const ctx = canvas.getContext("2d");
  const cols=Math.floor(canvas.width/14); const drops=Array(cols).fill(1);
  const chars="01HORIZONOS◈∞≈".split("");
  const draw=()=>{
    ctx.fillStyle="rgba(13,17,23,0.06)"; ctx.fillRect(0,0,canvas.width,canvas.height);
    drops.forEach((y,i)=>{
      ctx.fillStyle=i%3===0?"#00e5ff":"#00bcd4";
      ctx.font="13px monospace";
      ctx.fillText(chars[Math.floor(Math.random()*chars.length)],i*14,y*14);
      if(y*14>canvas.height&&Math.random()>0.975)drops[i]=0; drops[i]++;
    });
  };
  const interval=setInterval(draw,40);
  canvas.onclick=()=>{ clearInterval(interval); mode="terminal"; render(); };
  const hint=h("div",{style:{position:"absolute",bottom:"10px",width:"100%",textAlign:"center",color:"#4dd0e1",fontSize:"12px",pointerEvents:"none"}});
  hint.textContent="Ctrl+C veya tıkla — çıkış";
  wrap.appendChild(canvas); wrap.appendChild(hint);
  root.appendChild(wrap);
}

function renderSnake() {
  const wrap=h("div",{style:{background:"#070a0e",width:"100%",height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}});
  wrap.appendChild(h("div",{style:{color:"#00e5ff",fontSize:"16px",fontFamily:"monospace",marginBottom:"10px",letterSpacing:"2px"}},"🐍 HORIZON SNAKE"));
  const panel=h("div",{style:{border:"2px solid #00bcd4",background:"#0d1117",padding:"8px",boxShadow:"0 0 18px rgba(0,188,212,0.3)"}});
  const info=h("div",{style:{width:"400px",display:"flex",justifyContent:"space-between",color:"#00e5ff",marginBottom:"6px",fontSize:"12px",fontFamily:"monospace"}});
  info.appendChild(document.createTextNode(`SCORE: ${snakeScore}`));
  const status=h("span",{style:{color:snakeOver?"#ff5f57":"#28c840"}},snakeOver?"GAME OVER — R: yeniden":"← ↑ → ↓ hareket");
  info.appendChild(status); panel.appendChild(info);
  const grid=h("div",{style:{display:"grid",gridTemplateRows:"repeat(15,16px)",gridTemplateColumns:"repeat(25,16px)",background:"#0b0e14"}});
  for(let r=0;r<15;r++) for(let c=0;c<25;c++){
    const isHead=snake[0]?.[0]===r&&snake[0]?.[1]===c;
    const isBody=!isHead&&snake.some(s=>s[0]===r&&s[1]===c);
    const isFood=snakeFood[0]===r&&snakeFood[1]===c;
    const cell=h("div",{style:{width:"16px",height:"16px",
      background:isHead?"#00e5ff":isBody?"#00bcd4":isFood?"#ff5f57":"transparent",
      border:"1px solid rgba(25,35,50,0.2)",
      boxShadow:isHead?"0 0 5px #00e5ff":isFood?"0 0 5px #ff5f57":"none"}});
    grid.appendChild(cell);
  }
  panel.appendChild(grid); wrap.appendChild(panel);
  wrap.appendChild(h("div",{style:{color:"#4dd0e1",fontSize:"11px",marginTop:"10px",fontFamily:"monospace"}},"Ctrl+C — terminale dön"));
  root.appendChild(wrap);
}

function renderNano() {
  const wrap=h("div",{style:{background:"#0d1117",width:"100%",height:"100vh",display:"flex",flexDirection:"column"}});
  wrap.appendChild(h("div",{style:{background:"#e8eaed",color:"#0d1117",padding:"3px 10px",fontSize:"11px",fontFamily:"monospace",fontWeight:"bold",display:"flex",justifyContent:"space-between"}},
    `GNU nano 8.0  ─  ${nanoFile}`,h("span",{},"Modified")
  ));
  const ta=h("textarea",{style:{flex:1,background:"transparent",color:"#e8eaed",border:"none",outline:"none",padding:"12px",fontFamily:"monospace",fontSize:"12px",resize:"none",lineHeight:"1.7"}});
  ta.value=nanoContent;
  ta.oninput=e=>{nanoContent=e.target.value;};
  ta.onkeydown=e=>{
    if(e.ctrlKey&&e.key.toLowerCase()==="o"){e.preventDefault();saveNano();}
    if(e.ctrlKey&&e.key.toLowerCase()==="c"){e.preventDefault();mode="terminal";render();}
  };
  wrap.appendChild(ta);
  const bar=h("div",{style:{background:"#161b22",color:"#80deea",padding:"5px 10px",fontSize:"11px",fontFamily:"monospace",display:"flex",gap:"16px",alignItems:"center"}});
  const saveBtn=h("span",{style:{cursor:"pointer",background:"#2196f3",color:"#fff",padding:"2px 6px",borderRadius:"3px"}});
  saveBtn.textContent="^O Kaydet"; saveBtn.onclick=saveNano;
  const exitBtn=h("span",{style:{cursor:"pointer",background:"#ff5f57",color:"#fff",padding:"2px 6px",borderRadius:"3px"}});
  exitBtn.textContent="^C Çıkış"; exitBtn.onclick=()=>{mode="terminal";render();};
  bar.appendChild(saveBtn); bar.appendChild(exitBtn);
  bar.appendChild(document.createTextNode(`${(nanoContent.match(/\n/g)||[]).length+1} satır`));
  wrap.appendChild(bar);
  root.appendChild(wrap);
  setTimeout(()=>ta.focus(),50);
}

function renderTerminal() {
  const wrap = h("div", {
    style: {
      background: "#0d1117", width: "100%", height: "100vh",
      display: "flex", flexDirection: "column", position: "relative", boxSizing: "border-box"
    }
  });

  // Scanlines efekti
  const scan = h("div", {
    style: {
      position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50,
      background: "repeating-linear-gradient(to bottom,transparent 0,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)"
    }
  });
  wrap.appendChild(scan);

  // Üst Başlık Çubuğu (Titlebar)
  const titleBar = h("div", {
    style: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: "#161b22", padding: "6px 12px", borderBottom: "1px solid #21262d"
    }
  }, h("div", { style: { color: "#c9d1d9", fontSize: "12px", fontFamily: "monospace" } }, `HorizonOS Terminal — ${displayCwd()}`));
  wrap.appendChild(titleBar);

  // Çıktı Alanı (Terminal Screen)
  const screen = h("div", {
    style: {
      flex: 1, padding: "12px", overflowY: "auto", display: "flex",
      flexDirection: "column", gap: "4px", fontFamily: "monospace", fontSize: "13px"
    }
  });

  // Eski çıktı satırlarını çizdir
  outputLines.forEach(line => {
    if (line.type === "line") {
      screen.appendChild(h("div", { style: { color: line.color, whiteSpace: "pre-wrap" } }, line.text));
    } else if (line.type === "prompt-echo") {
      const p = h("div", { style: { color: "#d4d8de" } });
      p.appendChild(h("span", { style: { color: line.isRoot ? "#ff5f57" : "#28c840" } }, `${line.user}@horizon-local`));
      p.appendChild(h("span", { style: { color: "#d4d8de" } }, ":"));
      p.appendChild(h("span", { style: { color: "#2196f3" } }, line.path));
      p.appendChild(h("span", { style: { color: "#d4d8de" } }, line.isRoot ? "# " : "$ "));
      p.appendChild(h("span", { style: { color: "#fff" } }, line.cmd));
      screen.appendChild(p);
    } else if (line.type === "fetch-row") {
      const row = h("div", { style: { display: "flex", whiteSpace: "pre", fontFamily: "monospace", lineHeight: "1.3" } });
      row.appendChild(h("span", { style: { color: line.logoColor } }, line.logo));
      if (line.isHeader) {
        row.appendChild(h("span", { style: { color: "#00e5ff", fontWeight: "bold" } }, line.value));
      } else if (line.label) {
        const lbl = h("span", { style: { color: "#00bcd4" } }, line.label.padEnd(12));
        const val = h("span", { style: { color: "#e8eaed" } }, `: ${line.value}`);
        row.appendChild(lbl); row.appendChild(val);
      } else {
        row.appendChild(h("span", { style: { color: "#80deea" } }, line.value));
      }
      screen.appendChild(row);
    } else if (line.type === "ls-grid") {
      const grid = h("div", { style: { display: "flex", flexWrap: "wrap", gap: "16px", padding: "4px 0" } });
      line.items.forEach(item => {
        const itemPath = (line.basePath === "/" ? "" : line.basePath) + "/" + item;
        const isDir = FS[itemPath]?.type === "dir";
        grid.appendChild(h("span", { style: { color: isDir ? "#00e5ff" : "#d4d8de", fontWeight: isDir ? "bold" : "normal" } }, item));
      });
      screen.appendChild(grid);
    }
  });

  // Aktif Giriş Satırı (Interactive Prompt)
  const inputRow = h("div", { style: { display: "flex", alignItems: "center", color: "#d4d8de" } });
  inputRow.appendChild(h("span", { style: { color: isRoot ? "#ff5f57" : "#28c840" } }, `${userName}@horizon-local`));
  inputRow.appendChild(h("span", { style: { color: "#d4d8de" } }, ":"));
  inputRow.appendChild(h("span", { style: { color: "#2196f3" } }, displayCwd()));
  inputRow.appendChild(h("span", { style: { color: "#d4d8de" } }, isRoot ? "# " : "$ "));

  // Yazılan komut metni ve imleç
  const inputText = h("span", { style: { color: mode === "sudo-auth" ? "transparent" : "#fff", whiteSpace: "pre" } }, mode === "sudo-auth" ? "*".repeat(inputValue.length) : inputValue);
  const cursor = h("span", { style: { background: cursorOn ? "#00e5ff" : "transparent", color: "#0d1117", width: "8px", height: "15px", display: "inline-block", marginLeft: "2px", verticalAlign: "middle" } }, " ");
  
  inputRow.appendChild(inputText);
  inputRow.appendChild(cursor);
  screen.appendChild(inputRow);

  wrap.appendChild(screen);
  root.appendChild(wrap);

  // Ekranı otomatik en aşağı kaydır
  setTimeout(() => { screen.scrollTop = screen.scrollHeight; }, 10);
}

// ── INITIALIZATION & LOOPS ──
(async function init() {
  sysInfo = await loadSysInfo();
  
  // İmleç yanıp sönme döngüsü
  setInterval(() => {
    cursorOn = !cursorOn;
    if (mode === "terminal" || mode === "sudo-auth") {
      const c = document.querySelector("span[style*='background']");
      if (c) c.style.background = cursorOn ? "#00e5ff" : "transparent";
    }
  }, 500);

  // Animasyonlu Açılış Sekansı (Boot Sequence Simulation)
  const bootTimer = setInterval(() => {
    if (bootStep < 7) {
      bootStep++;
      render();
    } else {
      clearInterval(bootTimer);
      mode = "logo";
      const logoTimer = setInterval(() => {
        if (logoStep < BOOT_LOGO.length) {
          logoStep++;
          render();
        } else {
          clearInterval(logoTimer);
          setTimeout(() => {
            mode = "terminal";
            runCmd("banner");
          }, 800);
        }
      }, 70);
    }
  }, 250);

  render();
})();