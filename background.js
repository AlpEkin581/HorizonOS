// HorizonOS — Background Service Worker
// Sistem bilgilerini toplar ve popup'a iletir

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GET_SYSTEM_INFO") {
    collectSystemInfo().then(info => sendResponse({ success: true, data: info }));
    return true; // async yanıt için true dönüyoruz
  }
});

async function collectSystemInfo() {
  const info = {};

  // CPU bilgisi
  try {
    const cpu = await chrome.system.cpu.getInfo();
    info.cpu = {
      modelName: cpu.modelName || "Unknown CPU",
      numOfProcessors: cpu.numOfProcessors || 1,
      archName: cpu.archName || "x86_64",
    };
  } catch (e) {
    info.cpu = { modelName: "Unknown CPU", numOfProcessors: 1, archName: "x86_64" };
  }

  // RAM bilgisi
  try {
    const mem = await chrome.system.memory.getInfo();
    const totalMB = Math.round(mem.capacity / 1024 / 1024);
    const availMB = Math.round(mem.availableCapacity / 1024 / 1024);
    const usedMB  = totalMB - availMB;
    info.memory = { totalMB, availMB, usedMB };
  } catch (e) {
    info.memory = { totalMB: 8192, availMB: 4096, usedMB: 4096 };
  }

  // Disk bilgisi
  try {
    const storage = await chrome.system.storage.getInfo();
    info.storage = storage.map(s => ({
      id:       s.id,
      name:     s.name || "Storage",
      type:     s.type,
      capacity: Math.round(s.capacity / 1024 / 1024 / 1024),
    }));
  } catch (e) {
    info.storage = [{ id:"0", name:"Storage", type:"fixed", capacity: 256 }];
  }

  // Ekran bilgisi
  try {
    const displays = await chrome.system.display.getInfo();
    info.displays = displays.map(d => ({
      name:   d.name || "Display",
      width:  d.bounds?.width  || d.workArea?.width  || 1920,
      height: d.bounds?.height || d.workArea?.height || 1080,
      isPrimary: d.isPrimary,
    }));
  } catch (e) {
    info.displays = [{ name:"Display", width:1920, height:1080, isPrimary:true }];
  }

  // Tarayıcı / OS platform
  info.platform  = navigator.platform  || "Unknown";
  info.userAgent = navigator.userAgent || "";
  info.language  = navigator.language  || "en";
  info.cores     = navigator.hardwareConcurrency || info.cpu.numOfProcessors;
  info.online    = navigator.onLine;

  return info;
} // <--- collectSystemInfo fonksiyonu burada güvenle bitiyor.


// Eklenti simgesine tıklanınca popup yerine tam sayfa sekme açma kodu:
// Fonksiyonun tamamen dışında olduğu için artık Chrome tarafından algılanabilecek!
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({
    url: chrome.runtime.getURL("popup.html")
  });
});
