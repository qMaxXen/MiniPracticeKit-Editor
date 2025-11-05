import * as NBT from "https://cdn.jsdelivr.net/npm/nbtify@2.1.0/+esm";

const iconsPath = './icons/items/';
const curated = ["air.png","stone.png","diamond_sword.png","ender_pearl.png","bow.png","golden_apple.png","water_bucket.png","lava_bucket.png","oak_planks.png","bedrock.png"];


const fileInput = document.getElementById('file');
const grid = document.getElementById('grid');
const downloadBtn = document.getElementById('download');
const loadDefaultBtn = document.getElementById('loadDefault');
const resetBtn = document.getElementById('reset');

const slotModal = document.getElementById('slotModal');


const slotPreview = document.getElementById('slotPreview');
const slotIdDisplay = document.getElementById('itemIdDisplay');
const slotCountInput = document.getElementById('itemCountInput');
const clearSlotBtn = document.getElementById('clearSlotBtn');
clearSlotBtn.style.display = '';
const slotCountLabel = document.getElementById('itemCountLabel');

slotCountInput.addEventListener('input', ()=> {
    slotCountLabel.textContent = slotCountInput.value;
});

try {
  slotCountLabel.style.fontSize = '14px';
  slotCountLabel.style.lineHeight = '1';
  slotCountLabel.style.padding = '6px 12px';
  slotCountLabel.style.borderRadius = '6px';
} catch (e) {}


const applySlotBtn = document.getElementById('applySlotBtn');
const modalClose = document.getElementById('modalClose');

let slotClipboard = null;

const copySlotBtn = document.createElement('button');
copySlotBtn.className = 'btn small';
copySlotBtn.id = 'copySlotBtn';
copySlotBtn.textContent = 'Copy';
copySlotBtn.style.margin = '0 6px 0 0';
copySlotBtn.style.padding = '6px 8px';
copySlotBtn.style.fontSize = '0.85rem';

const pasteSlotBtn = document.createElement('button');
pasteSlotBtn.className = 'btn small';
pasteSlotBtn.id = 'pasteSlotBtn';
pasteSlotBtn.textContent = 'Paste';
pasteSlotBtn.style.margin = '0 6px 0 0';
pasteSlotBtn.style.padding = '6px 8px';
pasteSlotBtn.style.fontSize = '0.85rem';
pasteSlotBtn.disabled = true;

if (modalClose && modalClose.parentElement) {
    modalClose.parentElement.insertBefore(copySlotBtn, modalClose);
    modalClose.parentElement.insertBefore(pasteSlotBtn, copySlotBtn);

    try {
    modalClose.parentElement.style.display = 'flex';
    modalClose.parentElement.style.alignItems = 'center';
    modalClose.parentElement.style.gap = '1px';
    } catch(e){}

    try {
    modalClose.classList.remove('ghost', 'gray-btn');
    modalClose.classList.add('small');
    modalClose.style.padding = '6px 8px';
    modalClose.style.fontSize = '0.85rem';
    modalClose.style.margin = '0 6px 0 0';
    modalClose.style.borderRadius = '6px';
    } catch(e){}
}



const containerViewBtnWrap = document.getElementById('containerViewBtnWrap');

const pickerList = document.getElementById('pickerList');
const pickerSearch = document.getElementById('pickerSearch');

const containerModal = document.getElementById('containerModal');
const containerGrid = document.getElementById('containerGrid');
const closeContainer = document.getElementById('closeContainer');
const deleteContainerBtn = document.getElementById('deleteContainer');

const containerItemName = document.getElementById('containerItemName');
const containerSub = document.getElementById('containerSub');
const containerNameInput = document.getElementById('containerNameInput');

if (containerNameInput) {
  const saveContainerName = () => {
    if (!currentContainerRaw) return;
    const v = String(containerNameInput.value || '').trim();
    currentContainerRaw.tag = currentContainerRaw.tag || {};
    currentContainerRaw.tag.display = currentContainerRaw.tag.display || {};
    if (v) {
      currentContainerRaw.tag.display.Name = JSON.stringify({ text: v });
    } else {
      if (currentContainerRaw.tag.display && ('Name' in currentContainerRaw.tag.display)) {
        delete currentContainerRaw.tag.display.Name;
      }
    }

    containerNameInput.value = getContainerDisplayName(currentContainerRaw) || '';

    for (let h = 0; h < itemsArray.length; h++) {
      const top = itemsArray[h];
      if (!top || !top._raw) continue;
      if (top._raw.tag && top._raw.tag.BlockEntityTag && top._raw.tag.BlockEntityTag.Items === currentContainerRaw.tag.BlockEntityTag.Items) {
        top._raw = currentContainerRaw;
        break;
      }
    }
  };

  containerNameInput.addEventListener('change', saveContainerName);
  containerNameInput.addEventListener('keypress', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      saveContainerName();
    }
  });
}




let currentNbt = null;
let itemsArray = new Array(9).fill(null).map((_,i)=>({id:'minecraft:air',Count:1,Slot:i,_raw:{id:'minecraft:air',Count:1}}));

let currentHotbarIndex = 0; 
let allHotbars = {}; 

for (let h = 0; h < 9; h++) {
  allHotbars[h] = new Array(9).fill(null).map((_, i) => ({
    id: 'minecraft:air',
    Count: 1,
    Slot: i,
    _raw: { id: 'minecraft:air', Count: 1 }
  }));
}

let hotbarRef = null;
let activeSlot = 0;
let dragFrom = null;

const DRAG_THRESHOLD = 6; 
let pointerDownInfo = null;  
let isDragging = false;     


let applyMode = {type:'top', index:0};
let selectedIdForApply = 'minecraft:air';

const githubBtn = document.getElementById('githubBtn');
if (githubBtn) {
    githubBtn.addEventListener('click', (ev) => {
    githubBtn.classList.remove('git-anim');
    void githubBtn.offsetWidth;
    githubBtn.classList.add('git-anim');

    window.open('https://github.com/qMaxXen/MiniPracticeKit-Editor', '_blank', 'noopener');

    setTimeout(() => githubBtn.classList.remove('git-anim'), 700);
    });
}

const hotbarDropdownBtn = document.getElementById('hotbarDropdownBtn');
const hotbarDropdown = document.getElementById('hotbarDropdown');
const hotbarOptions = document.querySelectorAll('.hotbar-option');

const hotbarTooltip = document.querySelector('.hotbar-tooltip');

if (hotbarDropdownBtn && hotbarDropdown) {
  hotbarDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = hotbarDropdown.classList.contains('show');

    if (isVisible) {

      hotbarDropdown.classList.remove('show');

      if (hotbarTooltip) hotbarTooltip.classList.remove('show');
      setTimeout(() => {
        hotbarDropdown.style.display = 'none';
      }, 200);
    } else {
      hotbarDropdown.style.display = 'block';
      setTimeout(() => {
        hotbarDropdown.classList.add('show');

        if (hotbarTooltip) hotbarTooltip.classList.add('show');
      }, 10);

    }
  });

  document.addEventListener('click', (e) => {
    if (!hotbarDropdownBtn.contains(e.target) && !hotbarDropdown.contains(e.target)) {
      hotbarDropdown.classList.remove('show');
      if (hotbarTooltip) hotbarTooltip.classList.remove('show');
      setTimeout(() => {
        hotbarDropdown.style.display = 'none';
      }, 200);
    }
  });

  hotbarOptions.forEach(option => {
    option.addEventListener('click', () => {
      const hotbarIndex = parseInt(option.dataset.hotbar);
      switchToHotbar(hotbarIndex);
      hotbarDropdown.classList.remove('show');
      if (hotbarTooltip) hotbarTooltip.classList.remove('show');
      setTimeout(() => {
        hotbarDropdown.style.display = 'none';
      }, 200);
    });
  });
}

if (hotbarDropdownBtn && hotbarTooltip) {
  hotbarDropdownBtn.addEventListener('mouseenter', () => {
    if (hotbarDropdown.classList.contains('show')) {
      hotbarTooltip.classList.add('show');
    }
  });

  hotbarDropdownBtn.addEventListener('mouseleave', () => {
    if (!hotbarDropdown.classList.contains('show')) {
      if (hotbarTooltip) hotbarTooltip.classList.remove('show');
    }
  });


  hotbarDropdownBtn.addEventListener('focus', () => {
    if (hotbarDropdown.classList.contains('show')) {
      hotbarTooltip.classList.add('show');
    }
  });
  hotbarDropdownBtn.addEventListener('blur', () => {
    if (!hotbarDropdown.classList.contains('show')) {
      if (hotbarTooltip) hotbarTooltip.classList.remove('show');
    }
  });
}


function updateHotbarDropdownUI() {
  hotbarOptions.forEach(option => {
    const index = parseInt(option.dataset.hotbar);
    if (index === currentHotbarIndex) {
      option.classList.add('active');
    } else {
      option.classList.remove('active');
    }
  });
  
  if (hotbarDropdownBtn) {
    hotbarDropdownBtn.textContent = `Hotbar ${currentHotbarIndex + 1} ▼`;
  }
}

function switchToHotbar(index) {
  if (index < 0 || index > 8) return;
  
  allHotbars[currentHotbarIndex] = JSON.parse(JSON.stringify(itemsArray));
  
  currentHotbarIndex = index;
  itemsArray = JSON.parse(JSON.stringify(allHotbars[index]));
  
  renderGrid();
  updateHotbarDropdownUI();
  closeSlotModal();
  closeContainerModal();
}

updateHotbarDropdownUI();


let iconList = [];


const bookModal = document.getElementById('bookModal');
const bookPagesContainer = document.getElementById('bookPagesContainer');
const bookModalClose = document.getElementById('bookModalClose');
const saveBookBtn = document.getElementById('saveBookBtn');
const cancelBookBtn = document.getElementById('cancelBookBtn');

let bookPagesArray = [];
let bookCurrentPage = 0;


let currentBookRaw = null;
let currentBookContext = null; 


async function loadIconsIndex(){
    const candidates = [
    './icons/list/icons.json'
    ];
    for(const url of candidates){
    try{
        const r = await fetch(url);
        if(!r.ok) continue;
        const j = await r.json();
        if(Array.isArray(j) && j.length>0){
        
        iconList = Array.from(new Set(j.map(s => {
            if(typeof s !== 'string') return String(s);
            return s.split('/').pop();
        })));
        renderPicker(iconList);
        return;
        }
    }catch(e){}
    }
    
    iconList = Array.from(new Set(curated.map(s=>s)));
    renderPicker(iconList);
}

loadIconsIndex();

function showSuccessNotification(message) {
  const notification = document.getElementById('successNotification');
  if (!notification) return;
  
  notification.textContent = message;
  notification.classList.add('show');
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 1500);
}


const dragOverlay = document.getElementById('dragOverlay');
let dragCounter = 0; 
let isInternalDrag = false;

document.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('slot') || e.target.classList.contains('container-cell')) {
    isInternalDrag = true;
    }
}, true);

document.addEventListener('dragend', (e) => {
    isInternalDrag = false;
}, true);

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.addEventListener(eventName, (e) => {
    if (e.dataTransfer.types.includes('Files') && !isInternalDrag) {
        e.preventDefault();
        e.stopPropagation();
    }
    }, false);
});

document.addEventListener('dragenter', (e) => {
    if (e.dataTransfer.types.includes('Files') && !isInternalDrag) {
    dragCounter++;
    if (dragCounter === 1) {
        dragOverlay.classList.add('active');
    }
    }
}, false);

document.addEventListener('dragleave', (e) => {
    if (e.dataTransfer.types.includes('Files') && !isInternalDrag) {
    dragCounter--;
    if (dragCounter === 0) {
        dragOverlay.classList.remove('active');
    }
    }
}, false);

document.addEventListener('dragover', (e) => {
    if (e.dataTransfer.types.includes('Files') && !isInternalDrag) {
    e.dataTransfer.dropEffect = 'copy';
    }
}, false);

document.addEventListener('drop', async (e) => {
    if (isInternalDrag) return; 
    
    dragCounter = 0;
    dragOverlay.classList.remove('active');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
    e.preventDefault();
    e.stopPropagation();
    const file = files[0];
    if (file.name.endsWith('.nbt') || file.name.endsWith('.dat') || file.name.endsWith('.json')) {
        await handleFileLoad(file);
    } else {
        alert('Please drop a valid .nbt file');
    }
    }
}, false);

async function handleFileLoad(file) {
    const ab = await file.arrayBuffer();
    try {
      const parsed = await NBT.read(ab);
      currentNbt = parsed;
      
      if (parsed.data && typeof parsed.data === 'object') {
        for (let h = 0; h < 9; h++) {
          const hotbarKey = String(h);
          if (Array.isArray(parsed.data[hotbarKey])) {
            allHotbars[h] = new Array(9).fill(null).map((_, idx) => {
              const el = parsed.data[hotbarKey][idx];
              if (!el) return {id:'minecraft:air',Count:1,Slot:idx,_raw:{id:'minecraft:air',Count:1}};
              const slot = (el.Slot ?? el.slot ?? idx);
              const id = (typeof el.id === 'string' && el.id) || (el.id && el.id.value) || (el.tag && el.tag.BlockEntityTag && el.tag.BlockEntityTag.id) || 'minecraft:air';
              const Count = Number(el.Count ?? el.count ?? 1);
              return {id, Count, Slot: Number(slot), _raw: el};
            });
          }
        }
      }
      
      currentHotbarIndex = 0;
      itemsArray = JSON.parse(JSON.stringify(allHotbars[0]));
      renderGrid();
      updateHotbarDropdownUI();
      showSuccessNotification('Successfully loaded your hotbar.nbt!');
    } catch (err) {
      console.error(err);
      alert('Error parsing NBT file: ' + err.message);
    }
}

async function loadDefaultHotbar() {
    try {
      const response = await fetch('default/hotbar.nbt');
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }
      const ab = await response.arrayBuffer();
      
      try {
        const parsed = await NBT.read(ab);
        currentNbt = parsed;
        
        if (parsed.data && typeof parsed.data === 'object') {
          for (let h = 0; h < 9; h++) {
            const hotbarKey = String(h);
            if (Array.isArray(parsed.data[hotbarKey])) {
              allHotbars[h] = new Array(9).fill(null).map((_, idx) => {
                const el = parsed.data[hotbarKey][idx];
                if (!el) return {id:'minecraft:air',Count:1,Slot:idx,_raw:{id:'minecraft:air',Count:1}};
                const slot = (el.Slot ?? el.slot ?? idx);
                const id = (typeof el.id === 'string' && el.id) || (el.id && el.id.value) || (el.tag && el.tag.BlockEntityTag && el.tag.BlockEntityTag.id) || 'minecraft:air';
                const Count = Number(el.Count ?? el.count ?? 1);
                return {id, Count, Slot: Number(slot), _raw: el};
              });
            }
          }
        }
        
        currentHotbarIndex = 0;
        itemsArray = JSON.parse(JSON.stringify(allHotbars[0]));
        renderGrid();
        updateHotbarDropdownUI();
      } catch (err) {
        console.error(err);
        alert('Error parsing NBT file: ' + err.message);
      }
    } catch (fetchErr) {
      console.error('Failed to load default hotbar:', fetchErr);
      alert('Could not load default hotbar file. Make sure default/hotbar.nbt exists.');
    }
}


function displayName(fullIdOrName){
    if(!fullIdOrName) return '';
    let base = fullIdOrName.includes(':') ? fullIdOrName.split(':').pop() : fullIdOrName;
    base = base.replace(/\.png$/i, '');
    return base.replace(/_/g, ' ');
}
function canonicalIdFromName(nameOrFilename){
    if(!nameOrFilename) return 'minecraft:air';
    let n = nameOrFilename.replace(/\.png$/i, '');
    if(n.includes(':')) return n;
    return 'minecraft:' + n;
}

function getContainerItemTypeName(raw) {
  try {
    const idcand = (raw && raw.tag && raw.tag.BlockEntityTag && raw.tag.BlockEntityTag.id)
                 || (raw && raw.id)
                 || '';
    return displayName(idcand || '');
  } catch (e) {
    return 'container';
  }
}

function getContainerDisplayName(raw) {
  try {
    if (raw && raw.tag && raw.tag.display && raw.tag.display.Name) {
      const rawName = raw.tag.display.Name;
      if (typeof rawName === 'string') {
        try {
          const parsed = JSON.parse(rawName);
          if (parsed && typeof parsed.text === 'string') return parsed.text;
          return String(parsed || rawName);
        } catch (e) {
          return rawName;
        }
      } else if (typeof rawName === 'object' && rawName !== null && typeof rawName.text === 'string') {
        return rawName.text;
      } else {
        return String(rawName);
      }
    }
  } catch (e) {}
  const idcand = (raw && raw.tag && raw.tag.BlockEntityTag && raw.tag.BlockEntityTag.id)
               || (raw && raw.id)
               || 'container';
  return displayName(idcand);
}



function isContainerId(id){
    if(!id || typeof id !== 'string') return false;
    const lower = id.toLowerCase();
    return /barrel|shulker_box|chest/.test(lower);
}


function updateCopyPasteButtons() {
    pasteSlotBtn.disabled = !slotClipboard;
    copySlotBtn.disabled = false;
}

copySlotBtn.addEventListener('click', () => {
    copySlotBtn.classList.add('active');
    setTimeout(() => copySlotBtn.classList.remove('active'), 320);

    const ctx = applyMode || { type: 'top', index: activeSlot };

    try {
    if (ctx.type === 'top') {
        const idx = Number(ctx.index ?? activeSlot);
        const currentCount = Number(slotCountInput.value || 1);
        const currentId = selectedIdForApply || 'minecraft:air';
        const top = itemsArray[idx] || { id: currentId, Count: currentCount, _raw: { id: currentId, Count: currentCount } };
        const rawCopy = (top._raw && typeof top._raw === 'object') ? JSON.parse(JSON.stringify(top._raw)) : { id: currentId, Count: currentCount };
        rawCopy.id = currentId;
        rawCopy.Count = currentCount;
        delete rawCopy.Slot;
        delete rawCopy.slot;
        slotClipboard = { source: 'top', data: rawCopy };
    } else {
            const container = ctx.containerRaw;
            const slotIndex = Number(ctx.index);
            const currentCount = Number(slotCountInput.value || 1);
            const currentId = selectedIdForApply || 'minecraft:air';
            let obj = null;
            if (container && container.tag && container.tag.BlockEntityTag && Array.isArray(container.tag.BlockEntityTag.Items)) {
            obj = container.tag.BlockEntityTag.Items.find(it => Number(it.Slot ?? it.slot ?? -1) === slotIndex) || null;
            }
            const rawCopy = (obj && typeof obj === 'object') ? JSON.parse(JSON.stringify(obj)) : { id: currentId, Count: currentCount };
            rawCopy.id = currentId;
            rawCopy.Count = currentCount;
            delete rawCopy.Slot;
            delete rawCopy.slot;
            slotClipboard = { source: 'inner', data: rawCopy };
        }
    updateCopyPasteButtons();
    } catch (e) {
    console.error('Copy failed', e);
    alert('Failed to copy item: ' + (e && e.message ? e.message : String(e)));
    }
});


pasteSlotBtn.addEventListener('click', () => {
    if (!slotClipboard) return;

    pasteSlotBtn.classList.add('active');
    setTimeout(() => pasteSlotBtn.classList.remove('active'), 320);

    const ctx = applyMode || { type: 'top', index: activeSlot };

    try {
    const cloned = JSON.parse(JSON.stringify(slotClipboard.data || {})); // deep clone
    if (ctx.type === 'top') {
        const idx = Number(ctx.index ?? activeSlot);
        cloned.Slot = idx;
        itemsArray[idx] = {
        id: cloned.id || 'minecraft:air',
        Count: Number(cloned.Count ?? cloned.count ?? 0),
        Slot: idx,
        _raw: cloned
        };
        selectedIdForApply = itemsArray[idx].id || 'minecraft:air';
        const isAir = (selectedIdForApply || '').toLowerCase().includes('air');
        if (!isAir) {
        slotPreview.src = iconsPath + selectedIdForApply.split(':').pop() + '.png';
        slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
        slotIdDisplay.value = displayName(selectedIdForApply);
        } else {
        slotPreview.src = './icons/ui/empty.png';
        slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
        slotIdDisplay.value = 'empty';
        }
        slotCountInput.value = itemsArray[idx].Count ?? 1;
        slotCountLabel.textContent = slotCountInput.value;
        renderGrid();
    } else {
        const container = ctx.containerRaw;
        const slotIndex = Number(ctx.index);
        if (!container) throw new Error('Container context missing for paste');
        ensureContainerStructure(container);
        let items = container.tag.BlockEntityTag.Items || [];
        items = items.filter(it => Number(it.Slot ?? it.slot ?? -1) !== slotIndex);
        cloned.Slot = slotIndex;
        items.push(cloned);
        container.tag.BlockEntityTag.Items = items;

        for (let h = 0; h < itemsArray.length; h++) {
        const top = itemsArray[h];
        if (!top || !top._raw) continue;
        if (top._raw === container) {
            break;
        }
        if (top._raw.tag && top._raw.tag.BlockEntityTag && top._raw.tag.BlockEntityTag.Items === container.tag.BlockEntityTag.Items) {
            top._raw = container;
            break;
        }
        }

        selectedIdForApply = cloned.id || 'minecraft:air';
        const isAirInner = (selectedIdForApply || '').toLowerCase().includes('air');
        if (!isAirInner) {
        slotPreview.src = iconsPath + selectedIdForApply.split(':').pop() + '.png';
        slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
        slotIdDisplay.value = displayName(selectedIdForApply);
        } else {
        slotPreview.src = './icons/ui/empty.png';
        slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
        slotIdDisplay.value = 'empty';
        }
        slotCountInput.value = cloned.Count ?? 1;
        slotCountLabel.textContent = slotCountInput.value;

        renderCurrentContainer();
        renderGrid();
    }

    updateSlotModalButtons();
    updateCopyPasteButtons();
    try { pickRenderList(iconList.map(f=>f.replace(/\.png$/i,'')), ''); } catch(e){}
    } catch (e) {
    console.error('Paste failed', e);
    alert('Failed to paste item: ' + (e && e.message ? e.message : String(e)));
    }
});


modalClose.addEventListener('click', () => {
    modalClose.classList.add('active');
    setTimeout(() => modalClose.classList.remove('active'), 320);
});


function scoreName(name, q){
    const plain = name.replace(/_/g,' ').toLowerCase();
    const query = (q||'').trim().toLowerCase();
    if(!query) return 100000 + name.localeCompare(name); 
    if(plain === query) return 0;
    if(plain.startsWith(query)) return 10;
    if(plain.includes(query)) return 20 + plain.indexOf(query);
    const qtokens = query.split(/\s+/).filter(Boolean);
    const matchesAll = qtokens.every(t => plain.includes(t));
    if(matchesAll) return 30;
    for(const t of qtokens){
    if(plain.split(' ').some(word => word.startsWith(t))) return 40;
    }
    return 1000 + plain.indexOf(query); 
}

function renderPicker(list){
    const normalized = (list || []).map(fn => typeof fn === 'string' ? fn.replace(/\.png$/i,'') : String(fn));
    const seen = new Set(); const ordered = [];
    for(const n of normalized){
    if(!seen.has(n)){ seen.add(n); ordered.push(n); }
    }
    pickRenderList(ordered, '');
}

function pickRenderList(names, query){
    const q = (query||'').trim().toLowerCase();
    const scored = names.map((n, idx) => ({name:n,score:scoreName(n,q), idx}));
    scored.sort((a,b)=> a.score - b.score || a.idx - b.idx);
    pickerList.innerHTML = '';
    for(const s of scored){
    if(q && s.score > 900) continue;
    const div = document.createElement('div');
    div.className = 'picker-item';
    const img = document.createElement('img');
    img.src = iconsPath + s.name + '.png';
    img.onerror = ()=> img.src = iconsPath + 'air.png';
    const nm = document.createElement('div');
    nm.className = 'name';
    nm.textContent = displayName(s.name);
    div.appendChild(img);
    div.appendChild(nm);
    div.addEventListener('click', ()=> {
        const id = canonicalIdFromName(s.name);
        onPickerChoose(id);
    });
    pickerList.appendChild(div);
    }
}
deleteContainerBtn.addEventListener('click', ()=>{
    if(!currentContainerContext){
        containerModal.classList.remove('show');
        containerModal.style.display = 'none';
        return;
    }

    if(currentContainerContext.type === 'hotbar'){
        const slot = currentContainerContext.slot;
        itemsArray[slot] = { id: 'minecraft:air', Count: 1, Slot: slot, _raw: { id: 'minecraft:air', Count: 1 } };
        renderGrid();
        containerModal.classList.remove('show');
        containerModal.style.display = 'none';
        currentContainerRaw = null;
        currentContainerContext = null;
        return;
    }

    if(currentContainerContext.type === 'container'){
        const parentRaw = currentContainerContext.parentRaw;
        const slotIndex = currentContainerContext.slot;
        if(parentRaw && parentRaw.tag && parentRaw.tag.BlockEntityTag && Array.isArray(parentRaw.tag.BlockEntityTag.Items)){
        parentRaw.tag.BlockEntityTag.Items = parentRaw.tag.BlockEntityTag.Items.filter(it => Number(it.Slot ?? it.slot ?? -1) !== slotIndex);
        }
        containerModal.classList.remove('show');
        containerModal.style.display = 'none';
        currentContainerRaw = null;
        renderGrid();
        currentContainerContext = null;
        return;
    }
});

pickerSearch.addEventListener('input', ()=> {
    const list = iconList.map(f => f.replace(/\.png$/i,''));
    pickRenderList(list, pickerSearch.value);
});

function onPickerChoose(id){
    selectedIdForApply = id;
    const isPickedAir = (selectedIdForApply || '').toLowerCase().includes('air');
    if (!isPickedAir) {
    slotPreview.src = iconsPath + id.split(':').pop() + '.png';
    slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
    } else {
    slotPreview.src = './icons/ui/empty.png';
    slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
    }
    slotIdDisplay.value = displayName(id);

    updateSlotModalButtons();
}


function updateSlotModalButtons() {
    containerViewBtnWrap.innerHTML = '';

    if ((selectedIdForApply || '').toLowerCase().includes('air')) {
    clearSlotBtn.style.display = 'none';
    } else {
    clearSlotBtn.style.display = '';
    }

    const idLower = (selectedIdForApply || '').toLowerCase();
    if (idLower.includes('writable_book') || idLower.includes('book_and_quill')) {
    const editBtn = document.createElement('button');
    editBtn.className = 'btn small';
    editBtn.style.marginRight = '6px';
    editBtn.textContent = 'Edit book';
    editBtn.addEventListener('click', () => {
        if (applyMode.type === 'top') {
        const idx = applyMode.index;
        const el = itemsArray[idx] || { id: selectedIdForApply, Count: slotCountInput.value || 1 };
        const raw = (el && el._raw && typeof el._raw === 'object') ? el._raw : { Slot: idx, id: selectedIdForApply, Count: Number(slotCountInput.value || 1) };
        raw.tag = raw.tag || {};
        if (!Array.isArray(raw.tag.pages) && !Array.isArray(raw.tag.Pages)) raw.tag.pages = raw.tag.pages || [];
        openBookModal(raw, { type: 'top', index: idx });
        } else if (applyMode.type === 'inner') {
        const container = applyMode.containerRaw;
        const idx = applyMode.index;
        const items = container && container.tag && container.tag.BlockEntityTag && Array.isArray(container.tag.BlockEntityTag.Items) ? container.tag.BlockEntityTag.Items : [];
        const existing = items.find(it => Number(it.Slot ?? it.slot ?? -1) === idx);
        const raw = (existing && typeof existing === 'object') ? existing : { Slot: idx, id: selectedIdForApply, Count: Number(slotCountInput.value || 1) };
        raw.tag = raw.tag || {};
        if (!Array.isArray(raw.tag.pages) && !Array.isArray(raw.tag.Pages)) raw.tag.pages = raw.tag.pages || [];
        openBookModal(raw, { type: 'inner', containerRaw: container, index: idx, existingRef: existing });
        }
    });
    containerViewBtnWrap.appendChild(editBtn);
    }
    updateCopyPasteButtons();
}



function isContainer(raw){
    return !!(raw && raw.tag && raw.tag.BlockEntityTag && Array.isArray(raw.tag.BlockEntityTag.Items));
}
function getContainerItems(raw){ return isContainer(raw) ? raw.tag.BlockEntityTag.Items : []; }


function ensureContainerStructure(raw){
    raw.tag = raw.tag || {};
    raw.tag.BlockEntityTag = raw.tag.BlockEntityTag || {};
    if(!Array.isArray(raw.tag.BlockEntityTag.Items)) raw.tag.BlockEntityTag.Items = [];
    return raw;
}


function findHotbarArray(parsed){
    if(!parsed) return null;
    if(parsed.data && typeof parsed.data === 'object'){
    const dataObj = parsed.data;
    if(Array.isArray(dataObj['0'])) return dataObj['0'];
    const numericKeys = Object.keys(dataObj).filter(k=>/^\d+$/.test(k)).sort((a,b)=>Number(a)-Number(b));
    for(const k of numericKeys) if(Array.isArray(dataObj[k]) && dataObj[k].length >= 9) return dataObj[k];
    for(const k of Object.keys(dataObj)) if(Array.isArray(dataObj[k]) && dataObj[k].length >= 9) return dataObj[k];
    }
    return findItemsList(parsed);
}
function findItemsList(obj){
    if(!obj) return null;
    if(Array.isArray(obj)){
    if(obj.length>0 && typeof obj[0] === 'object' && ('Slot' in obj[0] || 'slot' in obj[0] || 'id' in obj[0])) return obj;
    }
    if(typeof obj === 'object'){
    for(const k of Object.keys(obj)){
        try{
        const found = findItemsList(obj[k]);
        if(found) return found;
        }catch(e){}
    }
    }
    return null;
}
function findArrayRef(root, target){
    if(root === target) return {parent:null, key:null};
    if(typeof root === 'object'){
    for(const k of Object.keys(root)){
        try{
        if(root[k] === target) return {parent: root, key: k};
        const deeper = findArrayRef(root[k], target);
        if(deeper) return deeper;
        }catch(e){}
    }
    }
    return null;
}


function renderGrid(){
    if (itemsArray && itemsArray.length === 9) {
      allHotbars[currentHotbarIndex] = JSON.parse(JSON.stringify(itemsArray));
    }

    grid.innerHTML = '';
    for(let i=0;i<9;i++){
    const s = itemsArray[i] || {id:'minecraft:air',Count:1,Slot:i,_raw:{id:'minecraft:air',Count:1}};
    const el = document.createElement('div');
    el.className = 'slot';
    el.draggable = true;
    el.dataset.slot = i;

    const nameNoNS = displayName(s.id);
    const countText = (typeof s.Count === 'number' && s.Count > 0) ? s.Count : '';
    el.innerHTML = `<div class="label">#${i + 1}</div>`;

    if (s.id && !(s.id.toLowerCase().includes('air'))) {
        const imgEl = document.createElement('img');
        imgEl.src = iconsPath + s.id.split(':').pop() + '.png';
        imgEl.draggable = false;
        el.appendChild(imgEl);
    }


    if (!(String(s.id || '').toLowerCase().includes('air')) && typeof s.Count === 'number' && s.Count > 0) {
        const countDiv = document.createElement('div');
        countDiv.className = 'count';
        countDiv.textContent = s.Count;
        el.appendChild(countDiv);
    }


    if ((s.id || '').toLowerCase().includes('air')) {
        const emptyBadge = document.createElement('div');
        emptyBadge.style.position = 'absolute';
        emptyBadge.style.top = '50%';
        emptyBadge.style.left = '50%';
        emptyBadge.style.transform = 'translate(-50%, -50%)';
        emptyBadge.style.fontSize = '.82rem';
        emptyBadge.style.color = 'var(--muted)';
        emptyBadge.style.background = 'rgba(0,0,0,0.28)';
        emptyBadge.style.padding = '4px 8px';
        emptyBadge.style.borderRadius = '6px';
        emptyBadge.style.pointerEvents = 'none'; 
        emptyBadge.textContent = 'empty';
        el.appendChild(emptyBadge);
    }


    if(isContainer(s._raw) || isContainerId(s.id)){
        const badge = document.createElement('div');
        badge.className = 'container-badge';
        badge.textContent = 'container';
        el.appendChild(badge);
    }

    el.addEventListener('pointerdown', (ev) => {
        pointerDownInfo = { x: ev.clientX, y: ev.clientY, pointerId: ev.pointerId, time: Date.now(), slotIndex: i };
        try { el.setPointerCapture(ev.pointerId); } catch(e){}
    });

    el.addEventListener('pointercancel', (ev) => {
        try { el.releasePointerCapture(ev.pointerId); } catch(e){}
        pointerDownInfo = null;
    });

    el.addEventListener('pointerup', (ev) => {
        try { el.releasePointerCapture(ev.pointerId); } catch(e){}
        if (isDragging) { pointerDownInfo = null; return; }
        if (!pointerDownInfo) return;

        const dx = Math.abs(ev.clientX - pointerDownInfo.x);
        const dy = Math.abs(ev.clientY - pointerDownInfo.y);
        const dist = Math.hypot(dx, dy);

        if (dist <= DRAG_THRESHOLD && pointerDownInfo.slotIndex === i) {
        const maybeId = (s.id || '').toString();
        if (isContainerId(maybeId)) {
            const raw = s._raw && typeof s._raw === 'object'
                ? s._raw
                : { Slot: i, id: maybeId, Count: s.Count ?? 1 };
            ensureContainerStructure(raw);
            closeSlotModal();
            openContainerModal(raw, { type: 'hotbar', slot: i });
        } else {
            openSlotEditor(i);
        }
        }

        pointerDownInfo = null;
    });


    el.addEventListener('dragstart', (ev) => {
        isDragging = true;
        dragFrom = i;
        el.classList.add('dragging');

        ev.dataTransfer.setData('text/plain', 'H:' + i);
        ev.dataTransfer.effectAllowed = 'move';

        try {
            const img = new Image();
            img.src = iconsPath + (String(itemsArray[i].id || 'air').split(':').pop()) + '.png';
            img.width = 36; img.height = 36;
            img.style.position = 'fixed';
            img.style.left = '-9999px';
            img.style.top = '-9999px';
            img.style.opacity = '0';
            document.body.appendChild(img);
            ev.dataTransfer.setDragImage(img, 18, 18);
            setTimeout(() => document.body.removeChild(img), 0);
        } catch(e){}
    });



    el.addEventListener('dragend', ()=> {
        isDragging = false;
        dragFrom = null;
        el.classList.remove('dragging');
    });

    el.addEventListener('dragover', (ev)=> { ev.preventDefault(); try { ev.dataTransfer.dropEffect = 'move'; } catch(e){}; el.style.opacity = 0.8; });
    el.addEventListener('dragleave', ()=> { el.style.opacity = 1; });
    el.addEventListener('drop', (ev)=> {
    ev.preventDefault();
    el.style.opacity = 1;
    const payload = ev.dataTransfer.getData('text/plain') || '';
    const to = Number(el.dataset.slot);

    if (payload.startsWith('C:')) {
        const fromIdx = Number(payload.slice(2));
        if (Number.isFinite(fromIdx)) moveContainerToHotbar(currentContainerRaw, fromIdx, to);
        return;
    }

    if (payload.startsWith('H:')) {
        const fromIdx = Number(payload.slice(2));
        if (Number.isFinite(fromIdx)) swapSlots(fromIdx, to);
        return;
    }

    const maybeNum = Number(payload);
    if (Number.isFinite(maybeNum)) swapSlots(maybeNum, to);
    });
    grid.appendChild(el);
    }
}

function swapSlots(a,b){
    const tmp = itemsArray[a];
    itemsArray[a] = itemsArray[b] || {id:'minecraft:air',Count:1,Slot:a,_raw:{id:'minecraft:air',Count:1}};
    itemsArray[b] = tmp || {id:'minecraft:air',Count:1,Slot:b,_raw:{id:'minecraft:air',Count:1}};
    itemsArray[a].Slot = a;
    itemsArray[b].Slot = b;
    renderGrid();
}

function moveContainerToHotbar(containerRaw, fromIdx, toIdx){
    if(!containerRaw) return;
    const items = containerRaw.tag && containerRaw.tag.BlockEntityTag && Array.isArray(containerRaw.tag.BlockEntityTag.Items) ? containerRaw.tag.BlockEntityTag.Items.slice() : [];
    const obj = items.find(it => Number(it.Slot ?? it.slot ?? -1) === fromIdx);
    const remaining = items.filter(it => Number(it.Slot ?? it.slot ?? -1) !== fromIdx);
    containerRaw.tag.BlockEntityTag.Items = remaining;
    if(obj){
    const copyRaw = JSON.parse(JSON.stringify(obj));
    copyRaw.Slot = toIdx;
    itemsArray[toIdx] = { id: copyRaw.id || 'minecraft:air', Count: Number(copyRaw.Count ?? 1), Slot: toIdx, _raw: copyRaw };
    } else {
    itemsArray[toIdx] = { id:'minecraft:air', Count:1, Slot:toIdx, _raw:{id:'minecraft:air',Count:1} };
    }
    renderCurrentContainer();
    renderGrid();
}

function moveHotbarToContainer(fromHotbarIdx, containerRaw, toIdx){
    if(fromHotbarIdx == null || !containerRaw) return;
    const src = itemsArray[fromHotbarIdx];
    let items = containerRaw.tag && containerRaw.tag.BlockEntityTag && Array.isArray(containerRaw.tag.BlockEntityTag.Items) ? containerRaw.tag.BlockEntityTag.Items.slice() : [];
    items = items.filter(it => Number(it.Slot ?? it.slot ?? -1) !== toIdx);
    if(src && (src.id && !src.id.toLowerCase().includes('air'))){
    const copyRaw = JSON.parse(JSON.stringify(src._raw || { id: src.id, Count: src.Count }));
    copyRaw.Slot = toIdx;
    items.push(copyRaw);
    }
    containerRaw.tag.BlockEntityTag.Items = items;
    renderCurrentContainer();
    renderGrid();
}

function moveWithinContainer(containerRaw, fromIdx, toIdx){
    if(!containerRaw) return;
    const items = containerRaw.tag && containerRaw.tag.BlockEntityTag && Array.isArray(containerRaw.tag.BlockEntityTag.Items) ? containerRaw.tag.BlockEntityTag.Items.slice() : [];

    const idxFrom = items.findIndex(it => Number(it.Slot ?? it.slot ?? -1) === fromIdx);
    const idxTo   = items.findIndex(it => Number(it.Slot ?? it.slot ?? -1) === toIdx);

    if(idxFrom !== -1 && idxTo !== -1){
    const itemFrom = JSON.parse(JSON.stringify(items[idxFrom]));
    const itemTo   = JSON.parse(JSON.stringify(items[idxTo]));
    itemFrom.Slot = toIdx;
    itemTo.Slot   = fromIdx;

    const newItems = items.filter((_, i) => i !== idxFrom && i !== idxTo);
    newItems.push(itemFrom, itemTo);
    containerRaw.tag.BlockEntityTag.Items = newItems;
    renderCurrentContainer();
    return;
    }

    if(idxFrom !== -1){
    const itemFrom = JSON.parse(JSON.stringify(items[idxFrom]));
    itemFrom.Slot = toIdx;

    const newItems = items.filter(it => Number(it.Slot ?? it.slot ?? -1) !== fromIdx && Number(it.Slot ?? it.slot ?? -1) !== toIdx);
    newItems.push(itemFrom);
    containerRaw.tag.BlockEntityTag.Items = newItems;
    renderCurrentContainer();
    return;
    }
    renderCurrentContainer();
}

function closeContainerModal(){
  containerModal.classList.remove('show');
  containerModal.style.display = 'none';

  currentContainerRaw = null;
  currentContainerContext = null;
  containerGrid.innerHTML = '';

  containerHistory = []; 
  const backBtn = document.getElementById('containerBackBtn');
  if (backBtn) backBtn.remove();
}




function closeSlotModal(){
    slotModal.classList.remove('show');
    slotModal.style.display = 'none';
    document.getElementById('modalSub').textContent = '';
    containerViewBtnWrap.innerHTML = '';
    pickerSearch.value = '';
}


function normalizePageValue(p){
    if (p == null) return '';
    if (typeof p === 'string') return p;
    if (typeof p === 'object') {
    if ('value' in p) return String(p.value);
    if ('text' in p) return String(p.text);
    try { return JSON.stringify(p); } catch(e){ return String(p); }
    }
    return String(p);
}

function normalizeLoreEntry(l) {
    if (l == null) return '';
    if (typeof l === 'string') {
    try {
        const parsed = JSON.parse(l);
        if (parsed && typeof parsed.text === 'string') return parsed.text;
        return l;
    } catch (e) {
        return l;
    }
    }
    if (typeof l === 'object') {
    if (typeof l.text === 'string') return l.text;
    try { return JSON.stringify(l); } catch(e) { return String(l); }
    }
    return String(l);
}

function serializeLoreEntry(line) {
    const str = String(line || '');
    if (!str.trim()) return JSON.stringify({ text: '' });
    try {
    JSON.parse(str);
    return str;
    } catch (e) {
    return JSON.stringify({ text: str });
    }
}

function simplifyDisplayForWrite(item) {
    if (!item || typeof item !== 'object') return;
    if (!item.tag || typeof item.tag !== 'object') return;
    const disp = item.tag.display;
    if (!disp || typeof disp !== 'object') return;

    if (disp.Name !== undefined) {
    const rawName = disp.Name;
    if (typeof rawName === 'object' && rawName !== null) {
        if ('text' in rawName && typeof rawName.text === 'string') {
        disp.Name = rawName.text;
        } else {
        try { disp.Name = String(rawName); } catch(e) { disp.Name = ''; }
        }
    } else if (typeof rawName !== 'string') {
        disp.Name = String(rawName);
    }
    }
    if (Array.isArray(disp.Lore)) {
    disp.Lore = disp.Lore.map(l => {
        if (typeof l === 'object' && l !== null) {
        if ('text' in l && typeof l.text === 'string') return l.text;
        try { return JSON.stringify(l); } catch(e) { return String(l); }
        } else if (typeof l !== 'string') {
        return String(l);
        }
        return l;
    });
    }
}



function createPageElement(index, content){
    const wrap = document.createElement('div');
    wrap.style.display = 'flex';
    wrap.style.flexDirection = 'column';
    wrap.style.gap = '6px';

    const labelRow = document.createElement('div');
    labelRow.style.display = 'flex';
    labelRow.style.alignItems = 'center';
    labelRow.style.gap = '8px';

    const lbl = document.createElement('div');
    lbl.textContent = 'Page ' + (index+1);
    lbl.style.fontWeight = '700';
    lbl.style.fontSize = '0.95rem';
    labelRow.appendChild(lbl);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn small';
    removeBtn.textContent = 'Remove';
    removeBtn.style.marginLeft = 'auto';
    removeBtn.addEventListener('click', ()=> {
    wrap.remove();
    refreshPageLabels();
    });
    labelRow.appendChild(removeBtn);

    const ta = document.createElement('textarea');
    ta.style.width = '100%';
    ta.style.minHeight = '110px';
    ta.style.background = '#0f0f0f';
    ta.style.color = 'var(--text)';
    ta.style.border = '1px solid rgba(255,255,255,0.04)';
    ta.style.padding = '8px';
    ta.style.borderRadius = '6px';
    ta.style.fontFamily = 'monospace';
    ta.value = content || '';

    wrap.appendChild(labelRow);
    wrap.appendChild(ta);

    return { wrap, ta, lbl };
}

function refreshPageLabels(){
    const children = Array.from(bookPagesContainer.children);
    children.forEach((c, idx) => {
    const lbl = c.querySelector('div');
    if(lbl) lbl.textContent = 'Page ' + (idx+1);
    });
}

function saveCurrentPageEditor() {
    const ta = bookPagesContainer.querySelector('textarea');
    if (ta) {
    bookPagesArray[bookCurrentPage] = String(ta.value || '');
    }
}

function renderBookPageUI() {
    bookPagesContainer.innerHTML = '';

    const ctrl = document.createElement('div');
    ctrl.style.display = 'flex';
    ctrl.style.alignItems = 'center';
    ctrl.style.gap = '8px';
    ctrl.style.marginBottom = '6px';

    const prev = document.createElement('button');
    prev.className = 'btn small';
    prev.textContent = 'Prev';
    prev.disabled = bookCurrentPage <= 0;
    prev.addEventListener('click', () => {
    saveCurrentPageEditor();
    if (bookCurrentPage > 0) {
        bookCurrentPage--;
        renderBookPageUI();
    }
    });

    const next = document.createElement('button');
    next.className = 'btn small';
    next.textContent = 'Next';
    next.disabled = bookCurrentPage >= Math.max(0, bookPagesArray.length - 1);
    next.addEventListener('click', () => {
    saveCurrentPageEditor();
    if (bookCurrentPage < bookPagesArray.length - 1) {
        bookCurrentPage++;
        renderBookPageUI();
    }
    });

    const pageLabel = document.createElement('div');
    pageLabel.style.fontWeight = '700';
    pageLabel.style.marginLeft = '8px';
    pageLabel.textContent = `Page ${Math.max(1, bookCurrentPage + 1)} / ${Math.max(1, bookPagesArray.length || 1)}`;

    const addPageBtn = document.createElement('button');
    addPageBtn.className = 'btn small';
    addPageBtn.textContent = 'Add Page';
    addPageBtn.style.marginLeft = 'auto';
    addPageBtn.addEventListener('click', () => {
    saveCurrentPageEditor();
    const insertIndex = Math.min(bookCurrentPage + 1, bookPagesArray.length);
    bookPagesArray.splice(insertIndex, 0, '');
    bookCurrentPage = insertIndex;
    renderBookPageUI();
    });

    const removeBtn = document.createElement('button');
    removeBtn.className = 'btn small';
    removeBtn.textContent = 'Remove Page';
    removeBtn.style.marginLeft = '0';
    removeBtn.addEventListener('click', () => {
    bookPagesArray.splice(bookCurrentPage, 1);
    if (bookPagesArray.length === 0) {
        bookPagesArray = [''];
        bookCurrentPage = 0;
    } else if (bookCurrentPage >= bookPagesArray.length) {
        bookCurrentPage = bookPagesArray.length - 1;
    }
    renderBookPageUI();
    });

    ctrl.appendChild(prev);
    ctrl.appendChild(next);
    ctrl.appendChild(pageLabel);
    ctrl.appendChild(addPageBtn);
    ctrl.appendChild(removeBtn);
    bookPagesContainer.appendChild(ctrl);

    const ta = document.createElement('textarea');
    ta.style.width = '100%';
    ta.style.minHeight = '220px';
    ta.style.background = '#0f0f0f';
    ta.style.color = 'var(--text)';
    ta.style.border = '1px solid rgba(255,255,255,0.04)';
    ta.style.padding = '8px';
    ta.style.borderRadius = '6px';
    ta.style.fontFamily = 'monospace';
    ta.value = String(bookPagesArray[bookCurrentPage] || '');

    bookPagesContainer.appendChild(ta);
}



function openBookModal(raw, context) {
    
    currentBookRaw = raw || {};
    currentBookContext = context || null;

    
    const tag = (currentBookRaw.tag && typeof currentBookRaw.tag === 'object') ? currentBookRaw.tag : (currentBookRaw.tag = {});

    
    const pagesSource = Array.isArray(tag.pages) ? tag.pages.slice() : (Array.isArray(tag.Pages) ? tag.Pages.slice() : []);
    
    const pages = pagesSource.map(normalizePageValue);

    
    bookPagesArray = pages.length ? pages.slice() : [''];
    bookCurrentPage = 0;
    renderBookPageUI();

    
    let nameVal = '';
    try {
    if (tag.display && tag.display.Name) {
        const rawName = tag.display.Name;
        if (typeof rawName === 'string') {
        try {
            const parsed = JSON.parse(rawName);
            if (parsed && parsed.text) nameVal = parsed.text;
            else nameVal = String(parsed || rawName);
        } catch (e) {
            nameVal = rawName;
        }
        } else if (typeof rawName === 'object' && rawName.text) {
        nameVal = rawName.text;
        } else {
        nameVal = String(rawName);
        }
    }
    } catch(e) {
    nameVal = '';
    }
    const nm = document.getElementById('bookNameInput');
    if (nm) nm.value = nameVal;

    const loreTa = document.getElementById('bookLoreTextarea');
    const loreSource = (tag.display && Array.isArray(tag.display.Lore)) ? tag.display.Lore.slice() : [];
    if (loreTa) {
    const loreLines = loreSource.map(normalizeLoreEntry);
    loreTa.value = loreLines.join('\n');
    }

    bookModal.classList.add('show');
    bookModal.style.display = 'flex';

}

function closeBookModal() {
    bookModal.classList.remove('show');
    bookModal.style.display = 'none';
    currentBookRaw = null;
    currentBookContext = null;
    bookPagesContainer.innerHTML = '';
    bookPagesArray = [];
    bookCurrentPage = 0;
}

saveBookBtn.addEventListener('click', () => {
    if (!currentBookRaw) { closeBookModal(); return; }

    saveCurrentPageEditor();

    const pages = Array.isArray(bookPagesArray) ? bookPagesArray.slice() : [];
    currentBookRaw.tag = currentBookRaw.tag || {};
    if (!('RepairCost' in currentBookRaw.tag)) currentBookRaw.tag.RepairCost = 0;

    const hadPagesCapital = Array.isArray(currentBookRaw.tag.Pages);
    const pagesKey = hadPagesCapital ? 'Pages' : 'pages';
    currentBookRaw.tag[pagesKey] = pages.map(p => (typeof p === 'string' ? p : String(p ?? '')));

    if (pagesKey === 'pages' && Array.isArray(currentBookRaw.tag.Pages)) {
    delete currentBookRaw.tag.Pages;
    } else if (pagesKey === 'Pages' && Array.isArray(currentBookRaw.tag.pages)) {
    delete currentBookRaw.tag.pages;
    }

    const nameInputEl = document.getElementById('bookNameInput');
    const nameVal = nameInputEl ? (String(nameInputEl.value || '').trim()) : '';
    currentBookRaw.tag.display = currentBookRaw.tag.display || {};

    if (nameVal) {
    currentBookRaw.tag.display.Name = JSON.stringify({ text: nameVal });
    } else {
    if (currentBookRaw.tag.display && ('Name' in currentBookRaw.tag.display)) {
        delete currentBookRaw.tag.display.Name;
    }
    }

    const loreEl = document.getElementById('bookLoreTextarea');
    if (loreEl) {
    const loreRawText = String(loreEl.value || '');
    const loreLines = loreRawText.split(/\r?\n/).map(l => l.trim());
    if (loreLines.length && loreLines.some(l => l !== '')) {
        currentBookRaw.tag.display = currentBookRaw.tag.display || {};
        currentBookRaw.tag.display.Lore = loreLines.map(l => serializeLoreEntry(l));
    } else {
        if (currentBookRaw.tag && currentBookRaw.tag.display && 'Lore' in currentBookRaw.tag.display) {
        delete currentBookRaw.tag.display.Lore;
        }
    }
    } else {
    if (currentBookRaw.tag && currentBookRaw.tag.display && 'Lore' in currentBookRaw.tag.display) {
        delete currentBookRaw.tag.display.Lore;
    }
    }


    if (currentBookContext && currentBookContext.type === 'top') {
    const idx = currentBookContext.index;
    itemsArray[idx] = itemsArray[idx] || { id: 'minecraft:air', Count: 1, Slot: idx, _raw: {} };
    itemsArray[idx]._raw = itemsArray[idx]._raw || {};
    itemsArray[idx]._raw.tag = JSON.parse(JSON.stringify(currentBookRaw.tag));
    itemsArray[idx].Count = Number(itemsArray[idx].Count ?? 1);
    renderGrid();
    } else if (currentBookContext && currentBookContext.type === 'inner') {
    const containerRaw = currentBookContext.containerRaw || currentBookContext.parentRaw || null;
    const slotIndex = Number(currentBookContext.index ?? -1);

    if (!containerRaw) {
    } else {
        ensureContainerStructure(containerRaw);

        const items = containerRaw.tag.BlockEntityTag.Items = containerRaw.tag.BlockEntityTag.Items || [];

        const bookSrc = currentBookRaw || {};
        const normalizedEntry = {
        Slot: slotIndex,
        id: String(bookSrc.id || bookSrc._id || 'minecraft:writable_book'),
        Count: Number(bookSrc.Count ?? bookSrc.count ?? 1)
        };
        if (bookSrc.tag && typeof bookSrc.tag === 'object' && Object.keys(bookSrc.tag).length > 0) {
        normalizedEntry.tag = JSON.parse(JSON.stringify(bookSrc.tag));
        }

        const existingIdx = items.findIndex(it => Number(it.Slot ?? it.slot ?? -1) === slotIndex);
        if (existingIdx !== -1) {
        const existing = items[existingIdx];
        existing.id = normalizedEntry.id;
        existing.Count = normalizedEntry.Count;
        existing.Slot = slotIndex;
        if (normalizedEntry.tag) {
            existing.tag = normalizedEntry.tag;
        } else {
            if (existing.tag) delete existing.tag;
        }
        items[existingIdx] = existing;
        } else {
        items.push(normalizedEntry);
        }

        for (let h = 0; h < itemsArray.length; h++) {
        const top = itemsArray[h];
        if (!top || !top._raw) continue;
        if (top._raw === containerRaw) {
            break;
        }
        if (top._raw.tag && top._raw.tag.BlockEntityTag && top._raw.tag.BlockEntityTag.Items === containerRaw.tag.BlockEntityTag.Items) {
            top._raw = containerRaw;
            break;
        }
        }
    }

    renderCurrentContainer();
    renderGrid();
    }

    closeBookModal();
});


cancelBookBtn.addEventListener('click', closeBookModal);
bookModalClose.addEventListener('click', closeBookModal);



cancelBookBtn.addEventListener('click', closeBookModal);
bookModalClose.addEventListener('click', closeBookModal);

bookModal.addEventListener('click', (ev) => {
if (ev.target === bookModal) closeBookModal();
});


applySlotBtn.addEventListener('click', ()=>{
    const count = Math.max(0, Number(slotCountInput.value || 0));
    let idToApply = selectedIdForApply || 'minecraft:air';
    if(applyMode.type === 'top'){
    const idx = applyMode.index;
    const curRaw = itemsArray[idx] && itemsArray[idx]._raw;
    if(curRaw && typeof curRaw === 'object'){
        curRaw.id = idToApply;
        curRaw.Count = count;
        curRaw.Slot = idx;
        itemsArray[idx] = {id: idToApply, Count: count, Slot: idx, _raw: curRaw};
    } else {
        const newRaw = {Slot: idx, id: idToApply, Count: count};
        itemsArray[idx] = {id: idToApply, Count: count, Slot: idx, _raw: newRaw};
    }
    renderGrid();
    } else if (applyMode.type === 'inner') {
    const container = applyMode.containerRaw;
    const slotIndex = applyMode.index;
    if (!container) { 
    } else {
        ensureContainerStructure(container);

        const existingItems = container.tag && container.tag.BlockEntityTag && Array.isArray(container.tag.BlockEntityTag.Items)
        ? container.tag.BlockEntityTag.Items
        : [];

        const preservedOthers = existingItems.filter(it => Number(it.Slot ?? it.slot ?? -1) !== slotIndex);

        if (idToApply !== 'minecraft:air' && count > 0) {
        const existing = existingItems.find(it => Number(it.Slot ?? it.slot ?? -1) === slotIndex);
        let newEntry;
        if (existing && typeof existing === 'object') {
            newEntry = JSON.parse(JSON.stringify(existing));
            newEntry.Slot = slotIndex;
            newEntry.id = idToApply;
            newEntry.Count = Number(count);
        } else {
            newEntry = { Slot: slotIndex, id: idToApply, Count: Number(count) };
        }
        if ((!newEntry.tag || Object.keys(newEntry.tag).length === 0) && currentBookRaw && currentBookContext && currentBookContext.type === 'inner' && Number(currentBookContext.index) === slotIndex) {
            if (currentBookRaw.tag && typeof currentBookRaw.tag === 'object' && Object.keys(currentBookRaw.tag).length > 0) {
            newEntry.tag = JSON.parse(JSON.stringify(currentBookRaw.tag));
            }
        }

        preservedOthers.push(newEntry);
        } else {
        }

        container.tag = container.tag || {};
        container.tag.BlockEntityTag = container.tag.BlockEntityTag || {};
        container.tag.BlockEntityTag.Items = preservedOthers;

        for (let h = 0; h < itemsArray.length; h++) {
        const top = itemsArray[h];
        if (!top || !top._raw) continue;
        if (top._raw === container) {
            break;
        }
        if (top._raw.tag && top._raw.tag.BlockEntityTag && top._raw.tag.BlockEntityTag.Items === container.tag.BlockEntityTag.Items) {
            top._raw = container;
            break;
        }
        }
    }

    renderCurrentContainer();
    renderGrid();
    }

    closeSlotModal();
    selectedIdForApply = 'minecraft:air';
});


function openSlotEditor(slotIndex){
    closeContainerModal();

    activeSlot = slotIndex;
    applyMode = {type:'top', index: slotIndex};
    const el = itemsArray[slotIndex] ?? {id:'minecraft:air',Count:0,_raw:{id:'minecraft:air',Count:0}};

    selectedIdForApply = el.id || 'minecraft:air';
    const isAir = (selectedIdForApply || '').toLowerCase().includes('air');

    if (!isAir) {
    slotPreview.src = iconsPath + selectedIdForApply.split(':').pop() + '.png';
    slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
    } else {
    slotPreview.src = './icons/ui/empty.png';
    slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
    }

    const pretty = displayName(selectedIdForApply);
    slotIdDisplay.value = isAir ? 'empty' : pretty;
    slotCountInput.value = el.Count ?? 1;
    slotCountLabel.textContent = slotCountInput.value;

    updateSlotModalButtons();


    if ((selectedIdForApply || '').toLowerCase().includes('air')) {
    clearSlotBtn.style.display = 'none';
    } else {
    clearSlotBtn.style.display = '';
    }


    slotModal.classList.add('show');
    slotModal.style.display = 'flex';
    pickRenderList(iconList.map(f => f.replace(/\.png$/i,'')), '');
}

modalClose.addEventListener('click', ()=> {
    closeSlotModal();
});

clearSlotBtn.addEventListener('click', ()=>{
    selectedIdForApply = 'minecraft:air';
    slotPreview.src = './icons/ui/empty.png';
    slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
    slotIdDisplay.value = 'empty';
    slotCountInput.value = 1;
    slotCountLabel.textContent = '1';

    updateSlotModalButtons();
    updateCopyPasteButtons();
});



let currentContainerRaw = null;

let currentContainerContext = null;

let containerHistory = [];

function openContainerModal(raw, context, isBackNavigation = false){
  closeSlotModal();

  if (context && context.type === 'hotbar') {
    containerHistory = []; 
  } else {
    if (!isBackNavigation && currentContainerRaw !== null) {
      containerHistory.push({
        raw: currentContainerRaw,
        context: currentContainerContext
      });
    }
  }

  currentContainerRaw = ensureContainerStructure(raw);
  currentContainerContext = context || null;

  try {
    if (containerItemName) containerItemName.textContent = getContainerItemTypeName(currentContainerRaw) || 'container';
    if (containerNameInput) containerNameInput.value = getContainerDisplayName(currentContainerRaw) || '';
  } catch (e) {}

  containerSub.textContent = `Editing container contents`;
  renderCurrentContainer();

  updateContainerBackButton();

  containerModal.classList.add('show');
  containerModal.style.display = 'flex';
}



function updateContainerBackButton() {
  const backBtnId = 'containerBackBtn';
  let existingBtn = document.getElementById(backBtnId);
  if (existingBtn) existingBtn.remove();

  if (containerHistory.length > 0) {
    const backBtn = document.createElement('button');
    backBtn.id = backBtnId;
    backBtn.className = 'btn small';
    backBtn.textContent = '← Back';
    backBtn.style.marginRight = 'auto';

    backBtn.addEventListener('click', () => {
      goBackToParentContainer();
    });

    const buttonContainer = deleteContainerBtn.parentElement;
    buttonContainer.insertBefore(backBtn, buttonContainer.firstChild);
  }
}


function goBackToParentContainer() {
  if (containerHistory.length === 0) return;

  const previous = containerHistory.pop();

  openContainerModal(previous.raw, previous.context, true);
}


function renderCurrentContainer(){
    const raw = currentContainerRaw;
    const items = (raw && raw.tag && raw.tag.BlockEntityTag && Array.isArray(raw.tag.BlockEntityTag.Items)) ? raw.tag.BlockEntityTag.Items : [];
    const maxIndex = Math.max(27, items.reduce((m,it)=> Math.max(m, Number(it.Slot || it.slot || 0)), 0)+1);
    containerGrid.innerHTML = '';
    for(let i=0;i<maxIndex;i++){
    const obj = items.find(it => Number(it.Slot ?? it.slot ?? -1) === i);
    const el = document.createElement('div');
    el.classList.add('container-cell');

    el.style.position = 'relative';
    el.style.width = '64px';
    el.style.height = '64px';
    el.style.background = 'linear-gradient(180deg,#071019,#061019)';
    el.style.borderRadius = '8px';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.cursor = 'grab';
    el.style.border = '1px solid rgba(255,255,255,0.03)';
    el.draggable = true;

    let rawCount = undefined;
    if (obj) {
        rawCount = obj.Count ?? obj.count ?? (obj.Count && obj.Count.value) ?? (obj.count && obj.count.value);
    }
    const countVal = Number(rawCount || 0);
    const countDisplay = (obj && !(String(obj.id || '').toLowerCase().includes('air')) && countVal > 0) ? String(countVal) : '';

    const imgSrc = iconsPath + ((obj && obj.id) ? obj.id.split(':').pop() : 'air') + '.png';
    const countHtml = countDisplay ? `<div class="count">${countDisplay}</div>` : '';
    el.innerHTML = `
        <img src="${imgSrc}" onerror="this.src='${iconsPath}air.png'">
        ${countHtml}
    `;


    
    const imgEl = el.querySelector('img');
    if(imgEl) imgEl.draggable = false;

    if (!obj || (String(obj.id || '').toLowerCase().includes('air'))) {
        const emptyBadge = document.createElement('div');
        emptyBadge.style.position = 'absolute';
        emptyBadge.style.top = '50%';
        emptyBadge.style.left = '50%';
        emptyBadge.style.transform = 'translate(-50%, -50%)';
        emptyBadge.style.fontSize = '.82rem';
        emptyBadge.style.color = 'var(--muted)';
        emptyBadge.style.background = 'rgba(0,0,0,0.28)';
        emptyBadge.style.padding = '4px 8px';
        emptyBadge.style.borderRadius = '6px';
        emptyBadge.textContent = 'empty';
        el.appendChild(emptyBadge);
    }

    

    el.addEventListener('dragstart', (ev) => {
        isDragging = true;
        dragFrom = i;

        ev.dataTransfer.setData('text/plain', 'C:' + i);
        ev.dataTransfer.effectAllowed = 'move';

        try{
        const dragImg = document.createElement('img');
        dragImg.src = (obj && obj.id) ? (iconsPath + (obj.id.split(':').pop()) + '.png') : (iconsPath + 'air.png');
        dragImg.width = 36; dragImg.height = 36;
        dragImg.style.position = 'fixed';
        dragImg.style.left = '-9999px';
        dragImg.style.top = '-9999px';
        dragImg.style.opacity = '0';
        document.body.appendChild(dragImg);
        ev.dataTransfer.setDragImage(dragImg, 18, 18);
        setTimeout(()=> document.body.removeChild(dragImg), 0);
        }catch(e){}
        el.classList.add('dragging');
    });



    el.addEventListener('dragend', ()=> {
        isDragging = false;
        dragFrom = null;
        el.classList.remove('dragging');
    });


    el.addEventListener('dragover', (ev)=> { ev.preventDefault(); try { ev.dataTransfer.dropEffect = 'move'; } catch(e){}; el.style.opacity = 0.8; });
    el.addEventListener('dragleave', ()=> { el.style.opacity = 1; });

    el.addEventListener('drop', (ev)=> {
    ev.preventDefault();
    el.style.opacity = 1;
    const payload = ev.dataTransfer.getData('text/plain') || '';

    if (payload.startsWith('C:')) {
        const fromIdx = Number(payload.slice(2));
        if (Number.isFinite(fromIdx)) moveWithinContainer(raw, fromIdx, i);
        return;
    }

    if (payload.startsWith('H:')) {
        const fromHotbar = Number(payload.slice(2));
        if (Number.isFinite(fromHotbar)) moveHotbarToContainer(fromHotbar, raw, i);
        return;
    }

    const maybeNum = Number(payload);
    if (Number.isFinite(maybeNum)) moveHotbarToContainer(maybeNum, raw, i);
    });


    el.addEventListener('pointerdown', (ev) => {
        pointerDownInfo = { x: ev.clientX, y: ev.clientY, pointerId: ev.pointerId, time: Date.now(), containerSlotIndex: i };
        try { el.setPointerCapture(ev.pointerId); } catch(e){}
    });

    el.addEventListener('pointerup', (ev) => {
        try { el.releasePointerCapture(ev.pointerId); } catch(e){}
        if (isDragging) { pointerDownInfo = null; return; }
        if (!pointerDownInfo) return;
        const dx = Math.abs(ev.clientX - pointerDownInfo.x);
        const dy = Math.abs(ev.clientY - pointerDownInfo.y);
        const dist = Math.hypot(dx, dy);
        const DRAG_THRESHOLD = 6;
        if (dist <= DRAG_THRESHOLD && pointerDownInfo.containerSlotIndex === i) {
        if (obj && isContainerId(obj.id)) {
            const innerRaw = ensureContainerStructure(obj);
            openContainerModal(innerRaw, { type: 'container', parentRaw: raw, slot: i });
            pointerDownInfo = null;
            return;
        }

        applyMode = {type:'inner', containerRaw: raw, index: i};
        if(obj){
            selectedIdForApply = obj.id || 'minecraft:air';
            const isAir = (selectedIdForApply || '').toLowerCase().includes('air');
            
            if (!isAir) {
            slotPreview.src = iconsPath + selectedIdForApply.split(':').pop() + '.png';
            slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
            } else {
            slotPreview.src = './icons/ui/empty.png';
            slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
            }
            
            const pretty = displayName(selectedIdForApply);
            slotIdDisplay.value = isAir ? 'empty' : pretty;
            slotCountInput.value = obj.Count ?? 1;
            slotCountLabel.textContent = slotCountInput.value;
        } else {
            selectedIdForApply = 'minecraft:air';
            slotPreview.src = './icons/ui/empty.png';
            slotPreview.onerror = () => slotPreview.src = iconsPath + 'air.png';
            const pretty = displayName(selectedIdForApply);
            slotIdDisplay.value = 'empty';
            slotCountInput.value = 1;
            slotCountLabel.textContent = slotCountInput.value;
        }

        document.getElementById('modalSub');
        containerViewBtnWrap.innerHTML = '';

        if ((selectedIdForApply || '').toLowerCase().includes('air')) {
            clearSlotBtn.style.display = 'none';
        } else {
            clearSlotBtn.style.display = '';
        }

        const idLowerInner = (selectedIdForApply || '').toLowerCase();
        if (idLowerInner.includes('writable_book') || idLowerInner.includes('book_and_quill') || idLowerInner.includes('book')) {
            const customBtnInner = document.createElement('button');
            customBtnInner.className = 'btn';
            customBtnInner.textContent = 'Edit book';

            customBtnInner.addEventListener('click', () => {
            const rawBook = (obj && typeof obj === 'object') ? obj : { Slot: i, id: obj?.id, Count: obj?.Count };
            rawBook.tag = rawBook.tag || {};
            if (!Array.isArray(rawBook.tag.pages) && !Array.isArray(rawBook.tag.Pages)) rawBook.tag.pages = rawBook.tag.pages || [];
            openBookModal(rawBook, { type: 'inner', containerRaw: raw, index: i, existingRef: obj });
            });
            containerViewBtnWrap.appendChild(customBtnInner);
        }

        slotModal.classList.add('show');
        slotModal.style.display = 'flex';
        pickerSearch.value = '';
        pickRenderList(iconList.map(f=>f.replace(/\.png$/i,'')), '');
        updateCopyPasteButtons();

        }
        pointerDownInfo = null;
    });

    containerGrid.appendChild(el);
    }
}

closeContainer.addEventListener('click', ()=>{
    closeContainerModal();
});




fileInput.addEventListener('change', async (ev) => {
        const f = ev.target.files[0];
        if (!f) return;
        await handleFileLoad(f);
        ev.target.value = '';
    });


downloadBtn.addEventListener('click', async ()=>{
    allHotbars[currentHotbarIndex] = JSON.parse(JSON.stringify(itemsArray));
    
    if(!currentNbt){
      const dataObj = {};
      for (let h = 0; h < 9; h++) {
        dataObj[String(h)] = allHotbars[h].map((it, i) => {
          const base = (it && it._raw && typeof it._raw === 'object') ? JSON.parse(JSON.stringify(it._raw)) : { id: it.id ?? 'minecraft:air', Count: it.Count ?? 0 };
          base.Count = Number(it.Count ?? base.Count ?? 0);
          if ('Slot' in base) delete base.Slot;
          if ('slot' in base) delete base.slot;
          simplifyDisplayForWrite(base);
          return base;
        });
      }
      
      const root = { data: dataObj, rootName: '', endian: 'big' };
      try {
        const bin = await NBT.write(root);
        const blob = new Blob([bin], {type:'application/octet-stream'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'hotbar.nbt'; a.click(); URL.revokeObjectURL(url);
        showSuccessNotification('Successfully downloaded hotbar.nbt!');
      } catch(e) { alert('Failed to write: ' + e.message); console.error(e); }
      return;
    }
    
    if (currentNbt.data && typeof currentNbt.data === 'object') {
      for (let h = 0; h < 9; h++) {
        const newArr = allHotbars[h].map((it, i) => {
          if(it && it._raw && typeof it._raw === 'object'){
            it._raw.id = it.id ?? it._raw.id;
            it._raw.Count = it.Count ?? it._raw.Count ?? 0;
            it._raw.Slot = i;
            simplifyDisplayForWrite(it._raw);
            return it._raw;
          } else {
            return {Slot:i, id: it?.id ?? 'minecraft:air', Count: it?.Count ?? 0};
          }
        });
        currentNbt.data[String(h)] = newArr;
      }
      
      try{
        const bin = await NBT.write(currentNbt);
        const blob = new Blob([bin], {type:'application/octet-stream'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'hotbar.nbt'; a.click(); URL.revokeObjectURL(url);
        showSuccessNotification('Successfully downloaded hotbar.nbt!');
      }catch(e){ alert('Failed to write: '+e.message); console.error(e); }
    }
});

resetBtn.addEventListener('click', ()=>{
    for (let h = 0; h < 9; h++) {
      allHotbars[h] = new Array(9).fill(null).map((_, i) => ({
        id: 'minecraft:air',
        Count: 1,
        Slot: i,
        _raw: { id: 'minecraft:air', Count: 1 }
      }));
    }
    
    currentHotbarIndex = 0;
    itemsArray = JSON.parse(JSON.stringify(allHotbars[0]));
    currentNbt = null;
    hotbarRef = null;
    renderGrid();
    updateHotbarDropdownUI();
    loadDefaultHotbar();
    showSuccessNotification('Successfully reset to the default hotbar.nbt!');
});


renderGrid();

loadDefaultHotbar();

slotModal.addEventListener('click', (ev) => {
if (ev.target === slotModal) closeSlotModal();
});
containerModal.addEventListener('click', (ev) => {
if (ev.target === containerModal) {
    containerModal.classList.remove('show');
    containerModal.style.display = 'none';
}
});