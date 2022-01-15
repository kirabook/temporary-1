export class Inventory {
  constructor(scene,data) {
    this.scene = scene;
    this.DOM = new DOMParser().parseFromString(`<div class="${data.type}-inventory inventory" id="${data.name}-inventory" data-id="${data.id}" data-name="${data.name}"></div>`, 'text/html').body.firstChild;
    this.DOM.name = data.name;
    this.DOM.inventoryType = data.type;
    this.inventoryType = data.type;
    this.name = data.name;
    this.type = data.type;
    this.id = data.id;
    this.slots = [];
    this.inventoryId = data.name+'-inventory';
    this.slotCount = data.slotCount ? data.slotCount - 1 : 11;

    this.inventoryArea = document.querySelector('#'+data.id);
    this.inventoryArea ? this.inventoryArea.append(this.DOM) : console.log(' inventory area not found ');
    this.addSlots();
    this.loadSlots();
  }

  saveSlots(){
    this.savedInventory = JSON.parse(localStorage.getItem('inventories') ? localStorage.getItem('inventories') : '{}');
    var savedInventory = [];
    for (var i = 0; i < this.slots.length; i++) {
      if (this.slots[i].empty){
        savedInventory.push('empty');
      } else {
        var key = this.slots[i].item.key;
        var index = this.slots[i].item.index;
        var quantity = this.slots[i].item.quantity;
        var category = this.slots[i].item.category;
        var itemData = this.slots[i].item.itemData;
        savedInventory.push({'index':index,'key':key,'name':name,'quantity':quantity,'category':category,'itemData':itemData});
      }
    }
    this.savedInventory[this.inventoryId] = savedInventory;
    localStorage.setItem('inventories', JSON.stringify(this.savedInventory));
  }

  loadSlots(){
    this.savedInventory = JSON.parse(localStorage.getItem('inventories') ? localStorage.getItem('inventories') : null);
    for (var i = 0; i < this.slots.length; i++) {
      if (this.savedInventory && this.savedInventory[this.inventoryId] && this.savedInventory[this.inventoryId][i] && this.savedInventory[this.inventoryId][i] != 'empty') {
        var key = this.savedInventory[this.inventoryId][i].key;
        var quantity = this.savedInventory[this.inventoryId][i].quantity;
        var category = this.savedInventory[this.inventoryId][i].category;
        var itemData = this.savedInventory[this.inventoryId][i].itemData;
        this.slots[i].clearItem();
        this.addItem({'index':i,'key':key,'name':name,'quantity':quantity,'category':category,'itemData':itemData}); 
      }
    }
  }

  verifyItemSlots(){
    for (var i = 0; i < this.slots.length; i++) {
      this.slots[i].verifyItem();
    }
  }

  verifyCharacterSlots(){
    for (var i = 0; i < this.slots.length; i++) {
      this.slots[i].verifyCharacter();
    }
  }

  clearSlots(){
    for (var i = 0; i < this.slots.length; i++) {
      this.slots[i].clearItem();
    }
  }

  clearSelections(){
    for (var i = 0; i < this.slots.length; i++) {
     this.slots[i].deselect();
    }
  }

  addSlots(data){
    for (let i = 0; i <= this.slotCount; i++ ) {
      this.slots.length <= this.slotCount ? this.slots.push(new Slot(this.scene,{'index':i,'parentInventory':this,'inventoryId':this.inventoryId,'type':this.type})) : console.log('inventory slots already placed');
    }
  }

  addItem(data) {
    if (!this.inventoryArea) return false
    if (!data.index && !data.index == 0) return false
    //if (!data.key) return false
    if (!this.slots[data.index].getItem()) {
      this.slots[data.index].setItem({'index':data.index,'key':data.key,'quantity':data.quantity,'category':data.category,'itemData':data.itemData,'parentInventory':this,'inventoryId':this.inventoryId,'type':this.type});
      return true;
    }
    return false;
  }
  removeItem(data){
    if (!this.inventoryArea) return false
    if (!data.index && !data.index == 0) return false
    if (this.slots[data.index].getItem()) {
      this.slots[data.index].clearItem();
      this.saveSlots();
      return true;
    }
    return false;
  }
  hideItem(data){
    if (!this.inventoryArea) return false
    if (!data.index && !data.index == 0) return false
    if (this.slots[data.index].getItem()) {
      //this.slots[i].clearItem();
      return true;
    }
    return false;
  }
  disableItem(data){
    if (!this.inventoryArea) return false
    if (!data.index && !data.index == 0) return false
    if (this.slots[data.index].getItem()) {
      //this.slots[i].clearItem();
      return true;
    }
    return false;
  }
  moveItem(data){
    if (!this.inventoryArea || this.name == 'all' || this.name == 'store') return false;

    var slotA = data.inventory.slots[data.indexA];
    var slotB = data.inventory.slots[data.indexB];
    var itemA = slotA.item;
    var itemB = slotB.item;
    var dataA = {'indexA':data.indexA,'indexB':data.indexB,'item':itemA,'slot':slotA};
    var dataB = {'indexA':data.indexB,'indexB':data.indexA,'item':itemB,'slot':slotB};

    this.placeItem(dataA);
    data.inventory.removeItem({'index':data.indexA});
    this.saveSlots();
  }

  swapItem(data){
    if (!this.inventoryArea || this.name == 'all' || this.name == 'store') return false;

    var slotA = data.inventory.slots[data.indexA];
    var slotB = data.inventory.slots[data.indexB];
    var itemA = slotA.item;
    var itemB = slotB.item;
    var dataA = {'indexA':data.indexA,'indexB':data.indexB,'item':itemA,'slot':slotA};
    var dataB = {'indexA':data.indexB,'indexB':data.indexA,'item':itemB,'slot':slotB};

    this.placeItem(dataA);
    this.placeItem(dataB);
  }

  placeItem(data){
    if (!this.inventoryArea || this.name == 'all' || this.name == 'store') return false;
    var slot = data.slot ? data.slot : data.inventory.slots[data.indexA];
    var item = data.item ? data.item : slot.item;
    var itemKey = item.key;
    var itemQuantity = item.quantity;
    var itemCategory = item.category;
    var itemName = item.name;
    var itemData = item.itemData;
    this.removeItem({'index':data.indexB});
    this.addItem({'index':data.indexB,'key':itemKey,'name':itemName,'quantity':itemQuantity,'category':itemCategory,'itemData':itemData});
    this.saveSlots();
    slot.deselect();
  }
}

export class Slot {
  constructor(scene,data) {
    this.scene = scene;
    this.id = data.parentInventory.name+'_slot_'+data.index;
    this.inventoryId = data.inventoryId;
    this.parentInventory = data.parentInventory;
    this.index = data.index;
    this.type = data.type;
    this.selected = false;
    this.active = true;
    this.empty = true;
    this.item = null;

    this.parentBody = document.getElementById(this.inventoryId);
    this.DOM = new DOMParser().parseFromString(`<div class="slot" data-id="${this.id}" data-inventoryId="${this.inventoryId}" data-index="${this.index}" data-selected="false" data-active="true" data-empty="true"></div>`, 'text/html').body.firstChild;
    this.parentBody.appendChild(this.DOM);
  }

  setItem(data) {
    this.item = new Item(this.scene,data);
    this.item.slot = this;
    this.empty = false;
    this.DOM.dataset.empty = false;
    this.DOM.appendChild(this.item.DOM);
    this.deselect();
  }

  clearItem(data) {
    this.DOM.innerHTML = "";
    this.empty = true;
    this.DOM.dataset.empty = true;
    this.item = null;
    this.deselect();
  }

  verifyItem(data) {
    var itemData = this.item.itemData;
    var character = data.character;

    var verifyHP = (character.hp < itemData.hp_cost)&&itemData.hp_cost,
        verifyChakra = (character.chakra < itemData.chakra_cost)&&itemData.chakra_cost,
        verifyLevel = character.level < itemData.level,
        verifyUser = itemData.users.includes(character.name) || itemData.users.includes("all"),
        verifyQuantity = (this.item.quantity <= 0)&&itemData.category=="item";

    if (!verifyUser||verifyLevel||verifyHP||verifyChakra||verifyQuantity){ 
        this.DOM.setAttribute('data-active', false); 
        this.active = false;
    }  else { 
        this.DOM.setAttribute('data-active', true); 
        this.active = true;
    };
  }

  verifyCharacter(data) {
    var itemData = this.item.itemData;
    var verifyHP = itemData.hp < 0;

    if (verifyHP){ 
        this.DOM.setAttribute('data-active', false); 
        this.active = false;
    }  else { 
        this.DOM.setAttribute('data-active', true); 
        this.active = true;
    };
  }

  select(data) {
    this.DOM.classList.add("selected");
    this.selected = true;

    var itemsSelectedArr = this.scene.registry.get('itemsSelected') ? this.scene.registry.get('itemsSelected') : [];
    var selectedSlotsArr = this.scene.registry.get('selectedSlots') ? this.scene.registry.get('selectedSlots') : [];
    var itemsSelected = itemsSelectedArr[this.type] ? itemsSelectedArr[this.type] : 0;
    var selectedSlots = selectedSlotsArr[this.type] ? selectedSlotsArr[this.type] : [];
        selectedSlots[itemsSelected] = {'index':this.index,'inventoryId':this.inventoryId};
        selectedSlotsArr[this.type] = selectedSlots;

    this.selectionIndex = itemsSelected;
    if (itemsSelected < 0){ itemsSelected = 0 } else if (itemsSelected < 2){ itemsSelected++ }
    itemsSelectedArr[this.type] = itemsSelected;

    this.scene.registry.set('itemsSelected',itemsSelectedArr);
    this.scene.registry.set('selectedSlots',selectedSlotsArr);
  }

  deselect(data) {
    this.DOM.classList.remove("selected");
    this.selected = false;

    var itemsSelectedArr = this.scene.registry.get('itemsSelected') ? this.scene.registry.get('itemsSelected') : [];
    var selectedSlotsArr = this.scene.registry.get('selectedSlots') ? this.scene.registry.get('selectedSlots') : [];
    var itemsSelected = itemsSelectedArr[this.type] ? itemsSelectedArr[this.type] : 0;
    var selectedSlots = selectedSlotsArr[this.type] ? selectedSlotsArr[this.type] : [];
        selectedSlots.splice(this.selectionIndex, 1); 
        selectedSlotsArr[this.type] = selectedSlots;

    this.selectionIndex = null;
    if (itemsSelected < 0){ itemsSelected = 0 } else if (itemsSelected != 0) { itemsSelected-- }
    itemsSelectedArr[this.type] = itemsSelected;

    this.scene.registry.set('itemsSelected',itemsSelectedArr);
    this.scene.registry.set('selectedSlots',selectedSlotsArr);
  }

  getItem(data){ 
    if (this.item){ return this.item.key; } else { return null; }
    //this.item ? this.item.key : null;
  }
}

export class Item {
  constructor(scene,data) {
    this.scene = scene;
    this.inventoryId = data.inventoryId;
    this.parentInventory = data.parentInventory;
    this.type = data.type;
    this.index = data.index;
    this.quantity = data.quantity || 0;
    this.key = data.key || data.itemData.key;
    this.name = data.name || data.itemData.name;
    this.category = data.category || data.itemData.category;
    this.itemData = data.itemData || {};
    this.slot = this.parentInventory.slots[this.index];

    if (this.type == 'target' || this.type == 'characters'){
      var originalHP = this.itemData.originalHP;
      var originalCP = this.itemData.originalCP;
      var charaterHealth = (1 - ((originalHP - this.itemData.hp) / originalHP)) * 100;
      var charaterChakra = (1 - ((originalCP - this.itemData.chakra) / originalCP)) * 100;
      //this is for character huds
      this.DOM = new DOMParser().parseFromString(`<div data-inventoryid="${this.inventoryId}" data-key="${this.key}" data-index="${this.index}" data-quantity="${this.quantity}" data-category="${this.category}" class="item ${this.type}Item">
        <div class="select-indicator select-left fat"></div>
        <div class="character-bar">
          <div class="character-portrait">
            <img class="character-portrait-image" src="src/assets/characters/${this.key}_icon.png" alt="">
            <img class="character-portrait-overlay" src="src/assets/images/fbef23d159b82f390e9ec8699ec5cbd7.png" alt="">
          </div>
        </div>
        <div class="character-attributes">
          <div class="character-name"><span class="name">${this.name}</span></div>
          <span class="health-val val">${this.itemData.hp}/${originalHP}</span>
          <div class="health-bar"><div class="bar" style="width: ${charaterHealth}%;"><div class="hit"></div></div></div>
          <span class="chakra-val val">${this.itemData.chakra}/${originalCP}</span>
          <div class="chakra-bar"><div class="bar" style="width: ${charaterChakra}%;"><div class="hit"></div></div></div>
        </div>
        <div class="select-indicator select-right fat"></div>
      </div>`, 'text/html').body.firstChild;
      this.itemData.menuItem = this;
    } else {
      //for skills in battle menu
      var iconKey = this.scene.cache.game.textures.list[this.key+'_icon'] ? this.key : this.scene.cache.game.textures.list[this.itemData.rank+'_rank_icon'] ? this.itemData.rank+'_rank' : 'empty';
      this.DOM = new DOMParser().parseFromString(`<div data-inventoryid="${this.inventoryId}" data-key="${this.key}" data-index="${this.index}" data-quantity="${this.quantity}" data-category="${this.category}" class="item ${this.type}Item">
        <img src="src/assets/${this.type}/${iconKey}.png" class="item__img" alt="${this.name}" title="${this.name}"/>
        <div class="item__remove" data-inventoryid="${this.inventoryId}" data-index="${this.index}">&times;</div>
        <div class="item__quantity" data-value="${this.quantity}"><small>&times;</small>${this.quantity}</div>
        <div class="item__hpcost" data-value="${data.itemData.hp_cost}">${data.itemData.hp_cost}<small>hp</small></div>
        <div class="item__chakracost" data-value="${data.itemData.chakra_cost}">${data.itemData.chakra_cost}<small>cp</small></div>
        </div>`, 'text/html').body.firstChild;
    }
  }
}